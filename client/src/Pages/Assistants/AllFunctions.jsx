import { Row, Col } from "antd";
import { getUserRole } from "../../Utility/service";

import CommonPageLayout from "../../component/layout/CommonStructure/CommonPageLayout";
import ProfileHeader from "../../component/Proflie/ProfileHeader";
import FunctionDefinitionsTable from "../../component/FunctionsTable/FunctionDefinitionsTable";

const userRole = getUserRole();

const AllFunctions = () => {
  return (
    <CommonPageLayout>
      <div className="all-functions-page-container">
        <ProfileHeader
          title="All Functions"
          subHeading="View all custom AI functions."
          breadcrumbs={[
            { label: "Home", url: "/" },
            { label: "Agents", url: "/myAgents" },
            { label: "All Functions", url: "" },
          ]}
        />
        <Row>
          <Col span={24}>
            <FunctionDefinitionsTable data={{ userRole }} />
          </Col>
        </Row>
      </div>
    </CommonPageLayout>
  );
};

export default AllFunctions;
