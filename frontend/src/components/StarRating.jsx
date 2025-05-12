"use client"

import { useState } from "react"

function StarRating({ onRate, disabled = false }) {
  const [hoveredRating, setHoveredRating] = useState(0)
  const [selectedRating, setSelectedRating] = useState(0)

  const handleRating = (rating) => {
    if (disabled) return

    setSelectedRating(rating)
    onRate(rating)
  }

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          className={`star-button ${
            hoveredRating >= star || selectedRating >= star ? "active" : ""
          } ${disabled ? "disabled" : ""}`}
          onClick={() => handleRating(star)}
          onMouseEnter={() => setHoveredRating(star)}
          onMouseLeave={() => setHoveredRating(0)}
          disabled={disabled}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export default StarRating
