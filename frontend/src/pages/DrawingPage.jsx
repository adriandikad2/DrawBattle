"use client"

import { useState, useEffect } from "react"
import "../styles/PageStyles.css"
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
        // Use the timeLeft value as provided by the backend (host's choice)
        setTimeLeft(response.data.timeLeft)
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
        if (
          Math.abs(response.data.timeLeft - timeLeft) > 5 || 
          response.data.timeLeft > timeLeft ||
          timeLeft < 3
        ) {
          setTimeLeft(response.data.timeLeft)
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
      // First verify game state before submitting
      const stateResponse = await gameService.getGameState(roomId)
      
      if (stateResponse.data.phase !== "drawing") {
        toast.error("Room is no longer in drawing phase")
        return
      }

      // Attempt to submit the drawing
      await gameService.submitDrawing(roomId, drawingData)
      setIsSubmitted(true)
      toast.success("Drawing submitted successfully!")
      
      // Wait a moment for the server to process the submission
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Verify the submission was processed
      const verifyResponse = await gameService.getGameState(roomId)
      if (!verifyResponse.data.hasSubmitted) {
        toast.error("Drawing submission not confirmed. Please try again.")
        setIsSubmitted(false)
      }
    } catch (error) {
      console.error("Failed to submit drawing", error)
      if (error.response?.status === 403) {
        // If we get a 403, check if we're still in the room
        try {
          await gameService.getGameState(roomId)
        } catch (stateError) {
          if (stateError.response?.status === 403) {
            navigate(`/room/${roomId}`) // Redirect back to room if we're no longer in it
            return
          }
        }
      }
      toast.error(error.response?.data?.message || "Failed to submit drawing")
      setIsSubmitted(false)
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
