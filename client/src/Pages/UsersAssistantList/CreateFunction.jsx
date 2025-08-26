import { Tabs, Row, Col } from "antd";
import React from "react";
import UserFunctionCallingAssistantTable from "../../component/Assistant/UserFunctionCallingAssistantTable";
import FunctionCallingAssistantTable from "../../component/Assistant/FunctionCallingAssistantTable";
import { getUserRole } from "../../Utility/service";


function CreateFunction({
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
  const role = getUserRole()
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
  ];

  if(role === 'superadmin' || role === 'admin') {
    items.push(
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
    )
  }
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

export default CreateFunction;