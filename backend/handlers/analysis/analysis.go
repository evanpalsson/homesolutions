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
	"strings"

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

type IssueCard struct {
	Title         string `json:"title"`
	Severity      string `json:"severity"`
	Issue         string `json:"issue"`
	DIYEstimate   string `json:"diyEstimate"`
	ProEstimate   string `json:"proEstimate"`
	RemainingLife string `json:"remainingLife"`
	YoutubeSearch string `json:"youtubeSearch"`
}

// Call OpenAI API with the inspection report text
func AnalyzeInspection(text string) (string, error) {
	reqBody := ChatRequest{
		Model: "gpt-3.5-turbo",
		Messages: []MessageData{
			{Role: "system", Content: `
You are a certified home inspector with advanced knowledge in residential systems: roofing, plumbing, electrical, HVAC, foundation, and structural components.

You are also experienced in both professional contractor pricing and do-it-yourself (DIY) repair cost estimates.

Your role is to analyze home inspection reports, identify issues, prioritize them, and for each, provide:
- A professional repair/replacement cost estimate
- A potential DIY cost estimate (if applicable)
- An estimate of the remaining useful life for affected components

Respond in a structured, thorough, and homeowner-friendly format.
			`},
			{Role: "user", Content: fmt.Sprintf(`Analyze the following home inspection report and format by severity, issue, cost, DIY, life expectancy, and a YouTube search link if applicable:

%s`, text)},
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

	// Read full body once
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read OpenAI response: %v", err)
	}

	log.Println("🔍 Raw OpenAI response:", string(respBody))

	// Try to decode into expected format
	var result ChatResponse
	if err := json.Unmarshal(respBody, &result); err != nil {
		return "", fmt.Errorf("failed to parse OpenAI response: %v", err)
	}

	if len(result.Choices) == 0 {
		return "", fmt.Errorf("no choices returned from OpenAI")
	}

	return result.Choices[0].Message.Content, nil
}

// Save analysis result to the database
func SaveAnalysisResult(db *sql.DB, inspectionID string, analysisText string) error {
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

// Fetch stored analysis result for a given inspection
func GetAnalysisHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		inspectionID := vars["inspection_id"]
		if inspectionID == "" {
			http.Error(w, "inspection_id required", http.StatusBadRequest)
			return
		}

		var analysisText string
		err := db.QueryRow(`SELECT analysis_text FROM inspection_analysis WHERE inspection_id = ?`, inspectionID).Scan(&analysisText)
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

func AnalyzeAndSaveHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			InspectionID string `json:"inspection_id"`
			Text         string `json:"text"`
		}

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		log.Printf("[AnalyzeAndSaveHandler] Received request for inspection_id=%s, text length=%d", req.InspectionID, len(req.Text))

		// 🔍 Validate inspection ID exists
		var exists bool
		err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM inspections WHERE inspection_id = ?)", req.InspectionID).Scan(&exists)
		if err != nil {
			http.Error(w, "DB error", http.StatusInternalServerError)
			return
		}
		if !exists {
			http.Error(w, "Inspection ID not found", http.StatusBadRequest)
			return
		}

		// 🔍 Run OpenAI analysis
		result, err := AnalyzeInspection(req.Text)
		if err != nil {
			log.Println("❌ AnalyzeInspection error:", err)
			http.Error(w, "Failed to analyze inspection", http.StatusInternalServerError)
			return
		}

		// 💾 Save to DB
		if err := SaveAnalysisResult(db, req.InspectionID, result); err != nil {
			log.Println("❌ Failed to save analysis to DB:", err)
			http.Error(w, "Failed to save analysis", http.StatusInternalServerError)
			return
		}

		// ✅ Success
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"analysis": result,
		})
	}
}

func ParseIssueCards(text string) []IssueCard {
	var cards []IssueCard
	sections := strings.Split(text, "\n\n")

	for _, section := range sections {
		lines := strings.Split(strings.TrimSpace(section), "\n")
		if len(lines) == 0 {
			continue
		}

		titleParts := strings.SplitN(lines[0], "–", 2)
		if len(titleParts) != 2 {
			continue
		}
		title := strings.TrimSpace(titleParts[0]) + " – " + strings.TrimSpace(titleParts[1])

		card := IssueCard{Title: title}

		for _, line := range lines[1:] {
			line = strings.TrimSpace(strings.TrimPrefix(line, "-"))
			kv := strings.SplitN(line, ":", 2)
			if len(kv) != 2 {
				continue
			}
			key := strings.ToLower(strings.TrimSpace(kv[0]))
			val := strings.TrimSpace(kv[1])

			switch {
			case strings.HasPrefix(key, "severity"):
				card.Severity = strings.ToUpper(val)
			case strings.HasPrefix(key, "issue"):
				card.Issue = val
			case strings.HasPrefix(key, "diy estimate"):
				card.DIYEstimate = val
			case strings.HasPrefix(key, "professional estimate"):
				card.ProEstimate = val
			case strings.HasPrefix(key, "remaining"):
				card.RemainingLife = val
			case strings.HasPrefix(key, "diy tutorial"):
				card.YoutubeSearch = val
			}
		}

		if card.Severity != "" {
			cards = append(cards, card)
		}
	}

	return cards
}
