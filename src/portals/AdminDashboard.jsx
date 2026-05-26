import React from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  Baby, 
  BookOpen, 
  Award, 
  GraduationCap, 
  LogOut,
  CalendarDays,
  ListTodo
} from "lucide-react";
export default function Sidebar({ currentUser, onLogout, isOpen }) {
  if (!currentUser) return null;
  const renderAdminLinks = () => (
    <>
      <li>
        <NavLink to="/admin/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>
      </li>
      <li>
        <NavLink to="/admin/students" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <GraduationCap size={18} />
          <span>Students</span>
        </NavLink>
      </li>
      <li>
        <NavLink to="/admin/teachers" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Users size={18} />
          <span>Teachers</span>
        </NavLink>
      </li>
      <li>
        <NavLink to="/admin/parents" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Baby size={18} />
          <span>Parents</span>
        </NavLink>
      </li>
      <li>
        <NavLink to="/admin/quizzes" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <BookOpen size={18} />
          <span>All Quizzes</span>
        </NavLink>
      </li>
    </>
  );
  const renderTeacherLinks = () => (
    <>
      <li>
        <NavLink to="/teacher/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>
      </li>
      <li>
        <NavLink to="/teacher/quizzes" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <BookOpen size={18} />
          <span>Manage Quizzes</span>
        </NavLink>
      </li>
      <li>
        <NavLink to="/teacher/attempts" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <ListTodo size={18} />
          <span>Student Attempts</span>
        </NavLink>
      </li>
    </>
  );
  const renderStudentLinks = () => (
    <>
      <li>
        <NavLink to="/student/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={18} />
          <span>My Profile</span>
        </NavLink>
      </li>
      <li>
        <NavLink to="/student/quizzes" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <BookOpen size={18} />
          <span>Attempt Quizzes</span>
        </NavLink>
      </li>
      <li>
        <NavLink to="/student/history" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Award size={18} />
          <span>My History</span>
        </NavLink>
      </li>
    </>
  );
  const renderParentLinks = () => (
    <>
      <li>
        <NavLink to="/parent/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={18} />
          <span>Child Performance</span>
        </NavLink>
      </li>
    </>
  );
  return (
    <aside className={`sidebar ${isOpen ? "open" : "hidden"}`}>
      <div className="sidebar-logo">
        <div style={{
          backgroundColor: "var(--sidebar-active-bg)",
          color: "var(--sidebar-active-text)",
          width: "36px",
          height: "36px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justify: "center",
          fontWeight: 800,
          fontSize: "1.2rem",
          justifyContent: "center"
        }}>
          S
        </div>
        <div className="logo-text">SchoolQuiz</div>
      </div>
      <ul className="sidebar-menu">
        {currentUser.role === "admin" && renderAdminLinks()}
        {currentUser.role === "teacher" && renderTeacherLinks()}
        {currentUser.role === "student" && renderStudentLinks()}
        {currentUser.role === "parent" && renderParentLinks()}
      </ul>
      <div className="sidebar-footer">
        <button className="sidebar-link" onClick={onLogout} style={{ border: "none", cursor: "pointer", width: "100%" }}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
