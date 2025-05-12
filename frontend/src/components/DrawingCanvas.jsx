"use client"

import { useRef, useState, useEffect } from "react"

function DrawingCanvas({ onSave, timeLeft, disabled = false }) {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [ctx, setCtx] = useState(null)
  const [color, setColor] = useState("#000000")
  const [brushSize, setBrushSize] = useState(5)
  const [hasDrawn, setHasDrawn] = useState(false)
  const [autoSubmitted, setAutoSubmitted] = useState(false)

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const context = canvas.getContext("2d")
    if (context) {
      context.lineCap = "round"
      context.lineJoin = "round"
      context.strokeStyle = color
      context.lineWidth = brushSize
      setCtx(context)

      // Set white background
      context.fillStyle = "white"
      context.fillRect(0, 0, canvas.width, canvas.height)
    }

    // Handle window resize
    const handleResize = () => {
      if (!context) return

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      context.fillStyle = "white"
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.putImageData(imageData, 0, 0)

      context.lineCap = "round"
      context.lineJoin = "round"
      context.strokeStyle = color
      context.lineWidth = brushSize
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Update brush properties when they change
  useEffect(() => {
    if (ctx) {
      ctx.strokeStyle = color
      ctx.lineWidth = brushSize
    }
  }, [color, brushSize, ctx])

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && !autoSubmitted && hasDrawn) {
      handleSave()
      setAutoSubmitted(true)
    }
  }, [timeLeft, autoSubmitted, hasDrawn])

  const startDrawing = (e) => {
    if (disabled) return

    setIsDrawing(true)
    setHasDrawn(true)

    if (!ctx) return

    let x, y

    if (e.touches) {
      // Touch event
      const rect = canvasRef.current.getBoundingClientRect()
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      // Mouse event
      x = e.nativeEvent.offsetX
      y = e.nativeEvent.offsetY
    }

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e) => {
    if (!isDrawing || !ctx || disabled) return

    let x, y

    if (e.touches) {
      // Touch event
      const rect = canvasRef.current.getBoundingClientRect()
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      // Mouse event
      x = e.nativeEvent.offsetX
      y = e.nativeEvent.offsetY
    }

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    if (ctx) {
      ctx.closePath()
    }
  }

  const clearCanvas = () => {
    if (!ctx || !canvasRef.current || disabled) return

    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    setHasDrawn(false)
  }

  const handleSave = () => {
    if (!canvasRef.current) return

    const drawingData = canvasRef.current.toDataURL("image/png")
    onSave(drawingData)
  }

  return (
    <div className="drawing-canvas-container">
      <div className="drawing-tools">
        <div className="color-picker">
          <label htmlFor="color">Color:</label>
          <input type="color" id="color" value={color} onChange={(e) => setColor(e.target.value)} disabled={disabled} />
        </div>

        <div className="brush-size">
          <label htmlFor="brush-size">Brush Size:</label>
          <input
            type="range"
            id="brush-size"
            min="1"
            max="30"
            value={brushSize}
            onChange={(e) => setBrushSize(Number.parseInt(e.target.value))}
            disabled={disabled}
          />
        </div>

        <button className="btn btn-secondary" onClick={clearCanvas} disabled={disabled}>
          Clear Canvas
        </button>
      </div>

      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={`drawing-canvas ${disabled ? "disabled" : ""}`}
        />
      </div>

      {!disabled && (
        <div className="canvas-actions">
          <button className="btn btn-primary" onClick={handleSave} disabled={!hasDrawn || timeLeft === 0}>
            Submit Drawing
          </button>
        </div>
      )}
    </div>
  )
}

export default DrawingCanvas
