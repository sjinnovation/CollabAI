import React, { useState, useEffect } from "react";
import { ThemeContext } from "./themeConfig";
import { getUserSelectedTheme } from "../Utility/service";


export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getUserSelectedTheme());

  useEffect(() => {
    // get the root HTML element
    const root = window.document.documentElement;

    // set initial CSS variables
    if (theme === "light") {
      root.style.setProperty("--chat-box-bg-color", "#ffffff");
      root.style.setProperty("--chat-box-text-color", "#171717");
      root.style.setProperty("--secondary-color", "#F9F9F9");
      root.style.setProperty("--border-color", "rgba(0,0,0,.15)");
    } else {
      root.style.setProperty("--chat-box-bg-color", "#212121");
      root.style.setProperty("--chat-box-text-color", "#ececec");
      root.style.setProperty("--secondary-color", "#171717");
      root.style.setProperty("--border-color", "rgba(255,255,255,.15)");
    }

    localStorage.setItem('theme', theme);
  }, [theme]); // run this effect when the `theme` state changes

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      return prevTheme === "light" ? "dark" : "light";
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
