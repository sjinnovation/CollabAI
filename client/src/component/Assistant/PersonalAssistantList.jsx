import React, { useEffect, useState } from "react";
import AssistantTable from "../../component/Assistant/AssistantTable";
import UserAssistantList from "../../component/Assistant/UserAssistantList";
import FavoriteAssistantList from "../../component/Assistant/FavoriteAssistantList";
import { AssistantNeedToActiveFirst } from "../../constants/PublicAndPrivateAssistantMessages";
import { useNavigate } from 'react-router-dom';
//Libraries
import {
  Button,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  Switch,
  Tabs,
  Modal,
  Avatar,
  Spin,
  message,
} from "antd";
import { AiOutlineDelete, AiOutlineEdit,AiOutlineArrowUp } from "react-icons/ai";
//Component imports

//hooke
import useAssistantPage from "../../Hooks/useAssistantPage";

//-----Helper----------//
import { showDeleteConfirm } from "../../Utility/assistant-helper"
import { MdOutlineAssistant } from "react-icons/md";
import {
  SettingOutlined,
  BuildFilled,
  UserDeleteOutlined,
} from "@ant-design/icons";
import { showRemoveConfirm, handleSwitchChange } from "../../Utility/showModalHelper";
import { usePublicAssistant } from "../../Hooks/usePublicAssistantPage";
import { useFavoriteAssistant } from "../../Hooks/useFavoriteAssistantPage";

import { BsRobot } from "react-icons/bs";
import DebouncedSearchInput from "../../Pages/SuperAdmin/Organizations/DebouncedSearchInput";
import { handleCheckAssistantActive } from "../../Utility/addPublicAssistantHelper";
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

const IconComponent = ({ label }) => {
  switch (label) {
    case "Personal Assistants":
      return <MdOutlineAssistant className="me-2" />;
    case "Admin Assistants":
      return <BuildFilled className="me-2" />;
    case "User Assistants":
      return <UserDeleteOutlined className="me-2" />;
    case "Settings":
      return <SettingOutlined className="me-2" />;
  }
};

const SingleUserAssistants = ({ data }) => {
  const { showEditModalHandler } = data
  const { confirm } = Modal;
  //-----States ------//
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();
  const [assistantData, setAssistantData] = useState({
    ...initialAssistantState,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);


  //------Side Effects ---------//
  useEffect(() => {
    setIsLoading(true);
    handleFetchUserCreatedAssistants();
    setIsLoading(false);

  }, []);

  //----------Hooks--------------//
  const {
    adminUserAssistants,
    loader,
    handleDeleteAssistant,
    handleUpdateAssistant,

    handleFetchUserCreatedAssistants,
    handlePublicAssistantAdd,

  } = useAssistantPage();
  const { getFavoriteAssistant } = useFavoriteAssistant();


  const handlePublicOnClick = (checked, record, handlePublicAssistantAdd) => {
    (checked === false) ? showRemoveConfirm(record.assistant_id, record.name, record?._id, localStorage.getItem("userID"), checked, record?.is_active, handlePublicAssistantAdd) : handlePublicAssistantAdd(record?._id, localStorage.getItem("userID"), checked, record?.assistant_id, record?.is_active)
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


  // Filter the data based on the search query
  const filteredData = adminUserAssistants.filter(item => {
    const itemName = item.name.toLowerCase();
    const query = typeof searchQuery === 'string' ? searchQuery.toLowerCase() : '';

    return itemName.includes(query);
  });

  const openAssistantNewPage = (assistant_id, name) => {

    navigate(`/assistants/${assistant_id}`);

  };

  //------Columns----------//

  const columns = [
    {
      title: "Assistant",
      dataIndex: "name",
      key: "name",
      align: "center",
      render: (_, { name, image_url }) => (
        <Space size="middle" className="d-flex align-items-center">
          {image_url ? (
            <Avatar src={image_url} />
          ) : (
            <BsRobot className="fs-4" />
          )}
         <span className="ms-2 text-start">{name}</span>
        </Space>
      ),
    },
    {
      title: "Status",
      key: "is_active",
      dataIndex: "is_active",
      align: "center",
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
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Chat with Assistant">
            <Button onClick={() => openAssistantNewPage(record?.assistant_id, record?.name)}><AiOutlineArrowUp/></Button>
          </Tooltip>

          <Button
            onClick={() => showEditModalHandler(record)}
            icon={<AiOutlineEdit />}
          ></Button>
          <Tooltip title="Activate or Deactivate">
            <Switch
              checked={record?.is_active}
              onChange={(checked) =>
                handleSwitchChange(record, checked, handleUpdateAssistant)
              }

            />
          </Tooltip>
          <Button
            onClick={() => showDeleteConfirm(record.assistant_id, record.name, handleDeleteAssistant)}
            danger
            icon={<AiOutlineDelete />}
          />
          <Tooltip title="Public or Private">
            <Switch
              checked={record?.is_public}
              onChange={(checked) =>{handleCheckAssistantActive(checked, record, handlePublicAssistantAdd)}

              }

              loading={
                loader.ASSISTANT_UPDATING === record._id ?? false
              }

            />
          </Tooltip>

        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="container">
        <div className="mb-3">
          <DebouncedSearchInput
            data={{
              search: searchQuery,
              setSearch: setSearchQuery,
              placeholder: "Search Assistant",
            }}
          />
        </div>
          <Table
            loading={isLoading}
            bordered={true}
            columns={columns}
            dataSource={filteredData}
            scroll={{ y: '50vh' }}
            pagination={{
              pageSize: 10,
              total: filteredData?.length,
            }}
          />

      </div>
    </>
  );
};

export default SingleUserAssistants;
