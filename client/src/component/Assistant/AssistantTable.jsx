import React, { useEffect, useState } from "react";

//---------libraries---------------//
import {
  Button,
  Space,
  Table,
  Tag,
  Tooltip,
  Switch,
  message,
  Dropdown,
  Menu,
  Pagination,
  Modal,
} from "antd";
import {
  AiOutlineDelete,
  AiOutlineTeam,
  AiOutlineEdit,
  AiOutlineArrowUp,
} from "react-icons/ai";

import "./Assistant.css";
import { IoIosCheckmarkCircle } from "react-icons/io";
//-----Helper----------//
import {
  showDeleteConfirm,
  redirectToAssistant,
} from "../../Utility/assistant-helper";

//Components
import AssistantTeamAssignModal from "./AssistantTeamAssignModal";
import DebouncedSearchInput from "../../Pages/SuperAdmin/Organizations/DebouncedSearchInput";
import {
  handleSwitchChange,
  showRemoveConfirm,
} from "../../Utility/showModalHelper";
import { AssistantNeedToActiveFirst } from "../../constants/PublicAndPrivateAssistantMessages";
import { handleCheckAssistantActive } from "../../Utility/addPublicAssistantHelper";
import { useContext } from "react";
import { FileContext } from "../../contexts/FileContext";
import { useNavigate } from "react-router-dom";
import { IoChatbubbleEllipsesOutline, IoCloseCircle, IoInformationCircleOutline } from "react-icons/io5";
import { BiSolidLock, BiSolidLockOpen } from "react-icons/bi";
import { BsRobot, BsThreeDotsVertical } from "react-icons/bs";
import { RxCrossCircled } from "react-icons/rx";
import { CiCircleCheck } from "react-icons/ci";
import ProfileHeader from "../Proflie/ProfileHeader";
const AssistantTable = ({ data }) => {
  const {
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
    setOrgAssistantSearchQuery,
    handlePublicAssistantAdd,
    getAssistantInfo,
  } = data;
  const [selectedAssistant, setSelectedAssistant] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { isEditPageLoading, setIsEditPageLoading } = useContext(FileContext);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    handleFetchAllAssistants(currentPage, orgAssistantSearchQuery, pageSize);
  }, [currentPage, pageSize]);

  //Local function
  const handleViewTeams = (team) => {
    setSelectedAssistant(team);
  };

  const redirectToAssistant = (record) => {
    const assistantId = record.assistant_id;
    const url = `/agents/${assistantId}`;
    window.open(url, "_blank");
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
                } else {
                  setIsEditPageLoading(false);
                }
              }}
            >
              <AiOutlineEdit /> Edit
            </span>
          </Menu.Item>
        }

        {
          <Menu.Item key="status">
            <span
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
              onClick={async () => {
                await handleSwitchChange(
                  record,
                  !record?.is_active,
                  handleUpdateAssistant
                );

                handleFetchAllAssistants(
                  currentPage,
                  orgAssistantSearchQuery,
                  pageSize
                );
              }}
            >
              {record?.is_active ? <RxCrossCircled /> : <CiCircleCheck />}
              {record?.is_active ? "Make Deactivate" : "Make Activate"}
            </span>
          </Menu.Item>
        }
        {
          <Menu.Item key="viewTeams">
            <span
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
              onClick={() => handleViewTeams(record)}
            >
              <AiOutlineTeam /> View Teams
            </span>
          </Menu.Item>
        }
        {
          <Menu.Item key="publicPrivate">
            <span
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
              onClick={async () => {
                await handleCheckAssistantActive(
                  !record?.is_public,
                  record,
                  handlePublicAssistantAdd
                );
                handleFetchAllAssistants(
                  currentPage,
                  orgAssistantSearchQuery,
                  pageSize
                );
              }}
            >
              {record?.is_public ? <BiSolidLock /> : <BiSolidLockOpen />}
              {record?.is_public ? "Make Private" : "Make Public"}
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
              onClick={async () => {
                await showDeleteConfirm(
                  record?.assistant_id,
                  record?.name,
                  handleDeleteAssistant
                );
                handleFetchAllAssistants(
                  currentPage,
                  orgAssistantSearchQuery,
                  pageSize
                );
              }}
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
    if (!date || isNaN(Date.parse(date))) {
      return fallbackText;
    }
    return new Date(date).toLocaleDateString("en-US", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    });
  };

  //column
  const columns = [
    {
      title: "Agent",
      dataIndex: "name",
      key: "name",
      width:"15%",
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
      sorter: (firstAssistant, secondAssistant) =>
        firstAssistant.name.localeCompare(secondAssistant.name),
      sortOrder: sortedInfo?.columnKey === "name" ? sortedInfo?.order : null,
    },
    {
      title: "Type",
      key: "type",
      align: "center",
      width: "10%",
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
      title: "Created by",
      dataIndex: "userId",
      key: "userId",
      width: "15%",
      align: "center",
      render: (user) => <span className="text-left">{user?.fname}</span>,
      sorter: (firstAssistant, secondAssistant) =>
        firstAssistant.userId?.fname.localeCompare(secondAssistant.userId?.fname),
      sortOrder: sortedInfo?.columnKey === "userId" ? sortedInfo?.order : null,
      filters: Array.from(
        new Set(assistants.assistants?.map((item) => item.userId?.fname))
      )
        .filter(Boolean)
        .map((name) => ({
          text: name,
          value: name,
        })),
      filteredValue: filteredInfo?.userId || null,
      onFilter: (value, record) => record?.userId?.fname === value,
    },
    {
      title: "Creation Date",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      width: "10%",
      render: (date) => <span>{formatDate(date)}</span>,
      sorter: (firstAssistant, secondAssistant) =>
        new Date(firstAssistant?.createdAt) -
        new Date(secondAssistant?.createdAt),
      sortOrder:
        sortedInfo?.columnKey === "createdAt" ? sortedInfo?.order : null,
    },
    {
      title: "Last Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      align: "center",
      width: "10%",
      render: (date) => <span>{formatDate(date, "Not updated")}</span>,
      sorter: (firstAssistant, secondAssistant) =>
        new Date(firstAssistant.updatedAt || 0) -
        new Date(secondAssistant.updatedAt || 0),
      sortOrder:
        sortedInfo?.columnKey === "updatedAt" ? sortedInfo?.order : null,
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
      sorter: (firstAssistant, secondAssistant) => {
        const firstValue = firstAssistant.is_public ? "Public" : "Private";
        const secondValue = secondAssistant.is_public ? "Public" : "Private";
        return firstValue?.localeCompare(secondValue);
      },
      sortOrder:
        sortedInfo?.columnKey === "is_public" ? sortedInfo?.order : null,
    },
    {
      title: "Status",
      key: "is_active",
      align: "center",
      dataIndex: "is_active",
      width: "10%",
      render: (_, { is_active }) => (
        <Tag color={is_active ? "green" : "red"}>
          {is_active ? "active" : "inactive"}
        </Tag>
      ),
      sorter: (firstAssistant, secondAssistant) => {
        const firstValue = firstAssistant.is_active ? "Active" : "Inactive";
        const secondValue = secondAssistant.is_active ? "Active" : "Inactive";
        return firstValue.localeCompare(secondValue);
      },
      sortOrder: sortedInfo.columnKey === "is_active" ? sortedInfo.order : null,
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
      <AssistantTeamAssignModal
        data={{
          selectedAssistant,
          setSelectedAssistant,
          teamList,
          handleAssignTeamToAssistant,
          isTeamAssigning: loader.ASSISTANT_UPDATING,
        }}
      />

      <div className="mb-1">
        <ProfileHeader
          title="Organizational Agents"
          subHeading="Collaborate with AI agents within the organization."
        />
        <div className="searchbox-container">
          <div className="searchbox-wrapper">
            <DebouncedSearchInput
              data={{
                search: orgAssistantSearchQuery,
                setSearch: setOrgAssistantSearchQuery,
                placeholder: "Search Organizational Agents",
              }}
            />
          </div>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={assistants?.meta?.total}
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
        loading={loader.ALL_ASSISTANT_LOADING || isEditPageLoading}
        columns={columns}
        dataSource={assistants.assistants}
        onChange={handleChange}
        scroll={{ y: "50vh" }} //important for table consistancy
        className={`${
          loader.ALL_ASSISTANT_LOADING ||
          isEditPageLoading ||
          assistants?.assistants?.length === 0
            ? "mt-3"
            : ""
        }`}
        pagination={false}
      />
    </>
  );
};

export default AssistantTable;
