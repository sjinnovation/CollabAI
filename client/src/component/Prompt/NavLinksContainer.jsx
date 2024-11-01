import { useEffect, useState, useContext, useCallback } from "react";
import { getUserID, logout } from "../../Utility/service";
import { CgProfile } from "react-icons/cg";
import { Dropdown, Menu } from "antd";
import { AssistantContext } from "../../contexts/AssistantContext";
import AssistantList from "../layout/NewSidebar/AssistantList";
import CommonNavLinks from "../layout/NewSidebar/CommonNavLinks";
import UserNavLinks from "../layout/NewSidebar/UserNavLinks";
import AdminNavLinks from "../layout/NewSidebar/AdminNavLinks";
import SuperAdminNavLinks from "../layout/NewSidebar/SuperAdminNavLinks";
import { getUserAvatar, getUserData } from "../../api/userApiFunctions";
import { getAssistants } from "../../api/assistantApiFunctions";
import { FaSearch } from "react-icons/fa";
import debounce from "lodash/debounce";
import { ThemeContext } from "../../contexts/themeConfig";
import { Link, useNavigate } from "react-router-dom";
import { RiLogoutCircleLine } from "react-icons/ri";
import useAuth from "../../Hooks/useAuth";
import NavLinks from "./NavLink";

const NavLinksContainer = ({ chatLog, setChatLog }) => {
  const { theme } = useContext(ThemeContext);
  const userName = localStorage.userName && localStorage.userName;
  const [role, setRole] = useState("");

  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const userId = getUserID();

  useEffect(() => {
    handleFetchUserData();
  }, []);

  //------------------ API Calls -----------------------------

  const handleFetchUserData = async () => {
    try {
      const { success, data, error } = await getUserData(userId, setRole);
      if (success) {
        console.log("User Role:", data);
      } else {
        console.error("Error fetching user data:", error);
      }
    } finally {
    }
  };

  const handleLogout = () => {
    setAuth({
      role: "",
      loggedIn: false,
    });
    logout();
    navigate("/login", { replace: true });
  };
  

  //---------------------- Nav Links ---------------------
  const menu = (
    <Menu>
      {role === "superadmin" && (
        <>
          <Menu.Item key="superadmin">
            <SuperAdminNavLinks />
          </Menu.Item>
        </>
      )}

      {role === "admin" && (
        <>
          <Menu.Item key="admin">
            <AdminNavLinks />
          </Menu.Item>
        </>
      )}

      {role === "user" && (
        <>
          <Menu.Item key="user">
            <UserNavLinks />
          </Menu.Item>
        </>
      )}

        <>
        <Link className="text-decoration-none" onClick={handleLogout}>
         <div className="navPrompt logout">
          <RiLogoutCircleLine  className="logout-icon" />
            <p className="logout-text">Log Out</p>
          </div>
        </Link>
        </>

    
    </Menu>
  );

  return (
    <div
      className="navLinks bottom-navLinks"
      style={{
        padding: "0.875rem",
        width: "100%",
      }}
    >
      <Dropdown
        overlay={menu}
        placement="top"
        className="user-btn"
        trigger={["click"]}
      >
        <div className="ant-dropdown sidebar-user-profile-btn" >
          <>
            <CgProfile
              size={22}
              className="user-btn-icon"
              style={{ color: theme === "light" ? "#000" : "#fff" }}
            />
            {userName && userName}
          </>
        </div>
      </Dropdown>
    </div>
  );
};

export default NavLinksContainer;
