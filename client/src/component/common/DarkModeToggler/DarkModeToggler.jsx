import React, { useRef } from "react";
import "./style.scss";
import { PiSunDimFill } from "react-icons/pi";
import { PiMoonStarsFill } from "react-icons/pi";

const DarkModeToggler = ({
  toggleTheme,
  theme,
  themeIsChecked,
  setThemeIsChecked,
}) => {
  const checkboxRef = useRef();

  const handleChange = (event) => {
    if (event?.isTrusted) {
      toggleTheme();
    } else {
      checkboxRef.current.checked = themeIsChecked;
    }
  };
  
  return (
    <div>
      <input
        checked={themeIsChecked}
        onChange={handleChange}
        ref={checkboxRef}
        type="checkbox"
        class="checkbox"
        id="checkbox"
      />
      <label for="checkbox" class="checkbox-label">
        <PiMoonStarsFill className="icon" />
        <PiSunDimFill className="icon" />
        <span class="ball"></span>
      </label>
    </div>
  );
};

export default DarkModeToggler;
