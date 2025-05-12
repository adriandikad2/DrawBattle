"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { gameService } from "../services/api"
import { toast } from "react-toastify"

function LeaderboardPage() {
  const { roomId } = useParams()
  const navigate = useNavigate()

  const [leaderboard, setLeaderboard] = useState([])
  const [drawings, setDrawings] = useState([])
  const [roomDetails, setRoomDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        const response = await gameService.getLeaderboard(roomId)

        setLeaderboard(response.data.players)
        setDrawings(response.data.drawings)
        setRoomDetails(response.data.room)
        setError(null)
      } catch (error) {
        console.error("Failed to fetch leaderboard", error)
        setError("Failed to load leaderboard. Please try again.")
        toast.error("Failed to load leaderboard")
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [roomId])

  if (loading) {
    return <div className="loading">Loading results...</div>
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

  // Find the winner (player with highest score)
  const winner = leaderboard.length > 0 ? leaderboard[0] : null

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-header">
        <h1>Game Results</h1>
        {roomDetails && (
          <div className="room-info">
            <p>Room: {roomDetails.name}</p>
            <p>Rounds: {roomDetails.rounds}</p>
          </div>
        )}
      </div>

      {winner && (
        <div className="winner-announcement">
          <div className="winner-crown">👑</div>
          <h2>Winner: {winner.username}</h2>
          <p>Score: {winner.score} points</p>
        </div>
      )}

      <div className="leaderboard-section">
        <h2>Final Standings</h2>
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((player, index) => (
              <tr key={player.id} className={index === 0 ? "winner-row" : ""}>
                <td>{index + 1}</td>
                <td>{player.username}</td>
                <td>{player.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="drawings-gallery">
        <h2>All Drawings</h2>
        <div className="gallery-grid">
          {drawings.map((drawing) => {
            const artist = leaderboard.find((p) => p.id === drawing.artistId)
            const artistRank = artist ? leaderboard.findIndex((p) => p.id === artist.id) + 1 : "N/A"

            return (
              <div key={drawing.id} className="gallery-item">
                <img
                  src={drawing.imageUrl || "/placeholder.svg"}
                  alt={`Drawing by ${drawing.artistName}`}
                  className="gallery-image"
                />
                <div className="gallery-info">
                  <p>Prompt: {drawing.prompt}</p>
                  <p>
                    Artist: {drawing.artistName} (#{artistRank})
                  </p>
                  <p>Rating: {drawing.averageRating.toFixed(1)} / 5</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="leaderboard-actions">
        <Link to="/lobby" className="btn btn-primary">
          Return to Lobby
        </Link>
      </div>
    </div>
  )
}

export default LeaderboardPage
