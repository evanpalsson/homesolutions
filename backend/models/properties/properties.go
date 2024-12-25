package users

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"home_solutions/backend/database"
	"io"
	"net/http"
)

// Address struct to parse and store address components
type Address struct {
	AddressL1 string `json:"address_L1"`
	AddressL2 string `json:"address_L2"`
	City      string `json:"city"`
	State     string `json:"state"`
	Zip       string `json:"zip_code"`
}

// User represents a user in the system
type Property struct {
	PropertyID     int    `json:"property_id" gorm:"primaryKey"`
	Address        string `json:"address"`
	InspectionDate string `json:"inspection_date"`
	Inspector      string `json:"inspector_name"`
}

func GetProperties(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rows, err := db.Query("SELECT id, address, inspection_date, inspector FROM properties")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var properties []Property
		for rows.Next() {
			var p Property
			if err := rows.Scan(&p.PropertyID, &p.Address, &p.InspectionDate, &p.Inspector); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			properties = append(properties, p)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(properties)
	}
}

// InsertOrGetAddress inserts an address into the database if it doesn't exist
func InsertOrGetAddress(db *sql.DB, address *Address) (int64, error) {
	var propertyID int64

	// Check if address already exists
	query := `
        SELECT property_id 
        FROM properties 
        WHERE address_L1 = ? AND city = ? AND state = ? AND zip = ? AND zip4 = ?
    `
	err := db.QueryRow(query, address.AddressL1, address.City, address.State, address.Zip).Scan(&propertyID)

	if err != nil {
		if err == sql.ErrNoRows {
			// Address does not exist, insert a new record
			insertQuery := `
                INSERT INTO properties (address_L1, address_L2, city, state, zip, zip4) 
                VALUES (?, ?, ?, ?, ?, ?)
            `
			result, err := db.Exec(insertQuery, address.AddressL1, address.AddressL2, address.City, address.State, address.Zip)
			if err != nil {
				return 0, fmt.Errorf("failed to insert new address: %v", err)
			}

			// Retrieve the last inserted ID
			propertyID, err = result.LastInsertId()
			if err != nil {
				return 0, fmt.Errorf("failed to get inserted ID: %v", err)
			}

			return propertyID, nil
		} else {
			return 0, fmt.Errorf("database query failed: %v", err)
		}
	}

	// Address already exists
	return propertyID, nil
}

// ParseGoogleMapsResponse parses the Google Maps API response and extracts address components
func ParseGoogleMapsResponse(responseBody []byte) (*Address, error) {
	var googleMapsResponse struct {
		Results []struct {
			AddressComponents []struct {
				LongName  string   `json:"long_name"`
				ShortName string   `json:"short_name"`
				Types     []string `json:"types"`
			} `json:"address_components"`
		} `json:"results"`
	}

	err := json.Unmarshal(responseBody, &googleMapsResponse)
	if err != nil {
		return nil, fmt.Errorf("error parsing Google Maps response: %v", err)
	}

	if len(googleMapsResponse.Results) == 0 {
		return nil, fmt.Errorf("no address components found")
	}

	var address Address
	for _, component := range googleMapsResponse.Results[0].AddressComponents {
		for _, t := range component.Types {
			switch t {
			case "street_number":
				address.AddressL1 = component.LongName
			case "route":
				address.AddressL1 += " " + component.LongName
			case "sublocality_level_1":
				address.AddressL2 = component.LongName
			case "locality":
				address.City = component.LongName
			case "administrative_area_level_1":
				address.State = component.ShortName
			case "postal_code":
				address.Zip = component.LongName
			}
		}
	}

	return &address, nil
}

// HandleGoogleMapsResponse handles the request, processes the Google API data, and inserts into DB
func HandleGoogleMapsResponse(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// Read the request body (assume it's the Google Maps API response)
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	// Parse the response body
	address, err := ParseGoogleMapsResponse(body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Connect to the database
	db := database.GetDB() // Assume GetDB() initializes and returns a DB connection
	defer db.Close()

	// Check if the address exists and insert if it doesn't
	propertyID, err := InsertOrGetAddress(db, address)
	if err != nil {
		http.Error(w, "Database operation failed", http.StatusInternalServerError)
		return
	}

	// Send response back
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	response := map[string]interface{}{
		"message":     "Address processed successfully",
		"property_id": propertyID,
	}
	json.NewEncoder(w).Encode(response)
}
