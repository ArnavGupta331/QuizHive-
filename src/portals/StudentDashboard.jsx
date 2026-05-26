import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getQuizzes, getAttempts, getUsers, getStudentClassRank } from "../data/stateManager";
import { GraduationCap, Award, BookOpen, Clock, Calendar, CheckCircle2, Play, FileText } from "lucide-react";
import CertificateScreen from "../components/CertificateScreen";
import ReportCard from "../components/ReportCard";
export default function StudentDashboard({ currentUser, defaultTab = "quizzes" }) {
  const navigate = useNavigate();
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [history, setHistory] = useState([]);
  const [parentName, setParentName] = useState("None");
  const [activeSubTab, setActiveSubTab] = useState(defaultTab);
  useEffect(() => {
    setActiveSubTab(defaultTab);
  }, [defaultTab]);
  
  // Certificate view state
  const [selectedAttemptForCertificate, setSelectedAttemptForCertificate] = useState(null);
  
  // Leaderboard and Report Card states
  const [classRankInfo, setClassRankInfo] = useState({ rank: 1, total: 1, leaderboard: [] });
  const [showReportCard, setShowReportCard] = useState(false);
  useEffect(() => {
    if (!currentUser) return;
    // Load quizzes targeting the student's class
    const allQuizzes = getQuizzes();
    const classQuizzes = allQuizzes.filter(q => Number(q.class) === Number(currentUser.class));
    setAvailableQuizzes(classQuizzes);
    // Load attempts for this student
    const allAttempts = getAttempts();
    const studentAttempts = allAttempts.filter(a => a.studentId === currentUser.id);
    setHistory(studentAttempts);
    // Find parent name
    const allUsers = getUsers();
    const parent = allUsers.find(u => u.role === "parent" && u.studentId === currentUser.id);
    if (parent) {
      setParentName(parent.name);
    }
    // Load class ranking info
    const rankInfo = getStudentClassRank(currentUser.id, currentUser.class);
    setClassRankInfo(rankInfo);
  }, [currentUser]);
  const handleStartQuiz = (quizId) => {
    navigate(`/quiz/${quizId}`);
  };
  const getRemarkClass = (remark) => {
    switch (remark) {
      case "Excellent": return "badge-success";
      case "Good": return "badge-info";
      case "Average": return "badge-warning";
      default: return "badge-error";
    }
  };
  return (
    <div>
      <div className="dark-mode-card-header" style={{ marginBottom: "2rem" }}>
        <div>
          <h1 className="title-serif" style={{ fontSize: "1.75rem" }}>Student Portal</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Access your class exams, track scores, and print academic certificates.</p>
        </div>
      </div>
      <div className="panel-row">
        {/* Left: Student Profile Card */}
        <div className="card" style={{ flex: 1, alignSelf: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textClassName: "center" }}>
            <div style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              fontWeight: "700",
              color: "#111111",
              marginBottom: "1.5rem"
            }}>
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            
            <h2 className="title-serif" style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>{currentUser.name}</h2>
            <span className="badge badge-info" style={{ marginBottom: "1.5rem" }}>Class {currentUser.class}</span>
            <div style={{ width: "100%", borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", margin: "0.5rem 0", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>Roll Number:</span>
                <span style={{ fontWeight: 600 }}>{currentUser.rollNumber || "N/A"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", margin: "0.5rem 0", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>Email Address:</span>
                <span style={{ fontWeight: 600 }}>{currentUser.email || "N/A"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", margin: "0.5rem 0", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>Parent Contact:</span>
                <span style={{ fontWeight: 600 }}>{parentName}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", margin: "0.5rem 0", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>Quizzes Taken:</span>
                <span style={{ fontWeight: 600 }}>{history.length}</span>
              </div>
              <button 
                className="btn btn-secondary btn-sm" 
                style={{ width: "100%", marginTop: "1rem", display: "flex", gap: "0.5rem", justifyContent: "center" }}
                onClick={() => setShowReportCard(true)}
              >
                <FileText size={14} /> Academic Report Card
              </button>
            </div>
          </div>
        </div>
        {/* Right: Quiz Center */}
        <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Sub Navigation */}
          <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem", overflowX: "auto" }}>
            <button
              className={`btn ${activeSubTab === "quizzes" ? "btn-primary" : "btn-secondary"}`}
              style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", whiteSpace: "nowrap" }}
              onClick={() => setActiveSubTab("quizzes")}
            >
              <BookOpen size={16} /> Available Quizzes
            </button>
            <button
              className={`btn ${activeSubTab === "history" ? "btn-primary" : "btn-secondary"}`}
              style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", whiteSpace: "nowrap" }}
              onClick={() => setActiveSubTab("history")}
            >
              <Award size={16} /> Quiz History & Certificates
            </button>
            <button
              className={`btn ${activeSubTab === "leaderboard" ? "btn-primary" : "btn-secondary"}`}
              style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", whiteSpace: "nowrap" }}
              onClick={() => setActiveSubTab("leaderboard")}
            >
              <Award size={16} /> Class Leaderboard
            </button>
          </div>
          {activeSubTab === "quizzes" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {availableQuizzes.length > 0 ? (
                availableQuizzes.map((quiz) => {
                  const pastAttempts = history.filter(a => a.quizId === quiz.id);
                  const isAttempted = pastAttempts.length > 0;
                  const highestAttempt = isAttempted 
                    ? [...pastAttempts].sort((a,b) => b.percentage - a.percentage)[0]
                    : null;
                  return (
                    <div key={quiz.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ maxWidth: "70%" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                          <h3 className="card-title" style={{ margin: 0 }}>{quiz.title}</h3>
                          <span className="badge badge-neutral">{quiz.subject}</span>
                        </div>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                          {quiz.description || "No description provided."}
                        </p>
                        <div style={{ display: "flex", gap: "1rem", fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <Clock size={12} /> {quiz.timeLimit} Mins Limit
                          </span>
                          <span>•</span>
                          <span>{quiz.questions.length} Multiple Choice Questions</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                        {isAttempted && (
                          <span className="badge badge-success" style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem" }}>
                            <CheckCircle2 size={12} /> Passed ({highestAttempt.percentage}%)
                          </span>
                        )}
                        <button 
                          className="btn btn-primary" 
                          onClick={() => handleStartQuiz(quiz.id)}
                          style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                        >
                          <Play size={14} fill="currentColor" /> {isAttempted ? "Re-attempt" : "Start Quiz"}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="card" style={{ textAlign: "center", padding: "3rem 0" }}>
                  <p style={{ color: "var(--text-muted)" }}>No quizzes are currently scheduled for Class {currentUser.class}.</p>
                </div>
              )}
            </div>
          )}
          {activeSubTab === "history" && (
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: "1.25rem" }}>Attempt Records</h3>
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
                      <th>Certificate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.length > 0 ? (
                      history.map((att) => {
                        const mins = Math.floor(att.timeTaken / 60);
                        const secs = att.timeTaken % 60;
                        return (
                          <tr key={att.id}>
                            <td><strong>{att.quizTitle}</strong></td>
                            <td>{att.subject}</td>
                            <td>{att.score} / {att.totalQuestions}</td>
                            <td>{att.percentage}%</td>
                            <td>{mins}m {secs}s</td>
                            <td>{att.date}</td>
                            <td>
                              <span className={`badge ${getRemarkClass(att.remark)}`}>
                                {att.remark}
                              </span>
                            </td>
                            <td>
                              <button 
                                className="btn btn-secondary btn-sm"
                                onClick={() => setSelectedAttemptForCertificate(att)}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="8" style={{ textAlign: "center" }}>You have not completed any quizzes yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeSubTab === "leaderboard" && (
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <h3 className="card-title" style={{ margin: 0 }}>Class {currentUser.class} Leaderboard</h3>
                <span className="badge badge-success" style={{ fontSize: "0.9rem", padding: "0.4rem 0.8rem", textTransform: "none" }}>
                  Your Rank: #{classRankInfo.rank} of {classRankInfo.total}
                </span>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1rem" }}>
                Leaderboard is calculated based on cumulative average scores of all attempts in this class.
              </p>
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Student Name</th>
                      <th>Roll Number</th>
                      <th>Attempts Count</th>
                      <th>Average Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classRankInfo.leaderboard.map((entry, idx) => {
                      const isSelf = entry.studentId === currentUser.id;
                      return (
                        <tr key={entry.studentId} style={isSelf ? { backgroundColor: "rgba(216,195,165,0.15)", fontWeight: 600 } : {}}>
                          <td><strong>#{idx + 1}</strong> {isSelf && "(You)"}</td>
                          <td>{entry.name}</td>
                          <td>{entry.rollNumber}</td>
                          <td>{entry.attemptsCount} quizzes</td>
                          <td>
                            <span className={`badge ${entry.average >= 85 ? "badge-success" : entry.average >= 70 ? "badge-info" : entry.average >= 50 ? "badge-warning" : "badge-error"}`}>
                              {entry.average}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Certificate Modal */}
      {selectedAttemptForCertificate && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "700px", padding: "1.5rem" }}>
            <button 
              className="modal-close" 
              onClick={() => setSelectedAttemptForCertificate(null)}
            >
            </button>
            <CertificateScreen 
              attempt={selectedAttemptForCertificate} 
              onClose={() => setSelectedAttemptForCertificate(null)} 
            />
          </div>
        </div>
      )}
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
              student={currentUser}
              attempts={history}
              classQuizzes={availableQuizzes}
              parentName={parentName}
              onClose={() => setShowReportCard(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
