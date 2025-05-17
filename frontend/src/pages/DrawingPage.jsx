"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { gameService } from "../services/api"
import { toast } from "react-toastify"
import DrawingCanvas from "../components/DrawingCanvas"
import Timer from "../components/Timer"

function DrawingPage() {
  const { roomId } = useParams()
  const navigate = useNavigate()

  const [prompt, setPrompt] = useState("")
  const [timeLeft, setTimeLeft] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    // Initial load with loading indicator
    const fetchGameStateInitial = async () => {
      try {
        setLoading(true)
        const response = await gameService.getGameState(roomId)

        // Check if we're in the drawing phase
        if (response.data.phase !== "drawing") {
          // Redirect to the appropriate page based on the game phase
          if (response.data.phase === "voting") {
            navigate(`/voting/${roomId}`)
          } else if (response.data.phase === "results") {
            navigate(`/leaderboard/${roomId}`)
          } else {
            navigate(`/room/${roomId}`)
          }
          return
        }

        setPrompt(response.data.prompt)
        // Ensure initial timeLeft is at least 5 seconds to prevent immediate "time's up"
        // This gives users more time to see the prompt and start drawing
        setTimeLeft(Math.max(5, response.data.timeLeft))
        setIsSubmitted(response.data.hasSubmitted || false)
        setError(null)
      } catch (error) {
        console.error("Failed to fetch game state", error)
        setError("Failed to load game state. Please try again.")
        toast.error("Failed to load game state")
      } finally {
        setLoading(false)
      }
    }
    
    // Silent update for polling
    const fetchGameStateSilent = async () => {
      try {
        // Don't show loading indicator during polling
        const response = await gameService.getGameState(roomId)

        // Check if we're in the drawing phase
        if (response.data.phase !== "drawing") {
          // Redirect to the appropriate page based on the game phase
          if (response.data.phase === "voting") {
            navigate(`/voting/${roomId}`)
          } else if (response.data.phase === "results") {
            navigate(`/leaderboard/${roomId}`)
          } else {
            navigate(`/room/${roomId}`)
          }
          return
        }        

        // Update state without showing loading indicator
        setPrompt(response.data.prompt)
        
        // Only update timeLeft if:
        // 1. The new value is significantly different (>5s difference)
        // 2. The server time is higher than our current time (server refreshed the timer)
        // 3. The current timer is near zero (to refresh if server extended time)
        if (
          Math.abs(response.data.timeLeft - timeLeft) > 5 || 
          response.data.timeLeft > timeLeft ||
          timeLeft < 3
        ) {
          // Ensure we never set time to less than 5 seconds from a poll
          // This gives users a better experience
          setTimeLeft(Math.max(5, response.data.timeLeft))
        }
        
        setIsSubmitted(response.data.hasSubmitted || false)
        setError(null)
      } catch (error) {
        console.error("Failed to poll game state", error)
        // Only show error for critical issues during polling
      }
    }

    fetchGameStateInitial()

    // Poll for game state updates every 5 seconds without showing loading indicator
    const interval = setInterval(fetchGameStateSilent, 5000)
    return () => clearInterval(interval)
  }, [roomId, navigate, timeLeft])

  const handleDrawingSubmit = async (drawingData) => {
    try {
      setLoading(true)
      await gameService.submitDrawing(roomId, drawingData)
      setIsSubmitted(true)
      toast.success("Drawing submitted successfully!")
    } catch (error) {
      console.error("Failed to submit drawing", error)
      toast.error(error.response?.data?.message || "Failed to submit drawing")
    } finally {
      setLoading(false)
    }
  }

  const handleTimeUp = () => {
    toast.info("Time's up! Waiting for other players to finish...")
  }

  if (loading && !prompt) {
    return <div className="loading">Loading game...</div>
  }

  if (error) {
    return (
      <div className="error-page">
        <h2>Error</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => navigate(`/room/${roomId}`)}>
          Return to Room
        </button>
      </div>
    )
  }
  return (
    <div className="drawing-page">
      <div className="game-header">
        <h1>
          Draw: <span className="prompt">{prompt}</span>
        </h1>
        {timeLeft > 0 && !isSubmitted && <Timer seconds={timeLeft} onComplete={handleTimeUp} />}
      </div>

      {isSubmitted ? (
        <div className="waiting-section">
          <h2>Drawing Submitted!</h2>
          <p>Waiting for other players to finish their drawings...</p>
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <DrawingCanvas onSave={handleDrawingSubmit} timeLeft={timeLeft} disabled={timeLeft <= 0 && !loading} />
      )}

      {/* Only show "Time's up" message if we've loaded the game state and timeLeft is actually 0 */}
      {timeLeft <= 0 && !isSubmitted && !loading && (
        <div className="time-up-message">
          <p>Time's up! You didn't submit a drawing in time.</p>
        </div>
      )}
    </div>
  )
}

export default DrawingPage
