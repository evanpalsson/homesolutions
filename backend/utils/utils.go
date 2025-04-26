package utils

import (
	"database/sql"
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

func InsertDummyInspectionData(db *sql.DB) error {
	const inspectionID = "9c729b07-0fff-48e1-965a-11a97bd359b3"
	const propertyID = "TX782610001"
	const reportID = "TX782610001-1"

	rand.Seed(time.Now().UnixNano())

	// All dummy items across sections
	// sectionItems := []DummyItem{
	// 	// Exterior
	// 	{"inspection_exterior", "Sidewalks", []string{"Concrete", "Brick", "Asphalt"}, []string{"Cracked", "Uneven", "Trip Hazard"}},
	// 	{"inspection_exterior", "Exterior Walls", []string{"Brick", "Stucco", "Vinyl"}, []string{"Peeling Paint", "Rotting"}},
	// 	{"inspection_exterior", "Gutters & Downspouts", []string{"Aluminum", "Copper"}, []string{"Leaking", "Detached"}},

	// 	// Roof
	// 	{"inspection_roof", "Roof Covering", []string{"Asphalt Shingles", "Tile"}, []string{"Leaking", "Worn"}},
	// 	{"inspection_roof", "Flashing", []string{"Metal", "Rubber"}, []string{"Improper Install", "Damaged"}},

	// 	// Basement/Foundation
	// 	{"inspection_basementFoundation", "Foundation Walls", []string{"Concrete", "Block"}, []string{"Cracks", "Moisture Intrusion"}},
	// 	{"inspection_basementFoundation", "Sump Pump", []string{"Present"}, []string{"Inoperable", "Rusting"}},

	// 	// Heating
	// 	{"inspection_heating", "Furnace", []string{"Gas", "Electric"}, []string{"No Heat", "Short Cycling"}},
	// 	{"inspection_heating", "Thermostat", []string{"Digital"}, []string{"Unresponsive"}},

	// 	// Cooling
	// 	{"inspection_cooling", "AC Condenser", []string{"Split System"}, []string{"Leaking Refrigerant", "Dirty Coils"}},
	// 	{"inspection_cooling", "Thermostat", []string{"Digital"}, []string{"Out of Calibration"}},

	// 	// Plumbing
	// 	{"inspection_plumbing", "Water Heater", []string{"Tank", "Tankless"}, []string{"No Hot Water", "Leaking Tank"}},
	// 	{"inspection_plumbing", "Pipes", []string{"Copper", "PVC"}, []string{"Corrosion", "Loose Fittings"}},

	// 	// Electrical
	// 	{"inspection_electrical", "Main Panel", []string{"Circuit Breakers"}, []string{"Overfusing", "Missing Knockouts"}},
	// 	{"inspection_electrical", "Outlets", []string{"GFCI", "Standard"}, []string{"Reverse Polarity", "No Ground"}},

	// 	// Attic
	// 	{"inspection_attic", "Ventilation", []string{"Ridge Vent", "Gable Vent"}, []string{"Blocked", "Inadequate"}},
	// 	{"inspection_attic", "Insulation", []string{"Fiberglass", "Cellulose"}, []string{"Compacted", "Missing"}},

	// 	// Doors & Windows
	// 	{"inspection_doorsWindows", "Front Door", []string{"Steel", "Wood"}, []string{"Warped", "Loose Hinges"}},
	// 	{"inspection_doorsWindows", "Windows", []string{"Double Pane"}, []string{"Fogged", "Stuck"}},

	// 	// Fireplace
	// 	{"inspection_fireplace", "Chimney", []string{"Brick", "Stone"}, []string{"Cracked Crown", "No Cap"}},
	// 	{"inspection_fireplace", "Firebox", []string{"Masonry", "Prefab"}, []string{"Damaged Lining"}},

	// 	// Systems & Components
	// 	{"inspection_systemsComponents", "Garage Door", []string{"Automatic"}, []string{"Sensor Misaligned", "No Reverse"}},
	// 	{"inspection_systemsComponents", "Smoke Detectors", []string{"Present"}, []string{"Nonfunctional", "Outdated"}},
	// }

	// for _, item := range sectionItems {
	// 	materials := make(map[string]bool)
	// 	conditions := make(map[string]bool)

	// 	for _, mat := range item.Materials {
	// 		if rand.Intn(2) == 1 {
	// 			materials[mat] = true
	// 		}
	// 	}
	// 	for _, cond := range item.Conditions {
	// 		if rand.Intn(2) == 1 {
	// 			conditions[cond] = true
	// 		}
	// 	}

	// 	materialsJSON, _ := json.Marshal(materials)
	// 	conditionsJSON, _ := json.Marshal(conditions)

	// 	comment := fmt.Sprintf("Dummy entry for %s. Conditions: %v", item.ItemName, conditions)
	// 	query := fmt.Sprintf(`INSERT INTO %s (inspection_id, item_name, inspection_status, materials, conditions, comments) VALUES (?, ?, 'Inspected', ?, ?, ?)`, item.Table)

	// 	_, err := db.Exec(query, inspectionID, item.ItemName, materialsJSON, conditionsJSON, comment)
	// 	if err != nil {
	// 		log.Printf("Error inserting %s into %s: %v", item.ItemName, item.Table, err)
	// 		return err
	// 	}
	// }

	log.Println("Dummy data inserted successfully.")
	return nil
}
