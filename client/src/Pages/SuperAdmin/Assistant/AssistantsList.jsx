import React from "react";
import { useEffect, useState } from "react";

//libraries
import { Tabs, Button, Typography } from "antd";

import {
  SettingOutlined,
  BuildFilled,
  UserDeleteOutlined,
} from "@ant-design/icons";
import { MdOutlineAssistant } from "react-icons/md";

//Components
import CreateAssistantModal from "../../../component/Assistant/Assistantmodal/CreateAssistantModal";
import AssistantTable from "../../../component/Assistant/AssistantTable";
import UserAssistantList from "../../../component/Assistant/UserAssistantList";
import AssistantSettings from "../../../component/Assistant/AssistantSettings";
import AdminAssistantList from "../../../component/Assistant/AdminAssistantList";

//Hooks
import useAssistantPage from "../../../Hooks/useAssistantPage";

//-----Constants-----//
const initialAssistantState = {
  name: "",
  instructions: "",
  description: "",
  files: [],
  assistantId: "",
  tools: [],
  model: "",
  category: "",
  static_questions: [],
};

const { Title } = Typography;

//----components-----//
const AssistantsList = () => {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [assistantData, setAssistantData] = useState({
    ...initialAssistantState,
  });

  //----------Side Effects-------//
  useEffect(() => {
    handleFetchUserCreatedAssistants();
    handleFetchUserAssistantStats();
    handleFetchAllAssistants(1);
    handleFetchTeams();
  }, []);

  //---------Hooks ------------//
  const {
    setAdminUserAssistants,
    adminUserAssistants,
    totalCount,
    userAssistants,
    assistants,
    setAssistants,
    teamList,
    loader,
    handleAssignTeamToAssistant,
    handleUpdateAssistant,
    handleFetchUserCreatedAssistants,
    handleFetchUserAssistantStats,
    handleDeleteAssistant,
    handleFetchAllAssistants,
    handleFetchTeams,
    updateLoader,
    searchOrganizationalAssistants,
    searchPersonalAssistants,
    orgAssistantSearchQuery,
    setOrgAssistantSearchQuery,
    personalAssistantSearchQuery,
    setPersonalAssistantSearchQuery
  } = useAssistantPage();

  // <---------------local-Functions------------------------->

  const handleClose = () => {
    setAssistantData(() => ({ ...initialAssistantState }));
    setShowModal((value) => !value);
    setEditMode(false);
  };

  const showEditModalHandler = (assistant) => {
    const filterAssistantData = {
      ...assistant,
      tools: assistant?.tools?.map(({ type }) => type),
    };
    setAssistantData(filterAssistantData);
    setEditMode(true);
    setShowModal(true);
  };

  return (
    <>
      <div className="mt-5">
        <div className="container">
          <div className="d-flex align-items-center justify-content-between">
            <div className="col-8 d-flex align-items-center justify-content-between">
              <Title level={2}>Assistant Lists</Title>
            </div>
            <div className="col-2 d-flex justify-content-end">
              <Button className="" onClick={handleClose}>
                + Assistant
              </Button>
            </div>
          </div>
          <Tabs defaultActiveKey="1">
            {renderTabPane("1", "My Assistants", AdminAssistantList, {
              setAdminUserAssistants,
              adminUserAssistants,
              totalCount,
              loader,
              handleDeleteAssistant,
              handleUpdateAssistant,
              showEditModalHandler,
              handleFetchUserCreatedAssistants,
              updateLoader,
              searchPersonalAssistants,
              personalAssistantSearchQuery,
              setPersonalAssistantSearchQuery
            })}
            {renderTabPane("2", "Organizational Assistants", AssistantTable, {
              assistants,
              setAssistants,
              loader,
              teamList,
              handleAssignTeamToAssistant,
              handleDeleteAssistant,
              handleUpdateAssistant,
              showEditModalHandler,
              handleFetchAllAssistants,
              updateLoader,
              searchOrganizationalAssistants,
              orgAssistantSearchQuery,
              setOrgAssistantSearchQuery
            })}
            {renderTabPane("3", "User Assistants", UserAssistantList, {
              userAssistants,
              loader,
              handleDeleteAssistant,
            })}
            {renderTabPane("4", "Settings", AssistantSettings, {
              loader,
              teamList,
              handleFetchTeams,
            })}
          </Tabs>
          <div className="row">
            <div className="col">
              <CreateAssistantModal
                data={{
                  handleClose,
                  showModal,
                  editMode,
                  assistantData,
                  setAssistantData,
                  isAdmin: true,
                  handleFetchUserCreatedAssistants,
                  handleFetchAllAssistants,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
/**
 * Creates and returns a TabPane.
 * @param {string} key - The key.
 * @param {string} label - The label.
 * @param {JSX.Element} component - The component.
 * @param {object} data - The data.
 * @returns {JSX.Element} The TabPane.
 */
const renderTabPane = (key, label, Component, data) => (
  <Tabs.TabPane
    key={key}
    tab={
      <span>
        <IconComponent label={label} />
        {label}
      </span>
    }
  >
    <Component data={data} />
  </Tabs.TabPane>
);

/**
 * Returns the corresponding icon based on the label.
 * @param {string} label - The label.
 * @returns {JSX.Element} The icon.
 */
const IconComponent = ({ label }) => {
  switch (label) {
    case "My Assistants":
      return <MdOutlineAssistant className="me-2" />;
    case "Organizational Assistants":
      return <BuildFilled className="me-2" />;
    case "User Assistants":
      return <UserDeleteOutlined className="me-2" />;
    case "Settings":
      return <SettingOutlined className="me-2" />;
  }
};

export default AssistantsList;
