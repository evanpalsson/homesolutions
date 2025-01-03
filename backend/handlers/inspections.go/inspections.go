package inspections

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type CreateInspectionRequest struct {
	PropertyID     string `json:"property_id"`
	InspectionDate string `json:"inspection_date,omitempty"`
}

type CreateInspectionResponse struct {
	InspectionID string `json:"inspection_id"`
}

// CreateInspectionHelper creates a new inspection form and returns the form ID
func CreateInspectionHelper(db *sql.DB, propertyID string, inspectionDate string) (string, error) {
	inspectionID := uuid.New().String()

	// Validate and set default for InspectionDate
	if inspectionDate == "" {
		inspectionDate = time.Now().Format("2006-01-02") // Default to current date
	}

	query := `INSERT INTO inspections (inspection_id, property_id, inspection_date, status)
	          VALUES (?, ?, ?, ?)`
	_, err := db.Exec(query, inspectionID, propertyID, inspectionDate, "in-progress")
	if err != nil {
		log.Println("Error inserting inspection form:", err)
		return "", err
	}

	return inspectionID, nil
}

// CreateInspection handles HTTP requests to create a new inspection form
func CreateInspection(w http.ResponseWriter, r *http.Request) {
	// Allow CORS
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

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

	// Get environment variables for database connection
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	dbHard := os.Getenv("DB_HARDCODE")
	dsn := fmt.Sprintf("%s:%s@tcp(%s:3306)/%s", user, password, dbHard, dbName)
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Println("Error connecting to the database:", err)
		http.Error(w, "Failed to connect to the database", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	// Use CreateInspectionHelper to insert into the database
	inspectionID, err := CreateInspectionHelper(db, req.PropertyID, req.InspectionDate)
	if err != nil {
		http.Error(w, "Failed to create inspection form", http.StatusInternalServerError)
		return
	}

	res := CreateInspectionResponse{InspectionID: inspectionID}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

// GetInspectionForm fetches the inspection data by inspectionId
func GetInspectionForm(w http.ResponseWriter, r *http.Request) {
	// Extract formId from the route parameters
	vars := mux.Vars(r)
	inspectionId := vars["inspectionId"]
	if inspectionId == "" {
		http.Error(w, "Inspection ID is required", http.StatusBadRequest)
		return
	}

	// Connect to the database
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	dbHard := os.Getenv("DB_HARDCODE")
	dsn := fmt.Sprintf("%s:%s@tcp(%s:3306)/%s", user, password, dbHard, dbName)
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Println("Error connecting to the database:", err)
		http.Error(w, "Failed to connect to the database", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	// Query the inspection data
	var inspectionData struct {
		InspectionID   string `json:"inspection_id"`
		PropertyID     string `json:"property_id"`
		InspectionDate string `json:"inspection_date"`
	}
	query := `SELECT inspection_id, property_id, inspection_date
	          FROM inspections
	          WHERE inspection_id = ?`
	err = db.QueryRow(query, inspectionId).Scan(&inspectionData.InspectionID, &inspectionData.PropertyID, &inspectionData.InspectionDate)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Inspection form not found", http.StatusNotFound)
		} else {
			log.Println("Error querying inspection form:", err)
			http.Error(w, "Failed to fetch inspection form", http.StatusInternalServerError)
		}
		return
	}

	// Respond with the inspection data
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(inspectionData)
}
