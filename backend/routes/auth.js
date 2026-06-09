const express = require("express");
const User = require("../models/User");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      name,
      role,
      class: classNum,
      rollNumber
    } = req.body;

    const existingUser = await User.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: email.toLowerCase() }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username or email already exists"
      });
    }

    const newId = `${role.charAt(0).toUpperCase()}${Date.now()
      .toString()
      .slice(-6)}`;

    const user = new User({
      id: newId,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      name,
      role,
      class: classNum,
      rollNumber
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: user.toJSON()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    const user = await User.findOne({
      username: username.toLowerCase(),
      role
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const validPassword = await user.matchPassword(password);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    res.json({
      success: true,
      user: user.toJSON()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

module.exports = router;