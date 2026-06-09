import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  getUsers, getQuizzes, getAttempts, getAnalytics,
  addUser, updateUser, deleteUser,
} from "../data/stateManager";
import {
  LayoutDashboard, Users, GraduationCap, Baby, BookOpen,
  Plus, Trash2, Edit3, Save, X, Link, CheckCircle,
  BarChart2, TrendingUp, AlertCircle, Search,
} from "lucide-react";

// ── tiny helpers ─────────────────────────────────────────────────────────────
const CLASSES = [1,2,3,4,5,6,7,8,9,10,11,12];
const ROLES   = ["student","teacher","parent","admin"];

const EMPTY_USER = (role = "student") => ({
  role,
  username: "", password: "", name: "", email: "",
  // student extras
  class: "", rollNumber: "",
  // teacher extras
  subject: "", classes: [],
  // parent extras
  studentId: null,
});

const badge = (role) => {
  const map = { admin:"badge-error", teacher:"badge-info", student:"badge-success", parent:"badge-warning" };
  return map[role] || "badge-neutral";
};

export default function AdminDashboard() {
  const location = useLocation();

  // derive active tab from URL
  const tabFromPath = () => {
    if (location.pathname.includes("/students")) return "students";
    if (location.pathname.includes("/teachers")) return "teachers";
    if (location.pathname.includes("/parents"))  return "parents";
    if (location.pathname.includes("/quizzes"))  return "quizzes";
    return "dashboard";
  };

  const [activeTab, setActiveTab]   = useState(tabFromPath());
  const [users, setUsers]           = useState([]);
  const [quizzes, setQuizzes]       = useState([]);
  const [analytics, setAnalytics]   = useState(null);
  const [search, setSearch]         = useState("");

  // Modal state
  const [showModal, setShowModal]   = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData]     = useState(EMPTY_USER());
  const [formError, setFormError]   = useState("");

  // Parent-link modal
  const [linkModal, setLinkModal]   = useState(false);
  const [linkParent, setLinkParent] = useState(null);
  const [linkStudentId, setLinkStudentId] = useState("");
  const [linkSuccess, setLinkSuccess] = useState("");

  useEffect(() => { setActiveTab(tabFromPath()); }, [location.pathname]);
  useEffect(() => { loadAll(); }, []);

  const loadAll = () => {
    setUsers(getUsers());
    setQuizzes(getQuizzes());
    setAnalytics(getAnalytics());
  };

  // ── filtered lists ──────────────────────────────────────────────────────────
  const byRole = (role) =>
    users.filter((u) =>
      u.role === role &&
      (u.name?.toLowerCase().includes(search.toLowerCase()) ||
       u.username?.toLowerCase().includes(search.toLowerCase()) ||
       u.email?.toLowerCase().includes(search.toLowerCase()))
    );

  const students  = byRole("student");
  const teachers  = byRole("teacher");
  const parents   = byRole("parent");
  const allStudents = users.filter((u) => u.role === "student");

  // ── modal helpers ───────────────────────────────────────────────────────────
  const openCreate = (role) => {
    setEditingUser(null);
    setFormData(EMPTY_USER(role));
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setFormData({ ...EMPTY_USER(user.role), ...user, classes: user.classes ? [...user.classes] : [] });
    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditingUser(null); setFormError(""); };

  const field = (key, val) => setFormData((p) => ({ ...p, [key]: val }));

  const toggleClass = (c) => {
    setFormData((p) => {
      const cls = p.classes || [];
      return { ...p, classes: cls.includes(c) ? cls.filter((x) => x !== c) : [...cls, c] };
    });
  };

  const validate = () => {
    if (!formData.name.trim())     return "Full name is required.";
    if (!formData.username.trim()) return "Username is required.";
    if (!formData.password || formData.password.length < 4) return "Password must be at least 4 characters.";
    if (!formData.email.trim())    return "Email is required.";
    if (formData.role === "student" && !formData.class) return "Please select a class.";
    if (formData.role === "teacher" && (!formData.classes || formData.classes.length === 0))
      return "Assign at least one class to the teacher.";
    // username uniqueness
    if (!editingUser) {
      const taken = users.find((u) => u.username.toLowerCase() === formData.username.toLowerCase());
      if (taken) return "Username already taken.";
    }
    return null;
  };

  const handleSave = () => {
    const err = validate();
    if (err) { setFormError(err); return; }

    const payload = {
      ...formData,
      username: formData.username.trim().toLowerCase(),
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      ...(formData.role === "student" && { class: Number(formData.class) }),
      ...(formData.role === "teacher" && { classes: formData.classes.map(Number) }),
    };

    if (editingUser) {
      updateUser({ ...payload, id: editingUser.id });
    } else {
      addUser(payload);
    }
    loadAll();
    closeModal();
  };

  const handleDelete = (userId, userName) => {
    if (!window.confirm(`Delete "${userName}"? This cannot be undone.`)) return;
    deleteUser(userId);
    loadAll();
  };

  // ── parent-link modal ───────────────────────────────────────────────────────
  const openLink = (parent) => {
    setLinkParent(parent);
    setLinkStudentId(parent.studentId || "");
    setLinkSuccess("");
    setLinkModal(true);
  };

  const saveLink = () => {
    if (!linkStudentId) { setLinkSuccess("error:Please select a student."); return; }
    updateUser({ ...linkParent, studentId: linkStudentId });
    loadAll();
    setLinkSuccess("ok:Linked successfully! Parent can now see the child's dashboard.");
  };

  // ── stat card ───────────────────────────────────────────────────────────────
  const StatCard = ({ label, value, icon, sub }) => (
    <div className="card" style={{ flex: 1, display: "flex", alignItems: "center", gap: "1rem" }}>
      <div style={{ color: "var(--accent-text, var(--text-muted))" }}>{icon}</div>
      <div>
        <div style={{ fontSize: "1.6rem", fontWeight: 700, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>{label}</div>
        {sub && <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{sub}</div>}
      </div>
    </div>
  );

  // ── shared user table ───────────────────────────────────────────────────────
  const UserTable = ({ list, role, extraCols = [], extraActions = [] }) => (
    <div className="card">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.25rem", flexWrap:"wrap", gap:"0.5rem" }}>
        <h3 className="card-title" style={{ margin:0, textTransform:"capitalize" }}>{role}s ({list.length})</h3>
        <div style={{ display:"flex", gap:"0.5rem", alignItems:"center", flexWrap:"wrap" }}>
          <div style={{ position:"relative" }}>
            <Search size={14} style={{ position:"absolute", left:"0.6rem", top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)" }} />
            <input
              className="form-input"
              style={{ paddingLeft:"2rem", padding:"0.4rem 0.75rem 0.4rem 2rem", fontSize:"0.85rem", width:"200px" }}
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => openCreate(role)} style={{ display:"flex", alignItems:"center", gap:"0.3rem" }}>
            <Plus size={14} /> Add {role}
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              {extraCols.map((c) => <th key={c}>{c}</th>)}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.length > 0 ? list.map((u) => (
              <tr key={u.id}>
                <td><strong>{u.name}</strong></td>
                <td style={{ fontFamily:"monospace", fontSize:"0.85rem" }}>{u.username}</td>
                <td style={{ fontSize:"0.85rem" }}>{u.email || "—"}</td>
                {extraCols.map((col) => (
                  <td key={col}>
                    {col === "Class"       && <span className="badge badge-info">Class {u.class}</span>}
                    {col === "Roll No."    && (u.rollNumber || "N/A")}
                    {col === "Subject"     && (u.subject || "—")}
                    {col === "Classes"     && ((u.classes||[]).map((c) => `C${c}`).join(", ") || "None")}
                    {col === "Linked Child" && (() => {
                      const child = users.find((s) => s.id === u.studentId);
                      return child
                        ? <span className="badge badge-success">{child.name} (C{child.class})</span>
                        : <span className="badge badge-error">Not linked</span>;
                    })()}
                  </td>
                ))}
                <td>
                  <div style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap" }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(u)} style={{ display:"flex", alignItems:"center", gap:"0.25rem" }}>
                      <Edit3 size={13} /> Edit
                    </button>
                    {extraActions.map((action) => (
                      <button key={action.label} className="btn btn-secondary btn-sm"
                        onClick={() => action.onClick(u)}
                        style={{ display:"flex", alignItems:"center", gap:"0.25rem", ...action.style }}>
                        {action.icon} {action.label}
                      </button>
                    ))}
                    <button className="btn btn-secondary btn-sm"
                      style={{ display:"flex", alignItems:"center", gap:"0.25rem", color:"var(--error,#e53e3e)" }}
                      onClick={() => handleDelete(u.id, u.name)}>
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={4 + extraCols.length} style={{ textAlign:"center", color:"var(--text-muted)" }}>No {role}s found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div>
      {/* ── Header ── */}
      <div className="dark-mode-card-header" style={{ marginBottom:"2rem" }}>
        <div>
          <h1 className="title-serif" style={{ fontSize:"1.75rem" }}>Admin Dashboard</h1>
          <p style={{ color:"var(--text-muted)", fontSize:"0.9rem" }}>Manage users, quizzes, and view system analytics</p>
        </div>
      </div>

      {/* ── Stat row ── */}
      {analytics && (
        <div className="panel-row" style={{ marginBottom:"1.5rem" }}>
          <StatCard label="Total Students" value={analytics.totalStudents} icon={<GraduationCap size={20}/>} />
          <StatCard label="Total Teachers" value={analytics.totalTeachers} icon={<Users size={20}/>} />
          <StatCard label="Total Quizzes"  value={analytics.totalQuizzes}  icon={<BookOpen size={20}/>} />
          <StatCard label="Total Attempts" value={analytics.totalAttempts} icon={<BarChart2 size={20}/>} sub={`Avg: ${analytics.averageScore}%`} />
          <StatCard label="Pass / Fail"    value={`${analytics.passCount} / ${analytics.failCount}`} icon={<CheckCircle size={20}/>} />
        </div>
      )}

      {/* ── Tab nav ── */}
      <div style={{ display:"flex", gap:"0.5rem", borderBottom:"1px solid var(--border)", paddingBottom:"0.5rem", marginBottom:"1.5rem", flexWrap:"wrap" }}>
        {[
          { key:"dashboard", label:"Overview",  icon:<LayoutDashboard size={15}/> },
          { key:"students",  label:"Students",  icon:<GraduationCap size={15}/> },
          { key:"teachers",  label:"Teachers",  icon:<Users size={15}/> },
          { key:"parents",   label:"Parents",   icon:<Baby size={15}/> },
          { key:"quizzes",   label:"All Quizzes",icon:<BookOpen size={15}/> },
        ].map((t) => (
          <button key={t.key}
            className={`btn ${activeTab === t.key ? "btn-primary" : "btn-secondary"}`}
            style={{ padding:"0.5rem 1rem", fontSize:"0.85rem", display:"flex", alignItems:"center", gap:"0.4rem" }}
            onClick={() => { setActiveTab(t.key); setSearch(""); }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ══════════ OVERVIEW ══════════ */}
      {activeTab === "dashboard" && analytics && (
        <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
          {/* Class stats table */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom:"1.25rem" }}>Class-wise Performance</h3>
            <div className="table-container">
              <table className="custom-table">
                <thead><tr><th>Class</th><th>Attempts</th><th>Avg Score</th><th>Attendance Rate</th></tr></thead>
                <tbody>
                  {analytics.classStats.length > 0 ? analytics.classStats.map((cs) => (
                    <tr key={cs.className}>
                      <td><strong>{cs.className}</strong></td>
                      <td>{cs.attempts}</td>
                      <td>
                        <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                          <div style={{ width:"60px", height:"5px", background:"var(--border)", borderRadius:"3px", overflow:"hidden" }}>
                            <div style={{ height:"100%", width:`${cs.avgScore}%`, background: cs.avgScore>=75?"#2D6A4F":cs.avgScore>=50?"#B5621A":"#8B2020", borderRadius:"3px" }} />
                          </div>
                          {cs.avgScore}%
                        </div>
                      </td>
                      <td>{cs.attendanceRate}%</td>
                    </tr>
                  )) : <tr><td colSpan="4" style={{ textAlign:"center" }}>No data yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top / lowest students */}
          <div className="panel-row">
            {[
              { title:"🏆 Top 5 Students", list: analytics.topStudents, colorFn: () => "badge-success" },
              { title:"⚠️ Need Support",  list: analytics.lowestStudents, colorFn: (a) => a < 50 ? "badge-error" : "badge-warning" },
            ].map(({ title, list, colorFn }) => (
              <div key={title} className="card" style={{ flex:1 }}>
                <h3 className="card-title" style={{ marginBottom:"1rem" }}>{title}</h3>
                {list.map((s, i) => (
                  <div key={s.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0.5rem 0", borderBottom:"1px solid var(--border)" }}>
                    <div>
                      <div style={{ fontWeight:600, fontSize:"0.9rem" }}>#{i+1} {s.name}</div>
                      <div style={{ fontSize:"0.78rem", color:"var(--text-muted)" }}>Class {s.class}</div>
                    </div>
                    <span className={`badge ${colorFn(s.average)}`}>{s.average}%</span>
                  </div>
                ))}
                {list.length === 0 && <p style={{ color:"var(--text-muted)", fontSize:"0.85rem" }}>No data yet.</p>}
              </div>
            ))}
          </div>

          {/* Unlinked parents alert */}
          {users.filter((u) => u.role === "parent" && !u.studentId).length > 0 && (
            <div style={{ padding:"0.85rem 1rem", background:"#FAEEDA", border:"1px solid #E8A87C", borderRadius:"0.5rem", display:"flex", alignItems:"center", gap:"0.75rem", fontSize:"0.9rem", color:"#7A3B0A" }}>
              <AlertCircle size={18} />
              <span>
                <strong>{users.filter((u) => u.role==="parent" && !u.studentId).length}</strong> parent account(s) have no linked child.
                Go to the <button className="btn btn-secondary btn-sm" style={{ marginLeft:"6px" }} onClick={() => setActiveTab("parents")}>Parents tab</button> to link them.
              </span>
            </div>
          )}
        </div>
      )}

      {/* ══════════ STUDENTS ══════════ */}
      {activeTab === "students" && (
        <UserTable list={students} role="student" extraCols={["Class","Roll No."]} />
      )}

      {/* ══════════ TEACHERS ══════════ */}
      {activeTab === "teachers" && (
        <UserTable list={teachers} role="teacher" extraCols={["Subject","Classes"]} />
      )}

      {/* ══════════ PARENTS ══════════ */}
      {activeTab === "parents" && (
        <UserTable
          list={parents}
          role="parent"
          extraCols={["Linked Child"]}
          extraActions={[{
            label: "Link Child",
            icon: <Link size={13} />,
            style: { color:"var(--accent-text, #B5621A)" },
            onClick: openLink,
          }]}
        />
      )}

      {/* ══════════ QUIZZES ══════════ */}
      {activeTab === "quizzes" && (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom:"1.25rem" }}>All Quizzes ({quizzes.length})</h3>
          <div className="table-container">
            <table className="custom-table">
              <thead><tr><th>Title</th><th>Subject</th><th>Class</th><th>Questions</th><th>Time</th><th>Creator</th><th>Attempts</th></tr></thead>
              <tbody>
                {quizzes.length > 0 ? quizzes.map((q) => {
                  const creator = users.find((u) => u.id === q.creatorId);
                  const attempts = getAttempts().filter((a) => a.quizId === q.id);
                  return (
                    <tr key={q.id}>
                      <td><strong>{q.title}</strong></td>
                      <td><span className="badge badge-neutral">{q.subject}</span></td>
                      <td><span className="badge badge-info">Class {q.class}</span></td>
                      <td>{q.questions.length}</td>
                      <td>{q.timeLimit} min</td>
                      <td>{creator?.name || "Unknown"}</td>
                      <td>{attempts.length}</td>
                    </tr>
                  );
                }) : <tr><td colSpan="7" style={{ textAlign:"center" }}>No quizzes yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════ CREATE / EDIT USER MODAL ══════════ */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth:"580px", padding:"2rem", maxHeight:"90vh", overflowY:"auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" }}>
              <h2 className="title-serif" style={{ fontSize:"1.3rem", margin:0 }}>
                {editingUser ? `Edit ${formData.role}` : `Add new ${formData.role}`}
              </h2>
              <button className="modal-close" onClick={closeModal} style={{ position:"static" }}>×</button>
            </div>

            {formError && (
              <div className="alert-banner error" style={{ padding:"0.7rem 1rem", fontSize:"0.85rem", marginBottom:"1rem" }}>
                {formError}
              </div>
            )}

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.85rem" }}>
              <div className="form-group" style={{ gridColumn:"1/-1" }}>
                <label className="form-label">Full Name *</label>
                <input className="form-input" value={formData.name} onChange={(e) => field("name", e.target.value)} placeholder="Full name" />
              </div>
              <div className="form-group">
                <label className="form-label">Username *</label>
                <input className="form-input" value={formData.username} onChange={(e) => field("username", e.target.value)} placeholder="username" disabled={!!editingUser} />
              </div>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input className="form-input" type="password" value={formData.password} onChange={(e) => field("password", e.target.value)} placeholder="Min. 4 chars" />
              </div>
              <div className="form-group" style={{ gridColumn:"1/-1" }}>
                <label className="form-label">Email *</label>
                <input className="form-input" value={formData.email} onChange={(e) => field("email", e.target.value)} placeholder="email@example.com" />
              </div>

              {/* Role selector (create only) */}
              {!editingUser && (
                <div className="form-group" style={{ gridColumn:"1/-1" }}>
                  <label className="form-label">Role *</label>
                  <select className="form-input" value={formData.role} onChange={(e) => setFormData(EMPTY_USER(e.target.value))}>
                    {ROLES.map((r) => <option key={r} value={r} style={{ textTransform:"capitalize" }}>{r}</option>)}
                  </select>
                </div>
              )}

              {/* Student fields */}
              {formData.role === "student" && (
                <>
                  <div className="form-group">
                    <label className="form-label">Class *</label>
                    <select className="form-input" value={formData.class} onChange={(e) => field("class", e.target.value)}>
                      <option value="">Select…</option>
                      {CLASSES.map((c) => <option key={c} value={c}>Class {c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Roll Number</label>
                    <input className="form-input" value={formData.rollNumber} onChange={(e) => field("rollNumber", e.target.value)} placeholder="e.g. S-601" />
                  </div>
                </>
              )}

              {/* Teacher fields */}
              {formData.role === "teacher" && (
                <>
                  <div className="form-group" style={{ gridColumn:"1/-1" }}>
                    <label className="form-label">Subject</label>
                    <input className="form-input" value={formData.subject} onChange={(e) => field("subject", e.target.value)} placeholder="e.g. Mathematics" />
                  </div>
                  <div className="form-group" style={{ gridColumn:"1/-1" }}>
                    <label className="form-label">Assign Classes * <span style={{ fontWeight:400, color:"var(--text-muted)" }}>(select all that apply)</span></label>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:"0.4rem", marginTop:"0.4rem" }}>
                      {CLASSES.map((c) => {
                        const selected = (formData.classes||[]).includes(c);
                        return (
                          <button key={c} type="button"
                            onClick={() => toggleClass(c)}
                            style={{
                              padding:"0.3rem 0.7rem", borderRadius:"5px", border:"1px solid var(--border)",
                              background: selected ? "var(--primary,#1A1A1A)" : "transparent",
                              color: selected ? "#fff" : "var(--text-main)",
                              cursor:"pointer", fontSize:"0.82rem", fontFamily:"inherit",
                            }}>
                            C{c}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Parent fields */}
              {formData.role === "parent" && (
                <div className="form-group" style={{ gridColumn:"1/-1" }}>
                  <label className="form-label">Link to Student</label>
                  <select className="form-input" value={formData.studentId || ""} onChange={(e) => field("studentId", e.target.value || null)}>
                    <option value="">— Not linked yet —</option>
                    {allStudents.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} (Class {s.class}, Roll: {s.rollNumber||"N/A"})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div style={{ display:"flex", justifyContent:"flex-end", gap:"0.75rem", borderTop:"1px solid var(--border)", paddingTop:"1rem", marginTop:"1rem" }}>
              <button className="btn btn-secondary" onClick={closeModal} style={{ display:"flex", alignItems:"center", gap:"0.4rem" }}>
                <X size={15}/> Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSave} style={{ display:"flex", alignItems:"center", gap:"0.4rem" }}>
                <Save size={15}/> {editingUser ? "Save Changes" : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ PARENT-LINK MODAL ══════════ */}
      {linkModal && linkParent && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth:"460px", padding:"2rem" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.25rem" }}>
              <h2 className="title-serif" style={{ fontSize:"1.2rem", margin:0 }}>Link Child to Parent</h2>
              <button className="modal-close" onClick={() => setLinkModal(false)} style={{ position:"static" }}>×</button>
            </div>

            <p style={{ fontSize:"0.9rem", color:"var(--text-muted)", marginBottom:"1.25rem" }}>
              Parent: <strong>{linkParent.name}</strong> ({linkParent.username})
            </p>

            <div className="form-group">
              <label className="form-label">Select child (student) *</label>
              <select className="form-input" value={linkStudentId} onChange={(e) => { setLinkStudentId(e.target.value); setLinkSuccess(""); }}>
                <option value="">— Choose a student —</option>
                {allStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} · Class {s.class} · Roll {s.rollNumber||"N/A"}
                  </option>
                ))}
              </select>
            </div>

            {linkSuccess.startsWith("ok:") && (
              <div style={{ padding:"0.65rem 0.9rem", background:"#EAF3DE", border:"1px solid #97C459", borderRadius:"0.5rem", fontSize:"0.85rem", color:"#2D6A4F", marginBottom:"0.75rem", display:"flex", alignItems:"center", gap:"0.5rem" }}>
                <CheckCircle size={15}/> {linkSuccess.slice(3)}
              </div>
            )}
            {linkSuccess.startsWith("error:") && (
              <div className="alert-banner error" style={{ padding:"0.65rem 0.9rem", fontSize:"0.85rem", marginBottom:"0.75rem" }}>
                {linkSuccess.slice(6)}
              </div>
            )}

            <div style={{ display:"flex", justifyContent:"flex-end", gap:"0.75rem", borderTop:"1px solid var(--border)", paddingTop:"1rem" }}>
              <button className="btn btn-secondary" onClick={() => setLinkModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveLink} style={{ display:"flex", alignItems:"center", gap:"0.4rem" }}>
                <Link size={15}/> Save Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}