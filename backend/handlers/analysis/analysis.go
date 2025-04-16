package analysis

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/gorilla/mux"
)

type ChatRequest struct {
	Model    string        `json:"model"`
	Messages []MessageData `json:"messages"`
}

type MessageData struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatResponse struct {
	Choices []struct {
		Message MessageData `json:"message"`
	} `json:"choices"`
}

type analyzeRequest struct {
	InspectionID   int    `json:"inspectionId"`
	InspectionText string `json:"inspectionText"`
}

// Call OpenAI API with the inspection report text
func AnalyzeInspection(text string) (string, error) {
	reqBody := ChatRequest{
		Model: "gpt-4",
		Messages: []MessageData{
			{Role: "system", Content: "You are a professional home inspection analysis assistant."},
			{Role: "user", Content: fmt.Sprintf("Analyze the following inspection:\n\n%s", text)},
		},
	}

	body, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", "https://api.openai.com/v1/chat/completions", bytes.NewBuffer(body))
	req.Header.Set("Authorization", "Bearer "+os.Getenv("OPENAI_API_KEY"))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("OpenAI request failed: %v", err)
	}
	defer resp.Body.Close()

	var result ChatResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", fmt.Errorf("OpenAI decode failed: %v", err)
	}

	if len(result.Choices) == 0 {
		// Optional: Log entire body for debugging
		raw, _ := io.ReadAll(resp.Body)
		log.Println("Empty OpenAI response body:", string(raw))
		return "", fmt.Errorf("no choices returned from OpenAI")
	}

	return result.Choices[0].Message.Content, nil
}

// Save analysis result to the database
func SaveAnalysisResult(db *sql.DB, inspectionID int, analysisText string) error {
	const query = `
		INSERT INTO inspection_analysis (inspection_id, analysis_text, created_at)
		VALUES (?, ?, NOW())
		ON DUPLICATE KEY UPDATE
			analysis_text = VALUES(analysis_text),
			created_at = NOW();
	`
	_, err := db.Exec(query, inspectionID, analysisText)
	return err
}

// Main handler to analyze and store result
func AnalyzeAndSaveHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		log.Println("[AnalyzeAndSaveHandler] Received request")

		var req analyzeRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			log.Println("JSON decode error:", err)
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}

		log.Printf("Parsed inspectionId=%d, text length=%d\n", req.InspectionID, len(req.InspectionText))

		if req.InspectionID == 0 || req.InspectionText == "" {
			log.Println("Missing required fields")
			http.Error(w, "inspectionId and inspectionText are required", http.StatusBadRequest)
			return
		}

		// Step 1: Call OpenAI
		resultText, err := AnalyzeInspection(req.InspectionText)
		if err != nil {
			log.Println("OpenAI error:", err)
			http.Error(w, "Failed to analyze report", http.StatusInternalServerError)
			return
		}

		// Step 2: Save to DB
		err = SaveAnalysisResult(db, req.InspectionID, resultText)
		if err != nil {
			log.Println("DB save error:", err)
			http.Error(w, "Failed to save analysis", http.StatusInternalServerError)
			return
		}

		// Step 3: Respond
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"result": resultText,
		})
	}
}

// Fetch stored analysis result for a given inspection
func GetAnalysisHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		idStr := vars["inspection_id"]
		if idStr == "" {
			http.Error(w, "inspection_id required", http.StatusBadRequest)
			return
		}

		inspectionID, err := strconv.Atoi(idStr)
		if err != nil {
			http.Error(w, "invalid inspection_id", http.StatusBadRequest)
			return
		}

		var analysisText string
		err = db.QueryRow(`SELECT analysis_text FROM inspection_analysis WHERE inspection_id = ?`, inspectionID).Scan(&analysisText)
		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "Analysis not found", http.StatusNotFound)
			} else {
				log.Println("DB query error:", err)
				http.Error(w, "Database error", http.StatusInternalServerError)
			}
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"analysisText": analysisText,
		})
	}
}
