import { FaGraduationCap } from "react-icons/fa";
import NavLinks from "../../Prompt/NavLink";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../../Hooks/useAuth";
import { logout } from "../../../Utility/service";
import React, { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../../../contexts/themeConfig";
import "./AssistantListPinIcon.css"
import { CgProfile } from "react-icons/cg";
import { FaSync } from "react-icons/fa";
import { RiBug2Fill, RiGraduationCapFill, RiLogoutCircleLine } from "react-icons/ri";
import { MdBrowserUpdated } from "react-icons/md"
import { axiosSecureInstance } from "../../../api/axios";
import { Badge, Space, notification } from "antd";
import { getUserID } from "../../../Utility/service";
import { HiAcademicCap } from "react-icons/hi2";
import { IoDocumentText } from "react-icons/io5";
const userId = getUserID();
const TUTORIAL_LEADSLIFT_URL =
  "https://docs.google.com/document/d/1McErUX9EPKh-I08uRPp8iwLFW78Ej7fBicn0fJtoRgQ/edit?tab=t.powvmwjcec9p";
const ACADEMY_URL = "https://academy.collabai.software/"
const CommonNavLinks = () => {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [badgeVisible, setBadgeVisible] = useState(false);

  const getPushNotifications = async ()=>{
    const response = await axiosSecureInstance.get(`api/notify-badge/${userId}`);
    return response;

  } 

  useEffect(() => {
    getPushNotifications().then(getNotify=>{
      if(getNotify?.data){
        setBadgeVisible(getNotify?.data?.badgeVisible);
        if(getNotify?.data?.badgeVisible){
          notification.open({
            message: 'We’ve introduced new features / fixed a few pesky bugs. Check out the updates in the “ChangeLog” menu on the left side',
            placement: 'topRight',
            duration: null,
            style: {
              backgroundColor: '#72BF78',
              border: '1px solid #6697cc',
            },
          });
        }
      }
    })


  }, []);

  // 2. Hide the badge on click
  const handleClick = async () => {
    const body = { showBadge: false }
    const addNotification = await axiosSecureInstance.patch(`api/notify-badge/${userId}`,body);
    if(addNotification.data.status === 'ok'){
      setBadgeVisible(false);
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
        href={ACADEMY_URL}
        className="text-decoration-none"
        target="_blank"
      >
         <div className="navPrompt small sidebar-item">
          <IoDocumentText
            className="sidebar-icon"
          />
          <p className="sidebar-text">Academy </p>
        </div>
      </a>

      <a
        href={TUTORIAL_LEADSLIFT_URL}
        className="text-decoration-none"
        target="_blank"
      >
         <div className="navPrompt small sidebar-item">
          <HiAcademicCap
            className="sidebar-icon"
          />
          <p className="sidebar-text">Product Guide </p>
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
      </a >
      <a
      href="https://docs.google.com/document/d/1McErUX9EPKh-I08uRPp8iwLFW78Ej7fBicn0fJtoRgQ/edit?tab=t.m1oswktdfe36"
      className="text-decoration-none"
      target="_blank"
      >
      <div className="navPrompt small sidebar-item" onClick={handleClick} style={{ cursor: 'pointer' }}>
          <MdBrowserUpdated  className="sidebar-icon" />
          <p className="sidebar-text">
          ChangeLog 
          </p>
          {badgeVisible&&<div className="parent">
  <div className="child" />
</div>}

{/* {badgeVisible&&<div className="w-4 h-4 bg-red-500 rounded-full animate-ping absolute">
            <div className="blinking-dot"></div>
          </div>} */}

    
        </div>
      </a>


        {/* {badgeVisible && (
        <span
          style={{
            display: 'inline-block',
            marginLeft: '6px',
            width: '8px',
            height: '8px',
            backgroundColor: 'red',
            borderRadius: '50%',
          }}
        />
      )} */}
    </div>
  );
};

export default CommonNavLinks;
