import React, { useState } from "react";
import { loginUser, getUsers, addUser } from "../data/stateManager";
import { GraduationCap, BookOpen, Baby, ShieldAlert, Zap } from "lucide-react";

export default function Login({ onLoginSuccess }) {
  const [authMode, setAuthMode] = useState("login");
  const [role, setRole] = useState("student");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [classNum, setClassNum] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setUsername(""); setEmail(""); setPassword("");
    setName(""); setClassNum(""); setRollNumber("");
    setError(""); setSuccess("");
  };

  const switchMode = (mode) => {
    setAuthMode(mode);
    resetForm();
  };

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  const handleLogin = (e) => {
    e.preventDefault();
    setError(""); setSuccess("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);
    const result = loginUser(username.trim(), password, role);
    setLoading(false);

    if (result.success) {
      onLoginSuccess(result.user);
    } else {
      setError("Invalid username, password, or role. Please try again.");
    }
  };

  // ── REGISTER ───────────────────────────────────────────────────────────────
  const handleRegister = (e) => {
    e.preventDefault();
    setError(""); setSuccess("");

    // Basic validation
    if (!name.trim() || !username.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!email.toLowerCase().endsWith("@gmail.com")) {
      setError("Email must be a Gmail address (@gmail.com).");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (role === "student" && !classNum) {
      setError("Please select a class.");
      return;
    }

    // Block admin self-registration
    if (role === "admin") {
      setError("Admin accounts can only be created by the system administrator.");
      return;
    }

    // Check username not already taken
    const existingUsers = getUsers();
    const taken = existingUsers.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase()
    );
    if (taken) {
      setError("Username already taken. Please choose a different one.");
      return;
    }

    setLoading(true);

    // Build new user object
    const newUser = {
      role,
      username: username.trim().toLowerCase(),
      password,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      ...(role === "student" && {
        class: parseInt(classNum),
        rollNumber: rollNumber.trim() || `S-${Date.now().toString().slice(-4)}`,
      }),
      ...(role === "teacher" && {
        subject: "General",
        classes: [],
      }),
      ...(role === "parent" && {
        studentId: null, // Admin links parent to student after registration
      }),
    };

    try {
      addUser(newUser);
      setLoading(false);
      setSuccess("Account created! You can now log in with your credentials.");
      // Pre-fill login fields for convenience
      const savedUsername = username.trim().toLowerCase();
      const savedPassword = password;
      resetForm();
      setAuthMode("login");
      setUsername(savedUsername);
      setPassword(savedPassword);
    } catch (err) {
      setLoading(false);
      setError("Registration failed. Please try again.");
    }
  };

  const getRoleIcon = (r) => {
    switch (r) {
      case "admin":   return <ShieldAlert size={16} />;
      case "teacher": return <BookOpen size={16} />;
      case "parent":  return <Baby size={16} />;
      default:        return <GraduationCap size={16} />;
    }
  };

  // Roles available for registration (admin blocked)
  const registerableRoles = ["student", "teacher", "parent"];

  return (
    <div className="login-container">
      <div className="login-card">
        {/* ── Header ── */}
        <div className="login-header">
          <div
            style={{
              display: "inline-flex",
              padding: "1rem",
              backgroundColor: "var(--accent)",
              borderRadius: "50%",
              marginBottom: "1rem",
            }}
          >
            <Zap size={32} color="#111111" />
          </div>
          <h1 className="title-serif">QuizHive</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            School Quiz Management &amp; Analytics Portal
          </p>
        </div>

        {/* ── Login / Register toggle ── */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "1rem",
            background: "var(--secondary-bg, var(--bg-light, #f0ece4))",
            borderRadius: "0.6rem",
            padding: "0.25rem",
          }}
        >
          {["login", "register"].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => switchMode(mode)}
              style={{
                flex: 1,
                padding: "0.5rem",
                backgroundColor: authMode === mode ? "var(--primary, #1A1A1A)" : "transparent",
                color: authMode === mode ? "#fff" : "var(--text-muted)",
                border: "none",
                borderRadius: "0.4rem",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.9rem",
                fontFamily: "inherit",
                transition: "all 0.15s",
              }}
            >
              {mode === "login" ? "Login" : "Register"}
            </button>
          ))}
        </div>

        {/* ── Role tabs ── */}
        <div className="login-role-selector">
          {(authMode === "register" ? registerableRoles : ["student", "teacher", "parent", "admin"]).map((r) => (
            <button
              key={r}
              type="button"
              className={`role-btn ${role === r ? "active" : ""}`}
              onClick={() => { setRole(r); setError(""); setSuccess(""); }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
                {getRoleIcon(r)}
                <span style={{ textTransform: "capitalize", fontSize: "0.8rem" }}>{r}</span>
              </div>
            </button>
          ))}
        </div>

        {/* ── Alerts ── */}
        {error && (
          <div className="alert-banner error" style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
            {error}
          </div>
        )}
        {success && (
          <div
            className="alert-banner"
            style={{
              padding: "0.75rem 1rem",
              fontSize: "0.85rem",
              marginBottom: "0.75rem",
              background: "#EAF3DE",
              border: "1px solid #97C459",
              borderRadius: "0.5rem",
              color: "#2D6A4F",
            }}
          >
            ✓ {success}
          </div>
        )}

        {/* ════════════════════════════
            LOGIN FORM
        ════════════════════════════ */}
        {authMode === "login" && (
          <form onSubmit={handleLogin} style={{ textAlign: "left" }}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={`Enter ${role} username`}
                disabled={loading}
                autoComplete="username"
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
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "0.5rem" }}
              disabled={loading}
            >
              {loading ? "Signing In…" : "Sign In to Portal"}
            </button>

            {/* Quick-login hints for demo */}
            <div
              style={{
                marginTop: "1rem",
                padding: "0.75rem",
                background: "var(--secondary-bg, #f5f0e8)",
                borderRadius: "0.5rem",
                fontSize: "0.78rem",
                color: "var(--text-muted)",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-main)" }}>
                Demo credentials
              </div>
              {[
                { r: "student", u: "alex", p: "student123" },
                { r: "teacher", u: "smith", p: "teacher123" },
                { r: "parent",  u: "robert", p: "parent123" },
                { r: "admin",   u: "admin",  p: "admin123" },
              ].map(({ r, u, p }) => (
                <div
                  key={r}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "2px 0",
                    cursor: "pointer",
                  }}
                  onClick={() => { setRole(r); setUsername(u); setPassword(p); setError(""); }}
                >
                  <span style={{ textTransform: "capitalize", fontWeight: 500 }}>{r}</span>
                  <span style={{ fontFamily: "monospace" }}>{u} / {p}</span>
                </div>
              ))}
              <div style={{ marginTop: "0.4rem", fontSize: "0.72rem" }}>Click a row to auto-fill.</div>
            </div>
          </form>
        )}

        {/* ════════════════════════════
            REGISTER FORM
        ════════════════════════════ */}
        {authMode === "register" && (
          <form onSubmit={handleRegister} style={{ textAlign: "left" }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Username *</label>
              <input
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                disabled={loading}
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Gmail Address *</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.name@gmail.com"
                disabled={loading}
              />
              <small style={{ color: "var(--text-muted)", display: "block", marginTop: "0.25rem", fontSize: "0.77rem" }}>
                Must be a Gmail address (@gmail.com)
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                disabled={loading}
                autoComplete="new-password"
              />
            </div>

            {/* Student-only fields */}
            {role === "student" && (
              <>
                <div className="form-group">
                  <label className="form-label">Class *</label>
                  <select
                    className="form-input"
                    value={classNum}
                    onChange={(e) => setClassNum(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Select class…</option>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map((c) => (
                      <option key={c} value={c}>Class {c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Roll Number <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(optional)</span></label>
                  <input
                    type="text"
                    className="form-input"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="e.g. S-601"
                    disabled={loading}
                  />
                </div>
              </>
            )}

            {/* Teacher note */}
            {role === "teacher" && (
              <div
                style={{
                  padding: "0.65rem 0.85rem",
                  background: "var(--secondary-bg, #f5f0e8)",
                  borderRadius: "0.5rem",
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                  marginBottom: "0.75rem",
                  border: "1px solid var(--border)",
                }}
              >
                ℹ️ After registration, an admin will assign your classes and subject.
              </div>
            )}

            {/* Parent note */}
            {role === "parent" && (
              <div
                style={{
                  padding: "0.65rem 0.85rem",
                  background: "var(--secondary-bg, #f5f0e8)",
                  borderRadius: "0.5rem",
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                  marginBottom: "0.75rem",
                  border: "1px solid var(--border)",
                }}
              >
                ℹ️ After registration, an admin will link your account to your child's profile.
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "0.25rem" }}
              disabled={loading}
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>
        )}

        <p style={{ textAlign: "center", fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "1rem" }}>
          {authMode === "login"
            ? "Don't have an account? Click Register to create one."
            : "Already have an account? Click Login to sign in."}
        </p>
      </div>
    </div>
  );
}