package users

import (
	"database/sql"
	"errors"
)

type User struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	UserType string `json:"user_type"`
}

// GetUserByEmail fetches a user by email from the database
func GetUserByEmail(db *sql.DB, email string) (User, error) {
	var user User
	query := "SELECT id, name, email, password, user_type FROM users WHERE email = ?"
	err := db.QueryRow(query, email).Scan(&user.ID, &user.Name, &user.Email, &user.Password, &user.UserType)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return user, errors.New("user not found")
		}
		return user, err
	}
	return user, nil
}
