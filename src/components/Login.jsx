import React, { useState } from "react";
import { loginUser, getUsers } from "../data/stateManager";
import { GraduationCap, BookOpen, Baby, ShieldAlert } from "lucide-react";
export default function Login({ onLoginSuccess }) {
  const [role, setRole] = useState("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError("Please fill in all fields.");
      return;
    }
    const result = loginUser(username, password, role);
    if (result.success) {
      onLoginSuccess(result.user);
    } else {
      setError(result.message || "Invalid credentials.");
    }
  };
  const getQuickAccounts = () => {
    const users = getUsers() || [];
    return users.filter((u) => u.role === role);
  };
  const selectQuickAccount = (user) => {
    setUsername(user.username);
    setPassword(user.password);
    setError("");
  };
  const getRoleIcon = (currentRole) => {
    switch (currentRole) {
      case "admin": return <ShieldAlert size={16} />;
      case "teacher": return <BookOpen size={16} />;
      case "parent": return <Baby size={16} />;
      default: return <GraduationCap size={16} />;
    }
  };
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div style={{
            display: "inline-flex",
            padding: "1rem",
            backgroundColor: "var(--accent)",
            borderRadius: "50%",
            marginBottom: "1rem"
          }}>
            <GraduationCap size={32} color="#111111" />
          </div>
          <h1 className="title-serif">SchoolQuiz</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            School Quiz Management & Analytics Portal
          </p>
        </div>
        {/* Role Selector Tabs */}
        <div className="login-role-selector">
          {["student", "teacher", "parent", "admin"].map((r) => (
            <button
              key={r}
              type="button"
              className={`role-btn ${role === r ? "active" : ""}`}
              onClick={() => {
                setRole(r);
                setUsername("");
                setPassword("");
                setError("");
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
                {getRoleIcon(r)}
                <span style={{ textTransform: "capitalize" }}>{r}</span>
              </div>
            </button>
          ))}
        </div>
        {error && (
          <div className="alert-banner error" style={{ padding: "0.75rem 1rem", fontSize: "0.85rem" }}>
            {error}
          </div>
        )}
        <form onSubmit={handleLogin} style={{ textAlign: "left" }}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={`Enter ${role} username`}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }}>
            Sign In to Portal
          </button>
        </form>
        {/* Quick Accounts list to make testing simple */}
        <div className="quick-accounts">
          <h4 className="quick-accounts-title">Quick Demo Login</h4>
          <div className="quick-accounts-list">
            {getQuickAccounts().map((user) => (
              <button
                key={user.id}
                type="button"
                className="quick-account-tag"
                onClick={() => selectQuickAccount(user)}
              >
                {user.name} {user.class ? `(Cls ${user.class})` : ""}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
