import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Theme mapping for each route
const routeThemeMap = {
  '/': 'theme-home',
  '/login': 'theme-login',
  '/register': 'theme-auth',
  '/lobby': 'theme-lobby',
  '/create-room': 'theme-lobby',
  '/join-room': 'theme-lobby',
  '/waiting-room': 'theme-waiting',
  '/drawing': 'theme-drawing',
  '/voting': 'theme-voting',
  '/leaderboard': 'theme-leaderboard',
};

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const location = useLocation();
  const [currentTheme, setCurrentTheme] = useState('theme-home');

  useEffect(() => {
    // Get the corresponding theme for the current route
    const pathname = location.pathname;
    const theme = routeThemeMap[pathname] || 'theme-home';
    
    // Update the theme state
    setCurrentTheme(theme);
    
    // Add the theme class to the document body
    document.body.className = theme;
    
    return () => {
      // Clean up by removing all theme classes when component unmounts
      Object.values(routeThemeMap).forEach(themeClass => {
        document.body.classList.remove(themeClass);
      });
    };
  }, [location.pathname]);

  return (
    <ThemeContext.Provider value={{ currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
