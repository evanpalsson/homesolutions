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

// COVERPAGE WORKSHEET -------------------------------------------------------------------------------------------
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
	// log.Printf("Inserting inspection with inspection_id=%s, property_id=%s, inspection_date=%s", inspectionID, propertyID, inspectionDate)

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

// EXTERIOR WORKSHEET -------------------------------------------------------------------------------------------
type ExteriorData struct {
	InspectionID string          `json:"inspection_id"`
	ItemName     string          `json:"item_name"`
	Materials    map[string]bool `json:"materials"`
	Condition    string          `json:"condition"`
	Comments     string          `json:"comments"`
}

func SaveExteriorData() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Connect to the database
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

		// Parse the request body
		var data []ExteriorData
		if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
			log.Printf("Error decoding request body: %v", err)
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		log.Printf("Payload received: %+v", data)

		// Insert each record into the database
		query := `INSERT INTO inspection_exterior (inspection_id, item_name, materials, item_condition, comments)
				  VALUES (?, ?, ?, ?, ?)`
		for _, record := range data {
			if record.ItemName == "" || record.InspectionID == "" || len(record.Materials) == 0 {
				log.Println("Validation failed: Missing required fields")
				http.Error(w, "Missing required fields", http.StatusBadRequest)
				return
			}

			materialsJSON, err := json.Marshal(record.Materials)
			if err != nil {
				log.Printf("Error marshalling materials: %v", err)
				http.Error(w, "Invalid materials format", http.StatusBadRequest)
				return
			}

			// Handle item_condition: Use NULL if empty
			var itemCondition interface{}
			if record.Condition == "" {
				itemCondition = nil
			} else {
				itemCondition = record.Condition
			}

			_, err = db.Exec(query, record.InspectionID, record.ItemName, materialsJSON, itemCondition, record.Comments)
			if err != nil {
				log.Printf("Error executing query: %v", err)
				http.Error(w, "Database error", http.StatusInternalServerError)
				return
			}
		}

		// Respond with success
		w.WriteHeader(http.StatusCreated)
		w.Write([]byte("Exterior data saved successfully"))
	}
}

func GetExteriorData() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		inspectionId := vars["inspection_id"]

		if inspectionId == "" {
			http.Error(w, "Inspection ID is required", http.StatusBadRequest)
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

		query := `SELECT item_name, materials, item_condition, comments FROM inspection_exterior WHERE inspection_id = ?`
		rows, err := db.Query(query, inspectionId)
		if err != nil {
			log.Printf("Error fetching exterior data: %v", err)
			http.Error(w, "Failed to fetch data", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var data []ExteriorData
		for rows.Next() {
			var record ExteriorData
			var materialsJSON string
			var itemCondition sql.NullString
			var comments sql.NullString

			if err := rows.Scan(&record.ItemName, &materialsJSON, &itemCondition, &comments); err != nil {
				log.Printf("Error scanning row: %v", err)
				http.Error(w, "Failed to parse data", http.StatusInternalServerError)
				return
			}

			if err := json.Unmarshal([]byte(materialsJSON), &record.Materials); err != nil {
				log.Printf("Error unmarshalling materials: %v", err)
				http.Error(w, "Failed to parse materials", http.StatusInternalServerError)
				return
			}

			// Handle NULL values
			if itemCondition.Valid {
				record.Condition = itemCondition.String
			} else {
				record.Condition = ""
			}

			if comments.Valid {
				record.Comments = comments.String
			} else {
				record.Comments = ""
			}

			data = append(data, record)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(data)
	}
}
