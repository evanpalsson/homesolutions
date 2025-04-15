package invitations

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
)

type InvitationRequest struct {
	Email string `json:"email"`
}

func CreateInvitation(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req InvitationRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Email == "" {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		token := uuid.NewString()
		inviteID := uuid.NewString()
		expiresAt := time.Now().Add(7 * 24 * time.Hour)

		_, err := db.Exec(`
			INSERT INTO invitations (invite_id, email, user_type, token, expires_at)
			VALUES (?, ?, 'inspector', ?, ?)
		`, inviteID, req.Email, token, expiresAt)

		if err != nil {
			http.Error(w, "Failed to create invitation", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Invitation created",
			"token":   token,
		})
	}
}

func ListInvitations(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rows, err := db.Query(`SELECT invite_id, email, role, token, created_at, accepted FROM invitations ORDER BY created_at DESC`)
		if err != nil {
			http.Error(w, "Failed to retrieve invitations", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		type Invite struct {
			InviteID  string    `json:"invite_id"`
			Email     string    `json:"email"`
			UserType  string    `json:"user_type"`
			Token     string    `json:"token"`
			CreatedAt time.Time `json:"created_at"`
			Accepted  bool      `json:"accepted"`
		}

		var invites []Invite
		for rows.Next() {
			var i Invite
			if err := rows.Scan(&i.InviteID, &i.Email, &i.UserType, &i.Token, &i.CreatedAt, &i.Accepted); err != nil {
				continue
			}
			invites = append(invites, i)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(invites)
	}
}

func ValidateInvite(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token := r.URL.Query().Get("token")
		if token == "" {
			http.Error(w, "Token is required", http.StatusBadRequest)
			return
		}

		type Invite struct {
			Email     string    `json:"email"`
			UserType  string    `json:"user_type"`
			ExpiresAt time.Time `json:"expires_at"`
			Accepted  bool      `json:"accepted"`
		}

		var invite Invite
		err := db.QueryRow(`
			SELECT email, user_type, expires_at, accepted
			FROM invitations
			WHERE token = ?
		`, token).Scan(&invite.Email, &invite.UserType, &invite.ExpiresAt, &invite.Accepted)

		if err != nil {
			http.Error(w, "Invalid or expired invitation", http.StatusNotFound)
			return
		}

		if invite.Accepted || time.Now().After(invite.ExpiresAt) {
			http.Error(w, "This invitation is no longer valid", http.StatusForbidden)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(invite)
	}
}
