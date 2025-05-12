"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { roomService } from "../services/api"
import { toast } from "react-toastify"

function JoinRoomPage() {
  const [roomCode, setRoomCode] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!roomCode.trim()) {
      toast.error("Please enter a room code")
      return
    }

    setLoading(true)
    try {
      await roomService.joinRoom(roomCode)
      navigate(`/room/${roomCode}`)
    } catch (error) {
      console.error("Failed to join room", error)
      toast.error(error.response?.data?.message || "Failed to join room. Invalid code or room is full.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="join-room-page">
      <div className="page-header">
        <h1>Join a Room</h1>
        <Link to="/lobby" className="btn btn-secondary">
          Back to Lobby
        </Link>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="roomCode">Room Code</label>
            <input
              type="text"
              id="roomCode"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-digit code"
              className="room-code-input"
              maxLength={6}
              disabled={loading}
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Joining..." : "Join Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default JoinRoomPage
