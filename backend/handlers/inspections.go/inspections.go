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
	} else {
		_, err := time.Parse("2006-01-02", inspectionDate)
		if err != nil {
			log.Printf("Invalid inspection_date format: %s", inspectionDate)
			return "", fmt.Errorf("invalid date format")
		}
	}

	query := `INSERT INTO inspections (inspection_id, property_id, inspection_date, status)
              VALUES (?, ?, ?, ?)`
	log.Printf("Inserting inspection with inspection_id=%s, property_id=%s, inspection_date=%s", inspectionID, propertyID, inspectionDate)

	_, err := db.Exec(query, inspectionID, propertyID, inspectionDate, "in-progress")
	if err != nil {
		log.Printf("Error inserting inspection form with parameters: inspection_id=%s, property_id=%s, inspection_date=%s, error=%v",
			inspectionID, propertyID, inspectionDate, err)
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
	vars := mux.Vars(r)
	inspectionId := vars["inspection_id"]
	propertyId := vars["property_id"]

	if inspectionId == "" || propertyId == "" {
		http.Error(w, "Property ID and Inspection ID are required", http.StatusBadRequest)
		return
	}

	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	dbHost := os.Getenv("DB_HARDCODE")
	dsn := fmt.Sprintf("%s:%s@tcp(%s:3306)/%s", user, password, dbHost, dbName)
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Printf("Error connecting to the database: %v", err)
		http.Error(w, "Failed to connect to the database", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	query := `
        SELECT inspection_id, property_id, inspection_date, status, temperature, weather, 
               ground_condition, rain_last_three_days, radon_test, mold_test
        FROM inspections 
        WHERE inspection_id = ? AND property_id = ?
    `
	var inspectionDateStr string
	var inspectionData struct {
		InspectionID    string  `json:"inspection_id"`
		PropertyID      string  `json:"property_id"`
		InspectionDate  string  `json:"inspection_date"`
		Status          string  `json:"status"`
		Temperature     *int    `json:"temperature"`
		Weather         *string `json:"weather"`
		GroundCondition *string `json:"ground_condition"`
		RainLast3Days   *bool   `json:"rain_last_three_days"`
		RadonTest       *bool   `json:"radon_test"`
		MoldTest        *bool   `json:"mold_test"`
	}

	err = db.QueryRow(query, inspectionId, propertyId).Scan(
		&inspectionData.InspectionID,
		&inspectionData.PropertyID,
		&inspectionDateStr,
		&inspectionData.Status,
		&inspectionData.Temperature,
		&inspectionData.Weather,
		&inspectionData.GroundCondition,
		&inspectionData.RainLast3Days,
		&inspectionData.RadonTest,
		&inspectionData.MoldTest,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			log.Printf("No inspection found for inspectionId=%s and propertyId=%s", inspectionId, propertyId)
			http.Error(w, "Inspection not found", http.StatusNotFound)
		} else {
			log.Printf("Error executing query: %v", err)
			http.Error(w, "Failed to fetch inspection data", http.StatusInternalServerError)
		}
		return
	}

	// Parse the inspection_date string to Go's time.Time if necessary
	if inspectionDateStr != "" {
		parsedDate, err := time.Parse("2006-01-02", inspectionDateStr)
		if err != nil {
			log.Printf("Error parsing inspection_date: %v", err)
			http.Error(w, "Invalid date format in database", http.StatusInternalServerError)
			return
		}
		inspectionData.InspectionDate = parsedDate.Format("2006-01-02")
	} else {
		inspectionData.InspectionDate = ""
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(inspectionData); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, "Failed to encode inspection data", http.StatusInternalServerError)
	}
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
		InspectionDate  *string `json:"inspection_date"`
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
        SET inspection_date = ?, temperature = ?, weather = ?, ground_condition = ?, 
            rain_last_three_days = ?, radon_test = ?, mold_test = ?
        WHERE inspection_id = ?
    `

	_, err = db.Exec(query, inspection.InspectionDate, inspection.Temperature, inspection.Weather,
		inspection.GroundCondition, inspection.RainLast3Days, inspection.RadonTest, inspection.MoldTest, inspection.InspectionID)

	if err != nil {
		log.Printf("Error updating inspection: %v", err)
		http.Error(w, "Failed to update inspection", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "Inspection updated successfully"}`))
}
