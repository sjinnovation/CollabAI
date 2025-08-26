import React, { useContext } from "react";
import CommonSidebar from "./CommonSidebar";
import CommonMainSection from "./CommonMainSection";
import { ThemeContext } from "../../../contexts/themeConfig";
import { Layout } from "antd";
import "./style.scss";

const CommonLayout = ({
  children,
  handleChangeSideMenu,
  sideMenuItems,
  activeKey,
  HeaderContentChildren = null,
}) => {
  const { theme } = useContext(ThemeContext);
  const { Sider } = Layout;
  return (
    <Layout className="commonParentLayout">
      <CommonSidebar
        handleChangeSideMenu={handleChangeSideMenu}
        sideMenuItems={sideMenuItems}
        theme={theme}
        Sider={Sider}
        activeKey={activeKey}
        HeaderContentChildren={HeaderContentChildren}
      />
      <CommonMainSection>{children}</CommonMainSection>
    </Layout>
  );
};

export default CommonLayout;