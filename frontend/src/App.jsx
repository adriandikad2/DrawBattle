import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "./App.css"

// Pages
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import LobbyPage from "./pages/LobbyPage"
import CreateRoomPage from "./pages/CreateRoomPage"
import JoinRoomPage from "./pages/JoinRoomPage"
import WaitingRoomPage from "./pages/WaitingRoomPage"
import DrawingPage from "./pages/DrawingPage"
import VotingPage from "./pages/VotingPage"
import LeaderboardPage from "./pages/LeaderboardPage"

// Components
import ProtectedRoute from "./components/ProtectedRoute"
import Navbar from "./components/Navbar"

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route
                path="/lobby"
                element={
                  <ProtectedRoute>
                    <LobbyPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/create-room"
                element={
                  <ProtectedRoute>
                    <CreateRoomPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/join-room"
                element={
                  <ProtectedRoute>
                    <JoinRoomPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/room/:roomId"
                element={
                  <ProtectedRoute>
                    <WaitingRoomPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/round/:roomId"
                element={
                  <ProtectedRoute>
                    <DrawingPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/voting/:roomId"
                element={
                  <ProtectedRoute>
                    <VotingPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/leaderboard/:roomId"
                element={
                  <ProtectedRoute>
                    <LeaderboardPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <ToastContainer position="bottom-right" />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
