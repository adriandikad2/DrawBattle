"use client"

import { useNavigate } from "react-router-dom"
import { useTheme } from "../contexts/ThemeContext"

function RoomCard({ room }) {
  const navigate = useNavigate()
  const { currentTheme } = useTheme()

  const isJoinable = room.status === "waiting" && room.players < room.maxPlayers

  const handleJoinRoom = () => {
    if (!isJoinable) return
    navigate(`/room/${room.id}`)
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