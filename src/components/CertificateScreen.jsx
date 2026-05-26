import React from "react";
import { Award, Printer, X } from "lucide-react";
export default function CertificateScreen({ attempt, onClose }) {
  if (!attempt) return null;
  const handlePrint = () => {
    window.print();
  };
  return (
    <div style={{ padding: "1rem" }}>
      <div className="certificate-container">
        <div className="certificate-seal">
          <Award size={36} />
        </div>
        
        <h1 className="certificate-title">Certificate of Achievement</h1>
        <p className="certificate-subtitle">School Quiz Management System</p>
        
        <p style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
          This is proudly presented to
        </p>
        
        <h2 className="certificate-recipient">{attempt.studentName}</h2>
        
        <p className="certificate-text">
          for successfully completing the academic assessment on <strong>{attempt.quizTitle}</strong> (Subject: {attempt.subject}) for Class {attempt.class} with a score of <strong>{attempt.score}/{attempt.totalQuestions}</strong> (<strong>{attempt.percentage}%</strong>).
        </p>
        <div style={{ marginBottom: "2rem" }}>
          <span className="badge badge-success" style={{ fontSize: "1rem", padding: "0.5rem 1.25rem", textTransform: "uppercase", letterSpacing: "1px" }}>
            Performance: {attempt.remark}
          </span>
        </div>
        <div className="certificate-footer">
          <div className="certificate-sig">
            <div className="sig-line"></div>
            <span className="sig-title">Class Teacher</span>
          </div>
          <div className="certificate-sig">
            <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.25rem" }}>
              School Board
            </div>
            <div className="sig-line"></div>
            <span className="sig-title">System Director</span>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "1rem" }} className="no-print">
        <button className="btn btn-primary" onClick={handlePrint}>
          <Printer size={16} /> Print / Save PDF
        </button>
        {onClose && (
          <button className="btn btn-secondary" onClick={onClose}>
            Close Certificate
          </button>
        )}
      </div>
    </div>
  );
}
