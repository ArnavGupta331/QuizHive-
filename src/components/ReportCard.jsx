import React from "react";
import { Award, Printer, X, FileText } from "lucide-react";
export default function ReportCard({ student, attempts, classQuizzes, parentName, onClose }) {
  if (!student) return null;
  // Calculate subject stats
  const subjectStats = {};
  attempts.forEach((a) => {
    if (!subjectStats[a.subject]) {
      subjectStats[a.subject] = { totalPercentage: 0, count: 0, highestScore: 0 };
    }
    subjectStats[a.subject].totalPercentage += a.percentage;
    subjectStats[a.subject].count += 1;
    if (a.percentage > subjectStats[a.subject].highestScore) {
      subjectStats[a.subject].highestScore = a.percentage;
    }
  });
  const subjectRows = Object.keys(subjectStats).map((subj) => {
    const avg = Math.round(subjectStats[subj].totalPercentage / subjectStats[subj].count);
    let grade = "F";
    if (avg >= 85) grade = "A";
    else if (avg >= 70) grade = "B";
    else if (avg >= 50) grade = "C";
    else grade = "D";
    return {
      subject: subj,
      quizzesTaken: subjectStats[subj].count,
      average: avg,
      highest: subjectStats[subj].highestScore,
      grade
    };
  });
  // Overall calculations
  const totalQuizzesAvailable = classQuizzes.length;
  const attendedQuizzesCount = new Set(attempts.map((a) => a.quizId)).size;
  const attendanceRate = totalQuizzesAvailable > 0
    ? Math.round((attendedQuizzesCount / totalQuizzesAvailable) * 100)
    : 0;
  const overallAvg = attempts.length > 0
    ? Math.round(attempts.reduce((acc, curr) => acc + curr.percentage, 0) / attempts.length)
    : 0;
  let overallRemark = "Needs Improvement";
  if (overallAvg >= 85) overallRemark = "Excellent Progress";
  else if (overallAvg >= 70) overallRemark = "Good Effort";
  else if (overallAvg >= 50) overallRemark = "Satisfactory Average";
  const handlePrint = () => {
    window.print();
  };
  return (
    <div style={{ padding: "1rem" }}>
      <div className="report-card-container">
        {/* Report Card Header */}
        <div className="report-card-header">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
            <FileText size={40} color="var(--text-main)" />
            <div>
              <h1 className="title-serif" style={{ fontSize: "2rem", margin: 0, textTransform: "uppercase", letterSpacing: "1px" }}>
                Academic Report Card
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0, fontWeight: 500 }}>
                School Quiz Management & Performance System
              </p>
            </div>
          </div>
          <div className="report-card-school-info">
            <strong>VIRTUAL ACADEMY</strong><br />
            Term Evaluation Report<br />
            Date: {new Date().toLocaleDateString()}
          </div>
        </div>
        {/* Student Details Grid */}
        <div className="report-card-details">
          <div className="detail-item">
            <span className="detail-label">Student Name:</span>
            <span className="detail-val">{student.name}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Class Level:</span>
            <span className="detail-val">Class {student.class}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Roll Number:</span>
            <span className="detail-val">{student.rollNumber || "N/A"}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Parent/Guardian:</span>
            <span className="detail-val">{parentName || "N/A"}</span>
          </div>
        </div>
        {/* Grades Table */}
        <h3 className="title-serif" style={{ fontSize: "1.2rem", margin: "1.5rem 0 0.75rem 0", borderBottom: "2px solid var(--text-main)", paddingBottom: "0.25rem" }}>
          Subject Evaluation Summary
        </h3>
        <table className="report-card-table">
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Subject</th>
              <th>Quizzes Taken</th>
              <th>Highest Score</th>
              <th>Average Score</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {subjectRows.length > 0 ? (
              subjectRows.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ textAlign: "left", fontWeight: 600 }}>{row.subject}</td>
                  <td>{row.quizzesTaken}</td>
                  <td>{row.highest}%</td>
                  <td>{row.average}%</td>
                  <td style={{ fontWeight: 700 }}>{row.grade}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "1.5rem" }}>No quiz evaluation records found for this term.</td>
              </tr>
            )}
          </tbody>
        </table>
        {/* Statistics Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginTop: "1.5rem" }}>
          <div className="report-stat-box">
            <span className="report-stat-lbl">Quiz Attendance</span>
            <span className="report-stat-val" style={{ color: attendanceRate >= 80 ? "var(--success)" : "var(--warning)" }}>
              {attendanceRate}%
            </span>
            <span className="report-stat-sub">({attendedQuizzesCount} of {totalQuizzesAvailable} quizzes)</span>
          </div>
          <div className="report-stat-box">
            <span className="report-stat-lbl">Overall Average</span>
            <span className="report-stat-val">{overallAvg}%</span>
            <span className="report-stat-sub">Cumulative grade pct</span>
          </div>
          <div className="report-stat-box">
            <span className="report-stat-lbl">Conduct / Remark</span>
            <span className="report-stat-val" style={{ fontSize: "1.1rem", height: "36px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {overallRemark}
            </span>
            <span className="report-stat-sub">Academic appraisal</span>
          </div>
        </div>
        {/* Signatures */}
        <div className="report-card-footer" style={{ marginTop: "3rem" }}>
          <div className="certificate-sig">
            <div className="sig-line"></div>
            <span className="sig-title">Class Tutor</span>
          </div>
          <div className="certificate-sig">
            <div className="sig-line"></div>
            <span className="sig-title">Academy Registrar</span>
          </div>
        </div>
      </div>
      {/* Control Buttons (hidden when printing) */}
      <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "1.5rem" }} className="no-print">
        <button className="btn btn-primary" onClick={handlePrint} disabled={attempts.length === 0}>
          <Printer size={16} /> Print Report Card / Save PDF
        </button>
        {onClose && (
          <button className="btn btn-secondary" onClick={onClose}>
            Close Report Card
          </button>
        )}
      </div>
    </div>
  );
}
