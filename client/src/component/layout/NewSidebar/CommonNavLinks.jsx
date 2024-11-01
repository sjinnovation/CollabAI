import { FaGraduationCap } from "react-icons/fa";
import NavLinks from "../../Prompt/NavLink";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../../Hooks/useAuth";
import { logout } from "../../../Utility/service";
import React, { useContext } from "react";
import { ThemeContext } from "../../../contexts/themeConfig";
import GoogleFilePicker from "../../KnowledgeBase/importFromGoogle";
import { CgProfile } from "react-icons/cg";
import { FaSync } from "react-icons/fa";
import { RiBug2Fill, RiGraduationCapFill, RiLogoutCircleLine } from "react-icons/ri";

const TUTORIAL_LEADSLIFT_URL =
  "https://tutorials.buildyourai.consulting/";
const CommonNavLinks = () => {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const handleLogout = () => {
    setAuth({
      role: "",
      loggedIn: false,
    });
    logout();
    navigate("/login", { replace: true });
  };
  return (
    <div className="sidebar-bottom-section">
{/* 
      <NavLinks
        svg={<FaSync size={22}  />
      }
        text="Sync Applications"
        link="/integrate-apps"
      /> */}

      <a
        href={TUTORIAL_LEADSLIFT_URL}
        className="text-decoration-none"
        target="_blank"
      >
         <div className="navPrompt small sidebar-item">
          <RiGraduationCapFill
            className="sidebar-icon"
          />
          <p className="sidebar-text">Tutorial </p>
        </div>
      </a>
      <a
        href="https://docs.google.com/forms/d/e/1FAIpQLSeWtj0L3SYvLmQNETh19dJgrezPlL-ibsQRJLWuiLpZGBv86g/viewform"
        className="text-decoration-none"
        target="_blank"
      >
        <div className="navPrompt small sidebar-item">
          <RiBug2Fill  className="sidebar-icon" />
          <p className="sidebar-text">
            Submit An Issue  <i className="bi bi-shield-exclamation"></i>
          </p>
        </div>
      </a>
    </div>
  );
};

export default CommonNavLinks;
