"use client"

import { useEffect, useState } from "react"

function Timer({ seconds, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(seconds)

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onComplete) onComplete()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, onComplete])

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const percentage = (timeLeft / seconds) * 100

  return (
    <div className="timer-container">
      <div className="timer-progress-bar">
        <div className="timer-progress" style={{ width: `${percentage}%` }}></div>
      </div>
      <div className="timer-text">{formatTime(timeLeft)}</div>
    </div>
  )
}

export default Timer
