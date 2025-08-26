import React from "react";
import { getUserID } from "../../Utility/service";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Checkbox, Dropdown, Menu, Pagination } from "antd";
import {
  IoChatbubbleEllipsesOutline,
  IoGitCompareOutline,
  IoInformationCircleOutline,
} from "react-icons/io5";
import { BsRobot, BsThreeDotsVertical } from "react-icons/bs";
import "./Assistant.css";
//libraries
import {
  Button,
  Space,
  Table,
  Tag,
  Modal,
  Tooltip,
  Switch,
  message,
  Spin,
} from "antd";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import axios from "axios";
import {
  fetchPublicAssistant,
  getFavoriteCount,
  deleteSinglePublicAssistant,
  addOrRemoveFeaturedAssistant,
} from "../../api/publicAssistant";
import {
  showDeletePublicConfirm,
  handleCheckboxChange,
} from "../../Utility/showModalHelper";
import DebouncedSearchInput from "../../Pages/SuperAdmin/Organizations/DebouncedSearchInput";
import { CustomSpinner } from "../common/CustomSpinner";
import { personalizeAssistant } from "../../api/personalizeAssistant";
import { LuCopyPlus } from "react-icons/lu";
import { CopyOutlined, SyncOutlined } from "@ant-design/icons";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { axiosSecureInstance } from "../../api/axios";
import { BiSolidLock, BiSolidLockOpen } from "react-icons/bi";
import { RiPushpinLine, RiUnpinLine } from "react-icons/ri";
import { generateEmbedCode } from "../../constants/Api_constants";
import ProfileHeader from "../Proflie/ProfileHeader";

const { confirm } = Modal;

