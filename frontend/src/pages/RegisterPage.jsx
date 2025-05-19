"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { toast } from "react-toastify"
import { motion } from "framer-motion"
import AuthCanvas from "../components/AuthCanvas"
import "./AuthPage.css"

function RegisterPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()
  
  // Animation variants
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.6 } },
    exit: { opacity: 0, transition: { duration: 0.4 } }
  }
  
  const decorativeVariants = {
    hover: { 
      scale: 1.1, 
      rotate: [0, 5, -5, 0],
      transition: { duration: 0.5 }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username || !password || !confirmPassword) {
      toast.error("Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setLoading(true)
    try {
      await register(username, password)
      toast.success("Registration successful! Please log in.")
      navigate("/login")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to register. Username may already be taken.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div 
      className="auth-page"
      variants={pageVariants}
      initial="initial"
      animate="animate"      exit="exit"
    >
      {/* Background canvas animation */}
      <AuthCanvas />
      
      {/* Decorative elements with hover animations */}
      <motion.div className="decorative-element pencil" variants={decorativeVariants} whileHover="hover">✏️</motion.div>
      <motion.div className="decorative-element brush" variants={decorativeVariants} whileHover="hover">🖌️</motion.div>
      <motion.div className="decorative-element palette" variants={decorativeVariants} whileHover="hover">🎨</motion.div>
      
      <div className="auth-card">
        <h1 className="auth-title">Join the Battle!</h1>
        <p className="auth-subtitle">Create an account to start your drawing adventure</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">
              <span className="input-icon">👤</span> Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              placeholder="Choose an artist name"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">
              <span className="input-icon">🔒</span> Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="Create a secure password"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">
              <span className="input-icon">🔐</span> Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              placeholder="Confirm your password"
              required
            />
          </div>
          <div className="form-actions">
            <motion.button 
              type="submit" 
              className="btn btn-primary btn-block" 
              disabled={loading}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? 
                <><span className="spinner"></span> Creating Masterpiece...</> : 
                <>🎨 Create Account</>
              }
            </motion.button>
          </div>
        </form>
        <div className="auth-links">
          <p className="auth-link">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
        
        <div className="auth-decoration">
          <div className="color-palette">
            <span style={{background: "var(--red-crayon)"}}></span>
            <span style={{background: "var(--blue-crayon)"}}></span>
            <span style={{background: "var(--green-crayon)"}}></span>
            <span style={{background: "var(--yellow-crayon)"}}></span>
            <span style={{background: "var(--purple-crayon)"}}></span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default RegisterPage
