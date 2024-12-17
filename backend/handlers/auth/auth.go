package auth

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	database "home_solutions/backend/database"
	users "home_solutions/backend/models/users"

	"github.com/dgrijalva/jwt-go"
	"golang.org/x/crypto/bcrypt"
)

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type Claims struct {
	UserID int `json:"user_id"`
	jwt.StandardClaims
}

type TokenRequest struct {
	Token string `json:"token"`
}

func Login(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var input LoginRequest
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		// Find the user by email
		var storedPassword string
		var userID int
		err := db.QueryRow("SELECT id, password FROM users WHERE email = ?", input.Email).Scan(&userID, &storedPassword)
		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "Invalid credentials", http.StatusUnauthorized)
				return
			}
			http.Error(w, fmt.Sprintf("Error querying database: %v", err), http.StatusInternalServerError)
			return
		}

		// Compare password with hashed password
		if err := bcrypt.CompareHashAndPassword([]byte(storedPassword), []byte(input.Password)); err != nil {
			http.Error(w, "Invalid credentials", http.StatusUnauthorized)
			return
		}

		// Generate JWT Token
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, Claims{
			UserID: userID,
			StandardClaims: jwt.StandardClaims{
				ExpiresAt: time.Now().Add(time.Hour * 72).Unix(),
			},
		})

		// Sign the token with your secret key
		tokenString, err := token.SignedString([]byte("your_secret_key"))
		if err != nil {
			http.Error(w, "Error generating token", http.StatusInternalServerError)
			return
		}

		// Send the token back to the client
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"token": tokenString})
	}
}

// Register function for hashing the password before storing it in the DB
func Register(db *sql.DB, email, password, name string) error {
	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// Insert the user with hashed password
	_, err = db.Exec("INSERT INTO users (email, password, name) VALUES (?, ?, ?)", email, hashedPassword, name)
	if err != nil {
		return err
	}

	return nil
}

// HashPassword takes a plain password and returns the hashed version
func HashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Println("Error hashing password:", err)
		return "", err
	}
	return string(hash), nil
}

func GetUserByEmail(email string) (*users.User, error) {
	db := database.GetDB() // Get the database connection

	var user users.User
	query := "SELECT id, email, password FROM users WHERE email = ?"
	err := db.QueryRow(query, email).Scan(&user.ID, &user.Email, &user.Password)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("no user found with email %s", email)
		}
		return nil, err
	}
	return &user, nil
}

func GoogleAuthHandler(w http.ResponseWriter, r *http.Request) {
	var req TokenRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	// Validate token with Google API and fetch user details
	fmt.Fprintf(w, "Google token: %s", req.Token)
}

func AppleAuthHandler(w http.ResponseWriter, r *http.Request) {
	var req TokenRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	// Validate token with Apple API and fetch user details
	fmt.Fprintf(w, "Apple token: %s", req.Token)
}
