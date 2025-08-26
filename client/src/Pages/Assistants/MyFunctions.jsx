import { Row, Col } from "antd";
import { getUserID } from "../../Utility/service";

import CommonPageLayout from "../../component/layout/CommonStructure/CommonPageLayout";
import ProfileHeader from "../../component/Proflie/ProfileHeader";
import UserFunctionsTable from "../../component/FunctionsTable/UserFunctionsTable";

const userId = getUserID();

const MyFunctions = () => (
  <CommonPageLayout>
    <div className="functions-page-container">
      <ProfileHeader
        title="My Functions"
        subHeading="View and manage your custom AI functions."
        breadcrumbs={[
          { label: "Home", url: "/" },
          { label: "Agents", url: "/myAgents" },
          { label: "My Functions", url: "" },
        ]}
      />
      <Row>
        <Col span={24}>
          <UserFunctionsTable data={{ userId }} />
        </Col>
      </Row>
    </div>
  </CommonPageLayout>
);

export default MyFunctions;
