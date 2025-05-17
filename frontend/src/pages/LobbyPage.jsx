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
    // Add functionality to leave any current room when entering the lobby
    const leaveCurrentRooms = async () => {
      try {
        // Call the leaveAllRooms endpoint to ensure user is not in any room
        await roomService.leaveAllRooms();
        console.log("Successfully left all rooms");
      } catch (error) {
        console.error("Failed to leave rooms:", error);
        // Don't show error to user as this is a silent cleanup operation
      }
    };
    
    // Initial fetch with loading state
    const fetchRoomsInitial = async () => {
      try {
        setLoading(true)
        
        // First leave any rooms the user might be in
        await leaveCurrentRooms();
        
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
