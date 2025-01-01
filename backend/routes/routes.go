package routes

import (
	"database/sql"
	auth "home_solutions/backend/handlers/auth"
	inspection "home_solutions/backend/handlers/inspections.go"
	address "home_solutions/backend/handlers/properties"
	users "home_solutions/backend/models/users"
	"net/http"

	"github.com/gorilla/handlers"
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

	// Address handling routes
	router.HandleFunc("/api/get-address/{property_id}", address.GetAddressByPropertyID).Methods("GET")
	router.HandleFunc("/api/save-address", address.SaveAddress).Methods("POST", "OPTIONS")

	// Inspection form handling routes
	router.HandleFunc("/api/inspection/{formId}", inspection.GetInspectionForm).Methods("GET")
	router.HandleFunc("/api/create-inspection", inspection.CreateInspection).Methods("POST", "OPTIONS")

	// Enable CORS
	corsHandler := handlers.CORS(
		handlers.AllowedOrigins([]string{"http://localhost:3000"}),                   // Allow frontend origin
		handlers.AllowedMethods([]string{"GET", "POST", "OPTIONS", "PUT", "DELETE"}), // Include OPTIONS for preflight
		handlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
	)(router)

	// Start the server
	http.ListenAndServe(":8080", corsHandler)

	return router
}
