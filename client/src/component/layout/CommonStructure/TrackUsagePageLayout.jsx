import { Layout } from "antd";
import TrackUsageSideNav from "./TrackUsageSideNav";
import CommonMainSection from "./CommonMainSection";
import "./style.scss";

const TrackUsagePageLayout = ({ children }) => {
  return (
    <Layout className="commonParentLayout">
      <TrackUsageSideNav />
      <CommonMainSection>{children}</CommonMainSection>
    </Layout>
  );
};

export default TrackUsagePageLayout; 