"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { gameService } from "../services/api"
import { toast } from "react-toastify"
import StarRating from "../components/StarRating"
import Timer from "../components/Timer"

function VotingPage() {
  const { roomId } = useParams()
  const navigate = useNavigate()

  const [currentDrawing, setCurrentDrawing] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [votingProgress, setVotingProgress] = useState({ current: 0, total: 0 })
  const [hasVoted, setHasVoted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDrawingToVote = async () => {
      try {
        setLoading(true)
        const response = await gameService.getDrawingToVote(roomId)

        // Check if we're in the voting phase
        if (response.data.phase !== "voting") {
          // Redirect to the appropriate page based on the game phase
          if (response.data.phase === "drawing") {
            navigate(`/round/${roomId}`)
          } else if (response.data.phase === "results") {
            navigate(`/leaderboard/${roomId}`)
          } else {
            navigate(`/room/${roomId}`)
          }
          return
        }

        setCurrentDrawing(response.data.drawing)
        setTimeLeft(response.data.timeLeft)
        setVotingProgress({
          current: response.data.currentDrawingIndex + 1,
          total: response.data.totalDrawings,
        })
        setHasVoted(response.data.hasVoted || false)
        setError(null)
      } catch (error) {
        console.error("Failed to fetch drawing to vote", error)
        setError("Failed to load drawing. Please try again.")
        toast.error("Failed to load drawing")
      } finally {
        setLoading(false)
      }
    }

    fetchDrawingToVote()

    // Poll for updates every 3 seconds
    const interval = setInterval(fetchDrawingToVote, 3000)
    return () => clearInterval(interval)
  }, [roomId, navigate])

  const handleVote = async (rating) => {
    if (!currentDrawing || hasVoted) return

    try {
      setLoading(true)
      await gameService.submitVote(currentDrawing.id, rating)
      setHasVoted(true)
      toast.success("Vote submitted!")
    } catch (error) {
      console.error("Failed to submit vote", error)
      toast.error(error.response?.data?.message || "Failed to submit vote")
    } finally {
      setLoading(false)
    }
  }

  const handleTimeUp = () => {
    if (!hasVoted && currentDrawing) {
      toast.info("Time's up! Moving to the next drawing...")
    }
  }

  if (loading && !currentDrawing) {
    return <div className="loading">Loading drawings...</div>
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

  if (!currentDrawing) {
    return (
      <div className="waiting-section">
        <h2>Waiting for Next Drawing</h2>
        <p>Please wait while we prepare the next drawing for voting...</p>
        <div className="loading-spinner"></div>
      </div>
    )
  }

  const isOwnDrawing = currentDrawing.isOwnDrawing

  return (
    <div className="voting-page">
      <div className="game-header">
        <h1>Vote on Drawings</h1>
        <div className="voting-progress">
          Drawing {votingProgress.current} of {votingProgress.total}
        </div>
        {timeLeft > 0 && !hasVoted && !isOwnDrawing && <Timer seconds={timeLeft} onComplete={handleTimeUp} />}
      </div>

      <div className="drawing-display">
        <div className="drawing-info">
          <h2>Prompt: {currentDrawing.prompt}</h2>
          <p>Artist: {isOwnDrawing ? "You" : currentDrawing.artistName}</p>
        </div>

        <div className="drawing-image-container">
          <img
            src={currentDrawing.imageUrl || "/placeholder.svg"}
            alt={`Drawing for prompt: ${currentDrawing.prompt}`}
            className="drawing-image"
          />
        </div>

        <div className="voting-controls">
          {isOwnDrawing ? (
            <div className="own-drawing-message">
              <p>This is your drawing. You cannot vote on your own work.</p>
              <p>Waiting for others to vote...</p>
            </div>
          ) : hasVoted ? (
            <div className="voted-message">
              <p>Vote submitted! Waiting for the next drawing...</p>
            </div>
          ) : (
            <div className="rating-container">
              <h3>Rate this drawing:</h3>
              <StarRating onRate={handleVote} disabled={timeLeft <= 0} />
              {timeLeft <= 0 && <p className="time-up-message">Time's up! Moving to next drawing...</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VotingPage
