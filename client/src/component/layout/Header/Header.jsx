import React, { useContext, useEffect } from "react";
import { BiMoon, BiSun } from "react-icons/bi";
import { ThemeContext } from "../../../contexts/themeConfig";
import { useLocation } from "react-router-dom";
import "./Header.scss";
import { Typography } from "antd";
import { pageTitle } from "./Utilities/pageTitleInfo";
import { SidebarContext } from "../../../contexts/SidebarContext";
import {
  TbLayoutSidebarLeftCollapse,
  TbLayoutSidebarRightCollapse,
} from "react-icons/tb";
import { getPageTitle } from "../../../Utility/helper";
import { PageTitleContext } from "../../../contexts/TitleContext";
import NewChatWithSameAssistant from "../../Prompt/NewChatWithSameAssistant";
import DarkModeToggler from "../../common/DarkModeToggler/DarkModeToggler";
// import logo from "../../../assests/images/Collab AI Logo White.png";

const Header = () => {
  const { theme, toggleTheme, themeIsChecked, setThemeIsChecked } = useContext(ThemeContext);
  const { setShowMenu, showMenu } = useContext(SidebarContext);
  const { pageTitle, setPageTitle } = useContext(PageTitleContext);
  let location = useLocation();
  const isChatPath = /^\/chat\/.*$/.test(location.pathname);
  return (
    <nav
      className="navbar navbar-expand sticky-top nav-bar w-100"
      aria-label="Second navbar example"
      style={
        theme === "light"
          ? { backgroundColor: "#eef3ff" }
          : { backgroundColor: "#212121" }
      }
    >
      <div className="container-fluid CustomFlex">
        <div className="d-flex align-items-center gap-2">
          {(location?.pathname === "/public-assistant" ||
            location.pathname === "/chat" ||
            location.pathname.startsWith("/chat/") ||
            location.pathname.startsWith("/agents/")) ? (
            <button
              className="toggle-sidebar"
              onClick={() => {
                setShowMenu((prevState) => !prevState);
              }}
            >
              {showMenu ? (
                <TbLayoutSidebarLeftCollapse className="thread-bar-open-icon" />
              ) : (
                <TbLayoutSidebarRightCollapse className="thread-bar-close-icon" />
              )}
            </button>
          ): <></>}
          <Typography.Title level={5} className="rounded m-0">
            {getPageTitle(location.pathname)}
              {pageTitle[location.pathname] && (
                <NewChatWithSameAssistant assistantId={location.pathname.split("/")[2]} assistantName={pageTitle[location.pathname]} />
              )}
          </Typography.Title>
        </div>
        <DarkModeToggler theme={theme} toggleTheme={toggleTheme} themeIsChecked={themeIsChecked} setThemeIsChecked={setThemeIsChecked}/>
      </div>
    </nav>
  );
};

export default Header;
