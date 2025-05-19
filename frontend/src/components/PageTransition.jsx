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
        duration: 0.4,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      y: isAuthPage ? -20 : 0,
      scale: isAuthPage ? 0.98 : 1,
      transition: {
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };

  return (
    <motion.div
      key={location.pathname}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      style={{ width: "100%", height: "100%" }}
    >
      {children}
    </motion.div>
  );
}

export default PageTransition;
