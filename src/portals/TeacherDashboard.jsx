import React, { useState, useEffect } from "react";
import {
  getQuizzes,
  getAttempts,
  getUsers,
  addQuiz,
  updateQuiz,
  deleteQuiz,
} from "../data/stateManager";
import {
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  Users,
  BarChart2,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Save,
  X,
  Sparkles,
  Loader,
} from "lucide-react";

const EMPTY_QUESTION = () => ({
  id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  text: "",
  options: ["", "", "", ""],
  correctAnswer: "",
});

const EMPTY_QUIZ = (teacherId) => ({
  title: "",
  description: "",
  class: "",
  subject: "",
  timeLimit: 10,
  creatorId: teacherId,
  questions: [EMPTY_QUESTION()],
});

// ── AI Generation ──────────────────────────────────────────────────────────────
async function generateQuestionsWithAI({ title, subject, classNum, count }) {
  const prompt = `You are a school teacher creating a multiple choice quiz.
Generate exactly ${count} multiple choice questions for Class ${classNum} students.
Subject: ${subject}
Topic / Quiz title: ${title}

Rules:
- Each question must have exactly 4 options (A, B, C, D as plain text, no letter prefix).
- correctAnswer must be the EXACT string of the correct option.
- Questions should be age-appropriate for Class ${classNum}.
- Vary difficulty: mix easy, medium, and hard questions.
- Return ONLY a raw JSON array. No markdown fences, no explanation, no preamble.

Format:
[
  {
    "text": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A"
  }
]`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();
  const raw = data.content
    .filter((c) => c.type === "text")
    .map((c) => c.text)
    .join("");
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned);
  return parsed.map((q) => ({
    id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    text: q.text,
    options: q.options,
    correctAnswer: q.correctAnswer,
  }));
}

