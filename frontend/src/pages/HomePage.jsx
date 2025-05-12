"use client"

import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

function HomePage() {
  const { currentUser } = useAuth()

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Draw, Vote, Win!</h1>
          <p className="hero-subtitle">
            Challenge your friends to drawing battles. Create masterpieces based on random prompts, vote on each other's
            artwork, and climb the leaderboard!
          </p>
          <div className="hero-actions">
            {currentUser ? (
              <Link to="/lobby" className="btn btn-primary btn-lg">
                Enter Lobby
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-primary btn-lg">
                  Get Started
                </Link>
                <Link to="/register" className="btn btn-outline btn-lg">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="hero-image">
          <div className="drawing-preview">
            <span className="drawing-icon">🎨</span>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-icon">✏️</div>
            <h3>1. Draw</h3>
            <p>Get a random prompt and create your masterpiece within the time limit</p>
          </div>
          <div className="step">
            <div className="step-icon">⭐</div>
            <h3>2. Vote</h3>
            <p>Rate other players' drawings from 1 to 5 stars during the voting phase</p>
          </div>
          <div className="step">
            <div className="step-icon">🏆</div>
            <h3>3. Win</h3>
            <p>See the results on the leaderboard and claim your victory</p>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>Features</h2>
        <div className="feature-grid">
          <div className="feature">
            <h3>Real-time Drawing</h3>
            <p>Draw with a responsive canvas that works on desktop and mobile</p>
          </div>
          <div className="feature">
            <h3>Fair Voting</h3>
            <p>Anonymous voting system ensures fair and unbiased results</p>
          </div>
          <div className="feature">
            <h3>Custom Rooms</h3>
            <p>Create private rooms to play with friends or join public games</p>
          </div>
          <div className="feature">
            <h3>Leaderboards</h3>
            <p>Track your progress and compete for the top spot</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
