package main

import (
	// "fmt"
	"log"
	"net/http"

	// "golang.org/x/crypto/bcrypt"

	database "home_solutions/backend/database"
	middleware "home_solutions/backend/middleware"
	routes "home_solutions/backend/routes"
)

func main() {
	// hash, _ := bcrypt.GenerateFromPassword([]byte("test123"), bcrypt.DefaultCost)
	// fmt.Println(string(hash))
	db := database.Connect()
	defer db.Close()

	router := routes.RegisterRoutes(db)

	router.PathPrefix("/uploads/").Handler(http.StripPrefix("/uploads/", http.FileServer(http.Dir("./uploads/"))))

	handler := middleware.CORSMiddleware(router)
	log.Println("Server is running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}
