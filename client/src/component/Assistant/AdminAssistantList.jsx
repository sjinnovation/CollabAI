import React, { useState } from "react";
import { BsRobot, BsThreeDotsVertical } from "react-icons/bs";
//libraries
import {
  Button,
  Space,
  Table,
  Tag,
  Modal,
  Tooltip,
  Switch,
  Avatar,
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
import { CopyOutlined, SyncOutlined } from "@ant-design/icons";
import { CopyToClipboard } from "react-copy-to-clipboard";
import DebouncedSearchInput from "../../Pages/SuperAdmin/Organizations/DebouncedSearchInput";
import { SEARCH_ALL_USER_CREATED_ASSISTANTS_SLUG } from "../../constants/Api_constants";
import { axiosSecureInstance } from "../../api/axios";
import { useEffect } from "react";
import { getUserID } from "../../Utility/service";
import {
  handleSwitchChange,
  showDeleteConfirm,
  showRemoveConfirm,
} from "../../Utility/showModalHelper";
import "./Assistant.css";
import {
  IoInformationCircleOutline,
} from "react-icons/io5";
import { handleCheckAssistantActive } from "../../Utility/addPublicAssistantHelper";
import { FileContext } from "../../contexts/FileContext";
import { useContext } from "react";
import { BiSolidLock, BiSolidLockOpen } from "react-icons/bi";
import { IoChatbubbleEllipsesOutline, IoCloseCircle } from "react-icons/io5";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { generateEmbedCode } from "../../constants/Api_constants";
import ProfileHeader from "../Proflie/ProfileHeader";
import { RxCrossCircled } from "react-icons/rx";
import { CiCircleCheck } from "react-icons/ci";
const { confirm } = Modal;

const AdminAssistantList = ({ data }) => {
  const {
    setAdminUserAssistants,
    adminUserAssistants,
    loader,
    handleDeleteAssistant,
    handleUpdateAssistant,
    showEditModalHandler,
    handleFetchUserCreatedAssistants,
    totalCount,
    updateLoader,
    searchPersonalAssistants,
    personalAssistantSearchQuery,
    setPersonalAssistantSearchQuery,
    handlePublicAssistantAdd,
    getAssistantInfo,
  } = data;

  const [searchQuery, setSearchQuery] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const { isEditPageLoading, setIsEditPageLoading } = useContext(FileContext);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const navigate = useNavigate();
  const redirectToAssistant = (record) => {
    const assistantId = record.assistant_id;
    const url = `/agents/${assistantId}`;
    window.open(url, "_blank");
  };

  useEffect(() => {
    handleFetchUserCreatedAssistants(
      currentPage,
      personalAssistantSearchQuery,
      pageSize
    );
  }, [currentPage, personalAssistantSearchQuery, pageSize]);

  const navigateToCustomizationPage = (assistantName, assistantId) => {
    navigate(`/customize-embed-code/${assistantId}`);
  };

  const showDeleteConfirm = (assistantId, assistantName) => {
    confirm({
      title: "Are you sure delete this Agent?",
      content: `You are deleting ${assistantName}.`,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        handleDeleteAssistant(
          assistantId,
          currentPage,
          personalAssistantSearchQuery,
          pageSize
        );
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  const createActionMenu = (record) => {
    return (
      <Menu>
        {
          <Menu.Item key="chat">
            <span
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
              onClick={() => redirectToAssistant(record)}
            >
              <IoChatbubbleEllipsesOutline /> Chat with Agent
            </span>
          </Menu.Item>
        }
        {
          <Menu.Item key="edit">
            <span
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
              onClick={async () => {
                setIsEditPageLoading(true);
                const isExisting = await getAssistantInfo(record?.assistant_id);
                if (isExisting) {
                  await showEditModalHandler(record);
                  // Fetch assistants after editing
                  handleFetchUserCreatedAssistants(
                    currentPage,
                    personalAssistantSearchQuery,
                    pageSize
                  );
                } else {
                  setIsEditPageLoading(false);
                }
              }}
            >
              <AiOutlineEdit /> Edit Agent
            </span>
          </Menu.Item>
        }

        {
          <Menu.Item key="activate">
            <span
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
              onClick={async () => {
                await handleSwitchChange(
                  record,
                  !record?.is_active,
                  handleUpdateAssistant
                );
                // Refetch assistants
                handleFetchUserCreatedAssistants(
                  currentPage,
                  personalAssistantSearchQuery,
                  pageSize
                );
              }}
            >
              {record?.is_active ? <RxCrossCircled /> : <CiCircleCheck />} Make{" "}
              {record?.is_active ? "Deactivate" : "Activate"}
            </span>
          </Menu.Item>
        }
        {
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
                  personalAssistantSearchQuery,
                  pageSize
                );
              }}
            >
              {record?.is_public ? <BiSolidLock /> : <BiSolidLockOpen />} Make{" "}
              {record?.is_public ? "Private" : "Public"}
            </span>
          </Menu.Item>
        }
        {
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
                        {Array.isArray(record?.tools) &&
                        record?.tools.length > 0
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
        }
        {
          <Menu.Item key="delete" danger>
            <span
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
              onClick={() =>
                showDeleteConfirm(
                  record?.assistant_id,
                  record?.name,
                  handleDeleteAssistant
                )
              }
            >
              <AiOutlineDelete /> Delete
            </span>
          </Menu.Item>
        }
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

  const columns = [
    {
      title: "Agent",
      dataIndex: "name",
      key: "name",
      align: "left",
      width: "20%",
      render: (_, { name, image_url }) => (
        <Space size="middle" className="d-flex align-items-center">
          <div className="assistantImageDiv">
            {image_url ? (
              <img src={image_url} className="customImage" alt="avatar" />
            ) : (
              <BsRobot className="customImage" />
            )}
          </div>
          <div className="ms-2 text-start">{name}</div>
        </Space>
      ),
      sorter: (firstAssistant, secondAssistant) =>
        firstAssistant.name.localeCompare(secondAssistant.name),
      sortOrder: sortedInfo?.columnKey === "name" ? sortedInfo?.order : null,
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
              tools?.length > 0? "geekblue" : "purple"
            }
          >
            {tools?.length > 0 ? "Agent" : "Assistant"}

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
      render: (_, { is_active }) => (
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
          {/* <Button
            onClick={() => redirectToAssistant(record)}
            icon={<AiOutlineArrowUp />}
          ></Button>

          <Button
            onClick={async() => {
              setIsEditPageLoading(true);
              const isExisting = await getAssistantInfo(record?.assistant_id);
              if(isExisting){
                await showEditModalHandler(record);
              }else{
                setIsEditPageLoading(false);

              }
            
            }}
            icon={<AiOutlineEdit /> } 
          >

          </Button>
          <Tooltip title="Activate or Deactivate">
            <Switch
              checked={record?.is_active}
              onChange={async (checked) =>

                await handleSwitchChange(record, checked, handleUpdateAssistant)

              }
              loading={
                loader.ASSISTANT_UPDATING === record._id ?? false
              }

            />
          </Tooltip>
          <Button
            onClick={() => showDeleteConfirm(record?.assistant_id, record?.name,handleDeleteAssistant)}
            danger
            icon={<AiOutlineDelete />}
            loading={
              loader.ASSISTANT_DELETING === record._id
            }

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
          </Tooltip> */}
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
        <div className="searchbox-wrapper">
          <DebouncedSearchInput
            data={{
              search: personalAssistantSearchQuery,
              setSearch: setPersonalAssistantSearchQuery,
              placeholder: "Search agents",
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
    </div>
    <Space style={{ marginBottom: 16 }}>
      <Button onClick={clearFilters}>Clear filters</Button>
      <Button onClick={clearAll}>Clear filters and sorters</Button>
    </Space>
    <Table
      loading={loader.ASSISTANT_LOADING || isEditPageLoading}
      columns={columns}
      dataSource={adminUserAssistants}
      onChange={handleChange}
      scroll={{y:"50vh"}}
      className={`${
        loader.ASSISTANT_LOADING ||
        isEditPageLoading ||
        adminUserAssistants?.length === 0
          ? "mt-2"
          : ""
      }`}
      pagination={false}
    />
  </>
  );
};

export default AdminAssistantList;
