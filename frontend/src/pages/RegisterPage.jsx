"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { toast } from "react-toastify"

function RegisterPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

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
    <div className="auth-page">
      {/* Decorative elements */}
      <div className="decorative-element pencil">✏️</div>
      <div className="decorative-element brush">🖌️</div>
      <div className="decorative-element palette">🎨</div>
      
      <div className="auth-card">
        <h1 className="auth-title">Join the Battle!</h1>
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
              placeholder="Create your artist name"
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
              placeholder="Your secret passcode"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">
              <span className="input-icon">✓</span> Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              placeholder="Confirm your passcode"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 
              <><span className="spinner"></span> Creating Masterpiece...</> : 
              <>✨ Start Your Artistic Journey</>
            }
          </button>
        </form>
        <p className="auth-link">
          Already a battle artist? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
