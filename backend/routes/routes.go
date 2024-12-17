package routes

import (
	"database/sql"
	auth "home_solutions/backend/handlers/auth"

	// properties "home_solutions/backend/models/properties"
	users "home_solutions/backend/models/users"

	"github.com/gorilla/mux"
)

// RegisterRoutes registers all API routes
func RegisterRoutes(db *sql.DB) *mux.Router {
	router := mux.NewRouter()

	// Authentication routes
	router.HandleFunc("/login", auth.Login(db)).Methods("POST")
	router.HandleFunc("/api/login", auth.Login(db)).Methods("POST")
	router.HandleFunc("/api/auth/google", auth.GoogleAuthHandler).Methods("POST")
	router.HandleFunc("/api/auth/apple", auth.AppleAuthHandler).Methods("POST")

	// User routes
	router.HandleFunc("/users", users.GetUsers(db)).Methods("GET")
	// router.HandleFunc("/api/properties", properties.GetProperties(db)).Methods("GET")

	// router.HandleFunc("/users", addressValidation.HandleValidateAddress(db)).Methods("GET")

	return router
}
