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

const { Title } = Typography;

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
    searchPersonalAssistants
  } = useAssistantPage();

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
    
    const assistantName = record.name.split(" ").join("-");
    const assistantId = record.assistant_id;
    const url = `/assistants/${assistantName}/${assistantId}`;
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
          <div className="mb-4">
            <DebouncedSearchInput
              data={{
                search: searchQuery,
                setSearch: setSearchQuery,
                placeholder: "Search assistants",
              }}
            />
          </div>
          <Table
            loading={loader.ASSISTANT_LOADING}
            bordered={true}
            columns={columns}
            dataSource={adminUserAssistants}
            scroll={{ y: "50vh" }}
            pagination={{
              pageSize: 10,
              total: totalCount,
              onChange: (page) => {
                handleFetchUserCreatedAssistants(page)
                
              }
            }}
          />
        </div>
      </div>
    </>
  );
};

export default UserAssistants;
