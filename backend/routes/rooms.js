const express = require("express")
const { v4: uuidv4 } = require("uuid")
const { pool } = require("../config/db")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Get all public rooms
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.id, r.name, r.host_id, r.max_players, r.status, r.is_private,
              u.username as host_name,
              COUNT(DISTINCT rp.user_id) as player_count
       FROM rooms r
       JOIN users u ON r.host_id = u.id
       LEFT JOIN room_players rp ON r.id = rp.room_id
       WHERE r.is_private = false
       GROUP BY r.id, u.username
       ORDER BY r.created_at DESC`,
    )

    const rooms = result.rows.map((room) => ({
      id: room.id,
      name: room.name,
      host: room.host_name,
      hostId: room.host_id,
      players: Number.parseInt(room.player_count),
      maxPlayers: room.max_players,
      status: room.status,
      isPrivate: room.is_private,
    }))

    res.json(rooms)
  } catch (error) {
    console.error("Get rooms error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create a new room
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, maxPlayers, drawingTime, votingTime, rounds, isPrivate } = req.body
    const userId = req.user.id

    // Validate input
    if (!name) {
      return res.status(400).json({ message: "Room name is required" })
    }

    // Generate a unique room code (6 characters)
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    // Create room
    const roomResult = await pool.query(
      `INSERT INTO rooms (
        id, name, host_id, max_players, drawing_time, voting_time, rounds, is_private, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,      [
        roomCode,
        name,
        userId,
        maxPlayers || 6,
        drawingTime || 120,  // Changed from 60 to 120 seconds
        votingTime || 20,    // Changed from 15 to 20 seconds
        rounds || 3,
        isPrivate || false,
        "waiting",
      ],
    )

    const room = roomResult.rows[0]

    // Add host as a player
    await pool.query("INSERT INTO room_players (room_id, user_id) VALUES ($1, $2)", [room.id, userId])

    res.status(201).json({
      id: room.id,
      name: room.name,
      hostId: room.host_id,
      maxPlayers: room.max_players,
      drawingTime: room.drawing_time,
      votingTime: room.voting_time,
      rounds: room.rounds,
      isPrivate: room.is_private,
      status: room.status,
    })
  } catch (error) {
    console.error("Create room error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get room details
router.get("/:roomId", authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params
    const userId = req.user.id

    // Get room details
    const roomResult = await pool.query("SELECT * FROM rooms WHERE id = $1", [roomId])

    if (roomResult.rows.length === 0) {
      return res.status(404).json({ message: "Room not found" })
    }

    const room = roomResult.rows[0]

    // Get players in the room
    const playersResult = await pool.query(
      `SELECT u.id, u.username
       FROM room_players rp
       JOIN users u ON rp.user_id = u.id
       WHERE rp.room_id = $1
       ORDER BY rp.joined_at ASC`,
      [roomId],
    )

    // Check if user is in the room
    const isInRoom = playersResult.rows.some((player) => player.id === userId)

    // If room is private and user is not in the room, deny access
    if (room.is_private && !isInRoom) {
      return res.status(403).json({ message: "Access denied to private room" })
    }

    res.json({
      room: {
        id: room.id,
        name: room.name,
        hostId: room.host_id,
        maxPlayers: room.max_players,
        drawingTime: room.drawing_time,
        votingTime: room.voting_time,
        rounds: room.rounds,
        isPrivate: room.is_private,
        status: room.status,
        currentRound: room.current_round,
      },
      players: playersResult.rows,
    })
  } catch (error) {
    console.error("Get room details error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Join a room
router.post("/:roomId/join", authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params
    const userId = req.user.id

    // Check if room exists
    const roomResult = await pool.query("SELECT * FROM rooms WHERE id = $1", [roomId])

    if (roomResult.rows.length === 0) {
      return res.status(404).json({ message: "Room not found" })
    }

    const room = roomResult.rows[0]

    // Check if game is already in progress
    if (room.status !== "waiting") {
      return res.status(400).json({ message: "Game is already in progress" })
    }

    // Check if room is full
    const playerCountResult = await pool.query("SELECT COUNT(*) FROM room_players WHERE room_id = $1", [roomId])

    const playerCount = Number.parseInt(playerCountResult.rows[0].count)
    if (playerCount >= room.max_players) {
      return res.status(400).json({ message: "Room is full" })
    }

    // Check if user is already in the room
    const existingPlayerResult = await pool.query("SELECT * FROM room_players WHERE room_id = $1 AND user_id = $2", [
      roomId,
      userId,
    ])

    if (existingPlayerResult.rows.length > 0) {
      return res.json({ message: "Already in room" })
    }

    // Check if user is in any other rooms and remove them first
    const otherRoomsResult = await pool.query("SELECT room_id FROM room_players WHERE user_id = $1 AND room_id != $2", [
      userId, 
      roomId
    ])
    
    if (otherRoomsResult.rows.length > 0) {
      // Remove user from all other rooms
      for (const row of otherRoomsResult.rows) {
        const otherRoomId = row.room_id;
        
        // For each room, check if the user is the host
        const hostCheckResult = await pool.query("SELECT host_id FROM rooms WHERE id = $1", [otherRoomId]);
        
        if (hostCheckResult.rows.length > 0 && hostCheckResult.rows[0].host_id === userId) {
          // Find new host
          const newHostResult = await pool.query(
            `SELECT user_id FROM room_players 
             WHERE room_id = $1 AND user_id != $2
             ORDER BY joined_at ASC 
             LIMIT 1`,
            [otherRoomId, userId]
          );
          
          if (newHostResult.rows.length > 0) {
            // Assign new host
            await pool.query("UPDATE rooms SET host_id = $1 WHERE id = $2", 
              [newHostResult.rows[0].user_id, otherRoomId]
            );
          } else {
            // No other players, delete the room
            await pool.query("DELETE FROM rooms WHERE id = $1", [otherRoomId]);
          }
        }
      }
      
      // Remove user from all other rooms
      await pool.query("DELETE FROM room_players WHERE user_id = $1 AND room_id != $2", [
        userId, 
        roomId
      ]);
    }

    // Add user to room
    await pool.query("INSERT INTO room_players (room_id, user_id) VALUES ($1, $2)", [roomId, userId])

    res.json({ message: "Joined room successfully" })
  } catch (error) {
    console.error("Join room error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Leave a room
router.post("/:roomId/leave", authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params
    const userId = req.user.id

    // Check if room exists
    const roomResult = await pool.query("SELECT * FROM rooms WHERE id = $1", [roomId])

    if (roomResult.rows.length === 0) {
      return res.status(404).json({ message: "Room not found" })
    }

    const room = roomResult.rows[0]

    // Remove user from room
    await pool.query("DELETE FROM room_players WHERE room_id = $1 AND user_id = $2", [roomId, userId])

    // If user is the host, either assign a new host or delete the room
    if (room.host_id === userId) {
      // Find another player to be the host
      const newHostResult = await pool.query(
        `SELECT user_id FROM room_players 
         WHERE room_id = $1 
         ORDER BY joined_at ASC 
         LIMIT 1`,
        [roomId],
      )

      if (newHostResult.rows.length > 0) {
        // Assign new host
        await pool.query("UPDATE rooms SET host_id = $1 WHERE id = $2", [newHostResult.rows[0].user_id, roomId])
      } else {
        // No players left, delete the room
        await pool.query("DELETE FROM rooms WHERE id = $1", [roomId])
      }
    }

    res.json({ message: "Left room successfully" })
  } catch (error) {
    console.error("Leave room error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Leave all rooms (used when going to lobby to ensure user is not in multiple rooms)
router.post("/leave-all", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id

    // Get all rooms where the user is a player
    const roomsResult = await pool.query(
      `SELECT rp.room_id, r.host_id
       FROM room_players rp
       JOIN rooms r ON rp.room_id = r.id
       WHERE rp.user_id = $1`,
      [userId]
    )

    if (roomsResult.rows.length === 0) {
      return res.json({ message: "Not in any rooms" })
    }

    // Remove user from all rooms
    await pool.query("DELETE FROM room_players WHERE user_id = $1", [userId])

    // For each room where the user was the host, reassign host or delete room
    for (const room of roomsResult.rows) {
      if (room.host_id === userId) {
        // Find another player to be the host
        const newHostResult = await pool.query(
          `SELECT user_id FROM room_players 
           WHERE room_id = $1 
           ORDER BY joined_at ASC 
           LIMIT 1`,
          [room.room_id]
        )

        if (newHostResult.rows.length > 0) {
          // Assign new host
          await pool.query("UPDATE rooms SET host_id = $1 WHERE id = $2", 
            [newHostResult.rows[0].user_id, room.room_id]
          )
        } else {
          // No players left, delete the room
          await pool.query("DELETE FROM rooms WHERE id = $1", [room.room_id])
        }
      }
    }

    res.json({ message: "Left all rooms successfully" })
  } catch (error) {
    console.error("Leave all rooms error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Start a game
router.post("/:roomId/start", authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params
    const userId = req.user.id

    // Check if room exists
    const roomResult = await pool.query("SELECT * FROM rooms WHERE id = $1", [roomId])

    if (roomResult.rows.length === 0) {
      return res.status(404).json({ message: "Room not found" })
    }

    const room = roomResult.rows[0]

    // Check if user is the host
    if (room.host_id !== userId) {
      return res.status(403).json({ message: "Only the host can start the game" })
    }

    // Check if game is already in progress
    if (room.status !== "waiting") {
      return res.status(400).json({ message: "Game is already in progress" })
    }

    // Check if there are enough players
    const playerCountResult = await pool.query("SELECT COUNT(*) FROM room_players WHERE room_id = $1", [roomId])

    const playerCount = Number.parseInt(playerCountResult.rows[0].count)
    if (playerCount < 2) {
      return res.status(400).json({ message: "Need at least 2 players to start" })
    }

    // Get a random prompt for the first round
    const promptResult = await pool.query("SELECT * FROM prompts ORDER BY RANDOM() LIMIT 1")

    if (promptResult.rows.length === 0) {
      return res.status(500).json({ message: "No prompts available" })
    }

    const prompt = promptResult.rows[0]

    // Start the game
    await pool.query(
      `UPDATE rooms SET 
        status = 'playing', 
        current_round = 1, 
        current_phase = 'drawing', 
        current_prompt_id = $1,
        phase_end_time = NOW() + (drawing_time * INTERVAL '1 second')
      WHERE id = $2`,
      [prompt.id, roomId],
    )

    res.json({ message: "Game started successfully" })
  } catch (error) {
    console.error("Start game error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
