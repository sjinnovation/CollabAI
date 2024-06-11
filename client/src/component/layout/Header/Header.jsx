import darkLogo from "../../../assests/images/NewLogo-dark.png";
import React, { useContext } from "react";
import { BiMoon, BiSun } from "react-icons/bi";
import { ThemeContext } from "../../../contexts/themeConfig";
import { useNavigate } from "react-router-dom";
import logo from "../../../assests/images/NewLogo.png";

const Header = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  return (
    <>
      <nav
        className="navbar navbar-expand sticky-top pt-3"
        aria-label="Second navbar example"
      >
        <div className="container-fluid CustomFlex">
          <div className="d-flex w-100 position-relative">
            <img
              onClick={() => {
                navigate("/chat", { replace: true });
              }}
              alt="brand logo"
              src={theme === "light" ? darkLogo : logo}
              width="250"
              height="auto"
            />
          </div>
          <button
            onClick={toggleTheme}
            className="btn btn-outline"
            style={{ borderColor: theme === "light" ? "#000" : "#fff" }}
          >
            {theme === "light" ? (
              <BiMoon style={{ color: "#000" }} />
            ) : (
              <BiSun style={{ color: "#fff" }} />
            )}
          </button>
        </div>
      </nav>
    </>
  );
};

export default Header;
