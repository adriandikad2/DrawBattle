"use client"

import { useNavigate } from "react-router-dom"

function RoomCard({ room }) {
  const navigate = useNavigate()

  const isJoinable = room.status === "waiting" && room.players < room.maxPlayers

  const handleJoinRoom = () => {
    if (!isJoinable) return
    navigate(`/room/${room.id}`)
  }

  return (
    <div className={`room-card ${room.status}`}>
      <h3>{room.name}</h3>
      <div className="room-info">
        <p>Host: {room.host}</p>
        <p>
          Players: {room.players}/{room.maxPlayers}
        </p>
        <p className="room-status">
          Status:
          <span className={`status-badge ${room.status}`}>
            {room.status === "waiting"
              ? "Waiting for players"
              : room.status === "playing"
                ? "Game in progress"
                : "Finished"}
          </span>
        </p>
      </div>
      <button className="btn btn-primary" onClick={handleJoinRoom} disabled={!isJoinable}>
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
