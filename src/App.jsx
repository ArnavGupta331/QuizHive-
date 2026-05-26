import React, { useState, useEffect } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { getCurrentUser, setCurrentUser, initializeStorage } from "./data/stateManager";

// Components
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Login from "./components/Login";
import QuizModule from "./components/QuizModule";

// Portals
import AdminDashboard from "./portals/AdminDashboard";
import TeacherDashboard from "./portals/TeacherDashboard";
import StudentDashboard from "./portals/StudentDashboard";
import ParentDashboard from "./portals/ParentDashboard";

export default function App() {
  const [currentUser, setCurrentUserLocal] = useState(null);
  const [theme, setTheme] = useState("light");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set page title
    document.title = "QuizHive — School Quiz System";

    // Initial storage setup
    initializeStorage();

    // Load auth session
    const user = getCurrentUser();
    if (user) {
      // Guard: if stored user has no valid role, clear it to prevent portal mismatch
      const validRoles = ["admin", "teacher", "student", "parent"];
      if (!validRoles.includes(user.role)) {
        setCurrentUser(null);
      } else {
        setCurrentUserLocal(user);
      }
    }

    // Load theme setting
    const savedTheme = localStorage.getItem("quiz_system_theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);

    setLoading(false);
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUserLocal(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentUserLocal(null);
  };

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("quiz_system_theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  const toggleSidebar = () => setSidebarOpen((o) => !o);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--primary-bg)",
          color: "var(--text-main)",
          fontSize: "1rem",
          gap: "0.75rem",
        }}
      >
        Loading QuizHive…
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* ── Public login ── */}
        <Route
          path="/login"
          element={
            currentUser ? (
              <Navigate to={`/${currentUser.role}/dashboard`} replace />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* ── Protected app shell ── */}
        <Route
          path="/*"
          element={
            !currentUser ? (
              <Navigate to="/login" replace />
            ) : (
              <div className="app-container">
                <Sidebar
                  currentUser={currentUser}
                  onLogout={handleLogout}
                  isOpen={sidebarOpen}
                />
                <div className="main-content">
                  <Header
                    currentUser={currentUser}
                    onLogout={handleLogout}
                    theme={theme}
                    onToggleTheme={toggleTheme}
                    onToggleSidebar={toggleSidebar}
                  />
                  <main
                    className="content-body"
                    onClick={() => sidebarOpen && setSidebarOpen(false)}
                  >
                    <Routes>
                      {/* ── Admin ── */}
                      {currentUser.role === "admin" && (
                        <>
                          <Route path="/admin/dashboard" element={<AdminDashboard />} />
                          <Route path="/admin/students"  element={<AdminDashboard />} />
                          <Route path="/admin/teachers"  element={<AdminDashboard />} />
                          <Route path="/admin/parents"   element={<AdminDashboard />} />
                          <Route path="/admin/quizzes"   element={<AdminDashboard />} />
                          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                        </>
                      )}

                      {/* ── Teacher ── */}
                      {currentUser.role === "teacher" && (
                        <>
                          {/* Dashboard — overview stats */}
                          <Route
                            path="/teacher/dashboard"
                            element={<TeacherDashboard currentUser={currentUser} defaultTab="quizzes" />}
                          />
                          {/* Create Quiz — opens form immediately */}
                          <Route
                            path="/teacher/create"
                            element={<TeacherDashboard currentUser={currentUser} defaultTab="quizzes" autoOpenCreate />}
                          />
                          {/* Manage Quizzes — quiz list */}
                          <Route
                            path="/teacher/quizzes"
                            element={<TeacherDashboard currentUser={currentUser} defaultTab="quizzes" />}
                          />
                          {/* Student Attempts */}
                          <Route
                            path="/teacher/attempts"
                            element={<TeacherDashboard currentUser={currentUser} defaultTab="attempts" />}
                          />
                          {/* My Students */}
                          <Route
                            path="/teacher/students"
                            element={<TeacherDashboard currentUser={currentUser} defaultTab="students" />}
                          />
                          <Route path="*" element={<Navigate to="/teacher/dashboard" replace />} />
                        </>
                      )}

                      {/* ── Student ── */}
                      {currentUser.role === "student" && (
                        <>
                          <Route path="/student/dashboard" element={<StudentDashboard currentUser={currentUser} defaultTab="quizzes" />} />
                          <Route path="/student/quizzes"   element={<StudentDashboard currentUser={currentUser} defaultTab="quizzes" />} />
                          <Route path="/student/history"   element={<StudentDashboard currentUser={currentUser} defaultTab="history" />} />
                          <Route path="/quiz/:id"          element={<QuizModule currentUser={currentUser} />} />
                          <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
                        </>
                      )}

                      {/* ── Parent ── */}
                      {currentUser.role === "parent" && (
                        <>
                          <Route path="/parent/dashboard" element={<ParentDashboard currentUser={currentUser} />} />
                          <Route path="*" element={<Navigate to="/parent/dashboard" replace />} />
                        </>
                      )}

                      {/* Fallback */}
                      <Route path="*" element={<Navigate to={`/${currentUser.role}/dashboard`} replace />} />
                    </Routes>
                  </main>
                </div>
              </div>
            )
          }
        />
      </Routes>
    </Router>
  );
}