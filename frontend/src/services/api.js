import axios from "axios"

// Create axios instance with base URL
export const api = axios.create({
  baseURL: import.meta.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("drawingBattleToken")
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Room related API calls
export const roomService = {
  getRooms: () => api.get("/rooms"),

  createRoom: (roomData) => api.post("/rooms", roomData),

  joinRoom: (roomId) => api.post(`/rooms/${roomId}/join`),

  leaveRoom: (roomId) => api.post(`/rooms/${roomId}/leave`),
  
  leaveAllRooms: () => api.post(`/rooms/leave-all`),

  startGame: (roomId) => api.post(`/rooms/${roomId}/start`),

  getRoomDetails: (roomId) => api.get(`/rooms/${roomId}`),
}

// Game related API calls
export const gameService = {
  submitDrawing: (roomId, drawingData) => {
    // Convert base64 image to file
    const formData = new FormData()

    // Extract base64 data
    const base64Data = drawingData.split(",")[1]
    const blob = b64toBlob(base64Data, "image/png")

    formData.append("drawing", blob, "drawing.png")
    formData.append("roomId", roomId)

    return api.post(`/game/${roomId}/submit-drawing`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  },


  getUserDrawings: (userId) => api.get(`/game/user/${userId}/drawings`),
  getDrawingToVote: (roomId) => api.get(`/game/${roomId}/drawing-to-vote`),

  submitVote: (drawingId, rating) => api.post(`/game/vote`, { drawingId, rating }),

  getLeaderboard: (roomId) => api.get(`/game/${roomId}/leaderboard`),

  getGameState: (roomId) => api.get(`/game/${roomId}/state`),
}

// Helper function to convert base64 to blob
function b64toBlob(b64Data, contentType = "", sliceSize = 512) {
  const byteCharacters = atob(b64Data)
  const byteArrays = []

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize)

    const byteNumbers = new Array(slice.length)
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)
    byteArrays.push(byteArray)
  }

  const blob = new Blob(byteArrays, { type: contentType })
  return blob
}
