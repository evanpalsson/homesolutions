import React, { useState, useEffect } from "react";
import "../styles/AdminDashboard.css";

function AdminDashboard() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteStatus, setInviteStatus] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [invitations, setInvitations] = useState([]);

  const fetchInvitations = async () => {
    try {
      const res = await fetch("/api/invitations");
      const data = await res.json();
      setInvitations(data);
    } catch (err) {
      console.error("Failed to fetch invitations:", err);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleSendInvite = async () => {
    setInviteStatus("");
    setInviteError("");

    if (!inviteEmail) {
      setInviteError("Please enter an email address.");
      return;
    }

    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        setInviteStatus(`Invitation sent to ${inviteEmail}`);
        setInviteEmail("");
        fetchInvitations();
      } else {
        setInviteError(data.message || "Failed to send invite.");
      }
    } catch (err) {
      setInviteError("Something went wrong.");
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <section className="invite-section">
        <h2>Invite Home Inspector</h2>
        <input
          type="email"
          placeholder="Inspector's email"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
        />
        <button onClick={handleSendInvite}>Send Invite</button>
        {inviteStatus && <p className="success-msg">{inviteStatus}</p>}
        {inviteError && <p className="error-msg">{inviteError}</p>}
      </section>

      <section className="invites-list">
        <h2>Sent Invitations</h2>
        {invitations.length === 0 ? (
          <p>No invitations sent yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Status</th>
                <th>Sent</th>
              </tr>
            </thead>
            <tbody>
              {invitations.map((invite) => (
                <tr key={invite.invite_id}>
                  <td>{invite.email}</td>
                  <td>{invite.accepted ? "Accepted" : "Pending"}</td>
                  <td>{new Date(invite.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;
