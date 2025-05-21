import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

// Page transition component for smooth route changes
function PageTransition({ children }) {
  const location = useLocation();
  
  // Different animations for auth pages vs game pages
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  
  const pageVariants = {
    initial: {
      opacity: 0,
      y: isAuthPage ? 20 : 0,
      scale: isAuthPage ? 0.98 : 1
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,  // Reduced from 0.4
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      y: isAuthPage ? -20 : 0,
      scale: isAuthPage ? 0.98 : 1,
      transition: {
        duration: 0.15,  // Reduced from 0.3
        ease: "easeIn"
      }
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      style={{ 
        position: "absolute",
        width: "100%",
        minHeight: "100vh",
        left: 0,
        top: 0,
        display: "flex",
        flexDirection: "column"
      }}
    >
      {children}
    </motion.div>
  );
}

export default PageTransition;
