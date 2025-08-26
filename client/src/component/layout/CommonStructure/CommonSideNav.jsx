import { useState, useEffect, useContext } from "react";
import { Link, useLocation, matchPath } from "react-router-dom";
import { Layout, Menu, Button } from "antd";
import { FaPlus } from "react-icons/fa";
import { agentPageMenuItems } from "../../../Utility/SideMenuItems/AgentPageSideMenu";
import { ThemeContext } from "../../../contexts/themeConfig";
import { getUserRole } from "../../../Utility/service";
import { SidebarContext } from "../../../contexts/SidebarContext";
import "./style.scss";

const { Sider } = Layout;

const getActiveKey = (pathname, items, stateFrom) => {
  if (matchPath({ path: "/editAgent/:id", end: true }, pathname)) {
    if (stateFrom === "/myAgents") {
      return items.find((item) => item.navTo === "/myAgents")?.key;
    }
    if (stateFrom === "/organizationalAgents") {
      return items.find((item) => item.navTo === "/organizationalAgents")?.key;
    }
  }
  if (matchPath({ path: "/editFunction/:id", end: true }, pathname)) {
    if (stateFrom === "/myFunctions") {
      return items.find((item) => item.navTo === "/myFunctions")?.key;
    }
    if (stateFrom === "/allFunctions") {
      return items.find((item) => item.navTo === "/allFunctions")?.key;
    }
  }
  if (matchPath({ path: "/createFunction", end: true }, pathname)) {
    if (stateFrom === "/myFunctions") {
      return items.find((item) => item.navTo === "/myFunctions")?.key;
    }
    if (stateFrom === "/allFunctions") {
      return items.find((item) => item.navTo === "/allFunctions")?.key;
    }
  }

  const hit = items.find(({ paths }) =>
    paths.some((p) => matchPath({ path: p, end: false }, pathname))
  );
  return hit ? hit.key : undefined;
};

const CommonSideNav = () => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { theme } = useContext(ThemeContext);
  const role = getUserRole();
  const { agentListMenu } = useContext(SidebarContext);

  const allowedItems = agentPageMenuItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  const activeKey = getActiveKey(
    location.pathname,
    allowedItems,
    location.state?.from
  );


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
        className="agent-list-sideMenu"
        trigger={null}
        collapsible
        collapsed={agentListMenu}
        breakpoint="md"
        style={siderStyles}
      >
        <div style={{ marginBottom: 20 }}>
          <Link to="/createAgent">
            <Button
              size="small"
              className="plusNewButton m-0"
              type="primary"
              block
              icon={<FaPlus />}
            >
              Create Agent
            </Button>
          </Link>
        </div>
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

export default CommonSideNav;
