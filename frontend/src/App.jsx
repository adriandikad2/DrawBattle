import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { ThemeProvider } from "./contexts/ThemeContext"
import { ToastContainer } from "react-toastify"
import { AnimatePresence } from "framer-motion"
import "react-toastify/dist/ReactToastify.css"
import "./App.css"
import "./styles/Theme.css"

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
import PageTransition from "./components/PageTransition"

// AnimatedRoutes component to handle route transitions
function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <PageTransition key={location.pathname}>
        <Routes location={location}>
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
      </PageTransition>
    </AnimatePresence>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ThemeProvider>
          <div className="app-container">
            <Navbar />
            <main className="main-content">
              <AnimatedRoutes />
            </main>
            <ToastContainer position="bottom-right" />
          </div>
        </ThemeProvider>
      </Router>
    </AuthProvider>
  )
}

export default App
