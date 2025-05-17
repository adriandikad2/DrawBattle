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
  const [autoVoteTimeout, setAutoVoteTimeout] = useState(null)
  
  useEffect(() => {
    // Initial load with loading indicator
    const fetchDrawingToVoteInitial = async () => {
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
        // Ensure at least 8 seconds for voting to prevent immediate "time's up"
        setTimeLeft(Math.max(8, response.data.timeLeft))
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
    
    // Silent update for polling
    const fetchDrawingToVoteSilent = async () => {
      try {
        // Don't set loading state during polling
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

        // Compare the current drawing with the new one
        const newDrawingId = response.data.drawing?.id
        const currentDrawingId = currentDrawing?.id
        
        // If drawing changed, reset vote state
        if (newDrawingId !== currentDrawingId) {
          setCurrentDrawing(response.data.drawing)
          // Give at least 8 seconds for new drawings
          setTimeLeft(Math.max(8, response.data.timeLeft))
          setHasVoted(response.data.hasVoted || false)
          
          // Clear any existing auto-vote timeout
          if (autoVoteTimeout) {
            clearTimeout(autoVoteTimeout)
          }
        } else {
          // Only update timeLeft if:
          // 1. The new value is significantly different (>3s difference)
          // 2. The server time is higher than our current time (server refreshed the timer)
          // 3. The current timer is near zero (to refresh if server extended time)
          if (
            Math.abs(response.data.timeLeft - timeLeft) > 3 || 
            response.data.timeLeft > timeLeft ||
            timeLeft < 2
          ) {
            // Ensure at least 5 seconds for voting during polling updates
            setTimeLeft(Math.max(5, response.data.timeLeft))
          }
          
          setHasVoted(response.data.hasVoted || false)
        }
        
        setVotingProgress({
          current: response.data.currentDrawingIndex + 1,
          total: response.data.totalDrawings,
        })
        
        setError(null)
      } catch (error) {
        console.error("Failed to poll drawing to vote", error)
        // Only show error for critical issues during polling
      }
    }

    fetchDrawingToVoteInitial()

    // Poll for voting updates every 3 seconds without showing loading indicator
    const interval = setInterval(fetchDrawingToVoteSilent, 3000)
    return () => {
      clearInterval(interval)
      if (autoVoteTimeout) clearTimeout(autoVoteTimeout)
    }
  }, [roomId, navigate, currentDrawing, timeLeft, autoVoteTimeout])

  // Auto-vote functionality to ensure game keeps moving
  useEffect(() => {
    // Only set up auto-vote if there's a drawing, user hasn't voted, it's not their own drawing, and time is running
    if (currentDrawing && !hasVoted && !currentDrawing.isOwnDrawing && timeLeft > 0) {
      // Auto-vote 2 seconds before time runs out
      const autoVoteTimer = setTimeout(() => {
        if (!hasVoted && !loading) {
          console.log("Auto-voting as time is about to run out");
          // Choose a random rating between 3-5 stars for auto-vote
          const randomRating = Math.floor(Math.random() * 3) + 3;
          handleVote(randomRating);
          toast.info("Auto-voted as time was running out");
        }
      }, (timeLeft - 2) * 1000);
      
      setAutoVoteTimeout(autoVoteTimer)

      return () => {
        clearTimeout(autoVoteTimer);
        setAutoVoteTimeout(null)
      };
    }
  }, [currentDrawing, hasVoted, timeLeft, loading]);

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
