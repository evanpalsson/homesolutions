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

type analyzeRequest struct {
	InspectionID   int    `json:"inspectionId"`
	InspectionText string `json:"inspectionText"`
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
		Model: "gpt-4",
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

			{Role: "user", Content: fmt.Sprintf(`
				Analyze the following home inspection report.
				
				For each major section (e.g., Roof, Plumbing, Electrical, HVAC, Foundation):
				1. Identify and clearly describe each issue.
				2. Assign a priority level: CRITICAL, MODERATE, or INFORMATIONAL.
				3. For each issue:
				   - Provide a brief explanation of the concern.
				   - Estimate the cost to repair/replace:
					 - DIY Estimate (if safe and feasible)
					 - Professional Estimate
				   - Estimate the remaining useful life of the affected component.
				   - If the issue is DIY-appropriate, provide a YouTube search link that a homeowner could use to learn how to fix it.
					 - Format: [Search YouTube](https://www.youtube.com/results?search_query=how+to+FIX_TOPIC)
				
				4. Organize the output by severity — from most critical to least important.
				5. End with a summary that ranks the systems by urgency and cost impact.
				
				Here is the report to analyze:
				%s
				`, text)},
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

func AnalyzeAndSaveHandler(db *sql.DB) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var req analyzeRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}

		if req.InspectionID == 0 || req.InspectionText == "" {
			http.Error(w, "Missing required fields", http.StatusBadRequest)
			return
		}

		// Send to OpenAI
		analysisText, err := AnalyzeInspection(req.InspectionText)
		if err != nil {
			http.Error(w, "OpenAI error: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Save raw text
		err = SaveAnalysisResult(db, req.InspectionID, analysisText)
		if err != nil {
			http.Error(w, "Failed to save analysis", http.StatusInternalServerError)
			return
		}

		// 🔍 Parse into structured cards
		cards := ParseIssueCards(analysisText)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(cards)
	})
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
