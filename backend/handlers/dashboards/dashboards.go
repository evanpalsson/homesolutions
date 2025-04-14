package dashboards

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

type DashboardResponse struct {
	InspectorName        string       `json:"inspector_name"`
	ActiveInspections    int          `json:"active_inspections"`
	CompletedInspections int          `json:"completed_inspections"`
	RecentInspections    []Inspection `json:"recent_inspections"`
}

type Inspection struct {
	InspectionID string `json:"inspection_id"`
	Address      string `json:"address"`
	Status       string `json:"status"`
	Date         string `json:"date"`
}

func GetInspectorDashboard(w http.ResponseWriter, r *http.Request) {
	db := r.Context().Value("db").(*sql.DB)
	vars := mux.Vars(r)
	inspectorID := vars["id"]

	var activeCount int
	var completedCount int

	// Active inspections
	err := db.QueryRow(`
		SELECT COUNT(*) FROM inspections
		WHERE inspector_id = ? AND inspection_status = 'active'
	`, inspectorID).Scan(&activeCount)
	if err != nil {
		log.Printf("Error fetching active inspections: %v", err)
		http.Error(w, "Failed to fetch active inspections", http.StatusInternalServerError)
		return
	}

	// Completed inspections
	err = db.QueryRow(`
		SELECT COUNT(*) FROM inspections
		WHERE inspector_id = ? AND inspection_status = 'completed'
	`, inspectorID).Scan(&completedCount)
	if err != nil {
		log.Printf("Error fetching completed inspections: %v", err)
		http.Error(w, "Failed to fetch completed inspections", http.StatusInternalServerError)
		return
	}

	// Recent inspections (limit to last 5)
	rows, err := db.Query(`
		SELECT inspection_id, address, inspection_status, inspection_date
		FROM inspections
		WHERE inspector_id = ?
		ORDER BY inspection_date DESC
		LIMIT 5
	`, inspectorID)
	if err != nil {
		log.Printf("Error fetching recent inspections: %v", err)
		http.Error(w, "Failed to fetch recent inspections", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	recent := []Inspection{}
	for rows.Next() {
		var ins Inspection
		err := rows.Scan(&ins.InspectionID, &ins.Address, &ins.Status, &ins.Date)
		if err != nil {
			log.Printf("Error scanning inspection row: %v", err)
			continue
		}
		recent = append(recent, ins)
	}

	res := DashboardResponse{
		InspectorName:        "Inspector Evan",
		ActiveInspections:    activeCount,
		CompletedInspections: completedCount,
		RecentInspections:    recent,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}
