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

var categoryWeights = map[string]float64{
	"Roof":       0.20,
	"Foundation": 0.20,
	"HVAC":       0.15,
	"Plumbing":   0.15,
	"Electrical": 0.10,
	"Exterior":   0.10,
	"Interior":   0.05,
	"Appliances": 0.05,
}

var severityScores = map[string]float64{
	"CRITICAL": 0.25,
	"MAJOR":    0.5,
	"MODERATE": 0.75,
	"MINOR":    0.9,
}

// Call OpenAI API with inspection report text and photo descriptions
func AnalyzeInspection(text, photoDescriptions string) (string, error) {
	systemPrompt := `
You are a certified master home inspector and building scientist specializing in residential systems (roofing, plumbing, electrical, HVAC, foundation, structural components, insulation, moisture management, and energy systems like solar). You are also highly knowledgeable in professional contractor repair pricing and DIY (do-it-yourself) cost estimation.

Your role is to analyze both the written home inspection report and the attached photo evidence. From these inputs, perform the following:

1. Identify and list all visible issues, even if the inspector did not explicitly call them out.
2. For each issue:
   - Description
   - Most likely cause
   - Professional repair/replacement cost estimate
   - DIY repair cost estimate if feasible
   - Remaining useful life estimate
   - Urgency recommendation (Immediate, Short-term, Long-term Monitoring)
   - YouTube DIY tutorial search link
3. Prioritize issues by severity: Critical / Major / Moderate / Minor.
4. Evaluate warranty information if mentioned.
5. Provide preventative maintenance tips when appropriate.
6. Summarize a total home health score at the end.

Respond structured, thorough, homeowner-friendly, and easy to parse into issue cards.
`

	reqBody := ChatRequest{
		Model: "gpt-4o", // Upgraded model if available
		Messages: []MessageData{
			{Role: "system", Content: systemPrompt},
			{Role: "user", Content: fmt.Sprintf(`Analyze the following home inspection report AND associated inspection photos. Use the following information:

Written Inspection Report:
%s

Uploaded Inspection Photo Descriptions:
%s`, text, photoDescriptions)},
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

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read OpenAI response: %v", err)
	}

	log.Println("🔍 Raw OpenAI response:", string(respBody))

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

// Fetch stored analysis result
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

// Analyze and save (now also saves Home Health Score)
func AnalyzeAndSaveHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			InspectionID      string `json:"inspection_id"`
			PropertyID        string `json:"property_id"`
			Text              string `json:"text"`
			PhotoDescriptions string `json:"photoDescriptions"`
		}

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		log.Printf("[AnalyzeAndSaveHandler] Received request for inspection_id=%s, property_id=%s", req.InspectionID, req.PropertyID)

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

		result, err := AnalyzeInspection(req.Text, req.PhotoDescriptions)
		if err != nil {
			log.Println("❌ AnalyzeInspection error:", err)
			http.Error(w, "Failed to analyze inspection", http.StatusInternalServerError)
			return
		}

		if err := SaveAnalysisResult(db, req.InspectionID, result); err != nil {
			log.Println("❌ Failed to save analysis to DB:", err)
			http.Error(w, "Failed to save analysis", http.StatusInternalServerError)
			return
		}

		parsedCards := ParseIssueCards(result)
		score, breakdown := CalculateHomeHealthScore(parsedCards)

		if err := SaveHomeHealthScore(db, req.PropertyID, req.InspectionID, score, breakdown, "professional"); err != nil {
			log.Println("❌ Failed to save home health score to DB:", err)
			http.Error(w, "Failed to save health score", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"analysis":        result,
			"homeHealthScore": score,
			"breakdown":       breakdown,
		})
	}
}

// Parse structured text into IssueCards
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

func CalculateHomeHealthScore(cards []IssueCard) (float64, map[string]float64) {
	categoryScores := make(map[string][]float64)

	for _, card := range cards {
		category := mapIssueToCategory(card.Title)
		severityScore, ok := severityScores[strings.ToUpper(card.Severity)]
		if !ok {
			severityScore = 1.0 // Default to perfect if no severity listed
		}
		categoryScores[category] = append(categoryScores[category], severityScore)
	}

	// Calculate per-category average
	finalCategoryScores := make(map[string]float64)
	for cat, scores := range categoryScores {
		if len(scores) == 0 {
			continue
		}
		var total float64
		for _, s := range scores {
			total += s
		}
		finalCategoryScores[cat] = total / float64(len(scores))
	}

	// Calculate weighted total
	var weightedSum float64
	var totalWeight float64
	for cat, avgScore := range finalCategoryScores {
		weight := categoryWeights[cat]
		weightedSum += avgScore * weight
		totalWeight += weight
	}

	// Normalize to percentage
	homeHealthScore := (weightedSum / totalWeight) * 100
	return homeHealthScore, finalCategoryScores
}

// Helper to map issue titles to major categories
func mapIssueToCategory(title string) string {
	title = strings.ToLower(title)
	switch {
	case strings.Contains(title, "roof"):
		return "Roof"
	case strings.Contains(title, "foundation") || strings.Contains(title, "basement") || strings.Contains(title, "crawlspace"):
		return "Foundation"
	case strings.Contains(title, "hvac") || strings.Contains(title, "cooling") || strings.Contains(title, "heating"):
		return "HVAC"
	case strings.Contains(title, "plumb") || strings.Contains(title, "water heater") || strings.Contains(title, "septic"):
		return "Plumbing"
	case strings.Contains(title, "electrical") || strings.Contains(title, "wiring") || strings.Contains(title, "breaker"):
		return "Electrical"
	case strings.Contains(title, "exterior") || strings.Contains(title, "siding") || strings.Contains(title, "stucco") || strings.Contains(title, "brick"):
		return "Exterior"
	case strings.Contains(title, "interior") || strings.Contains(title, "flooring") || strings.Contains(title, "walls") || strings.Contains(title, "ceiling"):
		return "Interior"
	case strings.Contains(title, "appliance") || strings.Contains(title, "oven") || strings.Contains(title, "range") || strings.Contains(title, "dishwasher"):
		return "Appliances"
	default:
		return "Exterior" // Default fallback
	}
}

// Save home health score to database
func SaveHomeHealthScore(db *sql.DB, propertyID, inspectionID string, score float64, breakdown map[string]float64, source string) error {
	breakdownJSON, err := json.Marshal(breakdown)
	if err != nil {
		return fmt.Errorf("failed to marshal breakdown: %v", err)
	}

	const query = `
		INSERT INTO home_health_score (property_id, inspection_id, score, breakdown, source, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, NOW(), NOW())
		ON DUPLICATE KEY UPDATE
			score = VALUES(score),
			breakdown = VALUES(breakdown),
			source = VALUES(source),
			updated_at = NOW();
	`

	_, err = db.Exec(query, propertyID, inspectionID, score, breakdownJSON, source)
	return err
}
