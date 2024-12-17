package users

import (
	"database/sql"
	"encoding/json"
	"net/http"
)

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
