import React, { useState, useEffect } from "react";
import { ThemeContext } from "./themeConfig";
import { getUserSelectedTheme } from "../Utility/service";

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getUserSelectedTheme());
  const [themeIsChecked, setThemeIsChecked] = useState(false);

  useEffect(() => {
    // get the root HTML element
    const root = window.document.documentElement;

    // set initial CSS variables
    if (theme === "light") {
      root.style.setProperty("--chat-box-bg-color", "#ffffff");
      root.style.setProperty("--chat-box-bg-color-2", "#F0F4F9");
      root.style.setProperty("--thread-active", "#ffffff");
      root.style.setProperty("--theme-toggler-light", "#ffffff");
      root.style.setProperty("--theme-toggler-dark", "#000000");
      root.style.setProperty("--main-bg-color", "#ffffff");
      root.style.setProperty("--chat-box-text-color", "#171717");
      root.style.setProperty("--sidebar-color", "#171717");
      // root.style.setProperty("--sidebar-color", "#1E1F20");
      root.style.setProperty("--sidebar-text-color", "#fafafa");
      root.style.setProperty("--header-bg", "#ffffff");
      root.style.setProperty("--sidebar-search", "#212121");
      root.style.setProperty("--sidebar-active-bg", "#E9E9E9");
      root.style.setProperty("--secondary-color", "#F9F9F9");
      root.style.setProperty("--thread-bar-bg", "#F0F4F9");
      root.style.setProperty("--thread-bar-bg-2", "rgb(249, 250, 251)");
      root.style.setProperty("--thread-bar-text-color", "gray");
      root.style.setProperty("--border-color", "rgba(0,0,0,.15)");
      root.style.setProperty("--light-dark", "#000000");
      root.style.setProperty("--sidebar-border-color", "rgba(255,255,255,.15)");
      root.style.setProperty("--chat-text-hover", "rgb(249, 250, 251)");
      root.style.setProperty("--hover-bg", "#f1f1f1");
      root.style.setProperty("--chat-box-shadow-color", "rgba(250, 250, 250, 0.2");
    } else {
      root.style.setProperty("--chat-box-bg-color", "#212121");
      root.style.setProperty("--thread-active", "#393939");
      root.style.setProperty("--chat-box-bg-color-2", "#1E1F20");
      root.style.setProperty("--theme-toggler-light", "#000000");
      root.style.setProperty("--theme-toggler-dark", "#ffffff");
      root.style.setProperty("--light-dark", "#ffffff");
      root.style.setProperty("--chat-box-text-color", "#ececec");
      root.style.setProperty("--main-bg-color", "#212121");
      root.style.setProperty("--header-bg", "#212121");
      root.style.setProperty("--sidebar-text-color", "#fafafa");
      root.style.setProperty("--sidebar-search", "#212121");
      root.style.setProperty("--sidebar-active-bg", "#E9E9E9");
      root.style.setProperty("--thread-bar-bg", "#333537");
      root.style.setProperty("--thread-bar-bg-2", "#212023 ");
      root.style.setProperty("--thread-bar-text-color", "#ffffff");
      root.style.setProperty("--sidebar-color", "#171717");
      root.style.setProperty("--secondary-color", "#171717");
      root.style.setProperty("--border-color", "rgba(255,255,255,.15)");
      root.style.setProperty("--sidebar-border-color", "rgba(255,255,255,.15)");
      root.style.setProperty("--chat-text-hover", "#030712");
      root.style.setProperty("--hover-bg", "rgba(255,255,255,.15)");
      root.style.setProperty("--chat-box-shadow-color", "rgba(0, 0, 0, 0.2");

    }

    localStorage.setItem("theme", theme);
  }, [theme]); // run this effect when the `theme` state changes

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      return prevTheme === "light" ? "dark" : "light";
    });
    setThemeIsChecked((prevThemeIsChecked) => !prevThemeIsChecked);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, themeIsChecked, setThemeIsChecked }}>
      {children}
    </ThemeContext.Provider>
  );
};