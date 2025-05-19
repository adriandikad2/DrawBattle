"use client"

import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"

function Navbar() {
  const { currentUser, logout } = useAuth()
  const { currentTheme } = useTheme()
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
    <header className={`navbar ${currentTheme}`}>
      <div className="navbar-container">        
        <Link to="/" className="navbar-logo">
          <span className="logo-icon select-none pointer-events-none">🎨</span>
          <h1 className="select-none pointer-events-none">DrawBattle</h1>
        </Link>

        <nav className="navbar-links">
          {currentUser ? (
            <>
              <Link to="/lobby" className="nav-link select-none">
                Lobby
              </Link>
              <div className="user-menu select-none">
                <Link to="/profile" className="username nav-link">
                  {currentUser.username}
                </Link>
                <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link select-none">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm select-none">
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
