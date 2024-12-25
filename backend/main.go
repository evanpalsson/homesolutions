package main

import (
	"bytes"
	"fmt"
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

	// testing the db
	url := "http://localhost:8080/api/save-address"
	jsonData := `{"street_name_num": "test"}`
	resp, err := http.Post(url, "application/json", bytes.NewBuffer([]byte(jsonData)))
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	defer resp.Body.Close()
	fmt.Println("Response Status:", resp.Status)
}
