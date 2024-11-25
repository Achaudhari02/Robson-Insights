import React, { createContext, useState, useContext } from 'react';

// Create a context for the theme
const ThemeContext = createContext({
  theme: 'light', // default theme
  toggleTheme: () => {}, // function to toggle the theme
});

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');  // Default to 'light' theme

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to access the theme context
export const useTheme = () => useContext(ThemeContext);
