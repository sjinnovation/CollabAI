import { FaRegTrashAlt } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { Tabs, Row, Col } from 'antd';
import ProfileInfo from './ProfileInfo';
import Trash from './Trash';
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { MdAppSettingsAlt } from "react-icons/md";

import Usage from "./Usage";
import CustomizeChat from "./CustomizeChat";
import AdvanceAiParameters from "./AdvanceAiParameters";
import { IntegrateApplications } from "../../component/IntegrateApplications/IntegrateApplications";
import googleDriveIcon from '../../assests/images/google-drive-icon.png';
import { TbPlugConnectedX } from "react-icons/tb"; 
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const Profile = () => {
  const location = useLocation();
  const [activeKey, setActiveKey] = useState('1');

  useEffect(() => {
    if (location.state?.activeTabKey) {
      setActiveKey(location.state.activeTabKey);
    }
  }, [location]);



  const items = [
    {
      key: '1',
      label: 'Profile',
      children: <ProfileInfo />,
      icon: <CgProfile />
    },
    {
      key: '2',
      label: 'Trash',
      children: <Trash />,
      icon: <FaRegTrashAlt />
    },
    {
      key: '3',
      label: 'Personal Usage',
      children: <Usage/>,
      icon: <FaMoneyBillTrendUp />
    },
    {
      key: '4',
      label: 'Customize Chat (Beta)',
      children: <CustomizeChat/>,
      icon: <MdAppSettingsAlt />
    },
    {
        key: '5',
        label: 'Advanced AI Settings (Beta)',
        children: <AdvanceAiParameters/>,
        icon: <FaMoneyBillTrendUp />
      },
    {
        key: '6',
        label: 'Connect Apps',
        children: <IntegrateApplications/>,
        icon: <TbPlugConnectedX className="large-icon lg" />

        //  <img src={googleDriveIcon} alt="Google Drive Icon" style={{ width: 20, height: 20 }} /> 
      },
  ];

  return (
    <div>
      <Row className='p-5'>
        <Col span={24}>
          <Tabs 
            activeKey={activeKey}
            onChange={setActiveKey}
            items={items}
            className="mb-3 custom-tab"
            tabBarStyle={{ justifyContent: 'space-around' }}
          />
        </Col>
      </Row>
    </div>
  );
};

export default Profile;