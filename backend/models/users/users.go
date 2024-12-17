package users

import (
	"database/sql"
	"encoding/json"
	"net/http"
)

// User represents a user in the system
type User struct {
	ID       int    `json:"id" gorm:"primaryKey"`
	Name     string `json:"name"`
	Email    string `json:"email" gorm:"unique"`
	Password string `json:"password"`
}

func GetUsers(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rows, err := db.Query("SELECT id, name, email FROM users")
		if err != nil {
			http.Error(w, "Failed to fetch users", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var users []map[string]interface{}
		for rows.Next() {
			var id int
			var name, email string
			if err := rows.Scan(&id, &name, &email); err != nil {
				http.Error(w, "Failed to parse user data", http.StatusInternalServerError)
				return
			}
			users = append(users, map[string]interface{}{
				"id":    id,
				"name":  name,
				"email": email,
			})
		}

		json.NewEncoder(w).Encode(users)
	}
}
