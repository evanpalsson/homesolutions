package routes

import (
	"database/sql"
	"net/http"

	auth "home_solutions/backend/handlers/auth"
	dashboards "home_solutions/backend/handlers/dashboards"
	homeowner "home_solutions/backend/handlers/homeowner"
	inspection "home_solutions/backend/handlers/inspections"
	invitations "home_solutions/backend/handlers/invitations"
	properties "home_solutions/backend/handlers/properties"
	middleware "home_solutions/backend/middleware"

	"github.com/gorilla/mux"
)

func RegisterRoutes(db *sql.DB) *mux.Router {
	router := mux.NewRouter()

	// Helper to wrap with CORS middleware
	withCORS := func(h http.HandlerFunc) http.Handler {
		return middleware.EnableCORS(http.HandlerFunc(h))
	}

	// Auth routes
	router.Handle("/api/login", withCORS(auth.Login(db))).Methods("POST", "OPTIONS")
	router.Handle("/api/refresh-token", withCORS(http.HandlerFunc(auth.RefreshToken))).Methods("POST", "OPTIONS")
	router.Handle("/api/logout", withCORS(http.HandlerFunc(auth.Logout))).Methods("POST", "OPTIONS")
	//Sign up
	router.HandleFunc("/api/signup", auth.SignUp).Methods("POST")
	// Invitations
	router.HandleFunc("/api/invitations", invitations.CreateInvitation(db)).Methods("POST")
	router.HandleFunc("/api/invitations", invitations.ListInvitations(db)).Methods("GET")
	router.HandleFunc("/api/validate-invite", invitations.ValidateInvite(db)).Methods("GET")

	// Dashboard routes
	router.Handle("/api/homeowner/{userId}/dashboard", withCORS(homeowner.GetHomeownerDashboard(db))).Methods("GET", "OPTIONS")
	router.Handle("/api/inspector/{id}/dashboard", withCORS(http.HandlerFunc(dashboards.GetInspectorDashboard))).Methods("GET", "OPTIONS")

	// Address and property routes
	router.Handle("/api/get-address/{property_id}", withCORS(properties.GetAddressByPropertyID)).Methods("GET", "OPTIONS")
	router.Handle("/api/save-address", withCORS(properties.SaveAddress)).Methods("POST", "OPTIONS")
	router.Handle("/api/property-details/{property_id}/{inspection_id}", withCORS(properties.GetPropertyDetails)).Methods("GET", "OPTIONS")
	router.Handle("/api/property-details", withCORS(properties.SaveOrUpdateProperty)).Methods("POST", "PUT", "OPTIONS")

	// Inspection routes
	router.Handle("/api/inspection-details/{inspection_id}/{property_id}", withCORS(inspection.GetInspectionForm)).Methods("GET", "OPTIONS")
	router.Handle("/api/create-inspection", withCORS(inspection.CreateInspection)).Methods("POST", "OPTIONS")
	router.Handle("/api/update-inspection", withCORS(inspection.UpdateInspection)).Methods("PUT", "OPTIONS")

	// Worksheet routes
	worksheets := map[string]struct {
		Get  http.HandlerFunc
		Post http.HandlerFunc
	}{
		"exterior":           {inspection.GetExteriorData(), inspection.SaveExteriorData()},
		"roof":               {inspection.GetRoofData(), inspection.SaveRoofData()},
		"basementFoundation": {inspection.GetBasementData(), inspection.SaveBasementData()},
		"heating":            {inspection.GetHeatingData(), inspection.SaveHeatingData()},
		"cooling":            {inspection.GetCoolingData(), inspection.SaveCoolingData()},
		"plumbing":           {inspection.GetPlumbingData(), inspection.SavePlumbingData()},
		"electrical":         {inspection.GetElectricalData(), inspection.SaveElectricalData()},
		"attic":              {inspection.GetAtticData(), inspection.SaveAtticData()},
		"doorsWindows":       {inspection.GetDoorsWindowsData(), inspection.SaveDoorsWindowsData()},
		"fireplace":          {inspection.GetFireplaceData(), inspection.SaveFireplaceData()},
		"systemsComponents":  {inspection.GetSystemsComponentsData(), inspection.SaveSystemsComponentsData()},
	}

	for section, handlers := range worksheets {
		router.Handle("/api/inspection-"+section+"/{inspection_id}", withCORS(handlers.Get)).Methods("GET", "OPTIONS")
		router.Handle("/api/inspection-"+section, withCORS(handlers.Post)).Methods("POST", "OPTIONS")
	}

	// Inspection photo routes
	router.Handle("/api/inspection-photo", withCORS(http.HandlerFunc(inspection.UploadInspectionPhoto))).Methods("POST", "OPTIONS")
	router.Handle("/api/inspection-photo/{inspection_id}/{item_name}", withCORS(http.HandlerFunc(inspection.GetInspectionPhotos))).Methods("GET", "OPTIONS")
	router.Handle("/api/inspection-photo/{photo_id}", withCORS(http.HandlerFunc(inspection.DeleteInspectionPhoto))).Methods("DELETE", "OPTIONS")
	router.Handle("/api/inspection-photo-all/{inspection_id}", withCORS(http.HandlerFunc(inspection.GetAllInspectionPhotos))).Methods("GET", "OPTIONS")

	// Property photo routes
	router.Handle("/api/property-photo/{inspection_id}", withCORS(http.HandlerFunc(inspection.UploadPropertyPhoto))).Methods("POST", "OPTIONS")
	router.Handle("/api/property-photo/{inspection_id}", withCORS(http.HandlerFunc(inspection.GetPropertyPhoto))).Methods("GET", "OPTIONS")
	router.Handle("/api/property-photo/{inspection_id}", withCORS(http.HandlerFunc(inspection.DeletePropertyPhoto))).Methods("DELETE", "OPTIONS")

	// Static file serving
	router.PathPrefix("/uploads/").Handler(middleware.CORSFileServer(http.StripPrefix("/uploads/", http.FileServer(http.Dir("./uploads/")))))

	return router
}
