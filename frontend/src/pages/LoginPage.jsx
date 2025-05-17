"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { toast } from "react-toastify"

function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

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
    <div className="auth-page">
      {/* Decorative elements */}
      <div className="decorative-element pencil">✏️</div>
      <div className="decorative-element brush">🖌️</div>
      <div className="decorative-element palette">🎨</div>
      
      <div className="auth-card">
        <h1 className="auth-title">Welcome Back, Artist!</h1>
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
              placeholder="Your artist name"
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
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 
              <><span className="spinner"></span> Sharpening Pencils...</> : 
              <>🎭 Enter the Arena</>
            }
          </button>
        </form>
        <p className="auth-link">
          New to the battle? <Link to="/register">Create an Account</Link>
        </p>
        
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
    </div>
  )
}

export default LoginPage
