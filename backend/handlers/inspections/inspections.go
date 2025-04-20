package inspections

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path"
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

type NullableInt struct {
	Value *int
}

func (n *NullableInt) UnmarshalJSON(b []byte) error {
	if string(b) == "null" || string(b) == `""` {
		n.Value = nil
		return nil
	}
	var i int
	if err := json.Unmarshal(b, &i); err != nil {
		return err
	}
	n.Value = &i
	return nil
}

// COVERPAGE WORKSHEET -------------------------------------------------------------------------------------------
// CreateInspectionHelper creates a new inspection form and returns the form ID
func CreateInspectionHelper(db *sql.DB, propertyID string, inspectionDate string) (string, error) {
	inspectionID := uuid.New().String()

	if inspectionDate == "" {
		inspectionDate = time.Now().UTC().Format("2006-01-02")
	} else {
		_, err := time.Parse("2006-01-02", inspectionDate)
		if err != nil {
			return "", fmt.Errorf("invalid date format")
		}
	}

	// Get the next report number for this property
	var count int
	err := db.QueryRow(`SELECT COUNT(*) FROM inspections WHERE property_id = ?`, propertyID).Scan(&count)
	if err != nil {
		return "", fmt.Errorf("failed to count previous inspections: %v", err)
	}
	reportID := fmt.Sprintf("%s-%d", propertyID, count+1)

	query := `INSERT INTO inspections (inspection_id, property_id, inspection_date, status, report_id)
              VALUES (?, ?, ?, ?, ?)`

	_, err = db.Exec(query, inspectionID, propertyID, inspectionDate, "in-progress", reportID)
	if err != nil {
		log.Printf("Error inserting inspection: %v", err)
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
        SELECT inspection_id, property_id, report_id, inspection_date, status, temperature, weather, ground_condition, rain_last_three_days, radon_test, mold_test
        FROM inspections 
        WHERE inspection_id = ? AND property_id = ?
    `
	var inspectionDateStr string
	var inspectionData struct {
		InspectionID    string  `json:"inspection_id"`
		PropertyID      string  `json:"property_id"`
		ReportID        string  `json:"report_id"`
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
		&inspectionData.ReportID,
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
		InspectionID    string      `json:"inspection_id"`
		InspectionDate  *string     `json:"inspection_date"`
		Temperature     NullableInt `json:"temperature"`
		Weather         *string     `json:"weather"`
		GroundCondition *string     `json:"ground_condition"`
		RainLast3Days   *bool       `json:"rain_last_three_days"`
		RadonTest       *bool       `json:"radon_test"`
		MoldTest        *bool       `json:"mold_test"`
	}

	if err := json.NewDecoder(r.Body).Decode(&inspection); err != nil {
		log.Printf("❌ Failed to decode inspection update: %v", err)
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	query := `
        UPDATE inspections
        SET inspection_date = ?, temperature = ?, weather = ?, ground_condition = ?, 
            rain_last_three_days = ?, radon_test = ?, mold_test = ?
        WHERE inspection_id = ?
    `

	_, err = db.Exec(query, inspection.InspectionDate, inspection.Temperature.Value, inspection.Weather,
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
	InspectionID     string          `json:"inspection_id"`
	ItemName         string          `json:"item_name"`
	Materials        map[string]bool `json:"materials"`
	Conditions       map[string]bool `json:"conditions"`
	Comments         string          `json:"comments"`
	InspectionStatus string          `json:"inspection_status"`
}

func SaveExteriorData() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
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

		var data []ExteriorData
		if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
			log.Printf("Error decoding request body: %v", err)
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		// log.Printf("Payload received: %+v", data)

		query := `
			INSERT INTO inspection_exterior (inspection_id, item_name, materials, conditions, comments, inspection_status)
			VALUES (?, ?, ?, ?, ?, ?)
			ON DUPLICATE KEY UPDATE
			materials = VALUES(materials),
			conditions = VALUES(conditions),
			comments = VALUES(comments),
			inspection_status = VALUES(inspection_status)
		`

		for _, record := range data {
			if record.ItemName == "" || record.InspectionID == "" {
				log.Printf("Validation failed: Missing required fields for record: %+v", record)
				continue
			}

			materialsJSON, err := json.Marshal(record.Materials)
			if err != nil {
				log.Printf("Error marshalling materials: %v", err)
				materialsJSON = []byte("{}")
			}

			conditionsJSON, err := json.Marshal(record.Conditions)
			if err != nil {
				log.Printf("Error marshalling condition: %v", err)
				conditionsJSON = []byte("{}")
			}

			// log.Printf("Executing query with inspection_id=%s, item_name=%s, materials=%s, conditions=%s, comments=%s",
			// 	record.InspectionID, record.ItemName, string(materialsJSON), string(conditionsJSON), record.Comments)

			_, err = db.Exec(query, record.InspectionID, record.ItemName, materialsJSON, conditionsJSON, record.Comments, record.InspectionStatus)

			if err != nil {
				log.Printf("Error executing query: %v", err)
				http.Error(w, "Database error", http.StatusInternalServerError)
				return
			}
		}

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

		query := `SELECT item_name, materials, conditions, comments, inspection_status FROM inspection_exterior WHERE inspection_id = ?`

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
			var materialsJSON, conditionsJSON string
			var comments sql.NullString
			var status sql.NullString

			if err := rows.Scan(&record.ItemName, &materialsJSON, &conditionsJSON, &comments, &status); err != nil {
				log.Printf("Error scanning row: %v", err)
				http.Error(w, "Failed to parse data", http.StatusInternalServerError)
				return
			}

			if err := json.Unmarshal([]byte(materialsJSON), &record.Materials); err != nil {
				log.Printf("Error unmarshalling materials: %v", err)
				http.Error(w, "Failed to parse materials", http.StatusInternalServerError)
				return
			}

			if err := json.Unmarshal([]byte(conditionsJSON), &record.Conditions); err != nil {
				log.Printf("Error unmarshalling conditions: %v", err)
				http.Error(w, "Failed to parse conditions", http.StatusInternalServerError)
				return
			}

			record.InspectionID = inspectionId
			record.Comments = ""
			if comments.Valid {
				record.Comments = comments.String
			}
			record.InspectionStatus = ""
			if status.Valid {
				record.InspectionStatus = status.String
			}

			data = append(data, record)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(data)
	}
}

// ROOF WORKSHEET -------------------------------------------------------------------------------------------
type RoofData struct {
	InspectionID     string          `json:"inspection_id"`
	ItemName         string          `json:"item_name"`
	Materials        map[string]bool `json:"materials"`
	Conditions       map[string]bool `json:"conditions"`
	Comments         string          `json:"comments"`
	InspectionStatus string          `json:"inspection_status"`
}

func SaveRoofData() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
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

		var data []RoofData
		if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
			log.Printf("Error decoding request body: %v", err)
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		query := `
			INSERT INTO inspection_roof (inspection_id, item_name, materials, conditions, comments, inspection_status)
			VALUES (?, ?, ?, ?, ?, ?)
			ON DUPLICATE KEY UPDATE
				materials = VALUES(materials),
				conditions = VALUES(conditions),
				comments = VALUES(comments),
				inspection_status = VALUES(inspection_status)
		`

		for _, record := range data {
			if record.ItemName == "" || record.InspectionID == "" {
				continue
			}

			materialsJSON, _ := json.Marshal(record.Materials)
			conditionsJSON, _ := json.Marshal(record.Conditions)

			_, err := db.Exec(query, record.InspectionID, record.ItemName, materialsJSON, conditionsJSON, record.Comments, record.InspectionStatus)
			if err != nil {
				log.Printf("Error executing insert: %v", err)
				http.Error(w, "Database error", http.StatusInternalServerError)
				return
			}
		}

		w.WriteHeader(http.StatusCreated)
		w.Write([]byte("Roof data saved successfully"))
	}
}

func GetRoofData() http.HandlerFunc {
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
			log.Printf("Error connecting to DB: %v", err)
			http.Error(w, "Database connection failed", http.StatusInternalServerError)
			return
		}
		defer db.Close()

		query := `SELECT item_name, materials, conditions, comments, inspection_status FROM inspection_roof WHERE inspection_id = ?`
		rows, err := db.Query(query, inspectionId)
		if err != nil {
			log.Printf("Error querying roof data: %v", err)
			http.Error(w, "Query error", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var data []RoofData
		for rows.Next() {
			var record RoofData
			var materialsJSON, conditionsJSON string
			var comments sql.NullString
			var status sql.NullString

			if err := rows.Scan(&record.ItemName, &materialsJSON, &conditionsJSON, &comments, &status); err != nil {
				log.Printf("Row scan error: %v", err)
				http.Error(w, "Row scan failed", http.StatusInternalServerError)
				return
			}

			json.Unmarshal([]byte(materialsJSON), &record.Materials)
			json.Unmarshal([]byte(conditionsJSON), &record.Conditions)
			record.InspectionID = inspectionId
			record.Comments = ""
			if comments.Valid {
				record.Comments = comments.String
			}
			record.InspectionStatus = ""
			if status.Valid {
				record.InspectionStatus = status.String
			}

			data = append(data, record)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(data)
	}
}

// BASEMENT FOUNDATION WORKSHEET -------------------------------------------------------------------------------------------
type BasementData struct {
	InspectionID     string          `json:"inspection_id"`
	ItemName         string          `json:"item_name"`
	Materials        map[string]bool `json:"materials"`
	Conditions       map[string]bool `json:"conditions"`
	Comments         string          `json:"comments"`
	InspectionStatus string          `json:"inspection_status"`
}

func SaveBasementData() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
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

		var data []BasementData
		if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
			log.Printf("Error decoding request body: %v", err)
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		query := `
			INSERT INTO inspection_basementFoundation (inspection_id, item_name, materials, conditions, comments, inspection_status)
			VALUES (?, ?, ?, ?, ?, ?)
			ON DUPLICATE KEY UPDATE
				materials = VALUES(materials),
				conditions = VALUES(conditions),
				comments = VALUES(comments),
				inspection_status = VALUES(inspection_status)
			`

		for _, record := range data {
			if record.ItemName == "" || record.InspectionID == "" {
				continue
			}

			materialsJSON, _ := json.Marshal(record.Materials)
			conditionsJSON, _ := json.Marshal(record.Conditions)

			_, err := db.Exec(query, record.InspectionID, record.ItemName, materialsJSON, conditionsJSON, record.Comments, record.InspectionStatus)
			if err != nil {
				log.Printf("Error executing insert: %v", err)
				http.Error(w, "Database error", http.StatusInternalServerError)
				return
			}
		}

		w.WriteHeader(http.StatusCreated)
		w.Write([]byte("Basement/Foundation data saved successfully"))
	}
}

func GetBasementData() http.HandlerFunc {
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
			log.Printf("Error connecting to DB: %v", err)
			http.Error(w, "Database connection failed", http.StatusInternalServerError)
			return
		}
		defer db.Close()

		query := `SELECT item_name, materials, conditions, comments, inspection_status FROM inspection_basementFoundation WHERE inspection_id = ?`

		rows, err := db.Query(query, inspectionId)
		if err != nil {
			log.Printf("Error querying basement data: %v", err)
			http.Error(w, "Query error", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var data []BasementData
		for rows.Next() {
			var record BasementData
			var materialsJSON, conditionsJSON string
			var comments sql.NullString
			var status sql.NullString

			if err := rows.Scan(&record.ItemName, &materialsJSON, &conditionsJSON, &comments, &status); err != nil {
				log.Printf("Row scan error: %v", err)
				http.Error(w, "Row scan failed", http.StatusInternalServerError)
				return
			}

			json.Unmarshal([]byte(materialsJSON), &record.Materials)
			json.Unmarshal([]byte(conditionsJSON), &record.Conditions)
			record.InspectionID = inspectionId
			record.Comments = ""
			if comments.Valid {
				record.Comments = comments.String
			}

			record.InspectionStatus = ""
			if status.Valid {
				record.InspectionStatus = status.String
			}

			data = append(data, record)

		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(data)
	}
}

// HEATING WORKSHEET -------------------------------------------------------------------------------------------
type HeatingData struct {
	InspectionID     string          `json:"inspection_id"`
	ItemName         string          `json:"item_name"`
	Materials        map[string]bool `json:"materials"`
	Conditions       map[string]bool `json:"conditions"`
	Comments         string          `json:"comments"`
	InspectionStatus string          `json:"inspection_status"` // ✅ add this
}

func SaveHeatingData() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
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

		var data []HeatingData
		if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
			log.Printf("Error decoding request body: %v", err)
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		query := `
			INSERT INTO inspection_heating (inspection_id, item_name, materials, conditions, comments, inspection_status)
			VALUES (?, ?, ?, ?, ?, ?)
			ON DUPLICATE KEY UPDATE
				materials = VALUES(materials),
				conditions = VALUES(conditions),
				comments = VALUES(comments),
				inspection_status = VALUES(inspection_status)
		`

		for _, record := range data {
			if record.ItemName == "" || record.InspectionID == "" {
				continue
			}

			materialsJSON, _ := json.Marshal(record.Materials)
			conditionsJSON, _ := json.Marshal(record.Conditions)

			_, err := db.Exec(query, record.InspectionID, record.ItemName, materialsJSON, conditionsJSON, record.Comments, record.InspectionStatus)
			if err != nil {
				log.Printf("Error executing insert: %v", err)
				http.Error(w, "Database error", http.StatusInternalServerError)
				return
			}
		}

		w.WriteHeader(http.StatusCreated)
		w.Write([]byte("Heating data saved successfully"))
	}
}

func GetHeatingData() http.HandlerFunc {
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
			log.Printf("Error connecting to DB: %v", err)
			http.Error(w, "Database connection failed", http.StatusInternalServerError)
			return
		}
		defer db.Close()

		query := `SELECT item_name, materials, conditions, comments, inspection_status FROM inspection_heating WHERE inspection_id = ?`
		rows, err := db.Query(query, inspectionId)
		if err != nil {
			log.Printf("Error querying heating data: %v", err)
			http.Error(w, "Query error", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var data []HeatingData
		for rows.Next() {
			var record HeatingData
			var materialsJSON, conditionsJSON string
			var comments sql.NullString
			var status sql.NullString

			if err := rows.Scan(&record.ItemName, &materialsJSON, &conditionsJSON, &comments, &status); err != nil {
				log.Printf("Row scan error: %v", err)
				http.Error(w, "Row scan failed", http.StatusInternalServerError)
				return
			}

			json.Unmarshal([]byte(materialsJSON), &record.Materials)
			json.Unmarshal([]byte(conditionsJSON), &record.Conditions)
			record.InspectionID = inspectionId
			record.Comments = ""
			if comments.Valid {
				record.Comments = comments.String
			}

			record.InspectionStatus = ""
			if status.Valid {
				record.InspectionStatus = status.String
			}

			data = append(data, record)
		}

		if len(data) == 0 {
			data = []HeatingData{}
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(data)
	}
}

// COOLING WORKSHEET -------------------------------------------------------------------------------------------
type CoolingData struct {
	InspectionID     string          `json:"inspection_id"`
	ItemName         string          `json:"item_name"`
	Materials        map[string]bool `json:"materials"`
	Conditions       map[string]bool `json:"conditions"`
	Comments         string          `json:"comments"`
	InspectionStatus string          `json:"inspection_status"` // ✅ Add this line
}

func SaveCoolingData() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
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

		var data []CoolingData
		if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
			log.Printf("Error decoding request body: %v", err)
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		query := `
			INSERT INTO inspection_cooling (inspection_id, item_name, materials, conditions, comments, inspection_status)
			VALUES (?, ?, ?, ?, ?, ?)
			ON DUPLICATE KEY UPDATE
				materials = VALUES(materials),
				conditions = VALUES(conditions),
				comments = VALUES(comments),
				inspection_status = VALUES(inspection_status)
			`

		for _, record := range data {
			if record.ItemName == "" || record.InspectionID == "" {
				continue
			}

			materialsJSON, _ := json.Marshal(record.Materials)
			conditionsJSON, _ := json.Marshal(record.Conditions)

			_, err := db.Exec(query, record.InspectionID, record.ItemName, materialsJSON, conditionsJSON, record.Comments, record.InspectionStatus)
			if err != nil {
				log.Printf("Error executing insert: %v", err)
				http.Error(w, "Database error", http.StatusInternalServerError)
				return
			}
		}

		w.WriteHeader(http.StatusCreated)
		w.Write([]byte("Cooling data saved successfully"))
	}
}

func GetCoolingData() http.HandlerFunc {
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
			log.Printf("Error connecting to DB: %v", err)
			http.Error(w, "Database connection failed", http.StatusInternalServerError)
			return
		}
		defer db.Close()

		query := `SELECT item_name, materials, conditions, comments, inspection_status FROM inspection_cooling WHERE inspection_id = ?`
		rows, err := db.Query(query, inspectionId)
		if err != nil {
			log.Printf("Error querying cooling data: %v", err)
			http.Error(w, "Query error", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var data []CoolingData
		for rows.Next() {
			var record CoolingData
			var materialsJSON, conditionsJSON string
			var comments sql.NullString
			var status sql.NullString

			if err := rows.Scan(&record.ItemName, &materialsJSON, &conditionsJSON, &comments, &status); err != nil {
				log.Printf("Row scan error: %v", err)
				http.Error(w, "Row scan failed", http.StatusInternalServerError)
				return
			}

			json.Unmarshal([]byte(materialsJSON), &record.Materials)
			json.Unmarshal([]byte(conditionsJSON), &record.Conditions)
			record.InspectionID = inspectionId
			record.Comments = ""
			if comments.Valid {
				record.Comments = comments.String
			}

			record.InspectionStatus = ""
			if status.Valid {
				record.InspectionStatus = status.String
			}

			data = append(data, record)
		}

		if len(data) == 0 {
			data = []CoolingData{}
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(data)
	}
}

// PLUMBING WORKSHEET -------------------------------------------------------------------------------------------
type PlumbingData struct {
	InspectionID     string          `json:"inspection_id"`
	ItemName         string          `json:"item_name"`
	Materials        map[string]bool `json:"materials"`
	Conditions       map[string]bool `json:"conditions"`
	Comments         string          `json:"comments"`
	InspectionStatus string          `json:"inspection_status"` // ✅ Add this line
}

func SavePlumbingData() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
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

		var data []PlumbingData
		if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
			log.Printf("Error decoding request body: %v", err)
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		query := `
			INSERT INTO inspection_plumbing (inspection_id, item_name, materials, conditions, comments, inspection_status)
			VALUES (?, ?, ?, ?, ?, ?)
			ON DUPLICATE KEY UPDATE
				materials = VALUES(materials),
				conditions = VALUES(conditions),
				comments = VALUES(comments),
				inspection_status = VALUES(inspection_status)
			`

		for _, record := range data {
			if record.ItemName == "" || record.InspectionID == "" {
				continue
			}

			materialsJSON, _ := json.Marshal(record.Materials)
			conditionsJSON, _ := json.Marshal(record.Conditions)

			_, err := db.Exec(query, record.InspectionID, record.ItemName, materialsJSON, conditionsJSON, record.Comments, record.InspectionStatus)
			if err != nil {
				log.Printf("Error executing insert: %v", err)
				http.Error(w, "Database error", http.StatusInternalServerError)
				return
			}
		}

		w.WriteHeader(http.StatusCreated)
		w.Write([]byte("Plumbing data saved successfully"))
	}
}

func GetPlumbingData() http.HandlerFunc {
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
			log.Printf("Error connecting to DB: %v", err)
			http.Error(w, "Database connection failed", http.StatusInternalServerError)
			return
		}
		defer db.Close()

		query := `SELECT item_name, materials, conditions, comments, inspection_status FROM inspection_plumbing WHERE inspection_id = ?`
		rows, err := db.Query(query, inspectionId)
		if err != nil {
			log.Printf("Error querying plumbing data: %v", err)
			http.Error(w, "Query error", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var data []PlumbingData
		for rows.Next() {
			var record PlumbingData
			var materialsJSON, conditionsJSON string
			var comments sql.NullString
			var status sql.NullString

			if err := rows.Scan(&record.ItemName, &materialsJSON, &conditionsJSON, &comments, &status); err != nil {
				log.Printf("Row scan error: %v", err)
				http.Error(w, "Row scan failed", http.StatusInternalServerError)
				return
			}

			json.Unmarshal([]byte(materialsJSON), &record.Materials)
			json.Unmarshal([]byte(conditionsJSON), &record.Conditions)
			record.InspectionID = inspectionId
			record.Comments = ""
			if comments.Valid {
				record.Comments = comments.String
			}

			record.InspectionStatus = ""
			if status.Valid {
				record.InspectionStatus = status.String
			}

			data = append(data, record)
		}

		if len(data) == 0 {
			data = []PlumbingData{}
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(data)
	}
}

// ELECTRICAL WORKSHEET -------------------------------------------------------------------------------------------
type ElectricalData struct {
	InspectionID     string          `json:"inspection_id"`
	ItemName         string          `json:"item_name"`
	Materials        map[string]bool `json:"materials"`
	Conditions       map[string]bool `json:"conditions"`
	Comments         string          `json:"comments"`
	InspectionStatus string          `json:"inspection_status"`
}

func SaveElectricalData() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
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

		var data []ElectricalData
		if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
			log.Printf("Error decoding request body: %v", err)
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		query := `
		INSERT INTO inspection_electrical (inspection_id, item_name, materials, conditions, comments, inspection_status)
		VALUES (?, ?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE
			materials = VALUES(materials),
			conditions = VALUES(conditions),
			comments = VALUES(comments),
			inspection_status = VALUES(inspection_status)
		`

		for _, record := range data {
			if record.ItemName == "" || record.InspectionID == "" {
				continue
			}

			materialsJSON, _ := json.Marshal(record.Materials)
			conditionsJSON, _ := json.Marshal(record.Conditions)

			_, err := db.Exec(query, record.InspectionID, record.ItemName, materialsJSON, conditionsJSON, record.Comments, record.InspectionStatus)
			if err != nil {
				log.Printf("Error executing insert: %v", err)
				http.Error(w, "Database error", http.StatusInternalServerError)
				return
			}
		}

		w.WriteHeader(http.StatusCreated)
		w.Write([]byte("Electrical data saved successfully"))
	}
}

func GetElectricalData() http.HandlerFunc {
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
			log.Printf("Error connecting to DB: %v", err)
			http.Error(w, "Database connection failed", http.StatusInternalServerError)
			return
		}
		defer db.Close()

		query := `SELECT item_name, materials, conditions, comments, inspection_status FROM inspection_electrical WHERE inspection_id = ?`
		rows, err := db.Query(query, inspectionId)
		if err != nil {
			log.Printf("Error querying electrical data: %v", err)
			http.Error(w, "Query error", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var data []ElectricalData
		for rows.Next() {
			var record ElectricalData
			var materialsJSON, conditionsJSON string
			var comments sql.NullString
			var status sql.NullString

			if err := rows.Scan(&record.ItemName, &materialsJSON, &conditionsJSON, &comments, &status); err != nil {
				log.Printf("Row scan error: %v", err)
				http.Error(w, "Row scan failed", http.StatusInternalServerError)
				return
			}

			json.Unmarshal([]byte(materialsJSON), &record.Materials)
			json.Unmarshal([]byte(conditionsJSON), &record.Conditions)
			record.InspectionID = inspectionId
			record.Comments = ""
			if comments.Valid {
				record.Comments = comments.String
			}

			record.InspectionStatus = ""
			if status.Valid {
				record.InspectionStatus = status.String
			}

			data = append(data, record)
		}

		if len(data) == 0 {
			data = []ElectricalData{}
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(data)
	}
}

// ATTIC WORKSHEET -------------------------------------------------------------------------------------------
type AtticData struct {
	InspectionID     string          `json:"inspection_id"`
	ItemName         string          `json:"item_name"`
	Materials        map[string]bool `json:"materials"`
	Conditions       map[string]bool `json:"conditions"`
	Comments         string          `json:"comments"`
	InspectionStatus string          `json:"inspection_status"`
}

func SaveAtticData() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
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

		var data []AtticData
		if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
			log.Printf("Error decoding request body: %v", err)
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		query := `
			INSERT INTO inspection_attic (inspection_id, item_name, materials, conditions, comments, inspection_status)
				VALUES (?, ?, ?, ?, ?, ?)
				ON DUPLICATE KEY UPDATE
				materials = VALUES(materials),
				conditions = VALUES(conditions),
				comments = VALUES(comments),
				inspection_status = VALUES(inspection_status)
			`

		for _, record := range data {
			if record.ItemName == "" || record.InspectionID == "" {
				continue
			}

			materialsJSON, _ := json.Marshal(record.Materials)
			conditionsJSON, _ := json.Marshal(record.Conditions)

			_, err := db.Exec(query, record.InspectionID, record.ItemName, materialsJSON, conditionsJSON, record.Comments, record.InspectionStatus)
			if err != nil {
				log.Printf("Error executing insert: %v", err)
				http.Error(w, "Database error", http.StatusInternalServerError)
				return
			}
		}

		w.WriteHeader(http.StatusCreated)
		w.Write([]byte("Attic data saved successfully"))
	}
}

func GetAtticData() http.HandlerFunc {
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
			log.Printf("Error connecting to DB: %v", err)
			http.Error(w, "Database connection failed", http.StatusInternalServerError)
			return
		}
		defer db.Close()

		query := `SELECT item_name, materials, conditions, comments, inspection_status FROM inspection_attic WHERE inspection_id = ?`
		rows, err := db.Query(query, inspectionId)
		if err != nil {
			log.Printf("Error querying attic data: %v", err)
			http.Error(w, "Query error", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var data []AtticData
		for rows.Next() {
			var record AtticData
			var materialsJSON, conditionsJSON string
			var comments sql.NullString
			var status sql.NullString

			if err := rows.Scan(&record.ItemName, &materialsJSON, &conditionsJSON, &comments, &status); err != nil {
				log.Printf("Row scan error: %v", err)
				http.Error(w, "Row scan failed", http.StatusInternalServerError)
				return
			}

			json.Unmarshal([]byte(materialsJSON), &record.Materials)
			json.Unmarshal([]byte(conditionsJSON), &record.Conditions)
			record.InspectionID = inspectionId
			record.Comments = ""
			if comments.Valid {
				record.Comments = comments.String
			}

			record.InspectionStatus = ""
			if status.Valid {
				record.InspectionStatus = status.String
			}

			data = append(data, record)
		}

		if len(data) == 0 {
			data = []AtticData{}
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(data)
	}
}

// DOORS WINDOWS WORKSHEET -------------------------------------------------------------------------------------------
type DoorsWindowsData struct {
	InspectionID     string          `json:"inspection_id"`
	ItemName         string          `json:"item_name"`
	Materials        map[string]bool `json:"materials"`
	Conditions       map[string]bool `json:"conditions"`
	Comments         string          `json:"comments"`
	InspectionStatus string          `json:"inspection_status"` // ✅ Add this line
}

func SaveDoorsWindowsData() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
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

		var data []DoorsWindowsData
		if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
			log.Printf("Error decoding request body: %v", err)
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		query := `
			INSERT INTO inspection_doorsWindows (inspection_id, item_name, materials, conditions, comments, inspection_status)
			VALUES (?, ?, ?, ?, ?, ?)
			ON DUPLICATE KEY UPDATE
				materials = VALUES(materials),
				conditions = VALUES(conditions),
				comments = VALUES(comments),
				inspection_status = VALUES(inspection_status)
		`

		for _, record := range data {
			if record.ItemName == "" || record.InspectionID == "" {
				continue
			}

			materialsJSON, _ := json.Marshal(record.Materials)
			conditionsJSON, _ := json.Marshal(record.Conditions)

			_, err := db.Exec(query, record.InspectionID, record.ItemName, materialsJSON, conditionsJSON, record.Comments, record.InspectionStatus)
			if err != nil {
				log.Printf("Error executing insert: %v", err)
				http.Error(w, "Database error", http.StatusInternalServerError)
				return
			}
		}

		w.WriteHeader(http.StatusCreated)
		w.Write([]byte("Doors & Windows data saved successfully"))
	}
}

func GetDoorsWindowsData() http.HandlerFunc {
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
			log.Printf("Error connecting to DB: %v", err)
			http.Error(w, "Database connection failed", http.StatusInternalServerError)
			return
		}
		defer db.Close()

		query := `SELECT item_name, materials, conditions, comments, inspection_status FROM inspection_doorsWindows WHERE inspection_id = ?`
		rows, err := db.Query(query, inspectionId)
		if err != nil {
			log.Printf("Error querying doors/windows data: %v", err)
			http.Error(w, "Query error", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var data []DoorsWindowsData
		for rows.Next() {
			var record DoorsWindowsData
			var materialsJSON, conditionsJSON string
			var comments sql.NullString
			var status sql.NullString

			if err := rows.Scan(&record.ItemName, &materialsJSON, &conditionsJSON, &comments, &status); err != nil {
				log.Printf("Row scan error: %v", err)
				http.Error(w, "Row scan failed", http.StatusInternalServerError)
				return
			}

			json.Unmarshal([]byte(materialsJSON), &record.Materials)
			json.Unmarshal([]byte(conditionsJSON), &record.Conditions)
			record.InspectionID = inspectionId
			record.Comments = ""
			if comments.Valid {
				record.Comments = comments.String
			}

			record.InspectionStatus = ""
			if status.Valid {
				record.InspectionStatus = status.String
			}

			data = append(data, record)
		}

		if len(data) == 0 {
			data = []DoorsWindowsData{}
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(data)
	}
}

// FIREPLACE WORKSHEET -------------------------------------------------------------------------------------------
type FireplaceData struct {
	InspectionID     string          `json:"inspection_id"`
	ItemName         string          `json:"item_name"`
	Materials        map[string]bool `json:"materials"`
	Conditions       map[string]bool `json:"conditions"`
	Comments         string          `json:"comments"`
	InspectionStatus string          `json:"inspection_status"`
}

func SaveFireplaceData() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
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

		var data []FireplaceData
		if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
			log.Printf("Error decoding request body: %v", err)
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		query := `
			INSERT INTO inspection_fireplace (inspection_id, item_name, materials, conditions, comments, inspection_status)
			VALUES (?, ?, ?, ?, ?, ?)
			ON DUPLICATE KEY UPDATE
				materials = VALUES(materials),
				conditions = VALUES(conditions),
				comments = VALUES(comments),
				inspection_status = VALUES(inspection_status)
		`

		for _, record := range data {
			if record.ItemName == "" || record.InspectionID == "" {
				continue
			}

			materialsJSON, _ := json.Marshal(record.Materials)
			conditionsJSON, _ := json.Marshal(record.Conditions)

			_, err := db.Exec(query, record.InspectionID, record.ItemName, materialsJSON, conditionsJSON, record.Comments, record.InspectionStatus)
			if err != nil {
				log.Printf("Error executing insert: %v", err)
				http.Error(w, "Database error", http.StatusInternalServerError)
				return
			}
		}

		w.WriteHeader(http.StatusCreated)
		w.Write([]byte("Fireplace data saved successfully"))
	}
}

func GetFireplaceData() http.HandlerFunc {
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
			log.Printf("Error connecting to DB: %v", err)
			http.Error(w, "Database connection failed", http.StatusInternalServerError)
			return
		}
		defer db.Close()

		query := `SELECT item_name, materials, conditions, comments, inspection_status FROM inspection_fireplace WHERE inspection_id = ?`
		rows, err := db.Query(query, inspectionId)
		if err != nil {
			log.Printf("Error querying fireplace data: %v", err)
			http.Error(w, "Query error", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var data []FireplaceData
		for rows.Next() {
			var record FireplaceData
			var materialsJSON, conditionsJSON string
			var comments sql.NullString
			var status sql.NullString

			if err := rows.Scan(&record.ItemName, &materialsJSON, &conditionsJSON, &comments, &status); err != nil {
				log.Printf("Row scan error: %v", err)
				http.Error(w, "Row scan failed", http.StatusInternalServerError)
				return
			}

			json.Unmarshal([]byte(materialsJSON), &record.Materials)
			json.Unmarshal([]byte(conditionsJSON), &record.Conditions)
			record.InspectionID = inspectionId
			record.Comments = ""
			if comments.Valid {
				record.Comments = comments.String
			}

			record.InspectionStatus = ""
			if status.Valid {
				record.InspectionStatus = status.String
			}

			data = append(data, record)
		}

		if len(data) == 0 {
			data = []FireplaceData{}
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(data)
	}
}

// SYSTEMS COMPONENTS WORKSHEET -------------------------------------------------------------------------------------------
type SystemsComponentsData struct {
	InspectionID     string          `json:"inspection_id"`
	ItemName         string          `json:"item_name"`
	Materials        map[string]bool `json:"materials"`
	Conditions       map[string]bool `json:"conditions"`
	Comments         string          `json:"comments"`
	InspectionStatus string          `json:"inspection_status"` // ✅ Add this
}

func SaveSystemsComponentsData() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
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

		var data []SystemsComponentsData
		if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
			log.Printf("Error decoding request body: %v", err)
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		query := `
			INSERT INTO inspection_systemsComponents (inspection_id, item_name, materials, conditions, comments, inspection_status)
			VALUES (?, ?, ?, ?, ?, ?)
			ON DUPLICATE KEY UPDATE
				materials = VALUES(materials),
				conditions = VALUES(conditions),
				comments = VALUES(comments),
				inspection_status = VALUES(inspection_status)
		`

		for _, record := range data {
			if record.ItemName == "" || record.InspectionID == "" {
				continue
			}

			materialsJSON, _ := json.Marshal(record.Materials)
			conditionsJSON, _ := json.Marshal(record.Conditions)

			_, err := db.Exec(query, record.InspectionID, record.ItemName, materialsJSON, conditionsJSON, record.Comments, record.InspectionStatus)
			if err != nil {
				log.Printf("Error executing insert: %v", err)
				http.Error(w, "Database error", http.StatusInternalServerError)
				return
			}
		}

		w.WriteHeader(http.StatusCreated)
		w.Write([]byte("Systems & Components data saved successfully"))
	}
}

func GetSystemsComponentsData() http.HandlerFunc {
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
			log.Printf("Error connecting to DB: %v", err)
			http.Error(w, "Database connection failed", http.StatusInternalServerError)
			return
		}
		defer db.Close()

		query := `SELECT item_name, materials, conditions, comments, inspection_status FROM inspection_systemsComponents WHERE inspection_id = ?`
		rows, err := db.Query(query, inspectionId)
		if err != nil {
			log.Printf("Error querying systems & components data: %v", err)
			http.Error(w, "Query error", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var data []SystemsComponentsData
		for rows.Next() {
			var record SystemsComponentsData
			var materialsJSON, conditionsJSON string
			var comments sql.NullString
			var status sql.NullString

			if err := rows.Scan(&record.ItemName, &materialsJSON, &conditionsJSON, &comments, &status); err != nil {
				log.Printf("Row scan error: %v", err)
				http.Error(w, "Row scan failed", http.StatusInternalServerError)
				return
			}

			json.Unmarshal([]byte(materialsJSON), &record.Materials)
			json.Unmarshal([]byte(conditionsJSON), &record.Conditions)
			record.InspectionID = inspectionId
			record.Comments = ""
			if comments.Valid {
				record.Comments = comments.String
			}
			record.InspectionStatus = ""
			if status.Valid {
				record.InspectionStatus = status.String
			}

			data = append(data, record)
		}

		if len(data) == 0 {
			data = []SystemsComponentsData{}
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(data)
	}
}

// STORING PHOTOS -------------------------------------------------------------------------------------------
// UploadInspectionPhoto handles photo uploads for an inspection item.
func UploadInspectionPhoto(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")

	// Parse the multipart form
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		log.Printf("Error parsing multipart form: %v", err)
		http.Error(w, "Error parsing form data", http.StatusBadRequest)
		return
	}

	// Retrieve form values
	inspectionId := r.FormValue("inspection_id")
	itemName := r.FormValue("item_name")
	if inspectionId == "" || itemName == "" {
		log.Println("Missing inspection_id or item_name")
		http.Error(w, "Missing inspection_id or item_name", http.StatusBadRequest)
		return
	}

	// Retrieve the photo file
	file, handler, err := r.FormFile("photo")
	if err != nil {
		log.Printf("Error retrieving file: %v", err)
		http.Error(w, "Error retrieving the file", http.StatusBadRequest)
		return
	}
	defer file.Close()
	log.Printf("Received file: %s, size: %d", handler.Filename, handler.Size)

	// Ensure the uploads directory exists
	uploadDir := "./uploads/inspection_photos/"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		log.Printf("Error creating upload directory: %v", err)
		http.Error(w, "Failed to create upload directory", http.StatusInternalServerError)
		return
	}

	// Simplify filename: generate a UUID and preserve the file extension.
	// Import "path" at the top of the file if not already imported.
	extension := path.Ext(handler.Filename)
	filename := uuid.New().String() + extension
	filePath := uploadDir + filename

	// Save the file to disk
	dst, err := os.Create(filePath)
	if err != nil {
		log.Printf("Error creating file on disk: %v", err)
		http.Error(w, "Error saving the file", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		log.Printf("Error copying file to disk: %v", err)
		http.Error(w, "Error saving the file", http.StatusInternalServerError)
		return
	}

	// Construct the relative URL to store in the database
	photoUrl := "/uploads/inspection_photos/" + filename

	// Get a DB connection and insert the photo record
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	dbHost := os.Getenv("DB_HARDCODE")
	dsn := fmt.Sprintf("%s:%s@tcp(%s:3306)/%s", user, password, dbHost, dbName)
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Printf("Database connection error: %v", err)
		http.Error(w, "Database connection failed", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	query := "INSERT INTO inspection_photos (inspection_id, item_name, photo_url) VALUES (?, ?, ?)"
	if _, err = db.Exec(query, inspectionId, itemName, photoUrl); err != nil {
		log.Printf("Error inserting photo record: %v", err)
		http.Error(w, "Failed to save photo record", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message":   "Photo uploaded successfully",
		"photo_url": photoUrl,
	})
}

// GetInspectionPhotos fetches photos for a given inspection and item.
func GetInspectionPhotos(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	inspectionId := vars["inspection_id"]
	itemName := vars["item_name"]
	if inspectionId == "" || itemName == "" {
		http.Error(w, "inspection_id and item_name are required", http.StatusBadRequest)
		return
	}

	// log.Printf("Fetching photos for inspection_id=%s, item_name=%s", inspectionId, itemName)

	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	dbHost := os.Getenv("DB_HARDCODE")
	dsn := fmt.Sprintf("%s:%s@tcp(%s:3306)/%s", user, password, dbHost, dbName)
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Printf("Error opening DB connection: %v", err)
		http.Error(w, "Database connection failed", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	query := "SELECT photo_id, photo_url, uploaded_at FROM inspection_photos WHERE inspection_id = ? AND item_name = ?"
	rows, err := db.Query(query, inspectionId, itemName)
	if err != nil {
		log.Printf("Error executing query: %v", err)
		http.Error(w, "Failed to query photos", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	type Photo struct {
		PhotoID    int       `json:"photo_id"`
		PhotoURL   string    `json:"photo_url"`
		UploadedAt time.Time `json:"uploaded_at"`
	}

	var photos []Photo
	// Define the expected time layout based on your MySQL TIMESTAMP format.
	const layout = "2006-01-02 15:04:05"

	for rows.Next() {
		var photo Photo
		// Scan uploaded_at into a byte slice.
		var uploadedAtRaw []byte
		if err := rows.Scan(&photo.PhotoID, &photo.PhotoURL, &uploadedAtRaw); err != nil {
			log.Printf("Error scanning row: %v", err)
			http.Error(w, "Failed to scan photo record", http.StatusInternalServerError)
			return
		}

		// Convert the raw bytes to string and parse it.
		uploadedAtStr := string(uploadedAtRaw)
		t, err := time.Parse(layout, uploadedAtStr)
		if err != nil {
			log.Printf("Error parsing uploaded_at value '%s': %v", uploadedAtStr, err)
			http.Error(w, "Failed to parse uploaded_at", http.StatusInternalServerError)
			return
		}
		photo.UploadedAt = t

		photos = append(photos, photo)
	}

	// log.Printf("Found %d photos for item %s", len(photos), itemName)

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(photos); err != nil {
		log.Printf("Error encoding JSON: %v", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}

func DeleteInspectionPhoto(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	photoID := vars["photo_id"]
	if photoID == "" {
		http.Error(w, "photo_id is required", http.StatusBadRequest)
		return
	}

	// Connect to DB
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	dbHost := os.Getenv("DB_HARDCODE")
	dsn := fmt.Sprintf("%s:%s@tcp(%s:3306)/%s", user, password, dbHost, dbName)
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Printf("DB connection error: %v", err)
		http.Error(w, "Database connection failed", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	// Fetch the photo URL before deleting it
	var photoUrl string
	err = db.QueryRow("SELECT photo_url FROM inspection_photos WHERE photo_id = ?", photoID).Scan(&photoUrl)
	if err != nil {
		log.Printf("Failed to fetch photo record: %v", err)
		http.Error(w, "Photo not found", http.StatusNotFound)
		return
	}

	// Delete photo record from DB
	_, err = db.Exec("DELETE FROM inspection_photos WHERE photo_id = ?", photoID)
	if err != nil {
		log.Printf("Error deleting photo from DB: %v", err)
		http.Error(w, "Failed to delete photo record", http.StatusInternalServerError)
		return
	}

	// Delete the file from disk
	// Remove leading slash so it's a relative path from the current dir
	filePath := "." + photoUrl
	if err := os.Remove(filePath); err != nil {
		log.Printf("Failed to delete file %s: %v", filePath, err)
		// Don't return 500 here — the DB record is already gone, and this isn't critical
	}

	// Respond success
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Photo deleted successfully",
	})
}

// GetAllInspectionPhotos returns all photos for a given inspection
func GetAllInspectionPhotos(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	inspectionId := vars["inspection_id"]

	if inspectionId == "" {
		http.Error(w, "Inspection ID is required", http.StatusBadRequest)
		return
	}

	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	dbHost := os.Getenv("DB_HARDCODE")
	dsn := fmt.Sprintf("%s:%s@tcp(%s:3306)/%s", dbUser, dbPassword, dbHost, dbName)
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		http.Error(w, "DB connection failed", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	query := `SELECT photo_id, inspection_id, item_name, photo_url FROM inspection_photos WHERE inspection_id = ?`
	rows, err := db.Query(query, inspectionId)
	if err != nil {
		http.Error(w, "Query error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	type Photo struct {
		PhotoID      int    `json:"photo_id"`
		InspectionID string `json:"inspection_id"`
		ItemName     string `json:"item_name"`
		PhotoURL     string `json:"photo_url"`
	}

	var photos []Photo
	for rows.Next() {
		var p Photo
		if err := rows.Scan(&p.PhotoID, &p.InspectionID, &p.ItemName, &p.PhotoURL); err != nil {
			http.Error(w, "Failed to scan row", http.StatusInternalServerError)
			return
		}
		photos = append(photos, p)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(photos)
}

// PROPERTY DETAILS COMPONENT PHOTO HANDLING
type PropertyPhoto struct {
	PhotoID    string `json:"photo_id"`
	PhotoURL   string `json:"photo_url"`
	UploadedAt string `json:"uploaded_at"`
}

func UploadPropertyPhoto(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Credentials", "true")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	vars := mux.Vars(r)
	inspectionId := vars["inspection_id"]
	if inspectionId == "" {
		http.Error(w, "Missing inspection_id", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("photo")
	if err != nil {
		http.Error(w, "Missing photo file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	filename := uuid.New().String() + path.Ext(header.Filename)
	filePath := path.Join("uploads", "property_photos", filename)

	out, err := os.Create(filePath)
	if err != nil {
		http.Error(w, "Failed to save file", http.StatusInternalServerError)
		return
	}
	defer out.Close()

	if _, err := io.Copy(out, file); err != nil {
		http.Error(w, "Failed to write file", http.StatusInternalServerError)
		return
	}

	photoID := uuid.New().String()
	photoURL := "/uploads/property_photos/" + filename

	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	dbHost := os.Getenv("DB_HARDCODE")
	dsn := fmt.Sprintf("%s:%s@tcp(%s:3306)/%s", user, password, dbHost, dbName)
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		http.Error(w, "Database connection failed", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	query := `INSERT INTO property_photos (photo_id, inspection_id, photo_url, uploaded_at) VALUES (?, ?, ?, ?)`
	_, err = db.Exec(query,
		photoID,
		inspectionId,
		photoURL,
		time.Now().Format("2006-01-02 15:04:05"),
	)

	if err != nil {
		log.Printf("❌ DB insert error in UploadPropertyPhoto: %v", err)
		http.Error(w, "DB insert failed", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"photo_id":  photoID,
		"photo_url": photoURL,
	})
}

func GetPropertyPhoto(w http.ResponseWriter, r *http.Request) {
	// ✅ CORS Headers
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Credentials", "true")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	vars := mux.Vars(r)
	inspectionID := vars["inspection_id"]
	if inspectionID == "" {
		http.Error(w, "Inspection ID is required", http.StatusBadRequest)
		return
	}

	// Connect to DB
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	dbHost := os.Getenv("DB_HARDCODE")
	dsn := fmt.Sprintf("%s:%s@tcp(%s:3306)/%s", user, password, dbHost, dbName)
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Printf("❌ DB connection failed: %v", err)
		http.Error(w, "Database connection failed", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	// ✅ Use the correct table: property_photos
	query := `SELECT photo_id, photo_url FROM property_photos WHERE inspection_id = ?`
	rows, err := db.Query(query, inspectionID)
	if err != nil {
		log.Printf("❌ Query failed in GetPropertyPhoto (inspection_id=%s): %v", inspectionID, err)
		http.Error(w, "Failed to query photo", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var results []map[string]interface{}
	for rows.Next() {
		var photoID string
		var photoURL string

		if err := rows.Scan(&photoID, &photoURL); err != nil {
			log.Printf("❌ Row scan failed: %v", err)
			continue
		}

		results = append(results, map[string]interface{}{
			"photo_id":  photoID,
			"photo_url": photoURL,
		})
	}

	if len(results) == 0 {
		log.Printf("ℹ️ No photo found for inspection_id=%s", inspectionID)
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte("[]"))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(results); err != nil {
		log.Printf("❌ Failed to encode response: %v", err)
		http.Error(w, "Encoding error", http.StatusInternalServerError)
	}
}

func DeletePropertyPhoto(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Methods", "DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	vars := mux.Vars(r)
	inspectionId := vars["inspection_id"]
	if inspectionId == "" {
		http.Error(w, "inspection_id is required", http.StatusBadRequest)
		return
	}

	// DB connection setup
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	dbHost := os.Getenv("DB_HARDCODE")
	dsn := fmt.Sprintf("%s:%s@tcp(%s:3306)/%s", user, password, dbHost, dbName)
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Println("DB connection error:", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	// Fetch photo URL to delete file
	var fileURL string
	err = db.QueryRow(`SELECT photo_url FROM property_photos WHERE inspection_id = ?`, inspectionId).Scan(&fileURL)
	if err == sql.ErrNoRows {
		w.WriteHeader(http.StatusOK)
		return
	} else if err != nil {
		log.Println("Query error:", err)
		http.Error(w, "Failed to fetch photo record", http.StatusInternalServerError)
		return
	}

	// Remove file from disk
	filename := path.Base(fileURL)
	filePath := path.Join("./uploads/property_photos", filename)
	if err := os.Remove(filePath); err != nil && !os.IsNotExist(err) {
		log.Println("File deletion error:", err)
		http.Error(w, "Failed to delete photo file", http.StatusInternalServerError)
		return
	}

	// Remove DB record
	_, err = db.Exec(`DELETE FROM property_photos WHERE inspection_id = ?`, inspectionId)
	if err != nil {
		log.Println("DB delete error:", err)
		http.Error(w, "Failed to delete photo record", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "Photo deleted successfully"}`))
}
