package routes

import (
	"database/sql"
	auth "home_solutions/backend/handlers/auth"
	dashboards "home_solutions/backend/handlers/dashboards"
	homeowner "home_solutions/backend/handlers/homeowner"
	inspection "home_solutions/backend/handlers/inspections"
	properties "home_solutions/backend/handlers/properties"
	"home_solutions/backend/middleware"
	"net/http"

	"github.com/gorilla/mux"
)

func RegisterRoutes(db *sql.DB) *mux.Router {
	router := mux.NewRouter()

	// Authentication routes
	router.HandleFunc("/login", auth.Login(db)).Methods("POST")
	router.HandleFunc("/api/login", auth.Login(db)).Methods("POST")
	router.HandleFunc("/api/refresh-token", auth.RefreshToken).Methods("POST")
	router.HandleFunc("/api/login", auth.Login(db)).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/logout", auth.Logout).Methods("POST")

	// Dashboard routes
	router.HandleFunc("/api/homeowner/{userId}/dashboard", homeowner.GetHomeownerDashboard(db)).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/inspector/{id}/dashboard", dashboards.GetInspectorDashboard).Methods("GET")

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
	// INSPECTIONS WORKSHEETS AND REPORT PHOTO HANDLING
	router.HandleFunc("/api/inspection-photo", inspection.UploadInspectionPhoto).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/inspection-photo/{inspection_id}/{item_name}", inspection.GetInspectionPhotos).Methods("GET")
	router.HandleFunc("/api/inspection-photo/{photo_id}", inspection.DeleteInspectionPhoto).Methods("DELETE")
	router.HandleFunc("/api/inspection-photo-all/{inspection_id}", inspection.GetAllInspectionPhotos).Methods("GET")
	// PROPERTY DETAILS COMPONENT PHOTO HANDLING
	router.HandleFunc("/api/property-photo/{inspection_id}", inspection.UploadPropertyPhoto).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/property-photo/{inspection_id}", inspection.GetPropertyPhoto).Methods("GET")
	router.HandleFunc("/api/property-photo/{inspection_id}", inspection.DeletePropertyPhoto).Methods("DELETE", "OPTIONS")

	// Serve static files from ./uploads folder
	uploadsHandler := http.StripPrefix("/uploads/", http.FileServer(http.Dir("./uploads/")))
	router.PathPrefix("/uploads/").Handler(middleware.EnableCORS(uploadsHandler))

	return router

}
