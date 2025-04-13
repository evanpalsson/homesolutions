package auth

import (
	"database/sql"
	"encoding/json"
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
			http.Error(w, "Invalid email or password", http.StatusUnauthorized)
			return
		}

		if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
			http.Error(w, "Invalid email or password", http.StatusUnauthorized)
			return
		}

		// Generate JWT
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"user_id": user.ID,
			"role":    user.UserType,
			"exp":     time.Now().Add(24 * time.Hour).Unix(),
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
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(res)
	}
}
