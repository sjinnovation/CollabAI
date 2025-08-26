import React, { useEffect, useState } from "react";
//-----------libraries--------------//
import {
  Button,
  Space,
  Table,
  Tag,
  Modal,
  Menu,
  Dropdown,
  Pagination,
} from "antd";
import "./Assistant.css";
//--------------helper ------------//
import { showDeleteConfirm } from "../../Utility/assistant-helper";

import {
  AiOutlineDelete,
  AiOutlineInfo,
  AiOutlineArrowUp,
  AiOutlineThreeDotsVertical,
  AiOutlineEdit,
} from "react-icons/ai";

//-------api----------//
import { fetchAssistantsCreatedByUser } from "../../api/assistant";
import DebouncedSearchInput from "../../Pages/SuperAdmin/Organizations/DebouncedSearchInput";
import { BsRobot, BsThreeDotsVertical } from "react-icons/bs";
//-----Helper----------//
import { redirectToAssistant } from "../../Utility/assistant-helper";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { IoChatbubbleEllipsesOutline, IoInformationCircleOutline } from "react-icons/io5";
import ProfileHeader from "../Proflie/ProfileHeader";
import "./Assistant.css";
import { PlusOutlined } from "@ant-design/icons";

const UserAssistantList = ({ data }) => {
  const {
    userAssistants,
    loader,
    handleDeleteAssistant,
    showEditModalHandler,
    showEditModalLoading,
  } = data;
  const [expandedData, setExpandedData] = useState([]);
  const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);
  const [prefilledData, setPrefilledData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showExpandedTable, setShowExpandedTable] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingExpandedData, setLoadingExpandedData] = useState(false);
  const [expandedCurrentPage, setExpandedCurrentPage] = useState(1);
  const [expandedPageSize, setExpandedPageSize] = useState(10);
  const [expandedTotal, setExpandedTotal] = useState([]);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});

  //---------local functions -----------//
  const showInfoModal = (record) => {
    setPrefilledData(record);
    setIsInfoModalVisible(true);
  };

  const redirectToAssistant = (record) => {
    const assistantId = record.assistant_id;
    const url = `/agents/${assistantId}`;
    window.open(url, "_blank");
  };

  const handleInfoModalCancel = () => {
    setIsInfoModalVisible(false);
  };

  //---On expand Api Call---------??
  const onExpand = async (expanded, record) => {
    if (expanded && record && record._id) {
      setCurrentUser(record);
      setShowExpandedTable(true);
      setLoadingExpandedData(true);

      try {
        const response = await fetchAssistantsCreatedByUser(
          1,
          record._id,
          expandedPageSize,
          searchQuery
        );
        setExpandedData(response?.data || []);
        setExpandedTotal(response?.meta?.total || 0);
      } catch (error) {
        console.error("Error fetching assistants created by user:", error);
      } finally {
        setLoadingExpandedData(false);
      }
    }
  };

  useEffect(() => {
    if (currentUser) {
      (async () => {
        setLoadingExpandedData(true);
        try {
          const response = await fetchAssistantsCreatedByUser(
            expandedCurrentPage,
            currentUser._id,
            expandedPageSize
          );
          setExpandedData(response?.data || []);
          setExpandedTotal(response?.meta?.total || 0);
        } catch (error) {
        } finally {
          setLoadingExpandedData(false);
        }
      })();
    }
  }, [expandedCurrentPage, expandedPageSize]);

  const handleBack = () => {
    setShowExpandedTable(false); 
    setCurrentUser(null); 
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

  const sortByNewestDate = (firstItem, secondItem, dateKey) => 
    new Date(secondItem[dateKey]) - new Date(firstItem[dateKey]);
  
  const sortByBooleanTrueFirst = (firstItem, secondItem, booleanKey) => {
    return firstItem[booleanKey] === secondItem[booleanKey] 
      ? 0 
      : firstItem[booleanKey] 
        ? -1 
        : 1;
  };
  const expandedRowRender = () => {
    const columns = [
      {
        title: "Agent",
        dataIndex: "name",
        key: "name",
        width: "22%",
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
        sorter: (firstAgent, secondAgent) => 
          firstAgent.name.localeCompare(secondAgent.name),
        sortOrder: sortedInfo.columnKey === "name" ? sortedInfo.order : null,
      },

      {
        title: "Descriptions",
        dataIndex: "description",
        key: "description",
        align: "left",
        width: "18%",
        render: (text) => {
          if (!text) return "No descriptions available";
          
          const words = text.trim().split(/\s+/); 
          const truncated = words.slice(0, 30).join(' '); 
          
          return (
            <div className="description-useragent">
              {words.length > 30 ? `${truncated}...` : text} 
            </div>
          );
        },
      },
      {
        title: "Model & Tools",
        dataIndex: "model",
        key: "modelAndTools",
        align: "left",
        width: "16%",
        render: (_, { model, tools }) => (
          <Space direction="vertical" size="small">
            <Tag color="blue">
              {Array.isArray(model) && model.length > 0
                ? model[0]
                : model || "No model specified"}
            </Tag>
            <div className="modeltools-column">
              {Array.isArray(tools) && tools.length > 0 ? (
                tools.map((tool, index) => (
                  <Tag key={index} color="green">
                    {tool?.name || tool?.type || "Unknown tool"}
                  </Tag>
                ))
              ) : (
                <span>No tools enabled</span>
              )}
            </div>
          </Space>
        ),
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
        title: "Creation Date",
        dataIndex: "createdAt",
        key: "createdAt",
        align: "center",
        width: "10%",
        render: (date) => <span>{formatDate(date)}</span>,
        sorter: (firstAssistant, secondAssistant) => 
          new Date(firstAssistant.createdAt) - new Date(secondAssistant.createdAt),
        sortOrder: sortedInfo.columnKey === "createdAt" ? sortedInfo.order : null,
      },
      {
        title: "Last Updated",
        dataIndex: "updatedAt",
        key: "updatedAt",
        align: "center",
        width: "10%",
        render: (date) => <span>{formatDate(date, "Not updated")}</span>,
        sorter: (firstAssistant, secondAssistant) => 
          new Date(firstAssistant.updatedAt) - new Date(secondAssistant.updatedAt),
        sortOrder: sortedInfo.columnKey === "updatedAt" ? sortedInfo.order : null,
      },
      {
        title: "Published",
        key: "is_public",
        align: "center",
        width: "10%",
        dataIndex: "is_public",
        render: (_, { is_public }) => (
          <Tag color={is_public ? "blue" : "gray"}>
            {is_public ? "Public" : "Private"}
          </Tag>
        ),
        sorter: (firstAssistant, secondAssistant) => {
          const firstValue = firstAssistant.is_public ? "Public" : "Private";
          const secondValue = secondAssistant.is_public ? "Public" : "Private";
          return firstValue.localeCompare(secondValue);
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
          </Space>
        ),
      },
    ];

    return (
      <>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Button onClick={handleBack}>Back</Button>
          <Pagination
            current={expandedCurrentPage}
            pageSize={expandedPageSize}
            total={expandedTotal}
            onChange={(page) => setExpandedCurrentPage(page)}
            onShowSizeChange={(current, size) => {
              setExpandedPageSize(size);
              setExpandedCurrentPage(1);
            }}
            showSizeChanger
            showTotal={(total) => `Total ${total} items`}
          />
        </div>
        <Space style={{ marginBottom: 16 }}>
            <Button onClick={clearFilters}>Clear filters</Button>
            <Button onClick={clearAll}>Clear filters and sorters</Button>
          </Space> 
        <Table
          columns={columns}
          dataSource={expandedData}
          pagination={false}
          scroll={{y:"50vh"}}
          loading={loadingExpandedData}
          onChange={handleChange}
          onRow={()=> ({
            onClick: (e) => e.stopPropagation(),
          })}
        />
      </>
    );
  };

  const createActionMenu = (record) => {
    return (
      <Menu>
      <Menu.Item key="redirect" className="action-items">
        <span
          onClick={() => redirectToAssistant(record)}
        >
          <IoChatbubbleEllipsesOutline /> Chat with Agent
        </span>
      </Menu.Item>
      <Menu.Item key="info" className="action-items">
        <span
          className="modal-info-useragent"
          onClick={() => showInfoModal(record)}
          disabled={loader.ASSISTANT_LOADING}
        >
          <IoMdInformationCircleOutline /> View Info
        </span>
      </Menu.Item>
      <Menu.Item key="edit" className="action-items">
        <span
          onClick={() => showEditModalHandler(record)}
        >
          <AiOutlineEdit /> Edit Agent
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
      <Menu.Item key="delete" className="action-items" danger>
        <span
          // className="action-items"
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

  const columns = [
    {
      title: "Person Name",
      dataIndex: "username",
      key: "username",
      align: "left",
      filters: Array.from(new Set(userAssistants?.map(user => user.username)))
        .filter(Boolean)
        .map(name => ({
          text: name,
          value: name,
        })),
      filteredValue: filteredInfo.username || null,
      sorter: (firstAssistant, secondAssistant) => 
        firstAssistant.username.localeCompare(secondAssistant.username),
      sortOrder: sortedInfo.columnKey === "username" ? sortedInfo.order : null,
      onFilter: (value, record) => record.username === value,
      render: (text, record) => (
        <Space size="middle">
          <Button
            variant="outlined"
            onClick={(e) => {
              e.stopPropagation();
              onExpand(true, record);
            }}
            icon={<PlusOutlined />}
            size="small"
          />
          <span className="text-left">{text}</span>
        </Space>
      ),
    },
    {
      title: "Total Agents",
      dataIndex: "totalAssistants",
      key: "totalAssistants",
      align: "center",
      sorter: (firstAssistant, secondAssistant) => 
        firstAssistant.totalAssistants - secondAssistant.totalAssistants,
      sortOrder: sortedInfo.columnKey === "totalAssistants" ? sortedInfo.order : null,
    },
  ];

  // Filter assistant based on search term
  const filteredUser = userAssistants?.filter((assistant) => {
    return assistant.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div>
      <div className="mb-3">
      <ProfileHeader
          title={
            showExpandedTable
              ? `User Agents - ${currentUser?.username}`
              : "User Agents"
          }
          subHeading="Interact with user-specific AI agents"
        />
      </div>
      {showExpandedTable ? (
        <div>{expandedRowRender()}</div>
      ) : (
        <div>
          <div className="searchbox-container">
            <div
              className={`${
                filteredUser?.length === 0
                  ? "searchbox-agent-loading-state mt-0"
                  : "searchbox-wrapper"
              }`}
            >
              <DebouncedSearchInput
                data={{
                  search: searchQuery,
                  setSearch: setSearchQuery,
                  placeholder: "Search users",
                }}
              />
            </div>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredUser?.length || 0}
              showSizeChanger
              onChange={(page) => setCurrentPage(page)}
              onShowSizeChange={(current, size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
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
            className={`${filteredUser?.length === 0 ? "mt-3" : "mt-0"}`}
            loading={loader.ASSISTANT_STATS_LOADING}
            columns={columns}
            dataSource={filteredUser?.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
            onChange={handleChange}
            pagination={false}
          />
        </div>
      )}

      <Modal
        title="Agent Information"
        open={isInfoModalVisible}
        onCancel={handleInfoModalCancel}
        footer={null}
      >
        <p>
          <b>Name:</b> {prefilledData?.name}
        </p>
        <p>
          <b>Instruction:</b> {prefilledData?.instructions}
        </p>
        <p>
          <b>Description:</b> {prefilledData?.description}
        </p>
      </Modal>
    </div>
  );
};

export default UserAssistantList;
