package users

import (
	"database/sql"
	"log"
	"strings"
)

type User struct {
	ID        int    `json:"id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	UserType  string `json:"user_type"`
}

// GetUserByEmail fetches a user by email from the database
func GetUserByEmail(db *sql.DB, email string) (*User, error) {
	// Normalize input
	email = strings.TrimSpace(strings.ToLower(email))

	var user User
	query := `
		SELECT user_id, first_name, last_name, email, password, user_type
		FROM users
		WHERE TRIM(LOWER(email)) = TRIM(LOWER(?))
	`
	err := db.QueryRow(query, email).Scan(&user.ID, &user.FirstName, &user.LastName, &user.Email, &user.Password, &user.UserType)
	if err != nil {
		log.Printf("User not found or error during lookup for email '%s': %v", email, err)

		// Optional: debug available emails in DB
		if rows, dbErr := db.Query("SELECT email FROM users"); dbErr == nil {
			defer rows.Close()
			log.Println("Current DB emails:")
			for rows.Next() {
				var em string
				rows.Scan(&em)
				log.Printf(" - %s", em)
			}
		}

		return nil, err
	}

	log.Printf("User found: ID=%d, Email=%s, Type=%s", user.ID, user.Email, user.UserType)
	return &user, nil
}
