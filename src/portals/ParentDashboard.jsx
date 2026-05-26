  import React, { useState, useEffect } from "react";
  import { getAttempts, getUsers, getQuizzes } from "../data/stateManager";
  import { Baby, Award, TrendingUp, AlertTriangle, CheckCircle, Clock, FileText } from "lucide-react";
  import ReportCard from "../components/ReportCard";
  import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer 
  } from "recharts";
  export default function ParentDashboard({ currentUser }) {
    const [child, setChild] = useState(null);
    const [childAttempts, setChildAttempts] = useState([]);
    const [classQuizzes, setClassQuizzes] = useState([]);
    const [strengths, setStrengths] = useState([]);
    const [weaknesses, setWeaknesses] = useState([]);
    const [showReportCard, setShowReportCard] = useState(false);
    useEffect(() => {
      if (!currentUser || !currentUser.studentId) return;
      const allUsers = getUsers();
      const childUser = allUsers.find(u => u.id === currentUser.studentId);
      if (!childUser) return;
      setChild(childUser);
      // Fetch child attempts
      const allAttempts = getAttempts();
      const attempts = allAttempts.filter(a => a.studentId === childUser.id);
      // Sort by date ascending for trend chart
      const sortedAttempts = [...attempts].sort((a, b) => new Date(a.date) - new Date(b.date));
      setChildAttempts(sortedAttempts);
      // Fetch quizzes for child's class
      const allQuizzes = getQuizzes();
      const quizzes = allQuizzes.filter(q => Number(q.class) === Number(childUser.class));
      setClassQuizzes(quizzes);
      // Determine strengths & weaknesses
      // Group attempts by subject
      const subjectScores = {};
      attempts.forEach(a => {
        if (!subjectScores[a.subject]) {
          subjectScores[a.subject] = { totalPct: 0, count: 0 };
        }
        subjectScores[a.subject].totalPct += a.percentage;
        subjectScores[a.subject].count += 1;
      });
      const strong = [];
      const weak = [];
      Object.keys(subjectScores).forEach(sub => {
        const avg = Math.round(subjectScores[sub].totalPct / subjectScores[sub].count);
        if (avg >= 75) {
          strong.push({ subject: sub, average: avg });
        } else if (avg < 60) {
          weak.push({ subject: sub, average: avg });
        }
      });
      // Fallback if no full subjects, look at individual quizzes
      if (strong.length === 0 && weak.length === 0 && attempts.length > 0) {
        attempts.forEach(a => {
          if (a.percentage >= 75) {
            strong.push({ subject: a.quizTitle, average: a.percentage });
          } else if (a.percentage < 60) {
            weak.push({ subject: a.quizTitle, average: a.percentage });
          }
        });
      }
      setStrengths(strong);
      setWeaknesses(weak);
    }, [currentUser]);
    if (!currentUser || !child) {
      return <div style={{ padding: "2rem", textAlign: "center" }}>No linked child record found for this parent account.</div>;
    }
    // Calculate statistics
    const avgScore = childAttempts.length > 0 
      ? Math.round(childAttempts.reduce((acc, curr) => acc + curr.percentage, 0) / childAttempts.length)
      : 0;
    // Attended count vs missed count
    const quizzesAttended = new Set(childAttempts.map(a => a.quizId));
    const attendanceRate = classQuizzes.length > 0 
      ? Math.round((quizzesAttended.size / classQuizzes.length) * 100)
      : 0;
    return (
      <div>
        <div className="dark-mode-card-header" style={{ marginBottom: "2rem" }}>
          <div>
            <h1 className="title-serif" style={{ fontSize: "1.75rem" }}>Parent Portal</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Monitor academic performance, attendance, and feedback for your child.</p>
          </div>
        </div>
        <div className="panel-row">
          {/* Child Profile summary */}
          <div className="card" style={{ flex: 1, alignSelf: "flex-start" }}>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1.5rem" }}>
              <div style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#111111"
              }}>
                <Baby size={28} />
              </div>
              <div>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>Student Monitored</span>
                <h2 className="title-serif" style={{ fontSize: "1.3rem" }}>{child.name}</h2>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>Class {child.class} • Roll {child.rollNumber}</span>
              </div>
            </div>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", margin: "0.5rem 0", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>Parent Account:</span>
                <span style={{ fontWeight: 600 }}>{currentUser.name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", margin: "0.5rem 0", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>Quizzes Attended:</span>
                <span style={{ fontWeight: 600 }}>{quizzesAttended.size} / {classQuizzes.length}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", margin: "0.5rem 0", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>Average Score:</span>
                <span style={{ fontWeight: 600 }}>{avgScore}%</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", margin: "0.5rem 0", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>Attendance Rate:</span>
                <span style={{ fontWeight: 600, color: attendanceRate >= 80 ? "var(--success)" : "var(--warning)" }}>{attendanceRate}%</span>
              </div>
              <button 
                className="btn btn-secondary btn-sm" 
                style={{ width: "100%", marginTop: "1.25rem", display: "flex", gap: "0.5rem", justifyContent: "center" }}
                onClick={() => setShowReportCard(true)}
              >
                <FileText size={14} /> Academic Report Card
              </button>
            </div>
          </div>
          {/* Child Trends Chart */}
          <div className="card" style={{ flex: 2 }}>
            <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <TrendingUp size={20} />
              Performance Trend Over Time (%)
            </h3>
            {childAttempts.length > 0 ? (
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={childAttempts}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="date" stroke="var(--text-muted)" />
                    <YAxis domain={[0, 100]} stroke="var(--text-muted)" />
                    <Tooltip contentStyle={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border)", color: "var(--text-main)" }} />
                    <Line type="monotone" dataKey="percentage" stroke="#111111" strokeWidth={3} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-muted)" }}>
                No quiz attempts recorded for {child.name} yet.
              </div>
            )}
          </div>
        </div>
        {/* Strengths & Weaknesses row */}
        <div className="panel-row" style={{ marginTop: "1.5rem" }}>
          {/* Strengths card */}
          <div className="card">
            <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--success)" }}>
              <CheckCircle size={20} /> Areas of Strength
            </h3>
            {strengths.length > 0 ? (
              <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {strengths.map((s, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", backgroundColor: "var(--success-light)", borderRadius: "var(--border-radius-sm)" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{s.subject}</span>
                    <span className="badge badge-success">{s.average}% Average</span>
                  </div>
                ))}
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                  💡 Child demonstrates excellent understanding in these areas. Keep encouraging practice.
                </p>
              </div>
            ) : (
              <div style={{ padding: "2rem 0", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                No strong subject trends identified yet. Scores will build profiles.
              </div>
            )}
          </div>
          {/* Weaknesses card */}
          <div className="card">
            <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--error)" }}>
              <AlertTriangle size={20} /> Focus / Revision Areas
            </h3>
            {weaknesses.length > 0 ? (
              <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {weaknesses.map((w, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", backgroundColor: "var(--error-light)", borderRadius: "var(--border-radius-sm)" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{w.subject}</span>
                    <span className="badge badge-error">{w.average}% Average</span>
                  </div>
                ))}
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                  💡 Needs focus. Review quiz answer sheets in the student portal together and revise foundational concepts.
                </p>
              </div>
            ) : (
              <div style={{ padding: "2rem 0", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                No critical weak areas detected. Excellent work!
              </div>
            )}
          </div>
        </div>
        {/* Child attempts list */}
        <div className="card" style={{ marginTop: "1.5rem" }}>
          <h3 className="card-title" style={{ marginBottom: "1.25rem" }}>Child's Assessment Log</h3>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Quiz Name</th>
                  <th>Subject</th>
                  <th>Score Obtained</th>
                  <th>Percentage</th>
                  <th>Time Spent</th>
                  <th>Date of Attempt</th>
                  <th>Status Remark</th>
                </tr>
              </thead>
              <tbody>
                {childAttempts.length > 0 ? (
                  [...childAttempts].reverse().map((att) => {
                    const mins = Math.floor(att.timeTaken / 60);
                    const secs = att.timeTaken % 60;
                    
                    let badge = "badge-neutral";
                    if (att.remark === "Excellent") badge = "badge-success";
                    else if (att.remark === "Good") badge = "badge-info";
                    else if (att.remark === "Average") badge = "badge-warning";
                    else if (att.remark === "Needs Improvement") badge = "badge-error";
                    return (
                      <tr key={att.id}>
                        <td><strong>{att.quizTitle}</strong></td>
                        <td>{att.subject}</td>
                        <td>{att.score} / {att.totalQuestions}</td>
                        <td>{att.percentage}%</td>
                        <td>{mins}m {secs}s</td>
                        <td>{att.date}</td>
                        <td>
                          <span className={`badge ${badge}`}>{att.remark}</span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center" }}>No assessment records found for this student.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Report Card Modal */}
        {showReportCard && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: "800px", padding: "1.5rem" }}>
              <button 
                className="modal-close" 
                onClick={() => setShowReportCard(false)}
              >
                ×
              </button>
              <ReportCard 
                student={child}
                attempts={childAttempts}
                classQuizzes={classQuizzes}
                parentName={currentUser.name}
                onClose={() => setShowReportCard(false)}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
