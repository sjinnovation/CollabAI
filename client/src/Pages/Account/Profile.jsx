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

const Profile = () => {

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
  ];

  return (
    <div>
      <Row className='p-5'>
        <Col span={24}>
          <Tabs 
            defaultActiveKey="1" 
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