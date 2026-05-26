import React from "react";
import { Sun, Moon, LogOut, User, Menu } from "lucide-react";
export default function Header({ currentUser, onLogout, theme, onToggleTheme, onToggleSidebar }) {
  const getAvatarChar = () => {
    if (currentUser && currentUser.name) {
      return currentUser.name.charAt(0).toUpperCase();
    }
    return "?";
  };
  const getRoleLabel = () => {
    if (!currentUser) return "";
    switch (currentUser.role) {
      case "admin": return "Administrator";
      case "teacher": return "Teacher";
      case "student": return `Student (Class ${currentUser.class})`;
      case "parent": return "Parent Portal";
      default: return "";
    }
  };
  return (
    <header className="header">
      <div className="header-title-section">
        <button className="menu-toggle" onClick={onToggleSidebar} aria-label="Toggle Navigation">
          <Menu size={24} />
        </button>
        <div>
          <h2 className="title-serif" style={{ fontSize: "1.25rem" }}>
            School Quiz Management System
          </h2>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>
            {getRoleLabel()}
          </span>
        </div>
      </div>
      <div className="header-actions">
        <button 
          className="theme-toggle" 
          onClick={onToggleTheme} 
          title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        {currentUser && (
          <>
            <div className="user-profile-badge">
              <div className="profile-avatar">{getAvatarChar()}</div>
              <span style={{ fontSize: "0.9rem", fontWeight: 600, display: "inline-block", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {currentUser.name}
              </span>
            </div>
            <button 
              className="btn btn-danger btn-sm" 
              onClick={onLogout}
              style={{ padding: "0.5rem", borderRadius: "50%" }}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </>
        )}
      </div>
    </header>
  );
}
