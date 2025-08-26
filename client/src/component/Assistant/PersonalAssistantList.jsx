import React, { useEffect, useState } from "react";
import AssistantTable from "../../component/Assistant/AssistantTable";
import UserAssistantList from "../../component/Assistant/UserAssistantList";
import FavoriteAssistantList from "../../component/Assistant/FavoriteAssistantList";
import { AssistantNeedToActiveFirst } from "../../constants/PublicAndPrivateAssistantMessages";
import { useNavigate } from "react-router-dom";
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
  Dropdown,
  Menu,
  Pagination,
} from "antd";
import {
  AiOutlineDelete,
  AiOutlineEdit,
  AiOutlineArrowUp,
} from "react-icons/ai";
//Component imports

//hooke
import useAssistantPage from "../../Hooks/useAssistantPage";

//-----Helper----------//
import { showDeleteConfirm } from "../../Utility/assistant-helper";
import { MdOutlineAssistant } from "react-icons/md";
import {
  SettingOutlined,
  BuildFilled,
  UserDeleteOutlined,
} from "@ant-design/icons";
import {
  showRemoveConfirm,
  handleSwitchChange,
} from "../../Utility/showModalHelper";
import { usePublicAssistant } from "../../Hooks/usePublicAssistantPage";
import { useFavoriteAssistant } from "../../Hooks/useFavoriteAssistantPage";

