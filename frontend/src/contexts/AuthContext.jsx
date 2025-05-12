"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { api } from "../services/api"

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem("drawingBattleToken")

        if (token) {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`

          const response = await api.get("/auth/me")
          setCurrentUser(response.data)
        }
      } catch (error) {
        console.error("Auth check failed", error)
        // Clear invalid token
        localStorage.removeItem("drawingBattleToken")
        api.defaults.headers.common["Authorization"] = ""
      } finally {
        setLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  const login = async (username, password) => {
    try {
      const response = await api.post("/auth/login", { username, password })
      const { token, user } = response.data

      localStorage.setItem("drawingBattleToken", token)
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`

      setCurrentUser(user)
      return user
    } catch (error) {
      console.error("Login failed", error)
      throw error
    }
  }

  const register = async (username, password) => {
    try {
      const response = await api.post("/auth/register", { username, password })
      return response.data
    } catch (error) {
      console.error("Registration failed", error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await api.post("/auth/logout")
    } catch (error) {
      console.error("Logout API call failed", error)
    } finally {
      // Always clear local storage and state
      localStorage.removeItem("drawingBattleToken")
      api.defaults.headers.common["Authorization"] = ""
      setCurrentUser(null)
    }
  }

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
