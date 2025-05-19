"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { roomService } from "../services/api"
import { useAuth } from "../contexts/AuthContext"
import { toast } from "react-toastify"

function WaitingRoomPage() {
  const { roomId } = useParams()
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const [room, setRoom] = useState(null)
  const [players, setPlayers] = useState([])
  const [isHost, setIsHost] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  
  useEffect(() => {
    // Define two versions of the fetch function - one for initial load and one for updates
    const fetchRoomDetailsInitial = async () => {
      try {
        setLoading(true)
        
        // Attempt to join the room first to ensure the player is added
        // This is a no-op if they're already in the room
        try {
          await roomService.joinRoom(roomId)
        } catch (joinError) {
          // Ignore "Already in room" errors
          if (joinError.response?.data?.message !== "Already in room") {
            console.error("Failed to join room:", joinError)
          }
        }
        
        const response = await roomService.getRoomDetails(roomId)
        setRoom(response.data.room)
        setPlayers(response.data.players)

        // Check if current user is the host
        setIsHost(response.data.room.hostId === currentUser?.id)

        // If game has already started, redirect to the appropriate page
        if (response.data.room.status === "playing") {
          navigate(`/round/${roomId}`)
        }

        setError(null)
      } catch (error) {
        console.error("Failed to fetch room details", error)
        setError("Failed to load room details. The room may no longer exist.")
        toast.error("Failed to load room details")
      } finally {
        setLoading(false)
      }
    }
    
    // Version for polling updates - doesn't change loading state
    const fetchRoomDetailsUpdate = async () => {
      try {
        const response = await roomService.getRoomDetails(roomId)
        setRoom(response.data.room)
        setPlayers(response.data.players)

        // Check if current user is the host
        setIsHost(response.data.room.hostId === currentUser?.id)

        // If game has already started, redirect to the appropriate page
        if (response.data.room.status === "playing") {
          navigate(`/round/${roomId}`)
        }

        setError(null)
      } catch (error) {
        console.error("Failed to fetch room details during polling", error)
        // Don't show errors during polling unless it's critical
        // Only update error state if there's a serious issue
        if (error.response?.status === 404) {
          setError("Room no longer exists.")
          toast.error("Room no longer exists")
        }
      }
    }

    // Initial load with loading state
    fetchRoomDetailsInitial()

    // Poll for room updates every 3 seconds without affecting loading state
    const interval = setInterval(fetchRoomDetailsUpdate, 3000)
    return () => clearInterval(interval)
  }, [roomId, currentUser, navigate])

  const handleStartGame = async () => {
    if (!isHost) {
      toast.error("Only the host can start the game")
      return
    }

    try {
      await roomService.startGame(roomId)
      navigate(`/round/${roomId}`)
    } catch (error) {
      console.error("Failed to start game", error)
      toast.error(error.response?.data?.message || "Failed to start the game")
    }
  }

  const handleLeaveRoom = async () => {
    try {
      await roomService.leaveRoom(roomId)
      navigate("/lobby")
    } catch (error) {
      console.error("Failed to leave room", error)
      // Navigate anyway
      navigate("/lobby")
    }
  }

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return <div className="loading">Loading room details...</div>
  }

  if (error) {
    return (
      <div className="error-page">
        <h2>Error</h2>
        <p>{error}</p>
        <Link to="/lobby" className="btn btn-primary">
          Return to Lobby
        </Link>
      </div>
    )
  }

  return (
    <div className="waiting-room-page">
      <div className="room-header">
        <h1>{room.name}</h1>
        <div className="room-code">
          <span>Room Code: </span>
          <span className="code">{roomId}</span>
          <button className="btn btn-icon" onClick={copyRoomCode} title="Copy room code">
            {copied ? "✓" : "📋"}
          </button>
        </div>
      </div>

      <div className="room-content">
        <div className="players-section">
          <h2>
            Players ({players.length}/{room.maxPlayers})
          </h2>
          <div className="players-grid">
            {players.map((player) => (
              <div key={player.id} className={`player-card ${player.id === room.hostId ? "host" : ""}`}>
                <div className="player-avatar">{player.username.charAt(0).toUpperCase()}</div>
                <div className="player-name">
                  {player.username} {player.id === room.hostId && "(Host)"}
                </div>
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: room.maxPlayers - players.length }).map((_, index) => (
              <div key={`empty-${index}`} className="player-card empty">
                <div className="player-avatar empty">?</div>
                <div className="player-name">Waiting for player...</div>
              </div>
            ))}
          </div>
        </div>

        <div className="room-info-section">
          <h2>Game Settings</h2>
          <div className="room-info-grid">
            <div className="info-item">
              <span className="info-label">Rounds:</span>
              <span className="info-value">{room.rounds}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Drawing Time:</span>
              <span className="info-value">{room.drawingTime} seconds</span>
            </div>
            <div className="info-item">
              <span className="info-label">Voting Time:</span>
              <span className="info-value">{room.votingTime} seconds</span>
            </div>
            <div className="info-item">
              <span className="info-label">Room Type:</span>
              <span className="info-value">{room.isPrivate ? "Private" : "Public"}</span>
            </div>
          </div>

          <div className="game-rules">
            <h3>How to Play</h3>
            <ol>
              <li>Each round, you'll be given a prompt to draw</li>
              <li>You have {room.drawingTime} seconds to create your drawing</li>
              <li>After drawing, everyone stars on each other's drawings</li>
              <li>The player with the highest score wins!</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="room-actions">
        <button className="btn btn-secondary" onClick={handleLeaveRoom}>
          Leave Room
        </button>

        {isHost ? (
          <button className="btn btn-primary" onClick={handleStartGame} disabled={players.length < 2}>
            {players.length < 2 ? "Need at least 2 players to start" : "Start Game"}
          </button>
        ) : (
          <div className="waiting-message">Waiting for host to start the game...</div>
        )}
      </div>
    </div>
  )
}

export default WaitingRoomPage
