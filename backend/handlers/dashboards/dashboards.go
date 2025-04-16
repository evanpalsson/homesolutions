package dashboards

import (
	"database/sql"
	"encoding/json"
	"home_solutions/backend/middleware"
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
	ctxDB := r.Context().Value(middleware.DBKey)
	db, ok := ctxDB.(*sql.DB)
	if !ok || db == nil {
		log.Printf("[GetInspectorDashboard] Database connection not found in context")
		http.Error(w, "Database not available", http.StatusInternalServerError)
		return
	}

	vars := mux.Vars(r)
	inspectorID := vars["id"]
	if inspectorID == "" {
		http.Error(w, "Inspector ID is required", http.StatusBadRequest)
		return
	}

	var activeCount int
	var completedCount int

	err := db.QueryRow(`
		SELECT COUNT(*) FROM inspections
		WHERE inspector_id = ? AND inspection_status = 'active'
	`, inspectorID).Scan(&activeCount)
	if err != nil {
		log.Printf("[GetInspectorDashboard] Error fetching active inspections: %v", err)
		http.Error(w, "Failed to fetch active inspections", http.StatusInternalServerError)
		return
	}

	err = db.QueryRow(`
		SELECT COUNT(*) FROM inspections
		WHERE inspector_id = ? AND inspection_status = 'completed'
	`, inspectorID).Scan(&completedCount)
	if err != nil {
		log.Printf("[GetInspectorDashboard] Error fetching completed inspections: %v", err)
		http.Error(w, "Failed to fetch completed inspections", http.StatusInternalServerError)
		return
	}

	rows, err := db.Query(`
		SELECT inspection_id, address, inspection_status, inspection_date
		FROM inspections
		WHERE inspector_id = ?
		ORDER BY inspection_date DESC
		LIMIT 5
	`, inspectorID)
	if err != nil {
		log.Printf("[GetInspectorDashboard] Error fetching recent inspections: %v", err)
		http.Error(w, "Failed to fetch recent inspections", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	recent := []Inspection{}
	for rows.Next() {
		var ins Inspection
		err := rows.Scan(&ins.InspectionID, &ins.Address, &ins.Status, &ins.Date)
		if err != nil {
			log.Printf("[GetInspectorDashboard] Error scanning row: %v", err)
			continue
		}
		recent = append(recent, ins)
	}

	res := DashboardResponse{
		InspectorName:        "Inspector Evan", // In the future, fetch this from users table
		ActiveInspections:    activeCount,
		CompletedInspections: completedCount,
		RecentInspections:    recent,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}
