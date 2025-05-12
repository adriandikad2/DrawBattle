"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { roomService } from "../services/api"
import { toast } from "react-toastify"

function CreateRoomPage() {
  const [roomName, setRoomName] = useState("")
  const [maxPlayers, setMaxPlayers] = useState(6)
  const [drawingTime, setDrawingTime] = useState(60)
  const [votingTime, setVotingTime] = useState(15)
  const [rounds, setRounds] = useState(3)
  const [isPrivate, setIsPrivate] = useState(false)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!roomName.trim()) {
      toast.error("Please enter a room name")
      return
    }

    setLoading(true)
    try {
      const response = await roomService.createRoom({
        name: roomName,
        maxPlayers,
        drawingTime,
        votingTime,
        rounds,
        isPrivate,
      })

      toast.success("Room created successfully!")
      navigate(`/room/${response.data.id}`)
    } catch (error) {
      console.error("Failed to create room", error)
      toast.error(error.response?.data?.message || "Failed to create room. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-room-page">
      <div className="page-header">
        <h1>Create a New Room</h1>
        <Link to="/lobby" className="btn btn-secondary">
          Back to Lobby
        </Link>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="roomName">Room Name</label>
            <input
              type="text"
              id="roomName"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name"
              disabled={loading}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="maxPlayers">Max Players</label>
              <select
                id="maxPlayers"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
                disabled={loading}
              >
                {[2, 3, 4, 5, 6, 8, 10, 12].map((num) => (
                  <option key={num} value={num}>
                    {num} Players
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="rounds">Number of Rounds</label>
              <select id="rounds" value={rounds} onChange={(e) => setRounds(Number(e.target.value))} disabled={loading}>
                {[1, 2, 3, 5, 10].map((num) => (
                  <option key={num} value={num}>
                    {num} Round{num !== 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="drawingTime">Drawing Time (seconds)</label>
              <select
                id="drawingTime"
                value={drawingTime}
                onChange={(e) => setDrawingTime(Number(e.target.value))}
                disabled={loading}
              >
                <option value={30}>30 seconds</option>
                <option value={60}>1 minute</option>
                <option value={120}>2 minutes</option>
                <option value={180}>3 minutes</option>
                <option value={300}>5 minutes</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="votingTime">Voting Time (seconds)</label>
              <select
                id="votingTime"
                value={votingTime}
                onChange={(e) => setVotingTime(Number(e.target.value))}
                disabled={loading}
              >
                <option value={10}>10 seconds</option>
                <option value={15}>15 seconds</option>
                <option value={20}>20 seconds</option>
                <option value={30}>30 seconds</option>
              </select>
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                disabled={loading}
              />
              Private Room (only accessible with room code)
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Creating Room..." : "Create Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateRoomPage
