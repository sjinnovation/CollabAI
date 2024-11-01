import React from "react";
import { theme } from "antd";

export const darkConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: "#1890ff",
  },
  components: {
    Button: {
      algorithm: true, 
    },
    Input: {
      colorPrimary: "#2c2a2a",
      // colorBorder: "#2c2a2a",
    },
    Form: {
      colorPrimary: "#eb2f96",
      backgroundColor: "#ff0000",
      border: "1px solid rgb(44, 48, 53)",
    },
    message: {
      top: "20px",
      right: "20px",
      position: "fixed",
    },
  },
};

export const lightConfig = {
  algorithm: theme.lightAlgorithm,
  token: {
    colorPrimary: "#000000", 
  },
  components: {
    Button: {
      algorithm: true,
    },
    Input: {
      colorPrimary: "#000000",
      // colorBorder: "#000000", // - [note]: this was causing extra border on inputs
    },
    Form: {
      colorPrimary: "#000000", 
      backgroundColor: "#ffffff", 
      border: "1px solid #000000", 
    },
    message: {
      top: "20px",
      right: "20px",
      position: "fixed",
    },
  },
};

export const ThemeContext = React.createContext("light");
