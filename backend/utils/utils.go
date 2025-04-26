package utils

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"time"
)

type DummyItem struct {
	Table      string
	ItemName   string
	Materials  []string
	Conditions []string
}

var allDummyItems = []DummyItem{
	// Exterior
	{"inspection_exterior", "Siding, Flashing, and Trim", []string{"Vinyl", "Wood", "Aluminum", "Brick", "Fiber Cement"}, []string{"Rot", "Cracks", "Warping", "Loose"}},
	{"inspection_exterior", "Exterior Doors", []string{"Wood", "Metal", "Fiberglass"}, []string{"Damaged", "Misaligned", "Broken Seal"}},

	// Roof
	{"inspection_roof", "Roof Coverings", []string{"Asphalt Shingles", "Tile", "Metal", "Slate"}, []string{"Cracked", "Missing Shingles", "Leaks"}},
	{"inspection_roof", "Flashing", []string{"Metal", "Rubber"}, []string{"Improper Install", "Rusting", "Separated"}},

	// Basement/Foundation
	{"inspection_basementFoundation", "Foundation Walls", []string{"Concrete", "Block", "Stone"}, []string{"Cracks", "Moisture Intrusion", "Settlement"}},
	{"inspection_basementFoundation", "Sump Pump", []string{"Plastic", "Cast Iron"}, []string{"Inoperable", "Rusting", "No Backup Power"}},

	// Heating
	{"inspection_heating", "Furnace", []string{"Gas", "Electric", "Oil"}, []string{"Short Cycling", "No Heat", "Unusual Noise"}},
	{"inspection_heating", "Thermostat", []string{"Digital", "Analog"}, []string{"Unresponsive", "Incorrect Readings"}},

	// Cooling
	{"inspection_cooling", "AC Condenser", []string{"Split System", "Window Unit"}, []string{"Leaking Refrigerant", "Dirty Coils", "Fan Failure"}},
	{"inspection_cooling", "Thermostat", []string{"Digital"}, []string{"Out of Calibration"}},

	// Plumbing
	{"inspection_plumbing", "Water Heater", []string{"Tank", "Tankless"}, []string{"No Hot Water", "Leaking Tank", "Rust"}},
	{"inspection_plumbing", "Visible Pipes", []string{"Copper", "PVC", "PEX"}, []string{"Corrosion", "Loose Fittings", "Leaks"}},

	// Electrical
	{"inspection_electrical", "Main Electrical Panel", []string{"Circuit Breaker Panel", "Fuse Box"}, []string{"Double Tapping", "Missing Knockouts", "Overfusing"}},
	{"inspection_electrical", "Outlets", []string{"Standard", "GFCI", "AFCI"}, []string{"Reverse Polarity", "No Ground"}},

	// Attic
	{"inspection_attic", "Attic Ventilation", []string{"Ridge Vent", "Soffit Vent"}, []string{"Blocked", "Inadequate Ventilation"}},
	{"inspection_attic", "Attic Insulation", []string{"Fiberglass", "Cellulose", "Spray Foam"}, []string{"Compressed", "Insufficient Depth"}},

	// Doors & Windows
	{"inspection_doorsWindows", "Front Door", []string{"Steel", "Wood", "Fiberglass"}, []string{"Warped", "Weatherstripping Damaged"}},
	{"inspection_doorsWindows", "Windows", []string{"Double Pane", "Single Pane"}, []string{"Fogged", "Cracked"}},

	// Fireplace
	{"inspection_fireplace", "Chimney", []string{"Brick", "Stone"}, []string{"Cracked Crown", "No Cap", "Loose Flashing"}},
	{"inspection_fireplace", "Firebox", []string{"Masonry", "Prefab"}, []string{"Damaged Lining", "Soot Build-up"}},

	// Systems & Components
	{"inspection_systemsComponents", "Garage Door Opener", []string{"Chain Drive", "Belt Drive"}, []string{"No Auto-Reverse", "Sensor Misaligned"}},
	{"inspection_systemsComponents", "Smoke Detectors", []string{"Present"}, []string{"Nonfunctional", "Missing"}},
}

func InsertDummyInspectionData(db *sql.DB) error {
	const inspectionID = "9c729b07-0fff-48e1-965a-11a97bd359b3"
	const propertyID = "TX782610001"
	const reportID = "TX782610001-1"

	rand.Seed(time.Now().UnixNano())

	for _, item := range allDummyItems {
		materials := make(map[string]string)
		conditions := make(map[string]bool)

		for _, mat := range item.Materials {
			if rand.Intn(2) == 1 {
				randomCondition := []string{"Good", "Fair", "Poor"}[rand.Intn(3)]
				materials[mat] = randomCondition
			}
		}
		for _, cond := range item.Conditions {
			if rand.Intn(2) == 1 {
				conditions[cond] = true
			}
		}

		materialsJSON, _ := json.Marshal(materials)
		conditionsJSON, _ := json.Marshal(conditions)
		conditionsText, _ := json.Marshal(conditions)
		comment := fmt.Sprintf("Dummy entry for %s. Conditions: %s", item.ItemName, conditionsText)

		query := fmt.Sprintf(`INSERT INTO %s (inspection_id, item_name, inspection_status, materials, conditions, comments) VALUES (?, ?, 'Inspected', ?, ?, ?)`, item.Table)
		_, err := db.Exec(query, inspectionID, item.ItemName, materialsJSON, conditionsJSON, comment)
		if err != nil {
			log.Printf("Error inserting %s into %s: %v", item.ItemName, item.Table, err)
			return err
		}
	}

	log.Println("Dummy data inserted successfully.")
	return nil
}
