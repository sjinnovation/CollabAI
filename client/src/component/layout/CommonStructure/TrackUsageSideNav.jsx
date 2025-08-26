import { useState, useEffect, useContext } from "react";
import { Link, useLocation, matchPath } from "react-router-dom";
import { Layout, Menu } from "antd";
import { trackUsageSideMenuItems } from "../../../Utility/SideMenuItems/TrackUsageSideMenu";
import { ThemeContext } from "../../../contexts/themeConfig";
import { getUserRole } from "../../../Utility/service";
import { SidebarContext } from "../../../contexts/SidebarContext";
import "./style.scss";

const { Sider } = Layout;

const getActiveKey = (pathname, items) => {
  // Special case for root trackUsage path
  if (pathname === "/reports") {
    return "1"; // Default to Monthly Usage
  }
  
  // Use the same approach as CommonSideNav
  const hit = items.find(({ paths }) =>
    paths.some((p) => matchPath({ path: p, end: false }, pathname))
  );
  return hit ? hit.key : "1";
};

const TrackUsageSideNav = () => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { theme } = useContext(ThemeContext);
  const role = getUserRole();
  const { trackUsageMenu, setTrackUsageMenu } = useContext(SidebarContext);

  const allowedItems = trackUsageSideMenuItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  const activeKey = getActiveKey(location.pathname, allowedItems);

  const siderStyles = {
    backgroundColor: theme === "light" ? "#fff" : "#000",
    borderRight: "1px solid var(--border-color)",
    padding: 15,
    marginBottom: 55,
  };

  const menuStyles = {
    width: "100%",
    border: "none",
    textAlign: "start",
    backgroundColor: "transparent",
    display: "flex",
    flexDirection: "column",
  };

  return (
    <div
      style={{
        borderRight: "1px solid var(--border-color)",
        backgroundColor: theme === "light" ? "#fff" : "#000",
      }}
    >
      <Sider
        width={256}
        className="track-usage-sideMenu"
        trigger={null}
        collapsible
        collapsed={trackUsageMenu}
        breakpoint="md"
        style={siderStyles}
      >
        {/* <div style={{ marginBottom: 20 }}>
          <h3 style={{ 
            color: "var(--theme-toggler-dark)", 
            margin: 0, 
            fontSize: "18px",
            fontWeight: "600"
          }}>
            Usage Tracking
          </h3>
        </div> */}
        <hr />
        <Menu
          mode="inline"
          selectedKeys={activeKey ? [activeKey] : []}
          style={menuStyles}
          items={allowedItems.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: (
              <Link
                to={item.navTo}
                style={{ color: "inherit", textDecoration: "none" }}
              >
                {item.label}
              </Link>
            ),
          }))}
        />
      </Sider>
    </div>
  );
};

export default TrackUsageSideNav; 