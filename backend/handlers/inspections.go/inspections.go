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
	if r.Method == http.MethodOptions {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.WriteHeader(http.StatusOK)
		return
	}

	vars := mux.Vars(r)
	inspectionId := vars["inspection_id"]
	propertyId := vars["property_id"] // Extracted from the path

	// log.Printf("Received request: inspectionId=%s, propertyId=%s", inspectionId, propertyId)

	if inspectionId == "" {
		http.Error(w, "Inspection ID is required", http.StatusBadRequest)
		return
	}

	if propertyId == "" {
		http.Error(w, "Property ID is required", http.StatusBadRequest)
		return
	}

	// Get database connection
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

	// Query for validation
	var count int
	query := `SELECT COUNT(*) FROM inspections WHERE inspection_id = ?`
	if propertyId != "" {
		query += ` AND (property_id = ? OR property_id IS NULL)`
		// log.Printf("Executing query: %s with parameters: inspectionId=%s, propertyId=%s", query, inspectionId, propertyId)
		err = db.QueryRow(query, inspectionId, propertyId).Scan(&count)
	} else {
		// log.Printf("Executing query: %s with parameter: inspectionId=%s", query, inspectionId)
		err = db.QueryRow(query, inspectionId).Scan(&count)
	}

	if err != nil {
		// log.Printf("Error executing query: %v", err)
		http.Error(w, "Database query failed", http.StatusInternalServerError)
		return
	}
	// log.Printf("Validation count: %d", count)
	if count == 0 {
		http.Error(w, "Inspection not found or invalid association", http.StatusNotFound)
		return
	}

	// Fetch the inspection details
	var inspectionData struct {
		InspectionID   string `json:"inspection_id"`
		PropertyID     string `json:"property_id"`
		InspectionDate string `json:"inspection_date"`
		Status         string `json:"status"`
	}
	query = `SELECT inspection_id, property_id, inspection_date, status FROM inspections WHERE inspection_id = ?`
	// log.Printf("Executing query: %s with parameter: inspectionId=%s", query, inspectionId)
	err = db.QueryRow(query, inspectionId).Scan(&inspectionData.InspectionID, &inspectionData.PropertyID, &inspectionData.InspectionDate, &inspectionData.Status)
	if err != nil {
		log.Printf("Error fetching inspection details: %v", err)
		http.Error(w, "Failed to fetch inspection data", http.StatusInternalServerError)
		return
	}

	// log.Printf("Fetched inspection data: %+v", inspectionData)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(inspectionData)
}

// UpdateInspection handles updating inspection details
func UpdateInspection(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Methods", "PUT, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
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

	var inspection struct {
		InspectionID    string  `json:"inspection_id"`
		Temperature     *int    `json:"temperature"`
		Weather         *string `json:"weather"`
		GroundCondition *string `json:"ground_condition"`
		RainLast3Days   *bool   `json:"rain_last_three_days"`
		RadonTest       *bool   `json:"radon_test"`
		MoldTest        *bool   `json:"mold_test"`
	}

	if err := json.NewDecoder(r.Body).Decode(&inspection); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	query := `
        UPDATE inspections
        SET temperature = ?, weather = ?, ground_condition = ?, 
            rain_last_three_days = ?, radon_test = ?, mold_test = ?
        WHERE inspection_id = ?
    `

	db.Exec(query, inspection.Temperature, inspection.Weather, inspection.GroundCondition,
		inspection.RainLast3Days, inspection.RadonTest, inspection.MoldTest, inspection.InspectionID)

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "Inspection updated successfully"}`))
}
