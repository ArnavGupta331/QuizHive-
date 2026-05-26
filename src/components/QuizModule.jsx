import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getQuizzes, saveAttempt } from "../data/stateManager";
import { Clock, ArrowRight, CheckCircle2, RotateCcw, Home, Award } from "lucide-react";
import CertificateScreen from "./CertificateScreen";
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};
export default function QuizModule({ currentUser }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const timerRef = useRef(null);
  const [quiz, setQuiz] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState({}); // Stores { [qId]: optionText }
  // Timer states
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [latestAttempt, setLatestAttempt] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);
  useEffect(() => {
    const allQuizzes = getQuizzes();
    const currentQuiz = allQuizzes.find((q) => q.id === id);
    if (!currentQuiz) {
      alert("Quiz not found!");
      navigate("/student/dashboard");
      return;
    }
    setQuiz(currentQuiz);
  }, [id, navigate]);
  // Start the quiz
  const handleStartQuiz = () => {
    if (!quiz) return;
    // Randomize questions
    let shuffledQs = shuffleArray(quiz.questions);
    
    // Take at most 10 questions
    shuffledQs = shuffledQs.slice(0, 10);
    // Randomize options for each question
    const preppedQs = shuffledQs.map((q) => ({
      ...q,
      options: shuffleArray(q.options)
    }));
    setQuizQuestions(preppedQs);
    setTimeRemaining(quiz.timeLimit * 60);
    setCurrentIdx(0);
    setAnswers({});
    setSelectedOption(null);
    setQuizStarted(true);
    setQuizFinished(false);
    setLatestAttempt(null);
    setShowCertificate(false);
  };
  // Timer countdown
  useEffect(() => {
    if (quizStarted && !quizFinished && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            // Auto submit
            handleFinishQuiz(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizStarted, quizFinished, timeRemaining]);
  const handleSelectOption = (optionText) => {
    setSelectedOption(optionText);
    setAnswers({
      ...answers,
      [quizQuestions[currentIdx].id]: optionText
    });
  };
  const handleNextQuestion = () => {
    if (currentIdx < quizQuestions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      // Restore previously selected option if any
      const nextQId = quizQuestions[currentIdx + 1].id;
      setSelectedOption(answers[nextQId] || null);
    }
  };
  const handlePrevQuestion = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
      const prevQId = quizQuestions[currentIdx - 1].id;
      setSelectedOption(answers[prevQId] || null);
    }
  };
  const handleFinishQuiz = (isAutoSubmit = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (isAutoSubmit) {
      alert("Time limit reached! Your quiz has been auto-submitted.");
    }
    // Calculate score
    let score = 0;
    quizQuestions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        score += 1;
      }
    });
    const totalQuestions = quizQuestions.length;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    
    // Calculate remarks
    let remark = "Needs Improvement";
    if (percentage >= 85) remark = "Excellent";
    else if (percentage >= 70) remark = "Good";
    else if (percentage >= 50) remark = "Average";
    const timeTaken = quiz.timeLimit * 60 - timeRemaining;
    const today = new Date().toISOString().split("T")[0];
    const newAttempt = {
      studentId: currentUser.id,
      studentName: currentUser.name,
      class: currentUser.class,
      quizId: quiz.id,
      quizTitle: quiz.title,
      subject: quiz.subject,
      score,
      totalQuestions,
      percentage,
      timeTaken,
      date: today,
      remark
    };
    const saved = saveAttempt(newAttempt);
    setLatestAttempt(saved);
    setQuizFinished(true);
    setQuizStarted(false);
  };
  if (!quiz) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Loading quiz details...</div>;
  }
  // Formatting helper for time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };
  const isLastQuestion = currentIdx === quizQuestions.length - 1;
  const isUrgent = timeRemaining <= 60; // Less than 1 min
  return (
    <div className="quiz-wrapper">
      {/* Intro Welcome Screen */}
      {!quizStarted && !quizFinished && (
        <div className="quiz-card" style={{ textAlign: "center" }}>
          <div style={{ display: "inline-flex", padding: "1.25rem", backgroundColor: "var(--accent)", borderRadius: "50%", marginBottom: "1.5rem" }}>
            <Award size={36} color="#111111" />
          </div>
          <h1 className="title-serif" style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{quiz.title}</h1>
          <span className="badge badge-info" style={{ marginBottom: "1.5rem" }}>{quiz.subject} - Class {quiz.class}</span>
          
          <p style={{ color: "var(--text-muted)", fontSize: "1rem", lineHeight: "1.6", maxWidth: "500px", margin: "0 auto 2.5rem auto" }}>
            {quiz.description || "Take this multiple choice exam to test your skills. Ensure you complete all questions before the countdown timer expires."}
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginBottom: "2.5rem", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "1.5rem 0" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{quiz.questions.length}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Questions</div>
            </div>
            <div style={{ width: "1px", backgroundColor: "var(--border)" }}></div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{quiz.timeLimit} min</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Time Limit</div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
            <button className="btn btn-secondary" onClick={() => navigate("/student/dashboard")}>
              Back to Dashboard
            </button>
            <button className="btn btn-primary" onClick={handleStartQuiz}>
              Start Quiz
            </button>
          </div>
        </div>
      )}
      {/* Active Quiz Question Screen */}
      {quizStarted && quizQuestions.length > 0 && (
        <div className="quiz-card">
          <div className="quiz-header-bar">
            <div>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Assessment in Progress
              </span>
              <h3 style={{ fontSize: "1.1rem", marginTop: "0.25rem" }}>{quiz.title}</h3>
            </div>
            <div className={`timer-box ${isUrgent ? "urgent" : ""}`}>
              <Clock size={16} />
              <span>{formatTime(timeRemaining)}</span>
            </div>
          </div>
          <div className="quiz-progress-bar-container">
            <div 
              className="quiz-progress-bar-fill" 
              style={{ width: `${((currentIdx + 1) / quizQuestions.length) * 100}%` }}
            ></div>
          </div>
          <div style={{ marginBottom: "0.5rem", fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: 600 }}>
            Question {currentIdx + 1} of {quizQuestions.length}
          </div>
          
          <h2 className="quiz-question-text">
            {quizQuestions[currentIdx].text}
          </h2>
          <div className="quiz-options-list">
            {quizQuestions[currentIdx].options.map((opt, i) => {
              const isSelected = selectedOption === opt;
              const optionLetter = String.fromCharCode(65 + i);
              return (
                <button
                  key={i}
                  className={`quiz-option-btn ${isSelected ? "selected" : ""}`}
                  onClick={() => handleSelectOption(opt)}
                >
                  <span className="quiz-option-index">{optionLetter}</span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: "1.5rem" }}>
            <button 
              className="btn btn-secondary" 
              onClick={handlePrevQuestion}
              disabled={currentIdx === 0}
            >
              Previous
            </button>
            {isLastQuestion ? (
              <button 
                className="btn btn-primary" 
                onClick={() => handleFinishQuiz(false)}
                disabled={!selectedOption && Object.keys(answers).length < quizQuestions.length}
              >
                Finish Quiz
              </button>
            ) : (
              <button 
                className="btn btn-primary" 
                onClick={handleNextQuestion}
                disabled={!selectedOption}
              >
                Next Question <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      )}
      {/* Quiz Completion Result Screen */}
      {quizFinished && latestAttempt && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {!showCertificate ? (
            <div className="quiz-card" style={{ textAlign: "center" }}>
              <div style={{ display: "inline-flex", padding: "1.25rem", backgroundColor: "var(--success-light)", color: "var(--success)", borderRadius: "50%", marginBottom: "1.5rem" }}>
                <CheckCircle2 size={40} />
              </div>
              <h1 className="title-serif" style={{ fontSize: "2rem", marginBottom: "0.25rem" }}>Quiz Completed!</h1>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "2rem" }}>
                Thank you for completing the assessment. Your score has been recorded.
              </p>
              <div className="grid-cols-2" style={{ gap: "1rem", marginBottom: "2.5rem" }}>
                <div className="card" style={{ padding: "1rem" }}>
                  <div style={{ fontSize: "1.75rem", fontWeight: 700 }}>{latestAttempt.score} / {latestAttempt.totalQuestions}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", marginTop: "0.25rem" }}>Raw Score</div>
                </div>
                <div className="card" style={{ padding: "1rem" }}>
                  <div style={{ fontSize: "1.75rem", fontWeight: 700 }}>{latestAttempt.percentage}%</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", marginTop: "0.25rem" }}>Percentage</div>
                </div>
              </div>
              <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem", padding: "1rem 1.5rem" }}>
                <div style={{ textAlign: "left" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Performance Remark</span>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 700, marginTop: "0.25rem" }}>{latestAttempt.remark}</h3>
                </div>
                <div>
                  <button className="btn btn-secondary" onClick={() => setShowCertificate(true)}>
                    <Award size={16} /> View Certificate
                  </button>
                </div>
              </div>
              {/* Correct answers breakdown */}
              <div className="card" style={{ textAlign: "left", marginBottom: "2.5rem" }}>
                <h3 className="title-serif" style={{ fontSize: "1.1rem", marginBottom: "1rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
                  Answers Review
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {quizQuestions.map((q, idx) => {
                    const studentAns = answers[q.id];
                    const isCorrect = studentAns === q.correctAnswer;
                    return (
                      <div key={q.id} style={{ paddingBottom: "0.75rem", borderBottom: "1px solid var(--primary-bg)" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                          <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{idx + 1}.</span>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: "0.95rem", fontWeight: 500, marginBottom: "0.25rem" }}>{q.text}</p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem 1.5rem", fontSize: "0.85rem" }}>
                              <span style={{ color: isCorrect ? "var(--success)" : "var(--error)", fontWeight: 600 }}>
                                Your Answer: {studentAns || "Unanswered"}
                              </span>
                              {!isCorrect && (
                                <span style={{ color: "var(--success)", fontWeight: 600 }}>
                                  Correct Answer: {q.correctAnswer}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
                <button className="btn btn-secondary" onClick={() => navigate("/student/dashboard")}>
                  <Home size={16} /> Go to Dashboard
                </button>
                <button className="btn btn-primary" onClick={handleStartQuiz}>
                  <RotateCcw size={16} /> Retake Quiz
                </button>
              </div>
            </div>
          ) : (
            <CertificateScreen 
              attempt={latestAttempt} 
              onClose={() => setShowCertificate(false)} 
            />
          )}
        </div>
      )}
    </div>
  );
}
