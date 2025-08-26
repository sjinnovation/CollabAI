import { Menu } from 'antd';
import { useContext } from 'react'
import { SidebarContext } from '../../../contexts/SidebarContext';
import './CommonSidebarResponsive.css';

const CommonSidebar = ({
  handleChangeSideMenu,
  sideMenuItems,
  Sider,
  theme,
  activeKey,
  HeaderContentChildren = null,
}) => {
  const { showSettingMenu, setSettingMenu, exploreAgentsMenu } = useContext(SidebarContext);

  return (
    <Sider className="knowledge-base-sidemenu" trigger={null} collapsible collapsed={showSettingMenu || exploreAgentsMenu} width={256} align={"center"} style={{ backgroundColor: theme === "light" ? "#fff" : "#000", borderRight: "1px solid var(--border-color)", padding: "15px", marginBottom: "55px" }} >
    <div className="sider__inner">
      {
        HeaderContentChildren ? <div className="side-top-section">{HeaderContentChildren}</div> : <></>
      }
      <div>
        <Menu
          onClick={handleChangeSideMenu}
          style={{
            width: "100%",
            border: "none",
            textAlign: "start",
            backgroundColor: "transparent",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
          defaultSelectedKeys={[activeKey]}
          defaultOpenKeys={['sub1']}
          mode="inline"
          items={sideMenuItems}
          selectedKeys={[activeKey]}
          iconSize={20}
        />
      </div>
    </div>
  </Sider>
  )
}

export default CommonSidebar;
