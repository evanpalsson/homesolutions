package main

import (
	"log"
	"net/http"

	database "home_solutions/backend/database"
	routes "home_solutions/backend/routes"
)

func main() {
	// Initialize database
	db := database.Connect()
	defer db.Close()

	// Register routes
	router := routes.RegisterRoutes(db)

	// Start the server
	log.Println("Server is running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", router))

}
