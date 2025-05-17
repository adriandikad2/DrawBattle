"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { roomService } from "../services/api"
import { toast } from "react-toastify"
import { useTheme } from "../contexts/ThemeContext"
import RoomCard from "../components/RoomCard"

function LobbyPage() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { currentTheme } = useTheme()

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true)
        const response = await roomService.getRooms()
        setRooms(response.data)
        setError(null)
      } catch (error) {
        console.error("Failed to fetch rooms", error)
        setError("Failed to load rooms. Please try again.")
        toast.error("Failed to load rooms")
      } finally {
        setLoading(false)
      }
    }

    fetchRooms()

    // Poll for room updates every 10 seconds
    const interval = setInterval(fetchRooms, 10000)
    return () => clearInterval(interval)
  }, [])
  return (
    <div className={`lobby-page ${currentTheme}`}>
      <div className="lobby-header themed-section">
        <h1 className="themed-title">Game Lobby</h1>
        <div className="lobby-actions">
          <Link to="/create-room" className="themed-btn">
            Create Room
          </Link>
          <Link to="/join-room" className="btn btn-secondary">
            Join with Code
          </Link>
        </div>
      </div>

      {loading && <div className="loading">Loading rooms...</div>}

      {error && <div className="error-message">{error}</div>}

      {!loading && !error && (
        <div className="room-grid">
          {rooms.length > 0 ? (
            rooms.map((room) => <RoomCard key={room.id} room={room} />)
          ) : (
            <div className="no-rooms themed-card">
              <p>No active rooms found.</p>
              <p>Create a room to get started!</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default LobbyPage
