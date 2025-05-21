"use client"

import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"
import { motion } from "framer-motion"
import { useEffect, useRef } from "react"
import { useInView } from 'react-intersection-observer'
import { FaPencilAlt, FaVoteYea, FaTrophy, FaPalette, FaUserFriends, FaChartLine } from 'react-icons/fa'
import './HomePage.css'
import '../styles/PageStyles.css'

// Importing pictures of collaborators
import adrian from '../assets/adrian.jpg';
import ifan from '../assets/ifan.JPG';
import grace from '../assets/grace.jpg';
import rafif from '../assets/rafif.jpg';

// --- Canvas Drawing Logic ---
const canvasColors = {
  red: '#f43f5e',
  blue: '#3b82f6',
  green: '#22c55e',
  yellow: '#eab308',
  purple: '#8b5cf6',
  pink: '#ec4899'
};

// Helper function to draw grid
function drawGrid(ctx, width, height) {
  ctx.strokeStyle = 'rgba(230, 230, 230, 0.4)';
  ctx.lineWidth = 1;

  for (let x = 0; x <= width; x += 20) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = 0; y <= height; y += 20) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

// Draw center circle
function drawCircle(ctx, element, time) {
  ctx.beginPath();
  const pulseRadius = element.radius + Math.sin(time * 2) * 2;

  ctx.arc(element.x, element.y, pulseRadius, 0, Math.PI * 2);
  ctx.fillStyle = element.color;
  ctx.fill();

  const gradient = ctx.createRadialGradient(
    element.x, element.y, 0,
    element.x, element.y, pulseRadius * 1.5
  );
  gradient.addColorStop(0, element.color + 'cc');
  gradient.addColorStop(1, element.color + '00');

  ctx.beginPath();
  ctx.arc(element.x, element.y, pulseRadius * 1.5, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();
}

// Draw flower petal
function drawPetal(ctx, element, time) {
  const angle = element.angle * Math.PI / 180;
  const wobble = Math.sin(time * 3 + element.angle / 30) * 5;
  const petalLength = 60 + wobble;

  ctx.save();
  ctx.translate(element.x, element.y);
  ctx.rotate(angle);

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(15, -15, 30, -30, 0, -petalLength);
  ctx.bezierCurveTo(-30, -30, -15, -15, 0, 0);
  ctx.fillStyle = element.color;
  ctx.fill();

  ctx.restore();
}

// Draw flower stem
function drawStem(ctx, element, time) {
  const stemWobble = Math.sin(time * 2) * 5;
  const stemLength = 150; // Fixed stem length

  ctx.beginPath();
  ctx.moveTo(element.x, element.y + 15);
  ctx.bezierCurveTo(
    element.x + stemWobble, element.y + 50,
    element.x - stemWobble, element.y + 100,
    element.x, element.y + stemLength
  );
  ctx.strokeStyle = element.color;
  ctx.lineWidth = 6;
  ctx.stroke();

  const leafTime = time * 3;
  const leafSize = 20 + Math.sin(leafTime) * 3;
  const leafPosition = Math.min(stemLength - 60, 90); // Position leaf higher up on short stems

  ctx.beginPath();
  ctx.moveTo(element.x, element.y + leafPosition);
  ctx.bezierCurveTo(
    element.x + leafSize, element.y + (leafPosition - 15) + Math.sin(leafTime) * 5,
    element.x + leafSize, element.y + (leafPosition + 15) + Math.sin(leafTime) * 5,
    element.x, element.y + leafPosition + 20
  );
  ctx.bezierCurveTo(
    element.x - leafSize / 2, element.y + (leafPosition + 10) + Math.sin(leafTime) * 3,
    element.x - leafSize / 2, element.y + leafPosition + Math.sin(leafTime) * 3,
    element.x, element.y + leafPosition
  );
  ctx.fillStyle = element.color;
  ctx.fill();
}

// Draw the flower theme
function drawTheme(ctx, theme, time) {
  theme.elements.forEach((element) => {
    switch (element.type) {
      case 'circle':
        drawCircle(ctx, element, time);
        break;
      case 'petal':
        drawPetal(ctx, element, time);
        break;
      case 'stem':
        drawStem(ctx, element, time);
        break;
    }
  });
}

// Draw animated bee
function drawBee(ctx, centerX, centerY, time) {
  // Make bee orbit radius responsive to canvas size
  const beeOrbitRadius = Math.min(70, Math.min(centerX, centerY) / 2);
  const beeAngle = time * 0.8; // Speed of orbit
  const verticalOffset = Math.min(80, centerY / 2); // Prevent bee from flying off canvas
  const beeX = centerX + Math.cos(beeAngle) * beeOrbitRadius;
  const beeY = centerY - verticalOffset + Math.sin(beeAngle) * beeOrbitRadius / 2; // Elliptical orbit, and offset to be above flower

  const beeSize = 10;
  const wingFlap = Math.sin(time * 20) * 3; // Wing flap speed

  ctx.save();
  ctx.translate(beeX, beeY);
  ctx.rotate(Math.sin(time * 0.8 + Math.PI/2) * 0.1); // Slight body rotation/wobble

  // Bee body (yellow)
  ctx.fillStyle = canvasColors.yellow;
  ctx.beginPath();
  ctx.ellipse(0, 0, beeSize * 1.2, beeSize * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Bee stripes (black)
  ctx.fillStyle = '#000000';
  for (let i = -1; i <= 1; i += 2) {
    ctx.beginPath();
    ctx.ellipse(beeSize * 0.3 * i, 0, beeSize * 0.2, beeSize * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Bee head (black)
  ctx.beginPath();
  ctx.arc(-beeSize * 1.1, 0, beeSize * 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Wings (semi-transparent white/light blue)
  ctx.fillStyle = 'rgba(173,216,230,0.7)'; // Light blue with transparency
  
  // Left Wing
  ctx.beginPath();
  ctx.ellipse(-beeSize * 0.2, -beeSize * 0.7 + wingFlap, beeSize * 0.8, beeSize * 0.5, Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();

  // Right Wing
  ctx.beginPath();
  ctx.ellipse(beeSize * 0.2, -beeSize * 0.7 + wingFlap, beeSize * 0.8, beeSize * 0.5, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Draw Colorful Orbs
function drawColorfulOrbs(ctx, width, height, time) {
  // Calculate positions relative to center to keep orbs balanced
  const centerX = width / 2;
  const centerY = height / 2;
  
  const orbs = [
    { id: 1, baseX: centerX - (width * 0.3), baseY: centerY - (height * 0.2), radius: 25, color: canvasColors.pink, speedX: 0.3, speedY: 0.2, phase: 0 },
    { id: 2, baseX: centerX + (width * 0.3), baseY: centerY - (height * 0.1), radius: 30, color: canvasColors.blue, speedX: -0.2, speedY: 0.3, phase: Math.PI / 2 },
    { id: 3, baseX: centerX, baseY: centerY + (height * 0.2), radius: 20, color: canvasColors.yellow, speedX: 0.25, speedY: -0.25, phase: Math.PI },
    { id: 4, baseX: centerX - (width * 0.2), baseY: centerY + (height * 0.1), radius: 15, color: canvasColors.green, speedX: -0.15, speedY: -0.3, phase: Math.PI * 1.5 },
    { id: 5, baseX: centerX + (width * 0.2), baseY: centerY - (height * 0.3), radius: 22, color: canvasColors.purple, speedX: 0.35, speedY: 0.15, phase: Math.PI * 0.8 },
  ];

  orbs.forEach(orb => {
    const x = orb.baseX + Math.sin(time * orb.speedX + orb.phase) * 30; // Horizontal sway
    const y = orb.baseY + Math.cos(time * orb.speedY + orb.phase) * 20; // Vertical sway
    const pulse = Math.sin(time * 2 + orb.id) * 0.1 + 1; // Slight pulsing effect

    ctx.beginPath();
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, orb.radius * pulse);
    gradient.addColorStop(0, orb.color + 'aa'); // More transparent center
    gradient.addColorStop(0.8, orb.color + '88');
    gradient.addColorStop(1, orb.color + '00'); // Transparent edge

    ctx.fillStyle = gradient;
    ctx.arc(x, y, orb.radius * pulse, 0, Math.PI * 2);
    ctx.fill();
  });
}

// --- End Canvas Drawing Logic ---

function HomePage() {
  const { currentUser } = useAuth()
  // InView hooks for scroll animations
  const [stepsRef, stepsInView] = useInView({ triggerOnce: true, threshold: 0.1 })
  const [featuresRef, featuresInView] = useInView({ triggerOnce: true, threshold: 0.1 })

  // Canvas reference for animations
  const canvasRef = useRef(null)

  // Button animation variants with reduced effect
  const buttonVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.03,
      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
    },
    tap: { scale: 0.98 }
  }
  
  // Step cards animation variants
  const stepItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  }
  
  // Features animation variants
  const featureVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    },
    hover: {
      y: -5,
      transition: { duration: 0.2 }
    }
  }
  // Create keyframes for the gradient and animation effects
  // Removed useEffect for injecting style element, keyframes moved to HomePage.css
  // Canvas animation effect
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.error("Failed to get canvas rendering context");
        return;
      }
      
      let animationFrameId;
      let time = 0;
      let lastTimestamp = 0;      // Function to start the animation
      const startAnimation = () => {
        // Get actual display dimensions
        const displayWidth = canvas.clientWidth || canvas.width;
        const displayHeight = canvas.clientHeight || canvas.height;
        
        // Use display dimensions for calculations, not the potentially scaled canvas dimensions
        const centerX = displayWidth / 2;
        const centerY = displayHeight / 2;

        // Theme object for drawing
        const drawingTheme = {
          elements: [
            { type: 'circle', x: centerX, y: centerY, radius: 20, color: canvasColors.red },
            { type: 'petal', x: centerX, y: centerY, angle: 0, color: canvasColors.blue },
            { type: 'petal', x: centerX, y: centerY, angle: 72, color: canvasColors.green },
            { type: 'petal', x: centerX, y: centerY, angle: 144, color: canvasColors.yellow },
            { type: 'petal', x: centerX, y: centerY, angle: 216, color: canvasColors.purple },
            { type: 'petal', x: centerX, y: centerY, angle: 288, color: canvasColors.pink },
            { type: 'stem', x: centerX, y: centerY, color: canvasColors.green }
          ],
          palette: Object.values(canvasColors)
        };        const renderLoop = (timestamp) => {
          const deltaTime = timestamp - lastTimestamp;
          lastTimestamp = timestamp;
          time += deltaTime / 1000; 

          // Get current display dimensions which may change during animation
          const width = canvas.clientWidth || canvas.width;
          const height = canvas.clientHeight || canvas.height;
          const centerX = width / 2;
          const centerY = height / 2;

          ctx.clearRect(0, 0, width, height);
          drawGrid(ctx, width, height);
          drawColorfulOrbs(ctx, width, height, time);
          drawTheme(ctx, drawingTheme, time);
          drawBee(ctx, centerX, centerY, time);

          animationFrameId = requestAnimationFrame(renderLoop);
        };

        animationFrameId = requestAnimationFrame(renderLoop);
      };
      
      // Set canvas dimensions based on container size
      const updateCanvasSize = () => {
        const container = canvas.parentElement;
        if (container) {
          // Get container dimensions
          const containerWidth = container.clientWidth;
          const containerHeight = container.clientHeight;
          
          // Clear any existing transformations
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          
          // Set display size in CSS pixels (controls visual size)
          canvas.style.width = containerWidth + 'px';
          canvas.style.height = containerHeight + 'px';
          
          // Get device pixel ratio for high DPI displays
          const dpr = window.devicePixelRatio || 1;
          
          // Set actual canvas dimensions accounting for device pixel ratio
          canvas.width = Math.floor(containerWidth * dpr);
          canvas.height = Math.floor(containerHeight * dpr);
          
          // Scale drawing operations by the device pixel ratio
          ctx.scale(dpr, dpr);
          
          // Redraw everything when size changes
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
          }
          startAnimation();
        }
      };
      
      // Handle mobile touch events for better interaction
      const handleTouchStart = (e) => {
        e.preventDefault(); // Prevent scrolling when touching the canvas
      };
      
      const handleTouchMove = (e) => {
        e.preventDefault(); // Prevent scrolling when touching the canvas
      };
      
      // Add touch event listeners for mobile devices
      canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
      canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
      
      // Initial size setup
      updateCanvasSize();
      
      // Listen for window resize and orientation change
      window.addEventListener('resize', updateCanvasSize);
      window.addEventListener('orientationchange', updateCanvasSize);
      
      return () => {
        window.removeEventListener('resize', updateCanvasSize);
        window.removeEventListener('orientationchange', updateCanvasSize);
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    }
  }, []);
  // Add CSS rules for different screen sizes
  useEffect(() => {
    // Helper function to create style element
    const createStyleElement = () => {
      const styleEl = document.createElement('style');
      styleEl.id = 'responsive-styles';
      document.head.appendChild(styleEl);
      return styleEl;
    };

    // Get existing style element or create a new one
    let styleEl = document.getElementById('responsive-styles');
    if (!styleEl) {
      styleEl = createStyleElement();
    }

    // Define responsive styles for different screen sizes
    styleEl.textContent = `
      /* Additional responsive styles for small devices (under 480px) */
      @media (max-width: 480px) {
        .btn {
          padding: 0.5rem 1.25rem !important;
          font-size: 0.95rem !important;
        }

        .btn-lg {
          padding: 0.75rem 1.5rem !important;
          font-size: 1rem !important;
        }
      }

      /* Landscape orientation on mobile */
      @media (max-width: 768px) and (orientation: landscape) {
        section {
          padding-top: 1.5rem !important;
          padding-bottom: 1.5rem !important;
        }
      }

      /* Medium-sized tablets */
      @media (min-width: 769px) and (max-width: 1024px) {
        .hero-title {
          font-size: 3rem !important;
        }
      }
    `;

    // Cleanup function to remove style element when component unmounts
    return () => {
      if (styleEl && document.head.contains(styleEl)) {
        document.head.removeChild(styleEl);
      }
    };
  }, []);
  const styles = {
    homePage: {
      position: 'relative',
      overflow: 'hidden',
      paddingBottom: '4rem',
      '@media (max-width: 768px)': {
        paddingBottom: '2rem',
      },
    },    hero: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      position: 'relative',
      minHeight: '80vh',
      maxWidth: '1200px',
      margin: '0 auto',
      '@media (max-width: 768px)': {
        flexDirection: 'column-reverse',
        padding: '1rem 1rem 2rem',
        minHeight: 'auto',
        gap: '1.5rem',
      },
    },    heroContent: {
      flex: 1,
      maxWidth: '600px',
      position: 'relative',
      zIndex: 2,
      marginRight: '2rem',
      '@media (max-width: 768px)': {
        width: '100%',
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '1rem',
        marginRight: '0',
        padding: '0 0.75rem',
      },
    },    heroTitle: {
      fontSize: '3.5rem',
      fontWeight: '800',
      lineHeight: '1.1',
      marginBottom: '1.5rem',
      position: 'relative',
      '@media (max-width: 768px)': {
        fontSize: '2.75rem',
        textAlign: 'center',
        marginTop: '0',
        marginBottom: '1rem',
      },
    },
    gradientHeading: {
      background: 'linear-gradient(90deg, #FF4D79 0%, #3B82F6 35%, #22c55e 65%, #FF4D79 100%)',
      backgroundSize: '200% auto',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      color: 'transparent',
      animation: 'gradientFlow 8s ease infinite',
    },    heroSubtitle: {
      fontSize: '1.25rem',
      marginBottom: '2rem',
      color: 'rgba(31, 41, 55, 0.8)',
      lineHeight: '1.6',
      '@media (max-width: 768px)': {
        fontSize: '1.1rem',
        textAlign: 'center',
        marginBottom: '1.25rem',
        maxWidth: '95%', // Prevent text from touching edges
        margin: '0 auto 1.25rem',
      },
    },    heroActions: {
      display: 'flex',
      gap: '1rem',
      marginTop: '2rem',
      '@media (max-width: 768px)': {
        justifyContent: 'center',
        marginBottom: '0.5rem',
        marginTop: '0.75rem',
        flexWrap: 'wrap',
        gap: '1rem',
      },
    },
    heroImage: {
      flex: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      '@media (max-width: 768px)': {
        width: '100%',
        marginBottom: '0.5rem',
      },
    },    canvasContainer: {
      width: '100%',
      maxWidth: '450px', 
      height: '350px',
      position: 'relative',
      borderRadius: '0.75rem',
      overflow: 'hidden',
      backgroundColor: 'white',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
      border: '1px solid var(--border-color)',
      transformStyle: 'preserve-3d',
      perspective: '1000px',
      margin: '0 auto', // Center canvas
      '@media (max-width: 768px)': {
        height: '300px', // Increased height on mobile
        maxWidth: '100%', // Full width of parent container
        width: '95%', // Add minimal padding on sides
        marginBottom: '1rem', // Add space between canvas and text
        marginTop: '1rem', // Add space at the top
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)', // More prominent shadow
      },
    },
    canvas: {
      width: '100%',
      height: '100%', 
      display: 'block',
      borderRadius: '0.75rem',
      touchAction: 'none', // Prevent default touch actions for better mobile experience
    },
    howItWorks: {
      padding: '4rem 2rem',
      backgroundColor: 'rgba(243, 244, 246, 0.7)',
      borderRadius: '1rem',
      margin: '2rem auto',
      maxWidth: '1100px',
      '@media (max-width: 768px)': {
        padding: '3rem 1rem',
        margin: '1rem 0.5rem',
      },
    },
    sectionTitle: {
      textAlign: 'center',
      fontSize: '2.25rem',
      fontWeight: '700',
      marginBottom: '2.5rem',
      color: 'var(--text-color)',
      position: 'relative',
      '@media (max-width: 768px)': {
        fontSize: '1.8rem',
        marginBottom: '2rem',
      },
    },
    stepsContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center', 
      maxWidth: '900px',
      margin: '0 auto',
      position: 'relative',
      '@media (max-width: 768px)': {
        flexDirection: 'column',
        gap: '2rem',
        paddingTop: '1rem',
      },
    },
    step: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      padding: '0 1rem',
      position: 'relative',
      zIndex: 1,
      '@media (max-width: 768px)': {
        maxWidth: '100%',
        padding: '0 0.5rem',
        marginBottom: '1.5rem',
        width: '90%',
      },
    },
    stepIcon: {
      width: '70px',
      height: '70px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      marginBottom: '1.5rem',
      fontSize: '1.8rem',
      color: 'var(--primary-color)',
      backgroundColor: 'white',
      boxShadow: '0 5px 15px rgba(99, 102, 241, 0.2)',
      border: '2px solid var(--primary-color)',
      position: 'relative',
      zIndex: 2,
    },
    stepTitle: {
      fontSize: '1.3rem',
      fontWeight: '600',
      marginBottom: '0.75rem',
      color: 'var(--primary-color)',
    },
    stepDescription: {
      color: 'rgba(31, 41, 55, 0.8)',
      fontSize: '1rem',
      lineHeight: '1.5',
    },
    // Connecting lines between steps
    stepsConnection: {
      position: 'absolute',
      height: '2px',
      backgroundColor: 'var(--primary-color)',
      top: '35px',
      width: '100%',
      left: '0',
      zIndex: 0,
      '@media (max-width: 768px)': {
        display: 'none', // Hide connecting lines on mobile since steps are stacked vertically
      },
    },
    features: {
      padding: '5rem 2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      '@media (max-width: 768px)': {
        padding: '3rem 1rem',
      },
    },
    featureGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '2rem',
      marginTop: '3rem',
      '@media (max-width: 768px)': {
        gridTemplateColumns: '1fr', // Single column on mobile
        gap: '1.5rem',
        marginTop: '2rem',
        width: '95%', // Add some side padding
        margin: '2rem auto 0',
      },
    },
    feature: {
      backgroundColor: 'white',
      borderRadius: '1rem',
      padding: '1.5rem',
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
      border: '1px solid var(--border-color)',
      position: 'relative',
      overflow: 'hidden',
      '@media (max-width: 768px)': {
        padding: '1.25rem',
      },
    },
    featureTopBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '4px',
      background: 'var(--primary-color)',
    },
    featureIcon: {
      fontSize: '1.8rem',
      color: 'var(--primary-color)',
      marginBottom: '1.25rem',
      padding: '0.8rem',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      borderRadius: '0.75rem',
      display: 'inline-flex',
    },
    featureTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      marginBottom: '0.75rem',
      color: 'var(--text-color)',
    },
    featureDescription: {
      color: 'rgba(31, 41, 55, 0.8)',
      fontSize: '0.9rem',
      lineHeight: '1.6',
    },
    credits: {
      padding: '3rem 2rem',
      marginTop: '4rem',
      backgroundColor: 'rgba(243, 244, 246, 0.7)',
      borderRadius: '1rem',
      maxWidth: '900px',
      margin: '4rem auto 2rem auto',
      textAlign: 'center',
      '@media (max-width: 768px)': {
        padding: '2rem 1.5rem',
        margin: '3rem 0.5rem 2rem',
        borderRadius: '0.75rem',
      },
    },
    creditsTitle: {
      fontSize: '2rem', // Slightly larger title
      fontWeight: '700',
      marginBottom: '2.5rem',
      color: 'var(--text-color)', // Consistent with sectionTitle
      position: 'relative',
    },
    creditsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '2rem',
      justifyContent: 'center',
      '@media (max-width: 768px)': {
        gridTemplateColumns: '1fr',
        gap: '1.5rem',
      },
    },
    creditItem: {
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
      border: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column', // Stack image and text vertically
      alignItems: 'center',
      textAlign: 'center',
    },
    creditImage: {
      width: '100px',
      height: '100px',
      borderRadius: '50%', // Circular images
      objectFit: 'cover',
      marginBottom: '1rem',
      border: '3px solid var(--primary-color)',
    },
    creditName: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: 'var(--text-color)',
      marginBottom: '0.25rem',
    },
    creditId: {
      fontSize: '0.9rem',
      color: 'rgba(31, 41, 55, 0.7)',
    }
  };

  return (
    <div style={styles.homePage}>
      {/* Hero Section with Animations */}
      <section style={styles.hero}>
        <motion.div 
          style={styles.heroContent}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >      <motion.h1 className="select-none pointer-events-none"
            style={{...styles.heroTitle, lineHeight: '1.2'}}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span style={styles.gradientHeading}>Draw, Vote, Win!</span>
          </motion.h1>
          
          <motion.p className="select-none pointer-events-none"
            style={styles.heroSubtitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Challenge your friends to drawing battles. Create masterpieces based on random prompts, vote on each other's
            artwork, and climb the leaderboard!
          </motion.p>
          
          <motion.div 
            style={styles.heroActions}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {currentUser ? (
              <motion.div className="select-none"
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
              >
                <Link to="/lobby" className="btn btn-primary btn-lg">
                  Enter Lobby
                </Link>
              </motion.div>
            ) : (
              <>
                <motion.div className="select-none"
                  variants={buttonVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Link to="/login" className="btn btn-primary btn-lg">
                    Get Started
                  </Link>
                </motion.div>
                <motion.div className="select-none"
                  variants={buttonVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Link to="/register" className="btn btn-outline btn-lg">
                    Sign Up
                  </Link>
                </motion.div>
              </>
            )}
          </motion.div>
        </motion.div>
          <motion.div 
          style={styles.heroImage}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >          <motion.div 
            style={styles.canvasContainer} 
            transition={{ duration: 0.3 }}
          >
            <canvas 
              ref={canvasRef} 
              style={styles.canvas}
              width={450} 
              height={350} 
            />
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Section with Scroll Animations */}
      <motion.section 
        ref={stepsRef}
        style={styles.howItWorks}
        initial={{ opacity: 0 }}
        animate={stepsInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h2 className="select-none"
          style={styles.sectionTitle}
          initial={{ opacity: 0, y: 20 }}
          animate={stepsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          How It Works
        </motion.h2>
        
        <div style={styles.stepsContainer}>
          {/* The connecting line between steps */}
          <div style={styles.stepsConnection}></div>
          
          <motion.div 
            style={styles.step}
            variants={stepItemVariants}
            initial="hidden"
            animate={stepsInView ? "visible" : "hidden"}
            transition={{ delay: 0.2 }}
          >
            <div style={styles.stepIcon}>
              <FaPencilAlt />
            </div>
            <h3 className="select-none pointer-events-none" style={styles.stepTitle}>1. Draw</h3>
            <p className="select-none pointer-events-none" style={styles.stepDescription}>Get a random prompt and create your masterpiece within the time limit</p>
          </motion.div>
          
          <motion.div 
            style={styles.step}
            variants={stepItemVariants}
            initial="hidden"
            animate={stepsInView ? "visible" : "hidden"}
            transition={{ delay: 0.4 }}
          >
            <div style={styles.stepIcon}>
              <FaVoteYea />
            </div>
            <h3 className="select-none pointer-events-none" style={styles.stepTitle}>2. Vote</h3>
            <p className="select-none pointer-events-none" style={styles.stepDescription}>Rate other players' drawings from 1 to 5 stars during the voting phase</p>
          </motion.div>
          
          <motion.div 
            style={styles.step}
            variants={stepItemVariants}
            initial="hidden"
            animate={stepsInView ? "visible" : "hidden"}
            transition={{ delay: 0.6 }}
          >
            <div style={styles.stepIcon}>
              <FaTrophy />
            </div>
            <h3 className="select-none pointer-events-none" style={styles.stepTitle}>3. Win</h3>
            <p className="select-none pointer-events-none" style={styles.stepDescription}>See the results on the leaderboard and claim your victory</p>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section with Interactive Cards */}
      <motion.section 
        ref={featuresRef}
        style={styles.features}
        initial={{ opacity: 0 }}
        animate={featuresInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h2 className="select-none pointer-events-none"
          style={styles.sectionTitle}
          initial={{ opacity: 0, y: 20 }}
          animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          Features
        </motion.h2>
        
        <div style={styles.featureGrid}>
          <motion.div 
            style={styles.feature}
            variants={featureVariants}
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            whileHover="hover"
            transition={{ delay: 0.1 }}
          >
            <div style={styles.featureTopBar}></div>
            <div style={styles.featureIcon}>
              <FaPalette />
            </div>
            <h3 className="select-none pointer-events-none" style={styles.featureTitle}>Real-time Drawing</h3>
            <p className="select-none pointer-events-none" style={styles.featureDescription}>Draw with a responsive canvas that works on desktop and mobile</p>
          </motion.div>
          
          <motion.div 
            style={styles.feature}
            variants={featureVariants}
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            whileHover="hover"
            transition={{ delay: 0.2 }}
          >
            <div style={styles.featureTopBar}></div>
            <div style={styles.featureIcon}>
              <FaVoteYea />
            </div>
            <h3 className="select-none pointer-events-none" style={styles.featureTitle}>Fair Voting</h3>
            <p className="select-none pointer-events-none" style={styles.featureDescription}>Anonymous voting system ensures fair and unbiased results</p>
          </motion.div>
          
          <motion.div 
            style={styles.feature}
            variants={featureVariants}
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            whileHover="hover"
            transition={{ delay: 0.3 }}
          >
            <div style={styles.featureTopBar}></div>
            <div style={styles.featureIcon}>
              <FaUserFriends />
            </div>
            <h3 className="select-none pointer-events-none" style={styles.featureTitle}>Custom Rooms</h3>
            <p className="select-none pointer-events-none" style={styles.featureDescription}>Create private rooms to play with friends or join public games</p>
          </motion.div>
          
          <motion.div 
            style={styles.feature}
            variants={featureVariants}
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            whileHover="hover"
            transition={{ delay: 0.4 }}
          >
            <div style={styles.featureTopBar}></div>
            <div style={styles.featureIcon}>
              <FaChartLine />
            </div>
            <h3 className="select-none pointer-events-none" style={styles.featureTitle}>Leaderboards</h3>
            <p className="select-none pointer-events-none" style={styles.featureDescription}>Track your progress and compete for the top spot</p>
          </motion.div>
        </div>
      </motion.section>
        {/* No CTA section - removed as requested */}      {/* Credits Section */}
      <section style={styles.credits}>
        <h3 style={styles.creditsTitle}>Project Credits</h3> {/* Changed title slightly */}
        <div style={styles.creditsGrid}> {/* Changed from ul to div with new style */}
          <div style={styles.creditItem}>
            <img src={rafif} alt="Adhi Rajasa Rafif" style={styles.creditImage} />
            <div style={styles.creditName}>Adhi Rajasa Rafif</div>
            <div style={styles.creditId}>2306266943</div>
          </div>
          <div style={styles.creditItem}>
            <img src={adrian} alt="Adrian Dika Darmawan" style={styles.creditImage} />
            <div style={styles.creditName}>Adrian Dika Darmawan</div>
            <div style={styles.creditId}>2306250711</div>
          </div>
          <div style={styles.creditItem}>
            <img src={ifan} alt="Fathan Yazid Satriani" style={styles.creditImage} />
            <div style={styles.creditName}>Fathan Yazid Satriani</div>
            <div style={styles.creditId}>2306250560</div>
          </div>
          <div style={styles.creditItem}>
            <img src={grace} alt="Grace Yunike Margaretha Sitorus" style={styles.creditImage} />
            <div style={styles.creditName}>Grace Yunike Margaretha Sitorus</div>
            <div style={styles.creditId}>2306267031</div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
