"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"
import PasswordInput from "../components/PasswordInput"
import { toast } from "react-toastify"
import { motion } from "framer-motion"
import AuthCanvas from "../components/AuthCanvas"
import "./AuthPage.css"

function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { currentTheme } = useTheme()
  const navigate = useNavigate()
  
  // Animation variants - simplified to work with PageTransition component
  const contentVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }
  
  const itemVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
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
    if (!username || !password) {
      toast.error("Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      await login(username, password)
      toast.success("Login successful!")
      navigate("/lobby")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to login. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`auth-page ${currentTheme}`}>
      {/* Background canvas animation */}
      <AuthCanvas />
      
      {/* Decorative elements with hover animations */}
      <motion.div className="decorative-element pencil select-none pointer-events-none" variants={decorativeVariants} whileHover="hover">✏️</motion.div>
      <motion.div className="decorative-element brush select-none pointer-events-none" variants={decorativeVariants} whileHover="hover">🖌️</motion.div>
      <motion.div className="decorative-element palette select-none pointer-events-none" variants={decorativeVariants} whileHover="hover">🎨</motion.div>
        <motion.div 
        className="auth-card"
        variants={contentVariants}
        initial="initial"
        animate="animate"
      >
        <motion.h1 className="auth-title" variants={itemVariants}>Welcome Back, Artist!</motion.h1>
        <motion.p className="auth-subtitle" variants={itemVariants}>Sign in to join the drawing battles!</motion.p>

        <form onSubmit={handleSubmit}>
          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="username">
              <span className="input-icon">👤</span> Username
            </label>
            <input              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              placeholder="Your artist name"
              required
            />
          </motion.div>
          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="password">
              <span className="input-icon">🔒</span> Password
            </label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="Your secret passcode"
              required
            />
          </motion.div>
          <motion.div className="form-actions" variants={itemVariants}>            <motion.button 
              type="submit" 
              className="btn btn-primary btn-block" 
              disabled={loading}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? 
                <><span className="spinner"></span> Sharpening Pencils...</> : 
                <>🎭 Enter the Arena</>
              }
            </motion.button>
          </motion.div>
        </form>
        <motion.div className="auth-links" variants={itemVariants}>
          <p className="auth-link">
            New to the battle? <Link to="/register">Create an Account</Link>
          </p>
        </motion.div>
        
        <motion.div className="auth-decoration" variants={itemVariants}>
          <div className="color-palette">
            <span style={{background: "var(--red-crayon)"}}></span>
            <span style={{background: "var(--blue-crayon)"}}></span>
            <span style={{background: "var(--green-crayon)"}}></span>
            <span style={{background: "var(--yellow-crayon)"}}></span>
            <span style={{background: "var(--purple-crayon)"}}></span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default LoginPage
