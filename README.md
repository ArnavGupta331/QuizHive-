# 🎓 QuizHive

QuizHive is a full-featured quiz management platform designed for schools and educational institutions. The system provides dedicated portals for Admins, Teachers, Students, and Parents, enabling seamless quiz creation, participation, performance tracking, and academic monitoring.

## 🚀 Features

### 👨‍💼 Admin Portal
- Manage students, teachers, and parents
- Monitor quiz participation and analytics
- View platform-wide performance statistics
- Role-based access control

### 👩‍🏫 Teacher Portal
- Create and manage quizzes
- Generate randomized question sets
- Track student performance
- View detailed quiz reports

### 👨‍🎓 Student Portal
- Attend quizzes with timer-based assessments
- Receive instant scores and feedback
- View leaderboard rankings
- Access certificates and report cards

### 👨‍👩‍👧 Parent Portal
- Monitor student performance
- View attendance and quiz participation
- Access report cards and academic progress

## 🛠️ Tech Stack

### Frontend
- React.js
- JavaScript (ES6+)
- CSS3
- React Router DOM

### Backend
- Node.js
- Express.js
- REST API

### Database
- MySQL

## 📂 Project Structure

```plaintext
QuizHive/
│
├── public/
│
├── src/
│   ├── components/
│   │   ├── CertificateScreen.jsx
│   │   ├── Header.jsx
│   │   ├── Login.jsx
│   │   ├── QuizModule.jsx
│   │   ├── ReportCard.jsx
│   │   └── Sidebar.jsx
│   │
│   ├── portals/
│   │   ├── AdminDashboard.jsx
│   │   ├── ParentDashboard.jsx
│   │   ├── StudentDashboard.jsx
│   │   └── TeacherDashboard.jsx
│   │
│   ├── data/
│   │   ├── mockData.js
│   │   └── stateManager.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   ├── App.css
│   └── index.css
│
├── package.json
├── vite.config.js
└── README.md
```

## ⚙️ Installation

### Clone the Repository

```bash
git clone https://github.com/your-username/QuizHive.git
```

### Navigate to Project Directory

```bash
cd QuizHive
```

### Install Dependencies

```bash
npm install
```

### Install Additional Packages

```bash
npm install react-router-dom
```

### Start Development Server

```bash
npm run dev
```

The application will be available at:

```plaintext
http://localhost:5173
```

## 🎯 Key Functionalities

- Multi-role Authentication
- Quiz Creation & Management
- Randomized Questions
- Automated Scoring System
- Real-Time Performance Tracking
- Student Leaderboards
- Printable Certificates
- Detailed Report Cards
- Attendance Monitoring
- Parent Progress Dashboard
- Responsive User Interface
- Dark & Light Theme Support

## 📈 Future Enhancements

- JWT Authentication
- Online Exam Proctoring
- AI-Based Question Generation
- Email Notifications
- PDF Report Export
- Cloud Deployment
- Mobile Application Support

## 👨‍💻 Author

**Arnav**

Built using React.js, Node.js, Express.js, and MySQL.

## 📜 License

This project is developed for educational and learning purposes.
