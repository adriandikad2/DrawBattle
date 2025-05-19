"use client"

import { useNavigate } from "react-router-dom"
import { useTheme } from "../contexts/ThemeContext"
import { roomService } from "../services/api"

function RoomCard({ room }) {
  const navigate = useNavigate()
  const { currentTheme } = useTheme()

  const isJoinable = room.status === "waiting" && room.players < room.maxPlayers
  const handleJoinRoom = async () => {
    if (!isJoinable) return
    try {
      // First join the room via API
      await roomService.joinRoom(room.id)
      // Then navigate to room page
      navigate(`/room/${room.id}`)
    } catch (error) {
      console.error("Failed to join room:", error)
      // Show error message using browser alert as we don't have access to toast here
      alert(error.response?.data?.message || "Failed to join room")
    }
  }

  return (
    <div className={`room-card ${room.status} themed-card`}>
      <h3 className="themed-subtitle">{room.name}</h3>
      <div className="room-info">
        <p>Host: {room.host}</p>
        <p>
          Players: {room.players}/{room.maxPlayers}
        </p>
        <p className="room-status">
          Status:
          <span className={`status-badge ${room.status} themed-badge`}>
            {room.status === "waiting"
              ? "Waiting for players"
              : room.status === "playing"
                ? "Game in progress"
                : "Finished"}
          </span>
        </p>
      </div>
      <button 
        className={isJoinable ? "themed-btn" : "btn btn-secondary"} 
        onClick={handleJoinRoom} 
        disabled={!isJoinable}
      >
        {isJoinable
          ? "Join Room"
          : room.status === "playing"
            ? "In Progress"
            : room.players >= room.maxPlayers
              ? "Full"
              : "Unavailable"}
      </button>
    </div>
  )
}

export default RoomCard