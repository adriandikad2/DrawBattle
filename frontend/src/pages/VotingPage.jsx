"use client"

import { useState, useEffect, useRef } from "react"
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
  const [pollingActive, setPollingActive] = useState(true)
  const pollingIntervalRef = useRef(null)
  
  // Only allow one navigation and polling stop
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    setPollingActive(true);

    // Helper to stop polling and navigate ONCE
    const stopPollingAndNavigate = (target) => {
      if (hasNavigatedRef.current) return;
      
      // Stop all polling and clear timeouts first
      setPollingActive(false);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      if (autoVoteTimeout) {
        clearTimeout(autoVoteTimeout);
        setAutoVoteTimeout(null);
      }
      
      // Mark as navigated and then navigate
      hasNavigatedRef.current = true;
      navigate(target);
    };

    // Initial load with loading indicator
    const fetchDrawingToVoteInitial = async () => {
      try {
        setLoading(true);
        const response = await gameService.getDrawingToVote(roomId);
        // Check if we're in the voting phase
        if (response.data.phase !== "voting") {
          if (response.data.phase === "drawing") {
            stopPollingAndNavigate(`/round/${roomId}`);
          } else if (response.data.phase === "results") {
            stopPollingAndNavigate(`/leaderboard/${roomId}`);
          } else {
            stopPollingAndNavigate(`/room/${roomId}`);
          }
          return;
        }
        setCurrentDrawing(response.data.drawing);
        setTimeLeft(Math.max(8, response.data.timeLeft));
        setVotingProgress({
          current: response.data.currentDrawingIndex + 1,
          total: response.data.totalDrawings,
        });
        setHasVoted(response.data.hasVoted || false);
        setError(null);
      } catch (error) {
        // Handle 204 No Content (voting is over)
        if (error?.response?.status === 204) {
          stopPollingAndNavigate(`/leaderboard/${roomId}`);
        } else if (error?.response?.status === 404) {
          // 404 likely means we're between phases - wait and retry
          console.log("Drawing not ready yet, waiting...");
          // Retry after a short delay
          setTimeout(fetchDrawingToVoteInitial, 2000);
        } else {
          console.error("Failed to fetch drawing to vote", error);
          setError("Failed to load drawing. Please try again.");
          toast.error("Failed to load drawing");
        }
      } finally {
        setLoading(false);
      }
    };

    // Silent update for polling
    const fetchDrawingToVoteSilent = async () => {
      if (!pollingActive || hasNavigatedRef.current) return;
      try {
        const response = await gameService.getDrawingToVote(roomId);
        if (response.data.phase !== "voting") {
          if (response.data.phase === "drawing") {
            stopPollingAndNavigate(`/round/${roomId}`);
          } else if (response.data.phase === "results") {
            stopPollingAndNavigate(`/leaderboard/${roomId}`);
          } else {
            stopPollingAndNavigate(`/room/${roomId}`);
          }
          return;
        }
        const newDrawingId = response.data.drawing?.id;
        const currentDrawingId = currentDrawing?.id;
        if (newDrawingId !== currentDrawingId) {
          setCurrentDrawing(response.data.drawing);
          setTimeLeft(Math.max(8, response.data.timeLeft));
          setHasVoted(response.data.hasVoted || false);
          if (autoVoteTimeout) {
            clearTimeout(autoVoteTimeout);
          }
        } else {
          if (
            Math.abs(response.data.timeLeft - timeLeft) > 3 ||
            response.data.timeLeft > timeLeft ||
            timeLeft < 2
          ) {
            setTimeLeft(Math.max(5, response.data.timeLeft));
          }
          setHasVoted(response.data.hasVoted || false);
        }
        setVotingProgress({
          current: response.data.currentDrawingIndex + 1,
          total: response.data.totalDrawings,
        });
        setError(null);
      } catch (error) {
        // Handle 204 No Content (voting is over)
        if (error?.response?.status === 204) {
          stopPollingAndNavigate(`/leaderboard/${roomId}`);
        } else if (error?.response?.status === 404) {
          // Still transitioning between phases, just wait for next poll
          console.log("Drawing not ready yet in poll, waiting...");
        } else {
          console.error("Failed to poll drawing to vote", error);
        }
      }
    };

    // Only start polling if we haven't navigated away
    if (!hasNavigatedRef.current) {
      fetchDrawingToVoteInitial();
      pollingIntervalRef.current = setInterval(fetchDrawingToVoteSilent, 3000);
    }

    // Cleanup function
    return () => {
      setPollingActive(false);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      if (autoVoteTimeout) {
        clearTimeout(autoVoteTimeout);
        setAutoVoteTimeout(null);
      }
    };
  }, [roomId, navigate, currentDrawing, timeLeft, autoVoteTimeout, pollingActive]);

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

  // If there is no drawing to vote on, check if the user failed to submit
  if (!currentDrawing) {
    // Show a message for this round only, then auto-advance to the next round or phase
    const [skipped, setSkipped] = useState(false);
    useEffect(() => {
      const timer = setTimeout(() => {
        setSkipped(true);
        // After 5 seconds, try to re-fetch the voting state to advance to the next round/phase
        window.location.reload(); // Simple reload to trigger the next round logic
      }, 5000);
      return () => clearTimeout(timer);
    }, []);

    return (
      <div className="waiting-section">
        <h2>No Drawing Submitted</h2>
        <p>You did not submit a drawing in time. You will not receive a score for this round.</p>
        <div className="loading-spinner"></div>
        <p style={{ marginTop: '1em', color: '#888' }}>Advancing to the next round in 5 seconds...</p>
      </div>
    );
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