const PublicAssistantList = ({ data }) => {
  const navigate = useNavigate();
  const {
    adminUserAssistants,
    loader,
    handleDeleteAssistant,
    handleUpdateAssistant,
    showEditModalHandler,
    handleFetchUserCreatedAssistants,
    handlePublicAssistantAdd,
    getFavoriteAssistant,
    handleDeletePublicAssistant,
    publicAssistant,
    setPublicAssistant,
    setIsLoading,
    isLoading,
    setLoadMyAssistants,
    updateLoader,
  } = data;

  const [totalCount, setTotalCount] = useState();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAssistantSyncing, setIsAssistantSyncing] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});

  //   useEffect(() => {
  //     // Fetch public assistants
  //     const page = 1;
  //     const searchQuery = "";

  //     fetchPublicAssistant(
  //       publicAssistant,
  //       setPublicAssistant,
  //       setIsLoading,
  //       setTotalCount,
  //       page,
  //       searchQuery
  //     );
  //   }, []);
  useEffect(() => {
    // Fetch public assistants
    fetchPublicAssistant(
      publicAssistant,
      setPublicAssistant,
      setIsLoading,
      setTotalCount,
      currentPage,
      searchQuery,
      pageSize
    );
  }, [searchQuery, currentPage, pageSize]);

  const query =
    typeof searchQuery === "string" ? searchQuery?.toLowerCase() : "";

  // Open selected card in a new page
  const openAssistantNewPage = (assistantId, name) => {
    navigate(`/agents/${assistantId}`);
  };

  const navigateToCustomizationPage = (assistantName, assistantId) => {
    navigate(`/customize-embed-code/${assistantId}`);
  };

  const createActionMenu = (record) => {
    return (
      <Menu>
        {
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
        }
        {
          <Menu.Item key="personalize">
            <span
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
              onClick={async () => {
                await personalizeAssistant(record?.assistant_id);
                setLoadMyAssistants(true);
              }}
            >
              <LuCopyPlus /> Personalize Agent
            </span>
          </Menu.Item>
        }

        {
          <Menu.Item key="feature">
            <span
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
              onClick={() =>
                handleCheckboxChange(
                  record,
                  !record?.is_featured,
                  publicAssistant,
                  setPublicAssistant,
                  handleUpdateAssistant
                )
              }
            >
              {record?.is_featured ? <RiPushpinLine /> : <RiUnpinLine />}
              {record?.is_featured ? "Unmark as featured" : "Mark as Featured"}
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
                              .map((func) => func.name)
                              .join(", ")
                          : "N/A"}
                      </p>

                      {record ? (
                        <p>
                          <strong>File Names:</strong>{" "}
                          {Array.isArray(record?.fileNames) &&
                          record?.fileNames.length > 0
                            ? record?.fileNames.join(", ")
                            : "N/A"}
                        </p>
                      ) : (
                        <p>Loading...</p>
                      )}
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
              onClick={async () =>
                await showDeletePublicConfirm(
                  record,
                  handleDeletePublicAssistant,
                  handleUpdateAssistant,
                  publicAssistant,
                  setPublicAssistant
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

  const handleTableChange = (pagination, filters, sorter) => {
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

  const setAgeSort = () => {
    setSortedInfo({
      order: "descend",
      columnKey: "age",
    });
  };

  const uniqueUserNames = [
    ...new Set(publicAssistant.map((item) => item.userInfo)),
  ].map((name) => ({
    text: name,
    value: name,
  }));

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

  const sortDateDescending = (firstRecord, secondRecord, dateField) => 
    new Date(secondRecord[dateField]) - new Date(firstRecord[dateField]);

  const sortBoolean = (firstRecord, secondRecord, field) => {
    return firstRecord[field] === secondRecord[field] 
      ? 0 
      : firstRecord[field] ? -1 : 1;
  };

  const columns = [
    {
      title: "Agent",
      dataIndex: "name",
      key: "name",
      width: "20%",
      align: "left",
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
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortOrder: sortedInfo.columnKey === "name" ? sortedInfo.order : null,
    },
    {
      title: "Type",
      key: "type",
      align: "center",
      width: "8%",
      render: (_, { tools }) => (
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
      title: "Created By",
      dataIndex: "Created By",
      key: "created_by",
      width: "12%",
      align: "center",
      render: (_, record) => (
        <span className="text-left">{record.userInfo}</span>
      ),
      sorter: (a, b) => {
        const userA = a.userInfo ? a.userInfo.toLowerCase() : "";
        const userB = b.userInfo ? b.userInfo.toLowerCase() : "";
        return userA.localeCompare(userB);
      },
      sortOrder:
        sortedInfo.columnKey === "created_by" ? sortedInfo.order : null,
      filters: [...uniqueUserNames],
      filteredValue: filteredInfo.created_by || null,
      onFilter: (value, record) => record.userInfo === value,
    },
    {
      title: "Creation Date",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      width: "12%",
      render: (date) => <span>{formatDate(date)}</span>,
      sorter: (firstAssistant, secondAssistant) => 
        sortDateDescending(firstAssistant, secondAssistant, "createdAt"),
      sortOrder: sortedInfo?.columnKey === "createdAt" ? sortedInfo?.order : null,
    },
    {
      title: "Last Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      align: "center",
      width: "12%",
      render: (date) => <span>{formatDate(date, "Not updated")}</span>,
      sorter: (firstAssistant, secondAssistant) => 
        sortDateDescending(firstAssistant, secondAssistant, "updatedAt"),
      sortOrder: sortedInfo?.columnKey === "updatedAt" ? sortedInfo?.order : null,
    },
    {
      title: "Favorite Count",
      dataIndex: "Count",
      key: "Count",
      width: "10%",
      align: "center",
      render: (_, record) => <span className="text-left">{record.count}</span>,
      sorter: (a, b) => a.count - b.count,
      sortOrder: sortedInfo.columnKey === "Count" ? sortedInfo.order : null,
      defaultSortOrder: "descend",
    },
    {
      title: "Featured",
      dataIndex: "is_featured",
      key: "is_featured",
      width: "8%",
      align: "center",
      render: (is_featured) => (
        <Tag color={is_featured ? "blue" : "default"}>
          {is_featured ? "Yes" : "No"}
        </Tag>
      ),
      sorter: (firstAssistant, secondAssistant) => {
        const firstValue = firstAssistant.is_featured ? "Yes" : "No";
        const secondValue = secondAssistant.is_featured ? "Yes" : "No";
        return firstValue.localeCompare(secondValue);
      },
      sortOrder:
        sortedInfo.columnKey === "is_featured" ? sortedInfo.order : null,
    },
    {
      title: "Action",
      key: "action",
      width: "8%",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Dropdown overlay={createActionMenu(record)} trigger={["click"]}>
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                <BsThreeDotsVertical />
              </Space>
            </a>
          </Dropdown>
          {/* <Tooltip title="Chat with Agent">
                        <Button onClick={() => openAssistantNewPage(record?.assistant_id, record?.name)}><IoChatbubbleEllipsesOutline /></Button>
                    </Tooltip>

                    <Tooltip title="Delete">
                        <Button

                            onClick={async () => await showDeletePublicConfirm(record, handleDeletePublicAssistant, handleUpdateAssistant, publicAssistant, setPublicAssistant)}
                            danger
                            icon={<AiOutlineDelete />}
                            loading={
                                loader.ASSISTANT_DELETING === record._id
                            }
                            disabled={loader.ASSISTANT_LOADING ||
                                loader.ASSISTANT_DELETING
                            }
                        />
                    </Tooltip>

                    <Tooltip title="Personalize Agent">
                        <Button onClick={async () => 
                            {await personalizeAssistant(record?.assistant_id);
                                setLoadMyAssistants(true);

                            
                            }
                        }><LuCopyPlus /></Button>
                    </Tooltip>
                    <Tooltip title="Add to Feature">
                        <Checkbox
                            checked={record?.is_featured}
                            onChange={(e) => handleCheckboxChange(record, e.target.checked, publicAssistant, setPublicAssistant, handleUpdateAssistant)} />
                    </Tooltip> */}
        </Space>
      ),
    },
  ];
  const handleSyncButton = async () => {
    setIsAssistantSyncing(true);
    setIsLoading(true);
    const isSyncSuccess = await axiosSecureInstance.get(
      "api/assistants/public/sync"
    );
    message.success(isSyncSuccess.data.message);
    setIsLoading(false);
    setIsAssistantSyncing(false);
  };

  return (
    <>
      <div className="mb-1">
        <ProfileHeader
          title="Public Agents"
          subHeading="Explore publicly available AI agents."
        />

        <div className="searchbox-container">
          <div className="searchbox-wrapper">
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
      </div>

      <Space style={{ marginBottom: 12 }}>
        <Button onClick={clearFilters}>Clear filters</Button>
        <Button onClick={clearAll}>Clear filters and sorters</Button>
      </Space>

      <Table
        loading={isLoading}
        columns={columns}
        dataSource={publicAssistant}
        onChange={handleTableChange}
        scroll={{ y: "50vh" }}
        className={`${
          isLoading || publicAssistant?.length === 0 ? "mt-3" : ""
        }`}
        pagination={false}
      />
    </>
  );
};

export default PublicAssistantList;
