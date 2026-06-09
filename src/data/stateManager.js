import { initialUsers, initialQuizzes, initialAttempts } from "./mockData";

const KEYS = {
  USERS: "quiz_system_users",
  QUIZZES: "quiz_system_quizzes",
  ATTEMPTS: "quiz_system_attempts",
  CURRENT_USER: "quiz_system_current_user",
  VERSION: "quiz_system_version",
};

// Bump this version string whenever mockData changes.
// On mismatch the storage is wiped and re-seeded automatically.
const DATA_VERSION = "v2";

// ── Initialize (or re-seed if version mismatch) ────────────────────────────
export const initializeStorage = () => {
  const storedVersion = localStorage.getItem(KEYS.VERSION);

  if (storedVersion !== DATA_VERSION) {
    // Version changed or first run — wipe everything except theme preference
    const theme = localStorage.getItem("quiz_system_theme");
    localStorage.clear();
    if (theme) localStorage.setItem("quiz_system_theme", theme);

    localStorage.setItem(KEYS.USERS,    JSON.stringify(initialUsers));
    localStorage.setItem(KEYS.QUIZZES,  JSON.stringify(initialQuizzes));
    localStorage.setItem(KEYS.ATTEMPTS, JSON.stringify(initialAttempts));
    localStorage.setItem(KEYS.VERSION,  DATA_VERSION);
  }
};

// ── Getters ────────────────────────────────────────────────────────────────
export const getUsers = () => {
  return JSON.parse(localStorage.getItem(KEYS.USERS)) || [];
};

export const getQuizzes = () => {
  return JSON.parse(localStorage.getItem(KEYS.QUIZZES)) || [];
};

export const getAttempts = () => {
  return JSON.parse(localStorage.getItem(KEYS.ATTEMPTS)) || [];
};

export const getCurrentUser = () => {
  const user = localStorage.getItem(KEYS.CURRENT_USER);
  return user ? JSON.parse(user) : null;
};

// ── Setters ────────────────────────────────────────────────────────────────
export const setUsers = (users) => {
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
};

export const setQuizzes = (quizzes) => {
  localStorage.setItem(KEYS.QUIZZES, JSON.stringify(quizzes));
};

export const setAttempts = (attempts) => {
  localStorage.setItem(KEYS.ATTEMPTS, JSON.stringify(attempts));
};

export const setCurrentUser = (user) => {
  if (user) {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(KEYS.CURRENT_USER);
  }
};

// ── Authentication ─────────────────────────────────────────────────────────
export const loginUser = (username, password, role) => {
  const users = getUsers();
  const user = users.find(
    (u) =>
      u.username.toLowerCase() === username.toLowerCase() &&
      u.password === password &&
      u.role === role
  );
  if (user) {
    setCurrentUser(user);
    return { success: true, user };
  }
  return { success: false, message: "Invalid credentials or role selection" };
};

// ── Admin: User CRUD ───────────────────────────────────────────────────────
export const addUser = (user) => {
  const users = getUsers();
  const newId = `${user.role.charAt(0).toUpperCase()}${users.length + 1}-${Date.now().toString().slice(-4)}`;
  const newUser = { id: newId, ...user };
  users.push(newUser);
  setUsers(users);
  return newUser;
};

export const updateUser = (updatedUser) => {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === updatedUser.id);
  if (index !== -1) {
    users[index] = { ...users[index], ...updatedUser };
    setUsers(users);
    const current = getCurrentUser();
    if (current && current.id === updatedUser.id) {
      setCurrentUser(users[index]);
    }
    return true;
  }
  return false;
};

export const deleteUser = (userId) => {
  const users = getUsers();
  setUsers(users.filter((u) => u.id !== userId));
  return true;
};

// ── Teacher: Quiz CRUD ─────────────────────────────────────────────────────
export const addQuiz = (quiz) => {
  const quizzes = getQuizzes();
  const newId = `Q${quizzes.length + 1}-${Date.now().toString().slice(-4)}`;
  const newQuiz = { id: newId, ...quiz };
  quizzes.push(newQuiz);
  setQuizzes(quizzes);
  return newQuiz;
};

export const updateQuiz = (updatedQuiz) => {
  const quizzes = getQuizzes();
  const index = quizzes.findIndex((q) => q.id === updatedQuiz.id);
  if (index !== -1) {
    quizzes[index] = { ...quizzes[index], ...updatedQuiz };
    setQuizzes(quizzes);
    return true;
  }
  return false;
};

export const deleteQuiz = (quizId) => {
  setQuizzes(getQuizzes().filter((q) => q.id !== quizId));
  return true;
};

// ── Student: Attempt ───────────────────────────────────────────────────────
export const saveAttempt = (attempt) => {
  const attempts = getAttempts();
  const newId = `att-${attempts.length + 1}-${Date.now().toString().slice(-4)}`;
  const newAttempt = { id: newId, ...attempt };
  attempts.push(newAttempt);
  setAttempts(attempts);
  return newAttempt;
};

