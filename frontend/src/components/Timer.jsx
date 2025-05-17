"use client"

import { useEffect, useState } from "react"

function Timer({ seconds, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(seconds)
  const [startTime, setStartTime] = useState(Date.now())
  const [hasCompletedCalled, setHasCompletedCalled] = useState(false)

  // Update timeLeft when seconds prop changes significantly
  // This prevents small fluctuations due to polling from restarting the timer
  useEffect(() => {
    // If the new seconds is significantly different (more than 2 seconds)
    // or if it's a larger value than our current timeLeft, update the timer
    if (Math.abs(seconds - timeLeft) > 2 || seconds > timeLeft) {
      console.log(`Timer received new time: ${seconds} seconds`);
      setTimeLeft(Math.max(1, seconds));
      setStartTime(Date.now());
      setHasCompletedCalled(false);
    }
  }, [seconds]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onComplete && !hasCompletedCalled) {
        onComplete();
        setHasCompletedCalled(true);
      }
      return;
    }

    const timer = setInterval(() => {
      // Calculate elapsed time since last update
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const newTimeLeft = Math.max(0, seconds - elapsed);
      
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft <= 0 && onComplete && !hasCompletedCalled) {
        onComplete();
        setHasCompletedCalled(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete, startTime, seconds, hasCompletedCalled]);

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
