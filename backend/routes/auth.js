const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { pool } = require("../config/db")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" })
    }

    // Check if username already exists
    const userCheck = await pool.query("SELECT * FROM users WHERE username = $1", [username])

    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: "Username already taken" })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Insert new user
    const result = await pool.query("INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username", [
      username,
      hashedPassword,
    ])

    res.status(201).json({
      message: "User registered successfully",
      user: result.rows[0],
    })
  } catch (error) {
    console.error("Register error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Login user
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" })
    }

    // Find user
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username])

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const user = result.rows[0]

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Create JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get current user
router.get("/me", authenticateToken, async (req, res) => {
  try {
    res.json(req.user)
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Logout (client-side only, just for API completeness)
router.post("/logout", (req, res) => {
  res.json({ message: "Logout successful" })
})

module.exports = router
