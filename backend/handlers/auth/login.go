package auth

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	users "home_solutions/backend/models/users"
)

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token    string `json:"token"`
	UserType string `json:"user_type"`
	UserID   int    `json:"user_id"`
}

func Login(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req LoginRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		user, err := users.GetUserByEmail(db, req.Email)
		if err != nil {
			log.Println("User not found for email:", req.Email)
			http.Error(w, "Invalid email or password", http.StatusUnauthorized)
			return
		}

		log.Printf("Found user: %s (%s)", user.Email, user.UserType)
		log.Printf("Stored hash: %s", user.Password)
		log.Printf("Entered password: %s", req.Password)

		if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
			log.Println("Password mismatch:", err)
			http.Error(w, "Invalid email or password", http.StatusUnauthorized)
			return
		}

		// Generate JWT
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"user_id":   user.ID,
			"user_type": user.UserType,
			"exp":       time.Now().Add(24 * time.Hour).Unix(),
		})

		refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"user_id":   user.ID,
			"user_type": user.UserType,
			"exp":       time.Now().Add(7 * 24 * time.Hour).Unix(),
		})
		refreshTokenString, err := refreshToken.SignedString([]byte(os.Getenv("JWT_SECRET")))
		if err != nil {
			http.Error(w, "Refresh token generation failed", http.StatusInternalServerError)
			return
		}

		// Set refresh token as cookie
		http.SetCookie(w, &http.Cookie{
			Name:     "refresh_token",
			Value:    refreshTokenString,
			Path:     "/api/refresh-token",
			HttpOnly: true,
			Secure:   true, // only if using HTTPS
			SameSite: http.SameSiteStrictMode,
			Expires:  time.Now().Add(7 * 24 * time.Hour),
		})

		secret := os.Getenv("JWT_SECRET")
		tokenString, err := token.SignedString([]byte(secret))
		if err != nil {
			http.Error(w, "Token generation failed", http.StatusInternalServerError)
			return
		}

		res := LoginResponse{
			Token:    tokenString,
			UserType: user.UserType,
			UserID:   user.ID,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(res)
	}
}

func RefreshToken(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("refresh_token")
	if err != nil {
		http.Error(w, "Refresh token missing", http.StatusUnauthorized)
		return
	}

	token, err := jwt.Parse(cookie.Value, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("JWT_SECRET")), nil
	})

	if err != nil || !token.Valid {
		http.Error(w, "Invalid refresh token", http.StatusUnauthorized)
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		http.Error(w, "Invalid token claims", http.StatusUnauthorized)
		return
	}

	newAccessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":   claims["user_id"],
		"user_type": claims["user_type"],
		"exp":       time.Now().Add(15 * time.Minute).Unix(),
	})
	tokenString, _ := newAccessToken.SignedString([]byte(os.Getenv("JWT_SECRET")))

	json.NewEncoder(w).Encode(map[string]string{"token": tokenString})
}
