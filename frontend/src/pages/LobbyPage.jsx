"use client"

import { useState, useEffect, useRef } from "react"
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
    // Only leave all rooms when actually navigating to lobby-related paths
    const lobbyPaths = ['/', '/create-room', '/join-room'];
    if (lobbyPaths.includes(window.location.pathname)) {
      // Use localStorage instead of sessionStorage to persist across refreshes
      if (!localStorage.getItem('didLeaveRooms')) {
        roomService.leaveAllRooms()
          .then(() => console.log("Successfully left all rooms"))
          .catch((error) => console.error("Failed to leave rooms:", error));
        localStorage.setItem('didLeaveRooms', 'true');
      }
    }

    // Initial fetch with loading state
    const fetchRoomsInitial = async () => {
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

    // Silent refresh for polling
    const fetchRoomsSilent = async () => {
      try {
        const response = await roomService.getRooms()
        setRooms(response.data)
        setError(null)
      } catch (error) {
        console.error("Failed to poll rooms", error)
        // Don't show error toast on silent refresh failures
      }
    }

    // Initial load
    fetchRoomsInitial()

    // Poll for room updates every 10 seconds without showing loading state
    const interval = setInterval(fetchRoomsSilent, 10000)
    // On unmount, clear the flag so it works on next navigation
    return () => {
      clearInterval(interval);
      // Only remove the flag if we're in lobby-related paths
      if (lobbyPaths.includes(window.location.pathname)) {
        localStorage.removeItem('didLeaveRooms');
      }
    }
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
