package auth

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"home_solutions/backend/database"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type SignUpRequest struct {
	FirstName   string `json:"first_name"`
	LastName    string `json:"last_name"`
	Email       string `json:"email"`
	Password    string `json:"password"`
	UserType    string `json:"user_type"`
	InviteToken string `json:"invite,omitempty"`
	CompanyName string `json:"company_name,omitempty"`
}

type SignUpResponse struct {
	Token    string `json:"token"`
	UserType string `json:"user_type"`
	UserID   int    `json:"user_id"`
}

var ipLastRequest = make(map[string]time.Time)

func tooManyRequests(ip string) bool {
	now := time.Now()
	last, exists := ipLastRequest[ip]
	if exists && now.Sub(last) < 10*time.Second {
		return true
	}
	ipLastRequest[ip] = now
	return false
}

func SignUp(w http.ResponseWriter, r *http.Request) {
	// Simple IP rate limiter (very basic)
	ip := strings.Split(r.RemoteAddr, ":")[0]
	if tooManyRequests(ip) {
		http.Error(w, "Too many requests. Try again later.", http.StatusTooManyRequests)
		return
	}

	var req SignUpRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.FirstName == "" || req.LastName == "" || req.Email == "" || req.Password == "" || req.UserType == "" {
		http.Error(w, "All fields are required", http.StatusBadRequest)
		return
	}

	allowedRoles := map[string]bool{"homeowner": true, "inspector": true}
	if !allowedRoles[req.UserType] {
		http.Error(w, "Invalid user type", http.StatusBadRequest)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Error securing password", http.StatusInternalServerError)
		return
	}

	db := database.GetDB()
	res, err := db.Exec(`
		INSERT INTO users (first_name, last_name, email, password, user_type)
		VALUES (?, ?, ?, ?, ?)`,
		req.FirstName, req.LastName, req.Email, hashedPassword, req.UserType,
	)
	if req.UserType == "inspector" && req.InviteToken != "" {
		_, err := db.Exec(`UPDATE invitations SET accepted = TRUE WHERE token = ?`, req.InviteToken)
		if err != nil {
			// Log but don't fail signup
			log.Printf("Failed to mark invite as accepted: %v", err)
		}
	}
	if err != nil {
		http.Error(w, "Email may already be in use or invalid", http.StatusConflict)
		return
	}

	userID64, _ := res.LastInsertId()
	userID := int(userID64)

	// If inspector, insert into inspectors table
	if req.UserType == "inspector" && req.CompanyName != "" {
		stmt, err := db.Prepare("INSERT INTO inspectors (user_id, company_name) VALUES (?, ?)")
		if err != nil {
			log.Printf("Failed to prepare inspector insert: %v", err)
		} else {
			_, err = stmt.Exec(userID, req.CompanyName)
			if err != nil {
				log.Printf("Failed to insert inspector data: %v", err)
			}
		}
	}

	// Generate access token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":   userID,
		"user_type": req.UserType,
		"exp":       time.Now().Add(24 * time.Hour).Unix(),
	})
	secret := os.Getenv("JWT_SECRET")
	tokenStr, _ := token.SignedString([]byte(secret))

	// Set refresh token as cookie
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":   userID,
		"user_type": req.UserType,
		"exp":       time.Now().Add(7 * 24 * time.Hour).Unix(),
	})
	refreshTokenStr, _ := refreshToken.SignedString([]byte(secret))
	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    refreshTokenStr,
		Path:     "/api/refresh-token",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
		Expires:  time.Now().Add(7 * 24 * time.Hour),
	})

	// Respond
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(SignUpResponse{
		Token:    tokenStr,
		UserType: req.UserType,
		UserID:   userID,
	})
}