export default function TeacherDashboard({ currentUser, defaultTab = "quizzes", autoOpenCreate = false }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [students, setStudents] = useState([]);

  // Quiz form state
  const [showForm, setShowForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [formData, setFormData] = useState(EMPTY_QUIZ(currentUser?.id));
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [formError, setFormError] = useState("");

  // AI generation state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCount, setAiCount] = useState(5);
  const [aiError, setAiError] = useState("");

  // Attempts filter
  const [filterClass, setFilterClass] = useState("all");
  const [filterQuiz, setFilterQuiz] = useState("all");

  // Sync tab when route prop changes (e.g. sidebar nav)
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // Auto-open create modal when navigating to /teacher/create
  useEffect(() => {
    if (autoOpenCreate) {
      openCreateForm();
    }
  }, [autoOpenCreate]);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = () => {
    const allQuizzes = getQuizzes();
    const myQuizzes = allQuizzes.filter((q) => q.creatorId === currentUser?.id);
    setQuizzes(myQuizzes);

    const allAttempts = getAttempts();
    const myQuizIds = new Set(myQuizzes.map((q) => q.id));
    const myAttempts = allAttempts.filter((a) => myQuizIds.has(a.quizId));
    setAttempts(myAttempts);

    const allUsers = getUsers();
    const classNums = currentUser?.classes || [];
    const myStudents = allUsers.filter(
      (u) => u.role === "student" && classNums.includes(Number(u.class))
    );
    setStudents(myStudents);
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const avgScore =
    attempts.length > 0
      ? Math.round(
          attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length
        )
      : 0;
  const passCount = attempts.filter((a) => a.percentage >= 50).length;
  const failCount = attempts.length - passCount;

  // ── Form helpers ───────────────────────────────────────────────────────────
  const openCreateForm = () => {
    setEditingQuiz(null);
    setFormData(EMPTY_QUIZ(currentUser?.id));
    setExpandedQuestions({ 0: true });
    setFormError("");
    setAiError("");
    setAiCount(5);
    setShowForm(true);
  };

  const openEditForm = (quiz) => {
    setEditingQuiz(quiz);
    setFormData({
      ...quiz,
      questions: quiz.questions.map((q) => ({ ...q, options: [...q.options] })),
    });
    setExpandedQuestions({ 0: true });
    setFormError("");
    setAiError("");
    setAiCount(5);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingQuiz(null);
    setFormError("");
    setAiError("");
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleQuestionChange = (qIdx, field, value) => {
    setFormData((prev) => {
      const qs = [...prev.questions];
      qs[qIdx] = { ...qs[qIdx], [field]: value };
      return { ...prev, questions: qs };
    });
  };

  const handleOptionChange = (qIdx, oIdx, value) => {
    setFormData((prev) => {
      const qs = [...prev.questions];
      const opts = [...qs[qIdx].options];
      opts[oIdx] = value;
      qs[qIdx] = { ...qs[qIdx], options: opts };
      return { ...prev, questions: qs };
    });
  };

  const addQuestion = () => {
    const newQ = EMPTY_QUESTION();
    setFormData((prev) => ({ ...prev, questions: [...prev.questions, newQ] }));
    setExpandedQuestions((prev) => ({
      ...prev,
      [formData.questions.length]: true,
    }));
  };

  const removeQuestion = (qIdx) => {
    if (formData.questions.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== qIdx),
    }));
  };

  // ── AI Generation handler ──────────────────────────────────────────────────
  const handleGenerateWithAI = async () => {
    setAiError("");
    if (!formData.title.trim()) {
      setAiError("Please enter a quiz title before generating questions.");
      return;
    }
    if (!formData.subject.trim()) {
      setAiError("Please enter a subject before generating questions.");
      return;
    }
    if (!formData.class) {
      setAiError("Please select a class before generating questions.");
      return;
    }

    setAiLoading(true);
    try {
      const generated = await generateQuestionsWithAI({
        title: formData.title,
        subject: formData.subject,
        classNum: formData.class,
        count: aiCount,
      });
      // Replace existing questions with AI-generated ones
      setFormData((prev) => ({ ...prev, questions: generated }));
      // Expand first question for review
      setExpandedQuestions({ 0: true });
    } catch (err) {
      setAiError(
        "AI generation failed. Check your connection and try again. You can still add questions manually."
      );
    } finally {
      setAiLoading(false);
    }
  };

  // ── Validation & Save ──────────────────────────────────────────────────────
  const validateForm = () => {
    if (!formData.title.trim()) return "Quiz title is required.";
    if (!formData.class) return "Please select a class.";
    if (!formData.subject.trim()) return "Subject is required.";
    if (!formData.timeLimit || formData.timeLimit < 1)
      return "Time limit must be at least 1 minute.";
    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i];
      if (!q.text.trim()) return `Question ${i + 1}: text is empty.`;
      if (q.options.some((o) => !o.trim()))
        return `Question ${i + 1}: all 4 options are required.`;
      if (!q.correctAnswer)
        return `Question ${i + 1}: correct answer not selected.`;
      if (!q.options.includes(q.correctAnswer))
        return `Question ${i + 1}: correct answer must match one of the options.`;
    }
    return null;
  };

  const handleSaveQuiz = () => {
    const err = validateForm();
    if (err) {
      setFormError(err);
      return;
    }
    const payload = {
      ...formData,
      class: Number(formData.class),
      timeLimit: Number(formData.timeLimit),
    };
    if (editingQuiz) {
      updateQuiz({ ...payload, id: editingQuiz.id });
    } else {
      addQuiz(payload);
    }
    loadData();
    closeForm();
  };

  const handleDeleteQuiz = (quizId) => {
    if (
      !window.confirm(
        "Delete this quiz? All related attempt records will remain."
      )
    )
      return;
    deleteQuiz(quizId);
    loadData();
  };

  // ── Filtered attempts ──────────────────────────────────────────────────────
  const filteredAttempts = attempts.filter((a) => {
    const classOk =
      filterClass === "all" || String(a.class) === filterClass;
    const quizOk = filterQuiz === "all" || a.quizId === filterQuiz;
    return classOk && quizOk;
  });

  const remarkBadge = (r) => {
    if (r === "Excellent") return "badge-success";
    if (r === "Good") return "badge-info";
    if (r === "Average") return "badge-warning";
    return "badge-error";
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="dark-mode-card-header" style={{ marginBottom: "2rem" }}>
        <div>
          <h1 className="title-serif" style={{ fontSize: "1.75rem" }}>
            Teacher Portal
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            {currentUser?.name} &nbsp;·&nbsp; {currentUser?.subject}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="panel-row" style={{ marginBottom: "1.5rem" }}>
        {[
          {
            label: "My Quizzes",
            value: quizzes.length,
            icon: <BookOpen size={20} />,
          },
          {
            label: "Total Attempts",
            value: attempts.length,
            icon: <BarChart2 size={20} />,
          },
          {
            label: "Avg Score",
            value: `${avgScore}%`,
            icon: <CheckCircle size={20} />,
          },
          {
            label: "Students in Classes",
            value: students.length,
            icon: <Users size={20} />,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="card"
            style={{ flex: 1, display: "flex", alignItems: "center", gap: "1rem" }}
          >
            <div style={{ color: "var(--accent-text, var(--text-muted))" }}>
              {s.icon}
            </div>
            <div>
              <div
                style={{ fontSize: "1.6rem", fontWeight: 700, lineHeight: 1 }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                  marginTop: "0.2rem",
                }}
              >
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab nav */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          borderBottom: "1px solid var(--border)",
          paddingBottom: "0.5rem",
          marginBottom: "1.5rem",
        }}
      >
        {[
          { key: "quizzes", label: "My Quizzes", icon: <BookOpen size={16} /> },
          {
            key: "attempts",
            label: "Student Attempts",
            icon: <BarChart2 size={16} />,
          },
          {
            key: "students",
            label: "My Students",
            icon: <Users size={16} />,
          },
        ].map((t) => (
          <button
            key={t.key}
            className={`btn ${
              activeTab === t.key ? "btn-primary" : "btn-secondary"
            }`}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
            onClick={() => setActiveTab(t.key)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: MY QUIZZES ── */}
      {activeTab === "quizzes" && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: "1rem",
            }}
          >
            <button
              className="btn btn-primary"
              onClick={openCreateForm}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <Plus size={16} /> Create New Quiz
            </button>
          </div>

          {quizzes.length === 0 ? (
            <div
              className="card"
              style={{
                textAlign: "center",
                padding: "3rem 0",
                color: "var(--text-muted)",
              }}
            >
              No quizzes yet. Click "Create New Quiz" to get started.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {quizzes.map((quiz) => {
                const quizAttempts = attempts.filter(
                  (a) => a.quizId === quiz.id
                );
                const qAvg =
                  quizAttempts.length > 0
                    ? Math.round(
                        quizAttempts.reduce((s, a) => s + a.percentage, 0) /
                          quizAttempts.length
                      )
                    : null;
                return (
                  <div
                    key={quiz.id}
                    className="card"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          marginBottom: "0.4rem",
                        }}
                      >
                        <h3 className="card-title" style={{ margin: 0 }}>
                          {quiz.title}
                        </h3>
                        <span className="badge badge-neutral">
                          {quiz.subject}
                        </span>
                        <span className="badge badge-info">
                          Class {quiz.class}
                        </span>
                        {quiz.aiGenerated && (
                          <span
                            className="badge badge-success"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.25rem",
                              fontSize: "0.7rem",
                            }}
                          >
                            <Sparkles size={10} /> AI Generated
                          </span>
                        )}
                      </div>
                      <p
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "0.85rem",
                          marginBottom: "0.4rem",
                        }}
                      >
                        {quiz.description || "No description."}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          gap: "1rem",
                          fontSize: "0.8rem",
                          color: "var(--text-muted)",
                          fontWeight: 500,
                        }}
                      >
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                          }}
                        >
                          <Clock size={12} /> {quiz.timeLimit} min
                        </span>
                        <span>·</span>
                        <span>{quiz.questions.length} questions</span>
                        <span>·</span>
                        <span>{quizAttempts.length} attempts</span>
                        {qAvg !== null && (
                          <>
                            <span>·</span>
                            <span>Avg: {qAvg}%</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        flexShrink: 0,
                      }}
                    >
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => openEditForm(quiz)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                        }}
                      >
                        <Edit3 size={14} /> Edit
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          color: "var(--error, #e53e3e)",
                        }}
                        onClick={() => handleDeleteQuiz(quiz.id)}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: STUDENT ATTEMPTS ── */}
      {activeTab === "attempts" && (
        <div className="card">
          <div
            style={{
              display: "flex",
              gap: "1rem",
              marginBottom: "1.25rem",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <h3 className="card-title" style={{ margin: 0, flex: 1 }}>
              Attempt Records
            </h3>
            <select
              className="form-input"
              style={{
                width: "auto",
                padding: "0.4rem 0.75rem",
                fontSize: "0.85rem",
              }}
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
            >
              <option value="all">All Classes</option>
              {(currentUser?.classes || []).map((c) => (
                <option key={c} value={String(c)}>
                  Class {c}
                </option>
              ))}
            </select>
            <select
              className="form-input"
              style={{
                width: "auto",
                padding: "0.4rem 0.75rem",
                fontSize: "0.85rem",
              }}
              value={filterQuiz}
              onChange={(e) => setFilterQuiz(e.target.value)}
            >
              <option value="all">All Quizzes</option>
              {quizzes.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.title}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            <span className="badge badge-success">
              Pass (≥50%): {passCount}
            </span>
            <span className="badge badge-error">Fail: {failCount}</span>
            <span className="badge badge-info">Avg Score: {avgScore}%</span>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Quiz</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Time Taken</th>
                  <th>Date</th>
                  <th>Remark</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttempts.length > 0 ? (
                  [...filteredAttempts]
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((att) => {
                      const mins = Math.floor(att.timeTaken / 60);
                      const secs = att.timeTaken % 60;
                      return (
                        <tr key={att.id}>
                          <td>
                            <strong>{att.studentName}</strong>
                          </td>
                          <td>Class {att.class}</td>
                          <td>{att.quizTitle}</td>
                          <td>
                            {att.score} / {att.totalQuestions}
                          </td>
                          <td>{att.percentage}%</td>
                          <td>
                            {mins}m {secs}s
                          </td>
                          <td>{att.date}</td>
                          <td>
                            <span
                              className={`badge ${remarkBadge(att.remark)}`}
                            >
                              {att.remark}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center" }}>
                      No attempts found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB: MY STUDENTS ── */}
      {activeTab === "students" && (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: "1.25rem" }}>
            Students in My Classes (
            {(currentUser?.classes || [])
              .map((c) => `Class ${c}`)
              .join(", ")}
            )
          </h3>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Roll Number</th>
                  <th>Class</th>
                  <th>Email</th>
                  <th>Attempts</th>
                  <th>Avg Score</th>
                </tr>
              </thead>
              <tbody>
                {students.length > 0 ? (
                  students.map((s) => {
                    const sAttempts = attempts.filter(
                      (a) => a.studentId === s.id
                    );
                    const sAvg =
                      sAttempts.length > 0
                        ? Math.round(
                            sAttempts.reduce(
                              (acc, a) => acc + a.percentage,
                              0
                            ) / sAttempts.length
                          )
                        : null;
                    return (
                      <tr key={s.id}>
                        <td>
                          <strong>{s.name}</strong>
                        </td>
                        <td>{s.rollNumber || "N/A"}</td>
                        <td>Class {s.class}</td>
                        <td>{s.email || "N/A"}</td>
                        <td>{sAttempts.length}</td>
                        <td>
                          {sAvg !== null ? (
                            <span
                              className={`badge ${
                                sAvg >= 75
                                  ? "badge-success"
                                  : sAvg >= 50
                                  ? "badge-warning"
                                  : "badge-error"
                              }`}
                            >
                              {sAvg}%
                            </span>
                          ) : (
                            <span
                              style={{
                                color: "var(--text-muted)",
                                fontSize: "0.85rem",
                              }}
                            >
                              No attempts
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }}>
                      No students found for your assigned classes.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── QUIZ CREATE / EDIT MODAL ── */}
      {showForm && (
        <div className="modal-overlay">
          <div
            className="modal-content"
            style={{
              maxWidth: "760px",
              padding: "2rem",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {/* Modal header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h2
                className="title-serif"
                style={{ fontSize: "1.4rem", margin: 0 }}
              >
                {editingQuiz ? "Edit Quiz" : "Create New Quiz"}
              </h2>
              <button
                className="modal-close"
                onClick={closeForm}
                style={{ position: "static" }}
              >
                ×
              </button>
            </div>

            {/* Form-level error */}
            {formError && (
              <div
                className="alert-banner error"
                style={{
                  marginBottom: "1rem",
                  padding: "0.75rem 1rem",
                  fontSize: "0.85rem",
                }}
              >
                {formError}
              </div>
            )}

            {/* Basic details */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <div
                className="form-group"
                style={{ gridColumn: "1 / -1" }}
              >
                <label className="form-label">Quiz Title *</label>
                <input
                  className="form-input"
                  value={formData.title}
                  onChange={(e) =>
                    handleFieldChange("title", e.target.value)
                  }
                  placeholder="e.g. Introduction to Fractions"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Subject *</label>
                <input
                  className="form-input"
                  value={formData.subject}
                  onChange={(e) =>
                    handleFieldChange("subject", e.target.value)
                  }
                  placeholder="e.g. Mathematics"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Class *</label>
                <select
                  className="form-input"
                  value={formData.class}
                  onChange={(e) =>
                    handleFieldChange("class", e.target.value)
                  }
                >
                  <option value="">Select class…</option>
                  {(currentUser?.classes || []).map((c) => (
                    <option key={c} value={c}>
                      Class {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Time Limit (minutes) *</label>
                <input
                  className="form-input"
                  type="number"
                  min={1}
                  value={formData.timeLimit}
                  onChange={(e) =>
                    handleFieldChange("timeLimit", e.target.value)
                  }
                />
              </div>
              <div
                className="form-group"
                style={{ gridColumn: "1 / -1" }}
              >
                <label className="form-label">Description</label>
                <input
                  className="form-input"
                  value={formData.description}
                  onChange={(e) =>
                    handleFieldChange("description", e.target.value)
                  }
                  placeholder="Brief description for students…"
                />
              </div>
            </div>

            {/* ── AI GENERATION PANEL ── */}
            <div
              style={{
                border: "1px solid var(--border)",
                borderRadius: "0.5rem",
                padding: "1rem 1.25rem",
                marginBottom: "1.25rem",
                background: "var(--card-bg, var(--secondary-bg))",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.6rem",
                }}
              >
                <Sparkles size={16} style={{ color: "var(--accent, #d8c3a5)" }} />
                <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                  Generate questions with AI
                </span>
                <span
                  className="badge badge-info"
                  style={{ fontSize: "0.7rem" }}
                >
                  Powered by Claude
                </span>
              </div>
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "var(--text-muted)",
                  marginBottom: "0.75rem",
                }}
              >
                Fill in the title, subject, and class above, then click
                Generate. AI will create ready-to-use MCQs — you can edit
                or delete any question afterwards.
              </p>

              {aiError && (
                <div
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--error, #e53e3e)",
                    marginBottom: "0.75rem",
                    padding: "0.5rem 0.75rem",
                    border: "1px solid var(--error, #e53e3e)",
                    borderRadius: "0.375rem",
                  }}
                >
                  {aiError}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <label
                    className="form-label"
                    style={{ margin: 0, whiteSpace: "nowrap" }}
                  >
                    Number of questions:
                  </label>
                  <select
                    className="form-input"
                    style={{ width: "auto", padding: "0.35rem 0.6rem", fontSize: "0.85rem" }}
                    value={aiCount}
                    onChange={(e) => setAiCount(Number(e.target.value))}
                    disabled={aiLoading}
                  >
                    {[3, 5, 8, 10, 15, 20].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={handleGenerateWithAI}
                  disabled={aiLoading}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    opacity: aiLoading ? 0.7 : 1,
                    cursor: aiLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {aiLoading ? (
                    <>
                      <Loader
                        size={14}
                        style={{
                          animation: "spin 1s linear infinite",
                        }}
                      />
                      Generating…
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} /> Generate Questions
                    </>
                  )}
                </button>
                {formData.questions.length > 0 &&
                  formData.questions[0].text !== "" && (
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {formData.questions.length} question
                      {formData.questions.length !== 1 ? "s" : ""} loaded —
                      review &amp; edit below
                    </span>
                  )}
              </div>
            </div>

            {/* Questions section */}
            <div
              style={{
                borderTop: "1px solid var(--border)",
                paddingTop: "1.25rem",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <h3
                  style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}
                >
                  Questions ({formData.questions.length})
                </h3>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={addQuestion}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                  }}
                >
                  <Plus size={14} /> Add Question
                </button>
              </div>

              {formData.questions.map((q, qIdx) => (
                <div
                  key={q.id}
                  className="card"
                  style={{ marginBottom: "0.75rem", padding: "1rem" }}
                >
                  {/* Question header / toggle */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      setExpandedQuestions((p) => ({
                        ...p,
                        [qIdx]: !p[qIdx],
                      }))
                    }
                  >
                    <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                      Q{qIdx + 1}.{" "}
                      {q.text
                        ? q.text.slice(0, 60) +
                          (q.text.length > 60 ? "…" : "")
                        : "(empty)"}
                    </span>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        alignItems: "center",
                      }}
                    >
                      {formData.questions.length > 1 && (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{
                            color: "var(--error, #e53e3e)",
                            padding: "0.2rem 0.5rem",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeQuestion(qIdx);
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                      {expandedQuestions[qIdx] ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </div>
                  </div>

                  {expandedQuestions[qIdx] && (
                    <div style={{ marginTop: "0.75rem" }}>
                      <div className="form-group">
                        <label className="form-label">Question Text *</label>
                        <input
                          className="form-input"
                          value={q.text}
                          onChange={(e) =>
                            handleQuestionChange(qIdx, "text", e.target.value)
                          }
                          placeholder="Enter the question…"
                        />
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "0.5rem",
                          marginBottom: "0.75rem",
                        }}
                      >
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className="form-group"
                            style={{ margin: 0 }}
                          >
                            <label className="form-label">
                              Option {oIdx + 1} *
                            </label>
                            <input
                              className="form-input"
                              value={opt}
                              onChange={(e) =>
                                handleOptionChange(qIdx, oIdx, e.target.value)
                              }
                              placeholder={`Option ${oIdx + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="form-group">
                        <label className="form-label">
                          Correct Answer *
                        </label>
                        <select
                          className="form-input"
                          value={q.correctAnswer}
                          onChange={(e) =>
                            handleQuestionChange(
                              qIdx,
                              "correctAnswer",
                              e.target.value
                            )
                          }
                        >
                          <option value="">
                            Select correct answer…
                          </option>
                          {q.options
                            .filter((o) => o.trim())
                            .map((opt, oIdx) => (
                              <option key={oIdx} value={opt}>
                                {opt}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Form actions */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.75rem",
                borderTop: "1px solid var(--border)",
                paddingTop: "1rem",
              }}
            >
              <button
                className="btn btn-secondary"
                onClick={closeForm}
                style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
              >
                <X size={15} /> Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveQuiz}
                style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
              >
                <Save size={15} />{" "}
                {editingQuiz ? "Save Changes" : "Create Quiz"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}