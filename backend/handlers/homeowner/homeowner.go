package homeowner

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

type DashboardData struct {
	Name              string        `json:"name"`
	HealthScore       int           `json:"health_score"`
	HealthSummary     string        `json:"health_summary"`
	InsuranceProvider string        `json:"insurance_provider"`
	InsurancePolicy   string        `json:"insurance_policy"`
	MortgageLender    string        `json:"mortgage_lender"`
	MortgageBalance   int           `json:"mortgage_balance"`
	Projects          []Project     `json:"projects"`
	Inspections       []Inspection  `json:"inspections"`
	ServiceProviders  []ServiceProv `json:"service_providers"`
}

type Project struct {
	Name   string `json:"name"`
	Date   string `json:"date"`
	Status string `json:"status"`
}

type Inspection struct {
	Date    string `json:"date"`
	Summary string `json:"summary"`
}

type ServiceProv struct {
	Name  string `json:"name"`
	Phone string `json:"phone"`
}

func GetHomeownerDashboard(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userId := mux.Vars(r)["userId"]

		// TODO: Replace with actual DB query logic
		log.Printf("Dashboard requested for user ID: %s", userId)

		data := DashboardData{
			Name:              "Evan",
			HealthScore:       82,
			HealthSummary:     "Your home is in good condition.",
			InsuranceProvider: "StateFarm",
			InsurancePolicy:   "SF-203983",
			MortgageLender:    "Wells Fargo",
			MortgageBalance:   243000,
			Projects: []Project{
				{Name: "Gutter Repair", Date: "2025-04-22", Status: "In Progress"},
			},
			Inspections: []Inspection{
				{Date: "2024-03-01", Summary: "Minor repairs needed."},
			},
			ServiceProviders: []ServiceProv{
				{Name: "Plumbing Co.", Phone: "(210) 555-0101"},
			},
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(data)
	}
}
