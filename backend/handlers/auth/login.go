package auth

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"
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
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		normalizedEmail := strings.ToLower(strings.TrimSpace(req.Email))

		user, err := users.GetUserByEmail(db, normalizedEmail)
		if err != nil {
			log.Printf("User not found for email: %s (err: %v)", normalizedEmail, err)
			http.Error(w, "Invalid email or password", http.StatusUnauthorized)
			return
		}

		log.Printf("Found user in DB: %s (type: %s)", user.Email, user.UserType)

		// Compare password
		if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
			log.Println("Password mismatch:", err)
			http.Error(w, "Invalid email or password", http.StatusUnauthorized)
			return
		}

		// Generate access token
		accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"user_id":   user.ID,
			"user_type": user.UserType,
			"exp":       time.Now().Add(24 * time.Hour).Unix(),
		})

		secret := os.Getenv("JWT_SECRET")
		accessTokenStr, err := accessToken.SignedString([]byte(secret))
		if err != nil {
			log.Println("Failed to sign access token:", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		// Generate refresh token
		refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"user_id":   user.ID,
			"user_type": user.UserType,
			"exp":       time.Now().Add(7 * 24 * time.Hour).Unix(),
		})

		refreshTokenStr, err := refreshToken.SignedString([]byte(secret))
		if err != nil {
			log.Println("Failed to sign refresh token:", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		// Set refresh token cookie
		http.SetCookie(w, &http.Cookie{
			Name:     "refresh_token",
			Value:    refreshTokenStr,
			Path:     "/api/refresh-token",
			HttpOnly: true,
			Secure:   true,
			SameSite: http.SameSiteStrictMode,
			Expires:  time.Now().Add(7 * 24 * time.Hour),
		})

		// Respond with access token and user info
		res := LoginResponse{
			Token:    accessTokenStr,
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

func Logout(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    "",
		Expires:  time.Now().Add(-time.Hour),
		HttpOnly: true,
		Path:     "/",
		SameSite: http.SameSiteLaxMode,
	})
	w.WriteHeader(http.StatusOK)
}
