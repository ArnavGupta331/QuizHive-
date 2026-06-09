const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");

const app = express();

// ========== MIDDLEWARE ==========
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== ROUTES ==========
app.use("/api/auth", authRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// ========== MONGODB CONNECTION ==========
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/quizhive';
const PORT = process.env.PORT || 5000;

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  });

// ========== START SERVER ==========
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║      🎓 QuizHive Server Started        ║
╠════════════════════════════════════════╣
║  Server: http://localhost:${PORT}         ║
║  MongoDB: Connected
║  Environment: ${process.env.NODE_ENV || 'development'}
╚════════════════════════════════════════╝
  `);
});

module.exports = app;