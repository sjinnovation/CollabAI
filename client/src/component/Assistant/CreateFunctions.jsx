import { Tabs, Row, Col } from "antd";
import React from "react";
import UserFunctionCallingAssistantTable from "./UserFunctionCallingAssistantTable";
import FunctionCallingAssistantTable from "./FunctionCallingAssistantTable";

function CreateFunctions({
  functionCallingAssistants,
  setFunctionCallingAssistants,
  loader,
  handleDeleteAssistant,
  handleUpdateAssistant,
  showEditModalHandler,
  handleFetchFunctionCallingAssistants,
  updateLoader,
  userId,
  userRole,
  refreshTrigger,
  setRefreshTrigger,
  toggleDefineFunctionsModal
}) {
  const items = [
    {
      key: "1",
      label: "My Functions",
      children: (
        <UserFunctionCallingAssistantTable
          data={{
            functionCallingAssistants,
            setFunctionCallingAssistants,
            loader,
            handleDeleteAssistant,
            handleUpdateAssistant,
            showEditModalHandler,
            handleFetchFunctionCallingAssistants,
            updateLoader,
            userId,
            userRole,
            refreshTrigger,
            setRefreshTrigger,
            toggleDefineFunctionsModal
          }}
        />
      ),
    },
    {
      key: "2",
      label: "All Functions",
      children: (
        <FunctionCallingAssistantTable
          data={{
            functionCallingAssistants,
            setFunctionCallingAssistants,
            loader,
            handleDeleteAssistant,
            handleUpdateAssistant,
            showEditModalHandler,
            handleFetchFunctionCallingAssistants,
            updateLoader,
            userId,
            userRole,
            refreshTrigger,
            setRefreshTrigger,
            toggleDefineFunctionsModal
          }}
        />
      ),
    },
  ];

  return (
    <div>
      <Row>
        <Col span={24}>
          <Tabs
            defaultActiveKey="1"
            items={items}
            className="custom-tab"
            tabBarStyle={{ justifyContent: "space-around" }}
          />
        </Col>
      </Row>
    </div>
  );
}

export default CreateFunctions;