package inspections

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/google/uuid"
)

type CreateInspectionRequest struct {
	PropertyID     string          `json:"property_id"`
	InspectionDate string          `json:"inspection_date,omitempty"` // Optional
	FormData       json.RawMessage `json:"form_data,omitempty"`       // Optional
}

type CreateInspectionResponse struct {
	FormID string `json:"form_id"`
}

func CreateInspection(w http.ResponseWriter, r *http.Request) {
	// Allow CORS
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

	// Get environment variables for database connection
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")

	// Correct DSN format
	dsn := fmt.Sprintf("%s:%s@tcp(database:3306)/%s", user, password, dbName)

	// Connect to the database
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Println("Error connecting to the database:", err)
		http.Error(w, "Failed to connect to the database", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	// Handle preflight (OPTIONS request)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Parse the request body
	var req CreateInspectionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Println("Error decoding request body:", err)
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Validate property_id
	if req.PropertyID == "" {
		http.Error(w, "Property ID is required", http.StatusBadRequest)
		return
	}

	// Generate a UUID for the form_id
	formID := uuid.New().String()

	// Insert a new inspection form into the database
	query := `INSERT INTO inspection_forms (form_id, property_id, inspection_date, form_data, status)
	          VALUES (?, ?, ?, ?, ?)`
	_, err = db.Exec(query, formID, req.PropertyID, req.InspectionDate, req.FormData, "in-progress")
	if err != nil {
		log.Println("Error inserting inspection form:", err)
		http.Error(w, "Failed to create inspection form", http.StatusInternalServerError)
		return
	}

	// Respond with the generated form_id
	res := CreateInspectionResponse{FormID: formID}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}
