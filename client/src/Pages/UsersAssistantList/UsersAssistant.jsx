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
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";

//Component imports
import CreateAssistantModal from "../../component/Assistant/Assistantmodal/CreateAssistantModal";

//hooke
import useAssistantPage from "../../Hooks/useAssistantPage";

//-----Helper----------//
import { showDeleteConfirm }  from "../../Utility/assistant-helper"

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
  const [assistantData, setAssistantData] = useState({
    ...initialAssistantState,
  });

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
      render: (_, { is_active = false }) => (
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
            onClick={() => showEditModalHandler(record)}
            icon={<AiOutlineEdit />}
          ></Button>
          <Tooltip title="Activate or Deactivate">
            <Switch
              defaultChecked={record?.is_active}
              onChange={(checked) =>
                handleUpdateAssistant(record._id, {
                  is_active: checked,
                })
              }
            />
          </Tooltip>
          <Button
            onClick={() => showDeleteConfirm(record.assistant_id, record.name,handleDeleteAssistant)}
            danger
            icon={<AiOutlineDelete />}
          />
        </Space>
      ),
    },
  ];

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
              handleFetchAllAssistants
            }}
          />
          <Table
             loading={loader.ASSISTANT_LOADING}
            bordered={true}
            columns={columns}
            dataSource={adminUserAssistants}
            scroll={{ y: "50vh" }}
          />
        </div>
      </div>
    </>
  );
};

export default UserAssistants;
