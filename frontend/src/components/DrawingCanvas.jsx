"use client"

import { useRef, useState, useEffect } from "react"
import "./DrawingCanvas.css"

function DrawingCanvas({ onSave, timeLeft, disabled = false }) {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [ctx, setCtx] = useState(null)
  const [color, setColor] = useState("#000000")
  const [brushSize, setBrushSize] = useState(5)
  const [hasDrawn, setHasDrawn] = useState(false)
  const [autoSubmitted, setAutoSubmitted] = useState(false)
  const [currentTool, setCurrentTool] = useState('brush') // brush, eraser, bucket
  const [brushType, setBrushType] = useState('normal') // normal, spraycan, crayon
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [history, setHistory] = useState([])
  const [currentStep, setCurrentStep] = useState(-1)

  // Color palette
  const colorPalette = {
    primary: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'], // ROY G BIV
    pastel: ['#FFB3B3', '#FFD9B3', '#FFFFB3', '#B3FFB3', '#B3B3FF', '#D9B3FF', '#FFB3FF'], // Pastel ROY G BIV
    monochrome: ['#000000', '#333333', '#666666', '#999999', '#CCCCCC'], // Monochromatic
    earth: ['#8B4513', '#A0522D', '#6B4423', '#8B7355', '#DAA520'] // Brown shades
  }

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

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
      ctx.strokeStyle = currentTool === 'eraser' ? 'white' : color
      ctx.lineWidth = brushSize
    }
  }, [color, brushSize, ctx, currentTool])

  // Auto-submit logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (timeLeft === 0 && !autoSubmitted && hasDrawn) {
        console.log("Auto-submitting drawing as time ran out");
        handleSave();
        setAutoSubmitted(true);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [timeLeft, autoSubmitted, hasDrawn]);

  useEffect(() => {
    if (timeLeft > 3 && !autoSubmitted && !disabled) {
      const backupTimer = setTimeout(() => {
        if (!autoSubmitted) {
          console.log("Auto-submitting drawing as backup before time runs out");
          
          if (!hasDrawn && ctx && canvasRef.current) {
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(canvasRef.current.width / 2, canvasRef.current.height / 2);
            ctx.lineTo(canvasRef.current.width / 2 + 10, canvasRef.current.height / 2 + 10);
            ctx.stroke();
            ctx.closePath();
            setHasDrawn(true);
          }
          
          handleSave();
          setAutoSubmitted(true);
        }
      }, (timeLeft - 2) * 1000);
      
      return () => clearTimeout(backupTimer);
    }
  }, [timeLeft, autoSubmitted, disabled, hasDrawn, ctx]);

  const startDrawing = (e) => {
    if (disabled) return

    setIsDrawing(true)
    setHasDrawn(true)

    if (!ctx) return

    const { x, y } = getCoordinates(e)
    setStartPos({ x, y })

    if (currentTool === 'brush' || currentTool === 'eraser') {
      ctx.beginPath()
      ctx.moveTo(x, y)
    }
  }

  const getCoordinates = (e) => {
    let x, y
    if (e.touches) {
      const rect = canvasRef.current.getBoundingClientRect()
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.nativeEvent.offsetX
      y = e.nativeEvent.offsetY
    }
    return { x, y }
  }

  const draw = (e) => {
    if (!isDrawing || !ctx || disabled) return

    const { x, y } = getCoordinates(e)

    if (currentTool === 'brush' || currentTool === 'eraser') {
      drawWithBrush(x, y)
    } else if (currentTool === 'bucket') {
      bucketFill(Math.floor(x), Math.floor(y), color)
    }
  }

  const drawWithBrush = (x, y) => {
    switch (brushType) {
      case 'normal':
        ctx.lineTo(x, y)
        ctx.stroke()
        break
      case 'spraycan':
        for (let i = 0; i < 20; i++) {
          const offsetX = (Math.random() - 0.5) * brushSize * 2
          const offsetY = (Math.random() - 0.5) * brushSize * 2
          ctx.beginPath()
          ctx.arc(x + offsetX, y + offsetY, 1, 0, Math.PI * 2)
          ctx.fill()
        }
        break
      case 'crayon':
        const angle = Math.random() * Math.PI * 2
        ctx.lineTo(x + Math.cos(angle) * 2, y + Math.sin(angle) * 2)
        ctx.stroke()
        break
    }
  }

  const saveToHistory = () => {
    if (!canvasRef.current) return
    const newHistory = history.slice(0, currentStep + 1)
    newHistory.push(canvasRef.current.toDataURL())
    setHistory(newHistory)
    setCurrentStep(newHistory.length - 1)
  }

  const undo = () => {
    if (currentStep > 0) {
      const img = new Image()
      img.src = history[currentStep - 1]
      img.onload = () => {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        ctx.drawImage(img, 0, 0)
        setCurrentStep(currentStep - 1)
      }
    }
  }

  const redo = () => {
    if (currentStep < history.length - 1) {
      const img = new Image()
      img.src = history[currentStep + 1]
      img.onload = () => {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        ctx.drawImage(img, 0, 0)
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    if (ctx) {
      ctx.closePath()
      saveToHistory()
    }
  }

  const bucketFill = (startX, startY, fillColor) => {
    const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height)
    const pixels = imageData.data

    const startPos = (startY * canvasRef.current.width + startX) * 4
    const startR = pixels[startPos]
    const startG = pixels[startPos + 1]
    const startB = pixels[startPos + 2]

    const fillR = parseInt(fillColor.substr(1, 2), 16)
    const fillG = parseInt(fillColor.substr(3, 2), 16)
    const fillB = parseInt(fillColor.substr(5, 2), 16)

    const stack = [[startX, startY]]

    while (stack.length) {
      const [x, y] = stack.pop()
      const pos = (y * canvasRef.current.width + x) * 4

      if (x < 0 || x >= canvasRef.current.width || y < 0 || y >= canvasRef.current.height) continue
      if (pixels[pos] !== startR || pixels[pos + 1] !== startG || pixels[pos + 2] !== startB) continue
      if (pixels[pos + 3] === 0) continue

      pixels[pos] = fillR
      pixels[pos + 1] = fillG
      pixels[pos + 2] = fillB
      pixels[pos + 3] = 255

      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
    }

    ctx.putImageData(imageData, 0, 0)
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
        {/* Tool Selection */}
        <div className="tool-buttons">
          <button 
            onClick={() => setCurrentTool('brush')}
            className={`tool-btn ${currentTool === 'brush' ? 'active' : ''}`}
            disabled={disabled}
          >
            🖌️
          </button>
          <button 
            onClick={() => setCurrentTool('eraser')}
            className={`tool-btn ${currentTool === 'eraser' ? 'active' : ''}`}
            disabled={disabled}
          >
            🧼
          </button>
          <button 
            onClick={() => setCurrentTool('bucket')}
            className={`tool-btn ${currentTool === 'bucket' ? 'active' : ''}`}
            disabled={disabled}
          >
            🪣
          </button>
          <button
            onClick={undo}
            className="tool-btn"
            disabled={disabled || currentStep <= 0}
          >
            ↩️
          </button>
          <button
            onClick={redo}
            className="tool-btn"
            disabled={disabled || currentStep >= history.length - 1}
          >
            ↪️
          </button>
        </div>

        {/* Brush Type Selection - only visible when brush tool is selected */}
        {currentTool === 'brush' && (
          <div className="brush-types">
            <button 
              onClick={() => setBrushType('normal')}
              className={`brush-type-btn ${brushType === 'normal' ? 'active' : ''}`}
              disabled={disabled}
            >
              🖊️
            </button>
            <button 
              onClick={() => setBrushType('spraycan')}
              className={`brush-type-btn ${brushType === 'spraycan' ? 'active' : ''}`}
              disabled={disabled}
            >
              ✏️
            </button>
            <button 
              onClick={() => setBrushType('crayon')}
              className={`brush-type-btn ${brushType === 'crayon' ? 'active' : ''}`}
              disabled={disabled}
            >
              🖍️
            </button>
          </div>
        )}

        {/* Color Palette */}
        <div className="color-section">
          <h3 className="color-title">Colors</h3>
          <div className="fancy-color-picker">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              disabled={disabled}
            />
            <span className="color-preview" style={{ backgroundColor: color }} />
          </div>
        </div>
        <div className="color-palette">
          {Object.values(colorPalette).flat().map((paletteColor, index) => (
            <button
              key={index}
              className={`color-btn ${color === paletteColor ? 'active' : ''}`}
              style={{ backgroundColor: paletteColor }}
              onClick={() => setColor(paletteColor)}
              disabled={disabled}
            />
          ))}
        </div>

        <div className="brush-size">
          <label htmlFor="brush-size">Size:</label>
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

        <button 
          className="btn btn-secondary" 
          onClick={clearCanvas} 
          disabled={disabled}
        >
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
          <button 
            className="btn btn-primary" 
            onClick={handleSave} 
            disabled={!hasDrawn || (timeLeft === 0 && !autoSubmitted)}
          >
            Submit Drawing
          </button>
        </div>
      )}
    </div>
  )
}

export default DrawingCanvas
