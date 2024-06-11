
import React, { useContext } from "react";
import { ThemeContext } from "../../../src/contexts/themeConfig";

const Avatar = ({ children, bg, className }) => {
  const { theme } = useContext(ThemeContext);
  return (
    <div
      id="avatar"
      style={{ backgroundColor: `${bg}` }}
      color={theme === "light" ? "dark" : "light"}
    >
      <div className={className}>{children}</div>
    </div>
  );
};

export default Avatar;