// ── Analytics ──────────────────────────────────────────────────────────────
export const getAnalytics = () => {
  const attempts = getAttempts();
  const quizzes = getQuizzes();
  const users = getUsers();

  const students = users.filter((u) => u.role === "student");
  const teachers = users.filter((u) => u.role === "teacher");
  const parents  = users.filter((u) => u.role === "parent");

  const totalAttempts = attempts.length;
  const attendedStudentIds = new Set(attempts.map((a) => a.studentId));
  const totalAttendedCount = attendedStudentIds.size;
  const totalMissedCount = Math.max(0, students.length - totalAttendedCount);

  const scores = attempts.map((a) => (a.score / a.totalQuestions) * 100);
  const averageScore =
    scores.length > 0
      ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
      : 0;

  const passes = attempts.filter((a) => (a.score / a.totalQuestions) >= 0.5).length;
  const fails = totalAttempts - passes;

  const classStats = {};
  for (let c = 1; c <= 12; c++) {
    const classAttempts = attempts.filter((a) => Number(a.class) === c);
    const classStudents = students.filter((s) => Number(s.class) === c);
    if (classAttempts.length > 0 || classStudents.length > 0) {
      const classScores = classAttempts.map((a) => (a.score / a.totalQuestions) * 100);
      const avg =
        classScores.length > 0
          ? (classScores.reduce((x, y) => x + y, 0) / classScores.length).toFixed(1)
          : 0;
      const attended = new Set(classAttempts.map((a) => a.studentId)).size;
      classStats[c] = {
        className: `Class ${c}`,
        attempts: classAttempts.length,
        avgScore: Number(avg),
        attendanceRate:
          classStudents.length > 0
            ? Math.round((attended / classStudents.length) * 100)
            : 0,
      };
    }
  }

  const studentPerformance = {};
  attempts.forEach((att) => {
    if (!studentPerformance[att.studentId]) {
      studentPerformance[att.studentId] = {
        name: att.studentName,
        class: att.class,
        totalPercentage: 0,
        count: 0,
      };
    }
    studentPerformance[att.studentId].totalPercentage += att.percentage;
    studentPerformance[att.studentId].count += 1;
  });

  const rankedStudents = Object.keys(studentPerformance)
    .map((sid) => {
      const sp = studentPerformance[sid];
      return {
        id: sid,
        name: sp.name,
        class: sp.class,
        average: Math.round(sp.totalPercentage / sp.count),
      };
    })
    .sort((a, b) => b.average - a.average);

  return {
    totalStudents: students.length,
    totalTeachers: teachers.length,
    totalParents: parents.length,
    totalQuizzes: quizzes.length,
    totalAttempts,
    totalAttendedCount,
    totalMissedCount,
    averageScore,
    passCount: passes,
    failCount: fails,
    classStats: Object.values(classStats),
    topStudents: rankedStudents.slice(0, 5),
    lowestStudents: [...rankedStudents].reverse().slice(0, 5),
  };
};

// ── Class rank & leaderboard ───────────────────────────────────────────────
export const getStudentClassRank = (studentId, classNum) => {
  const users = getUsers();
  const attempts = getAttempts();

  const classStudents = users.filter(
    (u) => u.role === "student" && Number(u.class) === Number(classNum)
  );

  const studentPerformances = classStudents.map((student) => {
    const sa = attempts.filter((a) => a.studentId === student.id);
    const avg =
      sa.length > 0
        ? Math.round(sa.reduce((acc, curr) => acc + curr.percentage, 0) / sa.length)
        : 0;
    return {
      studentId: student.id,
      name: student.name,
      rollNumber: student.rollNumber || "N/A",
      average: avg,
      attemptsCount: sa.length,
    };
  });

  studentPerformances.sort((a, b) => b.average - a.average);
  const index = studentPerformances.findIndex((p) => p.studentId === studentId);
  const rank = index !== -1 ? index + 1 : classStudents.length;

  return { rank, total: classStudents.length, leaderboard: studentPerformances };
};

// ── Monthly trends ─────────────────────────────────────────────────────────
export const getMonthlyTrends = () => {
  const attempts = getAttempts();
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthlyData = {};

  attempts.forEach((a) => {
    if (!a.date) return;
    const d = new Date(a.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!monthlyData[key]) {
      monthlyData[key] = {
        monthIndex: d.getMonth(),
        year: d.getFullYear(),
        monthName: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
        totalPercentage: 0,
        count: 0,
      };
    }
    monthlyData[key].totalPercentage += a.percentage;
    monthlyData[key].count += 1;
  });

  return Object.values(monthlyData)
    .sort((a, b) => a.year !== b.year ? a.year - b.year : a.monthIndex - b.monthIndex)
    .map((item) => ({
      month: item.monthName,
      avgScore: Math.round(item.totalPercentage / item.count),
      attempts: item.count,
    }));
};