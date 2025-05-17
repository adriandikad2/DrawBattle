"use client"

import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

function Navbar() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/login")
    } catch (error) {
      console.error("Failed to log out", error)
    }
  }

  return (
    <header className="navbar">
      <div className="navbar-container">        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🎨</span>
          <h1>DrawBattle</h1>
        </Link>

        <nav className="navbar-links">
          {currentUser ? (
            <>
              <Link to="/lobby" className="nav-link">
                Lobby
              </Link>
              <div className="user-menu">
                <span className="username">{currentUser.username}</span>
                <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
