package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"strings"

	"home_solutions/backend/database"
	"home_solutions/backend/middleware"
	"home_solutions/backend/routes"

	_ "github.com/go-sql-driver/mysql"
	"golang.org/x/crypto/bcrypt"
)

func seedUsers(db *sql.DB) {
	users := []struct {
		FirstName string
		LastName  string
		Email     string
		Password  string
		UserType  string
	}{
		{"Evan", "Palsson", "homeowner@example.com", "test1234", "homeowner"},
		{"Evan", "Palsson", "inspector@example.com", "test1234", "inspector"},
		{"Evan", "Palsson", "admin@example.com", "test1234", "admin"},
	}

	for _, user := range users {
		email := strings.ToLower(strings.TrimSpace(user.Email))
		log.Printf("Checking or inserting email: '%s'", email)

		var exists bool
		err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE email = ?)", email).Scan(&exists)
		if err != nil {
			log.Printf("Error checking if user exists (%s): %v", email, err)
			continue
		}

		if exists {
			log.Printf("User already exists: %s", email)
			continue
		}

		passwordToInsert := user.Password
		if !strings.HasPrefix(user.Password, "$2a$") {
			hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
			if err != nil {
				log.Printf("Error hashing password for %s: %v", email, err)
				continue
			}
			passwordToInsert = string(hashedPassword)
		}

		_, err = db.Exec(`
			INSERT INTO users (first_name, last_name, email, password, user_type)
			VALUES (?, ?, ?, ?, ?)`,
			user.FirstName, user.LastName, email, passwordToInsert, user.UserType,
		)

		if err != nil {
			log.Printf("Failed to insert user %s: %v", email, err)
		} else {
			log.Printf("Inserted user: %s", email)
		}
	}
}

func main() {
	db := database.Connect()
	defer db.Close()

	seedUsers(db)

	router := routes.RegisterRoutes(db)

	// Serve static files separately from /uploads/ WITHOUT CORS
	http.Handle("/uploads/", http.StripPrefix("/uploads/", http.FileServer(http.Dir("./uploads/"))))

	// Wrap all other routes with CORS
	corsWrapped := middleware.EnableCORS(router)

	fmt.Println("Server running at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", corsWrapped))
}
