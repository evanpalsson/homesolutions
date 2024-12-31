package properties

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
)

type AddressDetails struct {
	PropertyID       string `json:"property_id"`
	Street           string `json:"street"`
	City             string `json:"city"`
	State            string `json:"state"`
	PostalCode       string `json:"postal_code"`
	PostalCodeSuffix string `json:"postal_code_suffix"`
	Country          string `json:"country"`
}

// type CreateInspectionRequest struct {
// 	PropertyID     string          `json:"property_id"`
// 	InspectionDate string          `json:"inspection_date,omitempty"` // Optional
// 	FormData       json.RawMessage `json:"form_data,omitempty"`       // Optional
// }

// type CreateInspectionResponse struct {
// 	FormID string `json:"form_id"`
// }

func SaveAddress(w http.ResponseWriter, r *http.Request) {
	// Allow CORS
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

	// Handle preflight (OPTIONS request)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

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

	log.Println("Connected to the database")

	// Decode the incoming JSON
	var address AddressDetails
	if err := json.NewDecoder(r.Body).Decode(&address); err != nil {
		log.Println("Error decoding request body:", err)
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Check if the address already exists
	var existingPropertyID string
	checkExistingQuery := `SELECT property_id FROM properties
	                       WHERE street = ? AND city = ? AND state = ? AND postal_code = ? AND postal_code_suffix = ? AND country = ?`
	err = db.QueryRow(checkExistingQuery, address.Street, address.City, address.State, address.PostalCode, address.PostalCodeSuffix, address.Country).Scan(&existingPropertyID)
	if err != nil && err != sql.ErrNoRows {
		log.Println("Error checking for existing address:", err)
		http.Error(w, "Failed to validate address uniqueness", http.StatusInternalServerError)
		return
	}

	if existingPropertyID != "" {
		log.Println("Address already exists with property_id:", existingPropertyID)
		http.Error(w, fmt.Sprintf("Address already exists with property_id: %s", existingPropertyID), http.StatusConflict)
		return
	}

	// Check for the next available incremental ID for the property_id
	var maxIncrement int
	checkIncrementQuery := `SELECT COALESCE(MAX(CAST(SUBSTRING(property_id, 8, 4) AS UNSIGNED)), 0) AS max_increment
	                        FROM properties
	                        WHERE postal_code = ? AND state = ?`
	err = db.QueryRow(checkIncrementQuery, address.PostalCode, address.State).Scan(&maxIncrement)
	if err != nil {
		log.Println("Error checking for max increment:", err)
		http.Error(w, "Failed to generate property_id", http.StatusInternalServerError)
		return
	}

	// Generate new property_id
	newIncrement := maxIncrement + 1
	propertyID := fmt.Sprintf("%s%s%04d", address.State, address.PostalCode, newIncrement)

	// Insert into the database
	insertQuery := `INSERT INTO properties (property_id, street, city, state, postal_code, postal_code_suffix, country)
	                VALUES (?, ?, ?, ?, ?, ?, ?)`
	_, err = db.Exec(insertQuery, propertyID, address.Street, address.City, address.State, address.PostalCode, address.PostalCodeSuffix, address.Country)
	if err != nil {
		log.Println("Error executing query:", err)
		http.Error(w, "Failed to save address", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(fmt.Sprintf(`{"message": "Address saved successfully", "property_id": "%s"}`, propertyID)))
}

func GetAddressByPropertyID(w http.ResponseWriter, r *http.Request) {
	// Allow CORS (if needed for frontend communication)
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")

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

	// Extract property_id from URL path
	vars := mux.Vars(r)
	propertyID := vars["property_id"]
	if propertyID == "" {
		log.Println("Missing property_id in request")
		http.Error(w, "Missing property_id in request", http.StatusBadRequest)
		return
	}

	// Fetch the address details from the database
	var address AddressDetails
	query := `SELECT property_id, street, city, state, postal_code, postal_code_suffix, country
              FROM properties WHERE property_id = ?`
	err = db.QueryRow(query, propertyID).Scan(&address.PropertyID, &address.Street, &address.City, &address.State, &address.PostalCode, &address.PostalCodeSuffix, &address.Country)
	if err != nil {
		if err == sql.ErrNoRows {
			log.Printf("Address not found for property_id: %s", propertyID)
			http.Error(w, "Address not found", http.StatusNotFound)
		} else {
			log.Printf("Error fetching address for property_id %s: %v", propertyID, err)
			http.Error(w, "Failed to fetch address", http.StatusInternalServerError)
		}
		return
	}

	// Respond with the address details
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(address)
}

// func CreateInspection(w http.ResponseWriter, r *http.Request) {
// 	// Allow CORS
// 	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
// 	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
// 	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

// 	// Get environment variables for database connection
// 	user := os.Getenv("DB_USER")
// 	password := os.Getenv("DB_PASSWORD")
// 	dbName := os.Getenv("DB_NAME")

// 	// Correct DSN format
// 	dsn := fmt.Sprintf("%s:%s@tcp(database:3306)/%s", user, password, dbName)

// 	// Connect to the database
// 	db, err := sql.Open("mysql", dsn)
// 	if err != nil {
// 		log.Println("Error connecting to the database:", err)
// 		http.Error(w, "Failed to connect to the database", http.StatusInternalServerError)
// 		return
// 	}
// 	defer db.Close()

// 	// Handle preflight (OPTIONS request)
// 	if r.Method == http.MethodOptions {
// 		w.WriteHeader(http.StatusOK)
// 		return
// 	}

// 	// Parse the request body
// 	var req CreateInspectionRequest
// 	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
// 		log.Println("Error decoding request body:", err)
// 		http.Error(w, "Invalid request payload", http.StatusBadRequest)
// 		return
// 	}

// 	// Validate property_id
// 	if req.PropertyID == "" {
// 		http.Error(w, "Property ID is required", http.StatusBadRequest)
// 		return
// 	}

// 	// Generate a UUID for the form_id
// 	formID := uuid.New().String()

// 	// Insert a new inspection form into the database
// 	query := `INSERT INTO inspection_forms (form_id, property_id, inspection_date, form_data, status)
// 	          VALUES (?, ?, ?, ?, ?)`
// 	_, err = db.Exec(query, formID, req.PropertyID, req.InspectionDate, req.FormData, "in-progress")
// 	if err != nil {
// 		log.Println("Error inserting inspection form:", err)
// 		http.Error(w, "Failed to create inspection form", http.StatusInternalServerError)
// 		return
// 	}

// 	// Respond with the generated form_id
// 	res := CreateInspectionResponse{FormID: formID}
// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(res)
// }
