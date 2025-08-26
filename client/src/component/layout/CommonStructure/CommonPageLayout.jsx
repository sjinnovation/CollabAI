import { Layout } from "antd";
import CommonSideNav from "./CommonSideNav";
import CommonMainSection from "./CommonMainSection";
import "./style.scss";

const CommonPageLayout = ({ children }) => {
  return (
    <Layout className="commonParentLayout">
      <CommonSideNav />
      <CommonMainSection>{children}</CommonMainSection>
    </Layout>
  );
};

export default CommonPageLayout;
