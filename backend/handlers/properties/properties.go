package properties

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"home_solutions/backend/handlers/inspections.go"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
)

// SAVE ADDRESS
type AddressDetails struct {
	PropertyID       string `json:"property_id"`
	Street           string `json:"street"`
	City             string `json:"city"`
	State            string `json:"state"`
	PostalCode       string `json:"postal_code"`
	PostalCodeSuffix string `json:"postal_code_suffix"`
	Country          string `json:"country"`
}

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
	dbHard := os.Getenv("DB_HARDCODE")

	dsn := fmt.Sprintf("%s:%s@tcp(%s:3306)/%s", user, password, dbHard, dbName)
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

	// Validate required fields
	if address.Street == "" || address.City == "" || address.State == "" || address.PostalCode == "" {
		log.Println("Invalid address fields:", address)
		http.Error(w, "All address fields are required", http.StatusBadRequest)
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

		inspectionID, err := inspections.CreateInspectionHelper(db, existingPropertyID, "")
		if err != nil {
			log.Println("Error creating inspection form:", err)
			http.Error(w, "Failed to create inspection form", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Write([]byte(fmt.Sprintf(`{"message": "Inspection form created successfully", "property_id": "%s", "inspection_id": "%s"}`, existingPropertyID, inspectionID)))
		return
	}

	// Generate new property_id for the new address
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

	newIncrement := maxIncrement + 1
	propertyID := fmt.Sprintf("%s%s%04d", address.State, address.PostalCode, newIncrement)

	insertQuery := `INSERT INTO properties (property_id, street, city, state, postal_code, postal_code_suffix, country)
	                VALUES (?, ?, ?, ?, ?, ?, ?)`
	_, err = db.Exec(insertQuery, propertyID, address.Street, address.City, address.State, address.PostalCode, address.PostalCodeSuffix, address.Country)
	if err != nil {
		log.Println("Error executing query:", err)
		http.Error(w, "Failed to save address", http.StatusInternalServerError)
		return
	}

	inspectionID, err := inspections.CreateInspectionHelper(db, propertyID, "")
	if err != nil {
		log.Println("Error creating inspection form:", err)
		http.Error(w, "Failed to create inspection form", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(fmt.Sprintf(`{"message": "Inspection form created successfully", "property_id": "%s", "inspection_id": "%s"}`, propertyID, inspectionID)))

}

func GetAddressByPropertyID(w http.ResponseWriter, r *http.Request) {
	// Allow CORS (if needed for frontend communication)
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")

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

	// Extract property_id from URL path
	vars := mux.Vars(r)
	propertyID := vars["property_id"]
	if propertyID == "" {
		log.Println("Missing property_id in request")
		http.Error(w, "Missing property_id in request", http.StatusBadRequest)
		return
	}

	// Validate whether the provided property_id is actually a inspection_id
	var correctPropertyID string
	query := `SELECT property_id FROM inspections WHERE inspection_id = ?`
	err = db.QueryRow(query, propertyID).Scan(&correctPropertyID)
	if err != nil && err != sql.ErrNoRows {
		log.Printf("Error validating property_id: %v", err)
		http.Error(w, "Failed to validate property_id", http.StatusInternalServerError)
		return
	}

	// If a matching property_id is found, use it; otherwise, use the provided property_id
	if correctPropertyID != "" {
		propertyID = correctPropertyID
	}

	// Fetch the address details from the database
	var address AddressDetails
	query = `SELECT property_id, street, city, state, postal_code, postal_code_suffix, country
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

// SAVE AND UPDATE PROPERTY DETAILS
type PropertyDetails struct {
	PropertyID    string   `json:"property_id"`
	YearBuilt     *int     `json:"year_built"` // Use a pointer to handle NULL values
	SquareFootage *int     `json:"square_footage"`
	Bedrooms      *int     `json:"bedrooms"`
	Bathrooms     *float32 `json:"bathrooms"`
	LotSize       *float64 `json:"lot_size"`
	PropertyType  *string  `json:"property_type"`
}

func SaveOrUpdateProperty(w http.ResponseWriter, r *http.Request) {
	// Allow CORS
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Methods", "POST, PUT, OPTIONS")
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
	dbHard := os.Getenv("DB_HARDCODE")

	dsn := fmt.Sprintf("%s:%s@tcp(%s:3306)/%s", user, password, dbHard, dbName)
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Println("Error connecting to the database:", err)
		http.Error(w, "Failed to connect to the database", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	// Decode the incoming JSON
	var property PropertyDetails
	if err := json.NewDecoder(r.Body).Decode(&property); err != nil {
		log.Println("Error decoding request body:", err)
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if property.PropertyID == "" {
		http.Error(w, "Property ID is required", http.StatusBadRequest)
		return
	}

	if r.Method == http.MethodPost {
		// Insert the property
		insertQuery := `INSERT INTO properties (property_id, year_built, square_footage, bedrooms, bathrooms, lot_size, property_type)
		                VALUES (?, ?, ?, ?, ?, ?, ?)`
		_, err := db.Exec(insertQuery, property.PropertyID, property.YearBuilt, property.SquareFootage, property.Bedrooms, property.Bathrooms, property.LotSize, property.PropertyType)
		if err != nil {
			log.Println("Error inserting property:", err)
			http.Error(w, "Failed to insert property", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		w.Write([]byte(`{"message": "Property created successfully"}`))
	} else if r.Method == http.MethodPut {
		// Update the property
		updateQuery := `UPDATE properties SET year_built = ?, square_footage = ?, bedrooms = ?, bathrooms = ?, lot_size = ?, property_type = ?
		                WHERE property_id = ?`
		_, err := db.Exec(updateQuery, property.YearBuilt, property.SquareFootage, property.Bedrooms, property.Bathrooms, property.LotSize, property.PropertyType, property.PropertyID)
		if err != nil {
			log.Println("Error updating property:", err)
			http.Error(w, "Failed to update property", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"message": "Property updated successfully"}`))
	}
}

func GetPropertyDetails(w http.ResponseWriter, r *http.Request) {
	// Allow CORS
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")

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

	// Extract parameters from the URL
	vars := mux.Vars(r)
	propertyID := vars["property_id"]
	inspectionID := vars["inspection_id"]

	if propertyID == "" || inspectionID == "" {
		http.Error(w, "Property ID and Inspection ID are required", http.StatusBadRequest)
		return
	}

	// Validate that inspection_id corresponds to property_id
	var validationCount int
	validationQuery := `SELECT COUNT(*) 
                        FROM inspections 
                        WHERE property_id = ? AND inspection_id = ?`
	err = db.QueryRow(validationQuery, propertyID, inspectionID).Scan(&validationCount)
	if err != nil {
		log.Println("Error validating inspection ID:", err)
		http.Error(w, "Failed to validate inspection ID", http.StatusInternalServerError)
		return
	}

	if validationCount == 0 {
		http.Error(w, "Invalid inspection ID for the given property ID", http.StatusForbidden)
		return
	}

	// Fetch property details
	var property PropertyDetails
	query := `SELECT property_id, year_built, square_footage, bedrooms, bathrooms, lot_size, property_type
              FROM properties WHERE property_id = ?`
	err = db.QueryRow(query, propertyID).Scan(&property.PropertyID, &property.YearBuilt, &property.SquareFootage, &property.Bedrooms, &property.Bathrooms, &property.LotSize, &property.PropertyType)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Property not found", http.StatusNotFound)
		} else {
			log.Println("Error fetching property details:", err)
			http.Error(w, "Failed to fetch property details", http.StatusInternalServerError)
		}
		return
	}

	// Respond with the property details
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(property)
}
