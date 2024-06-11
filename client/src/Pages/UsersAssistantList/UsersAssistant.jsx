import React, { useEffect, useState } from "react";

//Libraries
import {
  Button,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  Switch,
  Tabs
} from "antd";
import { AiOutlineDelete, AiOutlineEdit, AiOutlineArrowUp } from "react-icons/ai";

//Component imports
import CreateAssistantModal from "../../component/Assistant/Assistantmodal/CreateAssistantModal";

//hooke
import useAssistantPage from "../../Hooks/useAssistantPage";

//-----Helper----------//
import { showDeleteConfirm } from "../../Utility/assistant-helper"
import DebouncedSearchInput from "../SuperAdmin/Organizations/DebouncedSearchInput";
import { axiosSecureInstance } from "../../api/axios";
import { SEARCH_ALL_USER_CREATED_ASSISTANTS_SLUG } from "../../constants/Api_constants";
import { getUserID } from "../../Utility/service";
import FavoriteAssistantList from "../../component/Assistant/FavoriteAssistantList"; 
import SingleUserAssistants from "../../component/Assistant/PersonalAssistantList"; 
import { usePublicAssistant } from "../../Hooks/usePublicAssistantPage";
import { useFavoriteAssistant } from "../../Hooks/useFavoriteAssistantPage";
import { getFavoriteAssistant } from "../../api/favoriteAssistant";
import { MdOutlineAssistant } from "react-icons/md";

import {
  SettingOutlined,
  BuildFilled,
  UserDeleteOutlined,
  GlobalOutlined ,
  HeartOutlined
} from "@ant-design/icons";
import AdminAssistantList from "../../component/Assistant/AdminAssistantList";
const { Title } = Typography;
const IconComponent = ({ label }) => {
  switch (label) {
    case "My Assistants":
      return <MdOutlineAssistant className="me-2" />;
    case "Favorite Assistants":
      return <HeartOutlined  className="me-2" />;  

  }
};
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

//constants
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


const UserAssistants = () => {
  //-----States ------//
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeKey, setActiveKey] = useState("unoptimized-data");
  const [isFunctionCallingAssistant, setIsFunctionCallingAssistant] =
    useState(false);
  const [assistantData, setAssistantData] = useState({
    ...initialAssistantState,
  });

  const [searchQuery, setSearchQuery] = useState("");

  //------Side Effects ---------//
  useEffect(() => {
    handleFetchUserCreatedAssistants();
  }, []);

  //----------Hooks--------------//
  const {
    loader,
    adminUserAssistants,
    handleUpdateAssistant,
    handleFetchUserCreatedAssistants,
    handleFetchAllAssistants,
    handleDeleteAssistant,
    totalCount,
    setAdminUserAssistants,
    updateLoader,
    searchPersonalAssistants,
    handlePublicAssistantAdd,
  } = useAssistantPage();

  const {
    
    handleDeletePublicAssistant
  } = usePublicAssistant();
  const { handleDeleteFavoriteAssistant } = useFavoriteAssistant();

  //--------Local functions------------//
  const showEditModalHandler = (assistant) => {
    const filteredAssistantData = {
      ...assistant,
      tools: assistant?.tools?.map(({ type }) => type),
    };
    setAssistantData(filteredAssistantData);
    setEditMode(true);
    setShowModal(true);
  };

  const handleClose = () => {
    setAssistantData(() => ({ ...initialAssistantState }));
    setShowModal((value) => !value);
    setEditMode(false);
  };

  const redirectToAssistant = (record) => {
    
    const assistantId = record.assistant_id;
    const url = `/assistants/${assistantId}`;
    window.open(url, "_blank");
  };

  //------Columns----------//

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="text-left">{text}</span>,
    },
    {
      title: "Status",
      key: "is_active",
      dataIndex: "is_active",
      width: 100,
      render: (_, { is_active }) => (
        <Tag color={is_active ? "green" : "red"}>
          {is_active ? "active" : "inactive"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
              onClick={() => redirectToAssistant(record)}
              icon={<AiOutlineArrowUp />}
          ></Button>
          <Button
            onClick={() => showEditModalHandler(record)}
            icon={<AiOutlineEdit />}
          ></Button>
          <Tooltip title="Activate or Deactivate">
            <Switch
              checked={record.is_active}
              onChange={(checked) =>
                handleUpdateAssistant(record._id, {
                  is_active: checked,
                })
              }
            />
          </Tooltip>
          <Button
            onClick={() => showDeleteConfirm(record.assistant_id, record.name, handleDeleteAssistant)}
            danger
            icon={<AiOutlineDelete />}
          />
        </Space>
      ),
    },
  ];

  useEffect(() => {
    searchPersonalAssistants(searchQuery)
  }, [searchQuery]);

  

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
                + Create New
              </Button>
            </div>
          </div>
          <Tabs defaultActiveKey="1">
          {renderTabPane("1", "My Assistants", SingleUserAssistants, {
              adminUserAssistants,
              loader,
              handleDeleteAssistant,
              handleUpdateAssistant,
              showEditModalHandler,
              handleFetchUserCreatedAssistants,
              handlePublicAssistantAdd,
              getFavoriteAssistant,
              handleDeleteFavoriteAssistant
            })}

            {renderTabPane("2", "Favorite Assistants", FavoriteAssistantList, {
              adminUserAssistants,
              loader,
              handleDeleteAssistant,
              handleUpdateAssistant,
              showEditModalHandler,
              handleFetchUserCreatedAssistants,
              handlePublicAssistantAdd,
              getFavoriteAssistant,
              handleDeleteFavoriteAssistant
            })}





          </Tabs>
          <CreateAssistantModal
            data={{
              handleClose,
              showModal,
              editMode,
              setEditMode,
              assistantData,
              setAssistantData,
              isAdmin: false,
              handleFetchUserCreatedAssistants,
              handleFetchAllAssistants,
              isFunctionCallingAssistant,
              activeKey,
              setActiveKey,
            }}
          />
        </div>
      </div>
    </>
  );
};

export default UserAssistants;