import { BsRobot, BsThreeDotsVertical } from "react-icons/bs";
import DebouncedSearchInput from "../../Pages/SuperAdmin/Organizations/DebouncedSearchInput";
import { handleCheckAssistantActive } from "../../Utility/addPublicAssistantHelper";
import { BiSolidLock, BiSolidLockOpen } from "react-icons/bi";
import { IoChatbubbleEllipsesOutline, IoCloseCircle, IoInformationCircleOutline } from "react-icons/io5";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { RxCrossCircled } from "react-icons/rx";
import { CiCircleCheck } from "react-icons/ci";
import ProfileHeader from "../Proflie/ProfileHeader";
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
  const {
    adminUserAssistants,
    loader,
    handleDeleteAssistant,
    handleUpdateAssistant,
    showEditModalHandler,
    handleFetchUserCreatedAssistants,
    handlePublicAssistantAdd,
    handleDeleteFavoriteAssistant,
    getAssistantInfo,
    isLoading,
    setIsLoading,
    totalCount,
  } = data;

  const { confirm } = Modal;
  //-----States ------//
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();
  const [assistantData, setAssistantData] = useState({
    ...initialAssistantState,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  //------Side Effects ---------//
  useEffect(() => {
    setIsLoading(true);
    handleFetchUserCreatedAssistants(currentPage, searchQuery, pageSize);
    setIsLoading(false);
  }, [currentPage, searchQuery, pageSize]);

  //----------Hooks--------------//
  const { getFavoriteAssistant } = useFavoriteAssistant();

  const handlePublicOnClick = (checked, record, handlePublicAssistantAdd) => {
    checked === false
      ? showRemoveConfirm(
          record?.assistant_id,
          record?.name,
          record?._id,
          localStorage.getItem("userID"),
          checked,
          record?.is_active,
          handlePublicAssistantAdd
        )
      : handlePublicAssistantAdd(
          record?._id,
          localStorage.getItem("userID"),
          checked,
          record?.assistant_id,
          record?.is_active
        );
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
  const filteredData = adminUserAssistants.filter((item) => {
    const itemName = item.name.toLowerCase();
    const query =
      typeof searchQuery === "string" ? searchQuery.toLowerCase() : "";

    return itemName.includes(query);
  });
  const openAssistantNewPage = (assistant_id, name) => {
    navigate(`/agents/${assistant_id}`);
  };

  const createActionMenu = (record) => {
    return (
      <Menu>
        <Menu.Item key="chat">
          <span
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
            onClick={() =>
              openAssistantNewPage(record?.assistant_id, record?.name)
            }
          >
            <IoChatbubbleEllipsesOutline /> Chat with Agent
          </span>
        </Menu.Item>
        <Menu.Item key="edit">
          <span
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
            onClick={async () => {
              setIsLoading(true);
              const isExisting = await getAssistantInfo(record?.assistant_id);
              if (isExisting) {
                await showEditModalHandler(record);
              } else {
                setIsLoading(false);
              }
            }}
          >
            <AiOutlineEdit /> Edit Agent
          </span>
        </Menu.Item>
        <Menu.Item key="activate">
          <span
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
            onClick={async () => {
              await handleSwitchChange(
                record,
                !record?.is_active,
                handleUpdateAssistant
              );
              handleFetchUserCreatedAssistants(
                currentPage,
                searchQuery,
                pageSize
              );
            }}
          >
            {record?.is_active ? <RxCrossCircled /> : <CiCircleCheck />} Make{" "}
            {record?.is_active ? "Deactivate" : "Activate"}
          </span>
        </Menu.Item>
          <Menu.Item key="details">
            <span
              className="action-item-layout"
              onClick={() => {
                Modal.info({
                  title: "Model & Tools Details",
                  content: (
                    <div>
                      <p>
                        <strong>AI Model:</strong>{" "}
                        {Array.isArray(record?.model)
                          ? record?.model.join(", ")
                          : record?.model || "N/A"}
                      </p>

                      <p>
                        <strong>Tools Enabled:</strong>{" "}
                        {Array.isArray(record?.tools) && record?.tools.length > 0
                          ? (() => {
                              const toolTypes = record?.tools?.map(
                                (tool) => tool?.type
                              );
                              const displayTools = [];

                              if (toolTypes.includes("function")) {
                                displayTools.push("Function Calling");
                              }
                              if (toolTypes.includes("code_interpreter")) {
                                displayTools.push("Code Interpreter");
                              }
                              if (toolTypes.includes("file_search")) {
                                displayTools.push("File Search");
                              }

                              return displayTools.length > 0
                                ? displayTools.join(", ")
                                : "N/A";
                            })()
                          : "N/A"}
                      </p>

                      <p>
                        <strong>Functions Used:</strong>{" "}
                        {Array.isArray(record.assistantApiId) &&
                        record.assistantApiId.length > 0
                          ? record.assistantApiId
                              .map((func) => (func?.name ?? "").replace(/_[0-9a-f]+$/i, "").replace(/_/g, " "))
                              .join(", ")
                          : "N/A"}
                      </p>

                      <p>
                        <strong>File Names:</strong>{" "}
                        {Array.isArray(record?.fileNames) &&
                        record?.fileNames.length > 0
                          ? record?.fileNames.join(", ")
                          : "N/A"}
                      </p>
                    </div>
                  ),
                  onOk() {},
                });
              }}
            >
              <IoInformationCircleOutline /> Model & Tools Details
            </span>
          </Menu.Item>
        <Menu.Item key="delete" danger>
          <span
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
            onClick={async () => {
              await showDeleteConfirm(
                record?.assistant_id,
                record?.name,
                handleDeleteAssistant
              );
              handleFetchUserCreatedAssistants(
                currentPage,
                searchQuery,
                pageSize
              );
            }}
          >
            <AiOutlineDelete /> Delete
          </span>
        </Menu.Item>
        <Menu.Item key="public">
          <span
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
            onClick={async () => {
              await handleCheckAssistantActive(
                !record?.is_public,
                record,
                handlePublicAssistantAdd
              );
              handleFetchUserCreatedAssistants(
                currentPage,
                searchQuery,
                pageSize
              );
            }}
          >
            {record?.is_public ? <BiSolidLock /> : <BiSolidLockOpen />} Make{" "}
            {record?.is_public ? "Private" : "Public"}
          </span>
        </Menu.Item>
      </Menu>
    );
  };

  const handleChange = (pagination, filters, sorter) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };

  const clearFilters = () => {
    setFilteredInfo({});
  };

  const clearAll = () => {
    setFilteredInfo({});
    setSortedInfo({});
  };

  const formatDate = (date, fallbackText = "Invalid Date") => {
    if (!date || isNaN(Date?.parse(date))) {
      return fallbackText;
    }
    return new Date(date)?.toLocaleDateString("en-US", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const sortDateDescending = (firstItem, secondItem, key) =>
    new Date(secondItem[key]) - new Date(firstItem[key]);

  const sortBoolean = (firstItem, secondItem, key) => {
    return firstItem[key] === secondItem[key] ? 0 : firstItem[key] ? -1 : 1;
  };

  //------Columns----------//

  const columns = [
    {
      title: "Agent",
      dataIndex: "name",
      key: "name",
      width: "20%",
      align: "left",
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
      sorter: (firstAssistant, secondAssistant) =>
        firstAssistant.name.localeCompare(secondAssistant.name),
      sortOrder: sortedInfo.columnKey === "name" ? sortedInfo.order : null,
    },
    {
      title: "Type",
      key: "type",
      align: "center",
      width: "10%",
      render: (_, { tools, category }) => (
        <div className="type-css">
          <Tag
          color={
            tools?.find((tool) => tool.type === "function")
              ? "geekblue"
              : "purple"
          }
        >
            {tools?.find((tool) => tool.type === "function")
            ? "Agent"
            : "Assistant"}
          </Tag>
          {category === "ORGANIZATIONAL" && (
            <Tag color="volcano" style={{ marginTop: 4 }}>Organizational</Tag>
          )}
        </div>
      ),      
      filters: [
        { text: "Agent", value: "agent" },
        { text: "Assistant", value: "assistant" },
      ],
      filteredValue: filteredInfo?.type || null,
      onFilter: (value, record) => {
        if (value === "agent") return record.tools?.length > 0;
        if (value === "assistant")
          return !record?.tools || record?.tools?.length === 0;
        return true;
      },
    },
    {
      title: "Creation Date",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      width: "12%",
      render: (date) => <span>{formatDate(date)}</span>,
      sorter: (firstRecord, secondRecord) =>
        sortDateDescending(firstRecord, secondRecord, "createdAt"),
      sortOrder:
        sortedInfo?.columnKey === "createdAt" ? sortedInfo?.order : null,
    },
    {
      title: "Last Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      align: "center",
      width: "12%",
      render: (date) => <span>{formatDate(date, "Not updated")}</span>,
      sorter: (firstRecord, secondRecord) =>
        sortDateDescending(firstRecord, secondRecord, "updatedAt"),
      sortOrder:
        sortedInfo?.columnKey === "updatedAt" ? sortedInfo?.order : null,
    },
    {
      title: "Status",
      key: "is_active",
      align: "center",
      dataIndex: "is_active",
      width: "10%",
      render: (_, { is_active = false }) => (
        <Tag color={is_active ? "green" : "red"}>
          {is_active ? "Active" : "Inactive"}
        </Tag>
      ),
      sorter: (firstRecord, secondRecord) =>
        sortBoolean(firstRecord, secondRecord, "is_active"),
      sortOrder:
        sortedInfo?.columnKey === "is_active" ? sortedInfo?.order : null,
    },
    {
      title: "Published",
      key: "is_public",
      align: "center",
      dataIndex: "is_public",
      width: "10%",
      render: (_, { is_public }) => (
        <Tag color={is_public ? "blue" : "gray"}>
          {is_public ? "Public" : "Private"}
        </Tag>
      ),
      sorter: (firstRecord, secondRecord) =>
        sortBoolean(firstRecord, secondRecord, "is_public"),
      sortOrder:
        sortedInfo?.columnKey === "is_public" ? sortedInfo?.order : null,
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      width: "10%",
      render: (_, record) => (
        <Space size="middle">
          <Dropdown overlay={createActionMenu(record)} trigger={["click"]}>
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                <BsThreeDotsVertical />
              </Space>
            </a>
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="mb-3">
        <ProfileHeader
          title="My Agents"
          subHeading="List of agents created by you."
        />

        <div className="searchbox-container">
          <div
            className={`${
              loader.ASSISTANT_LOADING ||
              isLoading ||
              filteredData?.length === 0
                ? "searchbox-agent-loading-state"
                : "searchbox-wrapper"
            }`}
          >
            <DebouncedSearchInput
              data={{
                search: searchQuery,
                setSearch: setSearchQuery,
                placeholder: "Search Agent",
              }}
            />
          </div>

          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalCount}
            showSizeChanger={true}
            onShowSizeChange={(current, size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            onChange={(page) => setCurrentPage(page)}
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} items`
            }
          />
        </div>
        <Space style={{ marginBottom: 16 }}>
          <Button onClick={clearFilters}>Clear filters</Button>
          <Button onClick={clearAll}>Clear filters and sorters</Button>
        </Space>

        <Table
          loading={loader.ASSISTANT_LOADING || isLoading}
          columns={columns}
          dataSource={filteredData}
          onChange={handleChange}
          scroll={{ y: "50vh" }}
          className={`${
            loader.ASSISTANT_LOADING || isLoading || filteredData?.length === 0
              ? "mt-3"
              : ""
          }`}
          pagination={false}
        />
      </div>
    </>
  );
};

export default SingleUserAssistants;
