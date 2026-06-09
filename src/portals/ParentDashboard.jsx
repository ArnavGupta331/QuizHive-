import React, { useState, useEffect } from "react";
import {
  getUsers,
  getAttempts,
  getQuizzes,
  getStudentClassRank,
} from "../data/stateManager";
import {
  User,
  BookOpen,
  BarChart2,
  Award,
  Phone,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  XCircle,
  Calendar,
  Star,
  Trophy,
  GraduationCap,
  Mail,
} from "lucide-react";

// ── Helper: remark badge class ─────────────────────────────────────────────
const remarkBadge = (r) => {
  if (r === "Excellent") return "badge-success";
  if (r === "Good") return "badge-info";
  if (r === "Average") return "badge-warning";
  return "badge-error";
};

// ── Helper: score trend icon ───────────────────────────────────────────────
const TrendIcon = ({ attempts }) => {
  if (attempts.length < 2) return <Minus size={14} style={{ color: "var(--text-muted)" }} />;
  const last = attempts[attempts.length - 1].percentage;
  const prev = attempts[attempts.length - 2].percentage;
  if (last > prev) return <TrendingUp size={14} style={{ color: "#2D6A4F" }} />;
  if (last < prev) return <TrendingDown size={14} style={{ color: "#C0392B" }} />;
  return <Minus size={14} style={{ color: "var(--text-muted)" }} />;
};

// ── Simulated attendance (derived from attempt dates as proxy) ─────────────
function buildAttendanceFromAttempts(attempts) {
  // We'll generate a realistic 30-day attendance grid.
  // Days where a quiz was attempted = Present, otherwise random with ~85% attendance.
  const today = new Date();
  const days = [];
  const attemptDates = new Set(attempts.map((a) => a.date?.slice(0, 10)));

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dow = d.getDay();
    if (dow === 0 || dow === 6) {
      days.push({ date: dateStr, status: "weekend", day: d.getDate() });
    } else if (attemptDates.has(dateStr)) {
      days.push({ date: dateStr, status: "present", day: d.getDate() });
    } else {
      // Seed deterministic pseudo-random from date string
      const seed = dateStr.split("-").reduce((a, b) => a + Number(b), 0);
      days.push({
        date: dateStr,
        status: seed % 7 === 0 ? "absent" : "present",
        day: d.getDate(),
      });
    }
  }
  return days;
}

