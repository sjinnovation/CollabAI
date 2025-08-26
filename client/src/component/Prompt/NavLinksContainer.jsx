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
import UserAvatar from "../UserAvatar/UserAvatar";
import { ProfileContext } from "../../contexts/ProfileContext";
import './NavLinksContainer.css';
import SupportLinks from "../layout/NewSidebar/SupportLinks";

const NavLinksContainer = ({ chatLog, setChatLog }) => {
  const { theme } = useContext(ThemeContext);
  const userName = localStorage.userName && localStorage.userName;
  const [role, setRole] = useState("");

  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const { userAvatar } = useContext(ProfileContext);

  const userId = getUserID();

  const handleFetchUserData = async () => {
    try {
      if (!userId) {
        return null;
      }
      const result = await getUserData(userId, setRole);
      if (!result) {
        console.error("Failed to fetch user data: No response received.");
        return;
      }
      const { success, data, error } = result;
      if (success) {

      } else {
        console.error("Error fetching user data:", error);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };


  useEffect(() => {
    handleFetchUserData();
  }, []);

  //------------------ API Calls -----------------------------

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
        <Menu.Item>
          <SupportLinks />
        </Menu.Item>
      </>

      <>
        <Link className="text-decoration-none" onClick={handleLogout}>
          <div className="navPrompt logout">
            <RiLogoutCircleLine className="logout-icon" />
            <p className="logout-text">Log Out</p>
          </div>
        </Link>
      </>

    </Menu>
  );

  return (
    <div
      className="navLinks bottom-navLinks bottom-nav__position"
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
            {userAvatar ? (
              <UserAvatar
                userAvatar={userAvatar}
                width={40}
                height={30}
                shape="square"
              />
            ) : (
              <CgProfile
                size={22}
              />
            )}
            {userName && userName}
          </>
        </div>
      </Dropdown>
    </div>
  );
};

export default NavLinksContainer;
