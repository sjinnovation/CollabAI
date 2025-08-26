import { FaRegTrashAlt } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { Tabs, Row, Col, Spin } from "antd";
import ProfileInfo from "./ProfileInfo";
import Trash from "./Trash";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { MdAppSettingsAlt } from "react-icons/md";

import Usage from "./Usage";
import CustomizeChat from "./CustomizeChat";
import AdvanceAiParameters from "./AdvanceAiParameters";
import { IntegrateApplications } from "../../component/IntegrateApplications/IntegrateApplications";
import googleDriveIcon from "../../assests/images/google-drive-icon.png";
import { TbPlugConnectedX } from "react-icons/tb";
import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FileContext } from "../../contexts/FileContext";
import { getGoogleAuthCredentials } from "../../api/googleAuthApi";
import { getWorkBoardAuthCredentials } from "../../api/workBoard";
import { getUserID, getUserRole } from "../../Utility/service";
import CommonLayout from "./../../component/layout/CommonStructure/index";
import { getProfilePageSideMenuItems } from "./../../Utility/SideMenuItems/ProfilePageSideMenu";
import "./profile.scss";
import HuggingFaceConfigForm from "../../component/huggingfacecomp/huggingFaceConfig";

const userId = getUserID();
const Profile = () => {
  const role = getUserRole();
  const location = useLocation();
  const [activeKey, setActiveKey] = useState("1");
  const {
    setIsConnected,
    setToken,
    setIsWorkBoardConnected,
    setWorkBoardToken,
    isLoading,
    setIsLoading,
  } = useContext(FileContext);
  useEffect(() => {
    if (location.state?.activeTabKey) {
      setActiveKey(location.state.activeTabKey);
    }
  }, [location]);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      getGoogleAuthCredentials(userId, setIsConnected, setToken, setIsLoading),
      getWorkBoardAuthCredentials(
        userId,
        setIsWorkBoardConnected,
        setWorkBoardToken
      ),
    ]).finally(() => setIsLoading(false));
  }, []);

  const renderContent = () => {
    switch (activeKey) {
      case "1":
        return <ProfileInfo />;
      case "2":
        return <Trash />;
      case "3":
        return <Usage />;
      case "4":
        return <CustomizeChat />;
      case "5":
        return <AdvanceAiParameters />;
      case "6":
        return <IntegrateApplications />;
        case '7':
          return <HuggingFaceConfigForm />;
      default:
        return null;
    }
  };

  const handleChangeSideMenu = ({ key }) => {
    setActiveKey(key);
  };

  return (
    <div className="profile-container">
      <CommonLayout
        sideMenuItems={getProfilePageSideMenuItems(role)}
        handleChangeSideMenu={handleChangeSideMenu}
        activeKey={activeKey}
      >
        {renderContent()}
      </CommonLayout>
    </div>
  );
};

export default Profile;