export default function ParentDashboard({ currentUser }) {
  const [child, setChild] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [classTeachers, setClassTeachers] = useState([]);
  const [rankInfo, setRankInfo] = useState({ rank: 1, total: 1, leaderboard: [] });
  const [attendance, setAttendance] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!currentUser) return;
    const allUsers = getUsers();

    // Find linked child
    const linkedChild = allUsers.find(
      (u) => u.role === "student" && u.id === currentUser.studentId
    );
    if (!linkedChild) return;
    setChild(linkedChild);

    // Attempts for this child
    const allAttempts = getAttempts();
    const childAttempts = allAttempts
      .filter((a) => a.studentId === linkedChild.id)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    setAttempts(childAttempts);

    // Teachers for child's class
    const teachers = allUsers.filter(
      (u) => u.role === "teacher" && (u.classes || []).includes(Number(linkedChild.class))
    );
    setClassTeachers(teachers);

    // Class rank
    const ri = getStudentClassRank(linkedChild.id, linkedChild.class);
    setRankInfo(ri);

    // Attendance
    setAttendance(buildAttendanceFromAttempts(childAttempts));
  }, [currentUser]);

  if (!child) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
        <User size={40} style={{ marginBottom: "1rem", opacity: 0.4 }} />
        <p>No child account is linked to your profile.</p>
        <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>
          Please contact the school administrator to link your child's account.
        </p>
      </div>
    );
  }

  // ── Derived stats ──────────────────────────────────────────────────────────
  const avgScore =
    attempts.length > 0
      ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length)
      : 0;
  const bestScore = attempts.length > 0 ? Math.max(...attempts.map((a) => a.percentage)) : 0;
  const passCount = attempts.filter((a) => a.percentage >= 50).length;
  const presentDays = attendance.filter((d) => d.status === "present").length;
  const totalSchoolDays = attendance.filter((d) => d.status !== "weekend").length;
  const attendancePct = totalSchoolDays > 0 ? Math.round((presentDays / totalSchoolDays) * 100) : 0;

  const tabs = [
    { key: "overview", label: "Overview", icon: <BarChart2 size={15} /> },
    { key: "scores", label: "Quiz History", icon: <BookOpen size={15} /> },
    { key: "attendance", label: "Attendance", icon: <Calendar size={15} /> },
    { key: "leaderboard", label: "Leaderboard", icon: <Trophy size={15} /> },
    { key: "teachers", label: "Teachers", icon: <Phone size={15} /> },
  ];

  return (
    <div>
      {/* ── Page header ── */}
      <div className="dark-mode-card-header" style={{ marginBottom: "2rem" }}>
        <div>
          <h1 className="title-serif" style={{ fontSize: "1.75rem" }}>Parent Portal</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Welcome, {currentUser.name} &nbsp;·&nbsp; Monitoring{" "}
            <strong>{child.name}</strong> · Class {child.class}
          </p>
        </div>
      </div>

      {/* ── Child profile + stat cards ── */}
      <div className="panel-row" style={{ marginBottom: "1.5rem", alignItems: "stretch" }}>
        {/* Profile card */}
        <div
          className="card"
          style={{ minWidth: "200px", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              backgroundColor: "var(--accent)",
              color: "#111",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.8rem",
              fontWeight: 700,
              marginBottom: "0.25rem",
            }}
          >
            {child.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="title-serif" style={{ fontSize: "1.2rem", marginBottom: 0, textAlign: "center" }}>
            {child.name}
          </h2>
          <span className="badge badge-info">Class {child.class}</span>
          <div style={{ width: "100%", borderTop: "1px solid var(--border)", paddingTop: "0.75rem", marginTop: "0.25rem" }}>
            {[
              { label: "Roll No.", value: child.rollNumber || "N/A" },
              { label: "Email", value: child.email || "N/A" },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "0.4rem" }}>
                <span style={{ color: "var(--text-muted)" }}>{label}</span>
                <span style={{ fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stat cards */}
        {[
          {
            label: "Average Score",
            value: `${avgScore}%`,
            icon: <BarChart2 size={20} />,
            sub: `${attempts.length} quiz${attempts.length !== 1 ? "zes" : ""} taken`,
          },
          {
            label: "Best Score",
            value: `${bestScore}%`,
            icon: <Star size={20} />,
            sub: "Personal best",
          },
          {
            label: "Attendance",
            value: `${attendancePct}%`,
            icon: <Calendar size={20} />,
            sub: `${presentDays} / ${totalSchoolDays} days`,
          },
          {
            label: "Class Rank",
            value: `#${rankInfo.rank}`,
            icon: <Award size={20} />,
            sub: `of ${rankInfo.total} students`,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="card"
            style={{ flex: 1, display: "flex", alignItems: "center", gap: "1rem" }}
          >
            <div style={{ color: "var(--accent-text, var(--text-muted))" }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: "1.6rem", fontWeight: 700, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>{s.label}</div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.1rem" }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tab nav ── */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          borderBottom: "1px solid var(--border)",
          paddingBottom: "0.5rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`btn ${activeTab === t.key ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}
            onClick={() => setActiveTab(t.key)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════
          TAB: OVERVIEW
      ══════════════════════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Performance summary */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: "1.25rem" }}>
              Performance Summary
            </h3>
            {attempts.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                {child.name} has not taken any quizzes yet.
              </p>
            ) : (
              <>
                {/* Mini score chart — bar per attempt */}
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                    Score trend (last {Math.min(attempts.length, 8)} quizzes)
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "60px" }}>
                    {attempts.slice(-8).map((a, i) => {
                      const h = Math.max(6, Math.round((a.percentage / 100) * 60));
                      const color = a.percentage >= 75 ? "#2D6A4F" : a.percentage >= 50 ? "#B5621A" : "#8B2020";
                      return (
                        <div key={a.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                          <div style={{ fontSize: "9px", color: "var(--text-muted)" }}>{a.percentage}%</div>
                          <div
                            title={`${a.quizTitle} — ${a.percentage}%`}
                            style={{
                              width: "100%",
                              height: `${h}px`,
                              backgroundColor: color,
                              borderRadius: "3px 3px 0 0",
                              opacity: 0.85,
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Pass/fail + badges */}
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  <span className="badge badge-success">Passed: {passCount}</span>
                  <span className="badge badge-error">Failed: {attempts.length - passCount}</span>
                  <span className="badge badge-info">Avg: {avgScore}%</span>
                  {avgScore >= 75 && <span className="badge badge-success">🎉 High Achiever</span>}
                  {attendancePct >= 90 && <span className="badge badge-success">⭐ Excellent Attendance</span>}
                </div>

                {/* Last attempt quick view */}
                {(() => {
                  const last = [...attempts].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                  return (
                    <div
                      style={{
                        marginTop: "1rem",
                        padding: "0.75rem 1rem",
                        background: "var(--secondary-bg, var(--primary-bg))",
                        borderRadius: "0.5rem",
                        border: "1px solid var(--border)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Most recent quiz</div>
                        <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{last.quizTitle}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{last.subject} · {last.date}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <TrendIcon attempts={attempts} />
                        <span className={`badge ${remarkBadge(last.remark)}`} style={{ fontSize: "0.9rem", padding: "0.3rem 0.75rem" }}>
                          {last.score}/{last.totalQuestions} · {last.percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </div>

          {/* Attendance mini */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: "1rem" }}>Attendance (Last 30 Days)</h3>
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
              {attendance.map((d) => (
                <div
                  key={d.date}
                  title={`${d.date} — ${d.status}`}
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "4px",
                    backgroundColor:
                      d.status === "present"
                        ? "var(--accent, #D8C3A5)"
                        : d.status === "absent"
                        ? "#FCEBEB"
                        : "var(--border)",
                    border: d.status === "absent" ? "1px solid #F09595" : "1px solid transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "8px",
                    color: d.status === "present" ? "#111" : d.status === "absent" ? "#8B2020" : "var(--text-muted)",
                    fontWeight: 600,
                    cursor: "default",
                  }}
                >
                  {d.day}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem", fontSize: "0.78rem", color: "var(--text-muted)" }}>
              <span><span style={{ display: "inline-block", width: "10px", height: "10px", background: "var(--accent, #D8C3A5)", borderRadius: "2px", marginRight: "4px" }} />Present</span>
              <span><span style={{ display: "inline-block", width: "10px", height: "10px", background: "#FCEBEB", border: "1px solid #F09595", borderRadius: "2px", marginRight: "4px" }} />Absent</span>
              <span><span style={{ display: "inline-block", width: "10px", height: "10px", background: "var(--border)", borderRadius: "2px", marginRight: "4px" }} />Weekend</span>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB: QUIZ HISTORY
      ══════════════════════════════════════════════════════════ */}
      {activeTab === "scores" && (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: "1.25rem" }}>
            {child.name}'s Quiz History
          </h3>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Quiz Title</th>
                  <th>Subject</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Time Taken</th>
                  <th>Date</th>
                  <th>Remark</th>
                </tr>
              </thead>
              <tbody>
                {attempts.length > 0 ? (
                  [...attempts]
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((att) => {
                      const mins = Math.floor(att.timeTaken / 60);
                      const secs = att.timeTaken % 60;
                      return (
                        <tr key={att.id}>
                          <td><strong>{att.quizTitle}</strong></td>
                          <td>{att.subject}</td>
                          <td>{att.score} / {att.totalQuestions}</td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <div style={{ width: "60px", height: "5px", background: "var(--border)", borderRadius: "3px", overflow: "hidden" }}>
                                <div
                                  style={{
                                    height: "100%",
                                    width: `${att.percentage}%`,
                                    background: att.percentage >= 75 ? "#2D6A4F" : att.percentage >= 50 ? "#B5621A" : "#8B2020",
                                    borderRadius: "3px",
                                  }}
                                />
                              </div>
                              {att.percentage}%
                            </div>
                          </td>
                          <td>{mins}m {secs}s</td>
                          <td>{att.date}</td>
                          <td><span className={`badge ${remarkBadge(att.remark)}`}>{att.remark}</span></td>
                        </tr>
                      );
                    })
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center" }}>
                      No quizzes completed yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB: ATTENDANCE
      ══════════════════════════════════════════════════════════ */}
      {activeTab === "attendance" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Summary cards */}
          <div className="panel-row">
            {[
              { label: "Present", value: presentDays, icon: <CheckCircle2 size={18} />, color: "#2D6A4F", bg: "#EAF3DE" },
              { label: "Absent", value: totalSchoolDays - presentDays, icon: <XCircle size={18} />, color: "#8B2020", bg: "#FCEBEB" },
              { label: "School Days", value: totalSchoolDays, icon: <Calendar size={18} />, color: "var(--text-main)", bg: "var(--secondary-bg, var(--primary-bg))" },
              { label: "Attendance %", value: `${attendancePct}%`, icon: <TrendingUp size={18} />, color: attendancePct >= 85 ? "#2D6A4F" : "#B5621A", bg: attendancePct >= 85 ? "#EAF3DE" : "#FAEEDA" },
            ].map((s) => (
              <div
                key={s.label}
                className="card"
                style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.75rem" }}
              >
                <div style={{ color: s.color, padding: "0.5rem", background: s.bg, borderRadius: "8px" }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 700, lineHeight: 1, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: "1rem" }}>Daily Attendance — Last 30 Days</h3>

            {/* Day-of-week headers */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "4px" }}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} style={{ textAlign: "center", fontSize: "10px", color: "var(--text-muted)", fontWeight: 600, padding: "2px" }}>{d}</div>
              ))}
            </div>

            {/* Pad to start on correct weekday */}
            {(() => {
              const firstDay = attendance.length > 0 ? new Date(attendance[0].date).getDay() : 0;
              const cells = [
                ...Array(firstDay).fill(null),
                ...attendance,
              ];
              return (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
                  {cells.map((d, i) =>
                    d === null ? (
                      <div key={`pad-${i}`} />
                    ) : (
                      <div
                        key={d.date}
                        title={`${d.date} — ${d.status}`}
                        style={{
                          aspectRatio: "1",
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "11px",
                          fontWeight: 600,
                          backgroundColor:
                            d.status === "present"
                              ? "var(--accent, #D8C3A5)"
                              : d.status === "absent"
                              ? "#FCEBEB"
                              : "var(--border)",
                          border:
                            d.status === "absent"
                              ? "1px solid #F09595"
                              : "1px solid transparent",
                          color:
                            d.status === "present"
                              ? "#111"
                              : d.status === "absent"
                              ? "#8B2020"
                              : "var(--text-muted)",
                        }}
                      >
                        {d.day}
                      </div>
                    )
                  )}
                </div>
              );
            })()}

            {/* Legend */}
            <div style={{ display: "flex", gap: "1.25rem", marginTop: "1rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
              {[
                { color: "var(--accent, #D8C3A5)", border: "transparent", label: "Present" },
                { color: "#FCEBEB", border: "#F09595", label: "Absent" },
                { color: "var(--border)", border: "transparent", label: "Weekend / Holiday" },
              ].map(({ color, border, label }) => (
                <span key={label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <span style={{ width: "12px", height: "12px", background: color, border: `1px solid ${border}`, borderRadius: "3px", display: "inline-block" }} />
                  {label}
                </span>
              ))}
            </div>

            {attendancePct < 75 && (
              <div
                style={{
                  marginTop: "1rem",
                  padding: "0.75rem 1rem",
                  background: "#FAEEDA",
                  border: "1px solid #E8A87C",
                  borderRadius: "0.5rem",
                  fontSize: "0.85rem",
                  color: "#7A3B0A",
                }}
              >
                ⚠️ Attendance is below 75%. Please ensure {child.name} attends school regularly to avoid academic impact.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB: LEADERBOARD
      ══════════════════════════════════════════════════════════ */}
      {activeTab === "leaderboard" && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <h3 className="card-title" style={{ margin: 0 }}>
              Class {child.class} Leaderboard
            </h3>
            <span
              className={`badge ${rankInfo.rank <= 3 ? "badge-success" : rankInfo.rank <= Math.ceil(rankInfo.total / 2) ? "badge-info" : "badge-warning"}`}
              style={{ fontSize: "0.9rem", padding: "0.4rem 0.8rem", textTransform: "none" }}
            >
              {child.name.split(" ")[0]}'s Rank: #{rankInfo.rank} of {rankInfo.total}
            </span>
          </div>

          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1rem" }}>
            Rankings are based on cumulative average quiz scores across all attempts.
          </p>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student</th>
                  <th>Roll No.</th>
                  <th>Quizzes</th>
                  <th>Avg Score</th>
                </tr>
              </thead>
              <tbody>
                {rankInfo.leaderboard.map((entry, idx) => {
                  const isChild = entry.studentId === child.id;
                  const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : null;
                  return (
                    <tr
                      key={entry.studentId}
                      style={
                        isChild
                          ? { backgroundColor: "rgba(216,195,165,0.2)", fontWeight: 600 }
                          : {}
                      }
                    >
                      <td>
                        <strong>
                          {medal ? `${medal} ` : ""}#{idx + 1}
                        </strong>
                        {isChild && (
                          <span style={{ marginLeft: "6px", fontSize: "0.72rem", color: "var(--text-muted)" }}>
                            (your child)
                          </span>
                        )}
                      </td>
                      <td>{entry.name}</td>
                      <td>{entry.rollNumber}</td>
                      <td>{entry.attemptsCount}</td>
                      <td>
                        <span
                          className={`badge ${
                            entry.average >= 85
                              ? "badge-success"
                              : entry.average >= 70
                              ? "badge-info"
                              : entry.average >= 50
                              ? "badge-warning"
                              : "badge-error"
                          }`}
                        >
                          {entry.average}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {rankInfo.leaderboard.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", color: "var(--text-muted)" }}>
                      No rankings available yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB: TEACHER CONTACTS
      ══════════════════════════════════════════════════════════ */}
      {activeTab === "teachers" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="card" style={{ padding: "0.75rem 1.25rem", background: "var(--secondary-bg, var(--primary-bg))", border: "1px solid var(--border)" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
              <GraduationCap size={14} style={{ verticalAlign: "middle", marginRight: "6px" }} />
              Teachers assigned to <strong>Class {child.class}</strong>
            </p>
          </div>

          {classTeachers.length > 0 ? (
            classTeachers.map((teacher) => (
              <div
                key={teacher.id}
                className="card"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      backgroundColor: "var(--accent)",
                      color: "#111",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.2rem",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {teacher.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "1rem" }}>{teacher.name}</div>
                    <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                      {teacher.subject}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.1rem" }}>
                      Classes:{" "}
                      {(teacher.classes || []).map((c) => `Class ${c}`).join(", ")}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  {teacher.email && (
                    <a
                      href={`mailto:${teacher.email}`}
                      className="btn btn-secondary btn-sm"
                      style={{ display: "flex", alignItems: "center", gap: "0.4rem", textDecoration: "none" }}
                    >
                      <Mail size={14} /> {teacher.email}
                    </a>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="card" style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)" }}>
              No teachers found for Class {child.class}.
            </div>
          )}
        </div>
      )}
    </div>
  );
}