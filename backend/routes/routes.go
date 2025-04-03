package routes

import (
	"database/sql"
	auth "home_solutions/backend/handlers/auth"
	inspection "home_solutions/backend/handlers/inspections.go"
	properties "home_solutions/backend/handlers/properties"
	users "home_solutions/backend/models/users"
	"net/http"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

// RegisterRoutes registers all API routes
func RegisterRoutes(db *sql.DB) *mux.Router {
	router := mux.NewRouter()

	// Authentication routes
	router.HandleFunc("/login", auth.Login(db)).Methods("POST")
	router.HandleFunc("/api/login", auth.Login(db)).Methods("POST")
	router.HandleFunc("/api/auth/google", auth.GoogleAuthHandler).Methods("POST")
	router.HandleFunc("/api/auth/apple", auth.AppleAuthHandler).Methods("POST")

	// User routes
	router.HandleFunc("/users", users.GetUsers(db)).Methods("GET")

	// Address handling routes
	router.HandleFunc("/api/get-address/{property_id}", properties.GetAddressByPropertyID).Methods("GET")
	router.HandleFunc("/api/save-address", properties.SaveAddress).Methods("POST", "OPTIONS")

	// Property details handling
	router.HandleFunc("/api/property-details/{property_id}/{inspection_id}", properties.GetPropertyDetails).Methods("GET")
	router.HandleFunc("/api/property-details", properties.SaveOrUpdateProperty).Methods("POST", "PUT", "OPTIONS")

	// Inspection details handling routes
	router.HandleFunc("/api/inspection-details/{inspection_id}/{property_id}", inspection.GetInspectionForm).Methods("GET")
	router.HandleFunc("/api/create-inspection", inspection.CreateInspection).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/update-inspection", inspection.UpdateInspection).Methods("PUT", "OPTIONS")

	// Inspection worksheets
	// EXTERIOR
	router.HandleFunc("/api/inspection-exterior/{inspection_id}", inspection.GetExteriorData()).Methods("GET")
	router.HandleFunc("/api/inspection-exterior", inspection.SaveExteriorData()).Methods("POST")
	// ROOF
	router.HandleFunc("/api/inspection-roof/{inspection_id}", inspection.GetRoofData()).Methods("GET")
	router.HandleFunc("/api/inspection-roof", inspection.SaveRoofData()).Methods("POST")
	// BASEMENT FOUNDATION
	router.HandleFunc("/api/inspection-basementFoundation/{inspection_id}", inspection.GetBasementData()).Methods("GET")
	router.HandleFunc("/api/inspection-basementFoundation", inspection.SaveBasementData()).Methods("POST")
	//  HEATING
	router.HandleFunc("/api/inspection-heating/{inspection_id}", inspection.GetHeatingData()).Methods("GET")
	router.HandleFunc("/api/inspection-heating", inspection.SaveHeatingData()).Methods("POST")
	//  COOLING
	router.HandleFunc("/api/inspection-cooling/{inspection_id}", inspection.GetCoolingData()).Methods("GET")
	router.HandleFunc("/api/inspection-cooling", inspection.SaveCoolingData()).Methods("POST")
	//  PLUMBING
	router.HandleFunc("/api/inspection-plumbing/{inspection_id}", inspection.GetPlumbingData()).Methods("GET")
	router.HandleFunc("/api/inspection-plumbing", inspection.SavePlumbingData()).Methods("POST")
	// ELECTRICAL
	router.HandleFunc("/api/inspection-electrical/{inspection_id}", inspection.GetElectricalData()).Methods("GET")
	router.HandleFunc("/api/inspection-electrical", inspection.SaveElectricalData()).Methods("POST")
	// ATTIC
	router.HandleFunc("/api/inspection-attic/{inspection_id}", inspection.GetAtticData()).Methods("GET")
	router.HandleFunc("/api/inspection-attic", inspection.SaveAtticData()).Methods("POST")
	// DOORS WINDOWS
	router.HandleFunc("/api/inspection-doorsWindows/{inspection_id}", inspection.GetDoorsWindowsData()).Methods("GET")
	router.HandleFunc("/api/inspection-doorsWindows", inspection.SaveDoorsWindowsData()).Methods("POST")
	// FIREPLACE
	router.HandleFunc("/api/inspection-fireplace/{inspection_id}", inspection.GetFireplaceData()).Methods("GET")
	router.HandleFunc("/api/inspection-fireplace", inspection.SaveFireplaceData()).Methods("POST")
	// SYSTEMS COMPONENTS
	router.HandleFunc("/api/inspection-systemsComponents/{inspection_id}", inspection.GetSystemsComponentsData()).Methods("GET")
	router.HandleFunc("/api/inspection-systemsComponents", inspection.SaveSystemsComponentsData()).Methods("POST")
	// PHOTO HANDLING
	router.HandleFunc("/api/inspection-photo", inspection.UploadInspectionPhoto).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/inspection-photo/{inspection_id}/{item_name}", inspection.GetInspectionPhotos).Methods("GET")

	// Enable CORS
	corsHandler := handlers.CORS(
		handlers.AllowedOrigins([]string{"http://localhost:3000"}),                   // Allow frontend origin
		handlers.AllowedMethods([]string{"GET", "POST", "OPTIONS", "PUT", "DELETE"}), // Include OPTIONS for preflight
		handlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
	)(router)

	// Start the server
	http.ListenAndServe(":8080", corsHandler)

	return router
}
