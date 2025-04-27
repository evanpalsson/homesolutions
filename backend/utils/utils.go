package utils

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"strings"
	"time"
)

type DummyItem struct {
	Table      string
	ItemName   string
	Materials  []string
	Conditions []string
}

var allDummyItems = []DummyItem{
	{"inspection_exterior", "Siding, Flashing, and Trim", []string{"Vinyl", "Wood", "Aluminum", "Brick", "Fiber Cement"}, []string{"Rot", "Cracks", "Warping", "Loose"}},
	{"inspection_exterior", "Exterior Doors", []string{"Wood", "Metal", "Fiberglass"}, []string{"Damaged", "Misaligned", "Broken Seal"}},
	{"inspection_roof", "Roof Coverings", []string{"Asphalt Shingles", "Tile", "Metal", "Slate"}, []string{"Cracked", "Missing Shingles", "Leaks"}},
	{"inspection_roof", "Flashing", []string{"Metal", "Rubber"}, []string{"Improper Install", "Rusting", "Separated"}},
	{"inspection_basementFoundation", "Foundation Walls", []string{"Concrete", "Block", "Stone"}, []string{"Cracks", "Moisture Intrusion", "Settlement"}},
	{"inspection_basementFoundation", "Sump Pump", []string{"Plastic", "Cast Iron"}, []string{"Inoperable", "Rusting", "No Backup Power"}},
	{"inspection_heating", "Furnace", []string{"Gas", "Electric", "Oil"}, []string{"Short Cycling", "No Heat", "Unusual Noise"}},
	{"inspection_heating", "Thermostat", []string{"Digital", "Analog"}, []string{"Unresponsive", "Incorrect Readings"}},
	{"inspection_cooling", "AC Condenser", []string{"Split System", "Window Unit"}, []string{"Leaking Refrigerant", "Dirty Coils", "Fan Failure"}},
	{"inspection_cooling", "Thermostat", []string{"Digital"}, []string{"Out of Calibration"}},
	{"inspection_plumbing", "Water Heater", []string{"Tank", "Tankless"}, []string{"No Hot Water", "Leaking Tank", "Rust"}},
	{"inspection_plumbing", "Visible Pipes", []string{"Copper", "PVC", "PEX"}, []string{"Corrosion", "Loose Fittings", "Leaks"}},
	{"inspection_electrical", "Main Electrical Panel", []string{"Circuit Breaker Panel", "Fuse Box"}, []string{"Double Tapping", "Missing Knockouts", "Overfusing"}},
	{"inspection_electrical", "Outlets", []string{"Standard", "GFCI", "AFCI"}, []string{"Reverse Polarity", "No Ground"}},
	{"inspection_attic", "Attic Ventilation", []string{"Ridge Vent", "Soffit Vent"}, []string{"Blocked", "Inadequate Ventilation"}},
	{"inspection_attic", "Attic Insulation", []string{"Fiberglass", "Cellulose", "Spray Foam"}, []string{"Compressed", "Insufficient Depth"}},
	{"inspection_doorsWindows", "Front Door", []string{"Steel", "Wood", "Fiberglass"}, []string{"Warped", "Weatherstripping Damaged"}},
	{"inspection_doorsWindows", "Windows", []string{"Double Pane", "Single Pane"}, []string{"Fogged", "Cracked"}},
	{"inspection_fireplace", "Chimney", []string{"Brick", "Stone"}, []string{"Cracked Crown", "No Cap", "Loose Flashing"}},
	{"inspection_fireplace", "Firebox", []string{"Masonry", "Prefab"}, []string{"Damaged Lining", "Soot Build-up"}},
	{"inspection_systemsComponents", "Garage Door Opener", []string{"Chain Drive", "Belt Drive"}, []string{"No Auto-Reverse", "Sensor Misaligned"}},
	{"inspection_systemsComponents", "Smoke Detectors", []string{"Present"}, []string{"Nonfunctional", "Missing"}},
}

func ResetDummyInspectionData(db *sql.DB) error {
	const inspectionID = "9c729b07-0fff-48e1-965a-11a97bd359b3"
	const propertyID = "TX782610001"

	tables := []string{
		"inspection_exterior",
		"inspection_roof",
		"inspection_basementFoundation",
		"inspection_heating",
		"inspection_cooling",
		"inspection_plumbing",
		"inspection_electrical",
		"inspection_attic",
		"inspection_doorsWindows",
		"inspection_fireplace",
		"inspection_systemsComponents",
	}

	for _, table := range tables {
		query := fmt.Sprintf("DELETE FROM %s WHERE inspection_id = ?", table)
		_, err := db.Exec(query, inspectionID)
		if err != nil {
			log.Printf("Error resetting table %s: %v", table, err)
			return err
		}
	}

	_, err := db.Exec("DELETE FROM inspections WHERE inspection_id = ?", inspectionID)
	if err != nil {
		log.Printf("Error resetting inspections: %v", err)
		return err
	}

	_, err = db.Exec("DELETE FROM properties WHERE property_id = ?", propertyID)
	if err != nil {
		log.Printf("Error resetting properties: %v", err)
		return err
	}

	log.Println("Dummy data reset successfully.")
	return nil
}

func InsertDummyInspectionData(db *sql.DB) error {
	const inspectionID = "9c729b07-0fff-48e1-965a-11a97bd359b3"
	const propertyID = "TX782610001"
	const reportID = "TX782610001-1"

	rand.Seed(time.Now().UnixNano())

	_, err := db.Exec(`INSERT INTO properties (property_id, owner_id, street, city, state, postal_code, country) 
	  VALUES (?, NULL, ?, ?, ?, ?, ?) 
	  ON DUPLICATE KEY UPDATE 
		street=VALUES(street), city=VALUES(city), state=VALUES(state), postal_code=VALUES(postal_code), country=VALUES(country)`,
		propertyID, "21930 Akin Byu", "San Antonio", "TX", "78261", "United States")
	if err != nil {
		log.Printf("Error inserting property: %v", err)
		return err
	}

	_, err = db.Exec(`
		INSERT INTO inspections (inspection_id, property_id, report_id, inspection_date, inspection_time, status)
		VALUES (?, ?, ?, CURDATE(), '12:00 PM', 'completed')
		ON DUPLICATE KEY UPDATE 
		property_id=VALUES(property_id), report_id=VALUES(report_id), inspection_date=VALUES(inspection_date), inspection_time=VALUES(inspection_time), status=VALUES(status)
	`, inspectionID, propertyID, reportID)
	if err != nil {
		log.Printf("Error inserting inspection: %v", err)
		return err
	}

	for _, item := range allDummyItems {
		materials := map[string]string{}
		conditions := map[string]bool{}

		if len(materials) == 0 {
			materials["Placeholder"] = "Good"
		}
		if len(conditions) == 0 {
			conditions["No Issues"] = true
		}

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
		var comment string
		if strings.HasSuffix(item.ItemName, "System Details") || strings.HasSuffix(item.ItemName, "Management Details") {
			jsonData := map[string]interface{}{
				"featurePresent": "No",
			}
			commentBytes, _ := json.Marshal(jsonData)
			comment = string(commentBytes)
		} else {
			comment = fmt.Sprintf("Dummy entry for %s. Conditions: %s", item.ItemName, conditionsText)
		}

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

func ResetAndReloadDummyData(db *sql.DB) error {
	if err := ResetDummyInspectionData(db); err != nil {
		return err
	}
	if err := InsertDummyInspectionData(db); err != nil {
		return err
	}
	log.Println("Dummy data reset and reloaded successfully.")
	return nil
}
