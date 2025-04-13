package database

import (
	"database/sql"
	"log"
	"os"
	"time"

	users "home_solutions/backend/models/users"

	_ "github.com/go-sql-driver/mysql"
)

func CreateUser(db *sql.DB, user users.User) error {
	query := "INSERT INTO users (name, email, password, user_type) VALUES (?, ?, ?, ?)"
	_, err := db.Exec(query, user.Name, user.Email, user.Password, user.UserType)
	if err != nil {
		log.Println("Error creating user:", err)
		return err
	}
	return nil
}

var DB *sql.DB

// GetDB returns the database connection instance
func GetDB() *sql.DB {
	return DB
}

// Connect initializes the database connection using environment variables
func Connect() *sql.DB {
	var db *sql.DB
	var err error

	// Fetch credentials from environment variables
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	dbName := os.Getenv("DB_NAME")

	// Construct the DSN
	dsn := user + ":" + password + "@tcp(" + host + ":" + port + ")/" + dbName

	for retries := 5; retries > 0; retries-- {
		db, err = sql.Open("mysql", dsn)
		if err == nil && db.Ping() == nil {
			log.Println("Database connected successfully!")
			return db
		}
		log.Println("Database connection failed. Retrying in 5 seconds...")
		time.Sleep(5 * time.Second)
	}

	log.Fatal("Could not connect to the database:", err)
	return nil
}
