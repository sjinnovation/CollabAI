import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Space,
  Table,
  Pagination,
  Tag,
  Modal,
  Dropdown,
  Menu,
} from "antd";
import CommonPageLayout from "../../component/layout/CommonStructure/CommonPageLayout";
import ProfileHeader from "../../component/Proflie/ProfileHeader";
import DebouncedSearchInput from "../../Pages/SuperAdmin/Organizations/DebouncedSearchInput";
import useAssistantPage from "../../Hooks/useAssistantPage";
import { PlusOutlined } from "@ant-design/icons";
import { BsRobot, BsThreeDotsVertical } from "react-icons/bs";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { fetchAssistantsCreatedByUser } from "../../api/assistant";
import {
  showDeleteConfirm,
  redirectToAssistant,
} from "../../Utility/assistant-helper";
import "../../component/Assistant/Assistant.css";

const UserAgents = () => {
  const navigate = useNavigate();

  const {
    userAssistants,
    loader,
    handleFetchUserAssistantStats,
    personalAssistantSearchQuery,
    setPersonalAssistantSearchQuery,
    handleDeleteAssistant,
    showEditModalHandler,
  } = useAssistantPage();
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [expandedData, setExpandedData] = useState([]);
  const [showExpandedTable, setShowExpandedTable] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingExpandedData, setLoadingExpandedData] = useState(false);
  const [expandedCurrentPage, setExpandedCurrentPage] = useState(1);
  const [expandedPageSize, setExpandedPageSize] = useState(10);
  const [expandedTotal, setExpandedTotal] = useState(0);
  const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);
  const [prefilledData, setPrefilledData] = useState({});

  useEffect(() => {
    handleFetchUserAssistantStats();
  }, []);

  useEffect(() => {
    if (currentUser) {
      (async () => {
        setLoadingExpandedData(true);
        try {
          const response = await fetchAssistantsCreatedByUser(
            expandedCurrentPage,
            currentUser._id,
            expandedPageSize,
            personalAssistantSearchQuery
          );
          setExpandedData(response?.data || []);
          setExpandedTotal(response?.meta?.total || 0);
        } catch (error) {
          console.error("Error fetching assistants created by user:", error);
        } finally {
          setLoadingExpandedData(false);
        }
      })();
    }
  }, [
    expandedCurrentPage,
    expandedPageSize,
    currentUser,
    personalAssistantSearchQuery,
  ]);

  const handleChange = (pagination, filters, sorter) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };

  const clearFilters = () => setFilteredInfo({});
  const clearAll = () => {
    setFilteredInfo({});
    setSortedInfo({});
  };

  const showInfoModal = (record) => {
    setPrefilledData(record);
    setIsInfoModalVisible(true);
  };

  const handleInfoModalCancel = () => setIsInfoModalVisible(false);

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
          personalAssistantSearchQuery
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

  const handleBack = () => {
    setShowExpandedTable(false);
    setCurrentUser(null);
    setExpandedData([]);
    setExpandedCurrentPage(1);
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

  const sortDateDescending = (a, b, key) => new Date(b[key]) - new Date(a[key]);
  const sortBoolean = (a, b, key) => (a[key] === b[key] ? 0 : a[key] ? -1 : 1);

  const createActionMenu = (record) => (
    <Menu>
      <Menu.Item key="redirect">
        <span
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
          onClick={() => redirectToAssistant(record)}
        >
          <IoChatbubbleEllipsesOutline /> Chat with Agent
        </span>
      </Menu.Item>
      <Menu.Item key="info">
        <span
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
          onClick={() => showInfoModal(record)}
          disabled={loader.ASSISTANT_LOADING}
        >
          <IoMdInformationCircleOutline /> View Info
        </span>
      </Menu.Item>
      <Menu.Item key="edit">
        <span
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
          onClick={() => showEditModalHandler(record)}
        >
          <AiOutlineEdit /> Edit Agent
        </span>
      </Menu.Item>
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
    </Menu>
  );

  const processedAssistants = useMemo(() => {
    let data = [...(userAssistants || [])];

    if (personalAssistantSearchQuery) {
      data = data.filter((item) =>
        item.username
          ?.toLowerCase()
          .includes(personalAssistantSearchQuery.toLowerCase())
      );
    }

    if (filteredInfo.personName && filteredInfo.personName.length) {
      data = data.filter((item) =>
        filteredInfo.personName.includes(item.fname)
      );
    }

    if (sortedInfo && sortedInfo.columnKey && sortedInfo.order) {
      const { columnKey, order } = sortedInfo;
      const direction = order === "ascend" ? 1 : -1;
      data.sort((a, b) => {
        switch (columnKey) {
          case "personName":
            return direction * a.fname.localeCompare(b.fname);
          case "totalAgents":
            return direction * (a.totalAssistants - b.totalAssistants);
          default:
            return 0;
        }
      });
    }

    return data;
  }, [userAssistants, personalAssistantSearchQuery, filteredInfo, sortedInfo]);

  const paginatedAssistants = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedAssistants.slice(start, start + pageSize);
  }, [processedAssistants, currentPage, pageSize]);

  const columns = [
    {
      title: "Person Name",
      dataIndex: "fname",
      key: "personName",
      width: "50%",
      align: "left",
      sorter: (a, b) => a.fname.localeCompare(b.fname),
      sortOrder:
        sortedInfo.columnKey === "personName" ? sortedInfo.order : null,
      filters: Array.from(new Set(userAssistants?.map((item) => item.fname)))
        .filter(Boolean)
        .map((name) => ({ text: name, value: name })),
      filteredValue: filteredInfo.personName || null,
      onFilter: (value, record) => record.fname === value,
      render: (_, record) => (
        <Space size="middle">
          <Button
            style={{ width: "18px", height: "18px", borderRadius: "6px" }}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/userAgents/${record.username}`);
            }}
            icon={<PlusOutlined />}
            size="small"
          />
          <span className="text-left">{record.fname}</span>
        </Space>
      ),
    },
    {
      title: "Total Agent",
      dataIndex: "totalAssistants",
      key: "totalAgents",
      width: "50%",
      align: "center",
      sorter: (a, b) => a.totalAssistants - b.totalAssistants,
      sortOrder:
        sortedInfo.columnKey === "totalAgents" ? sortedInfo.order : null,
    },
  ];

  const expandedRowRender = () => {
    const columns = [
      {
        title: "Agent",
        dataIndex: "name",
        key: "name",
        align: "left",
        width: "15%",
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
        title: "Descriptions",
        dataIndex: "description",
        key: "description",
        align: "left",
        width: "22%",
        render: (text) => {
          if (!text) return "No descriptions available";
          const words = text.split(/\s+/);
          const truncated = words.slice(0, 25).join(" ");
          return (
            <div style={{ whiteSpace: "pre-wrap" }}>
              {words.length > 25 ? `${truncated}...` : text}
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
          <Tag color={tools?.length > 0 ? "geekblue" : "purple"}>
            {tools?.length > 0 ? "Agent" : "Assistant"}
          </Tag>
        ),
        filters: [
          { text: "Agent", value: "agent" },
          { text: "Assistant", value: "assistant" },
        ],
        filteredValue: filteredInfo.type || null,
        onFilter: (value, record) => {
          if (value === "agent") return record.tools?.length > 0;
          if (value === "assistant")
            return !record.tools || record.tools.length === 0;
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
        sorter: (a, b) => sortDateDescending(a, b, "createdAt"),
        sortOrder:
          sortedInfo.columnKey === "createdAt" ? sortedInfo.order : null,
      },
      {
        title: "Last Updated",
        dataIndex: "updatedAt",
        key: "updatedAt",
        align: "center",
        width: "10%",
        render: (date) => <span>{formatDate(date, "Not updated")}</span>,
        sorter: (a, b) => sortDateDescending(a, b, "updatedAt"),
        sortOrder:
          sortedInfo.columnKey === "updatedAt" ? sortedInfo.order : null,
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
        sorter: (a, b) => sortBoolean(a, b, "is_public"),
        sortOrder:
          sortedInfo.columnKey === "is_public" ? sortedInfo.order : null,
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
        sorter: (a, b) => {
          const firstValue = a.is_active ? "Active" : "Inactive";
          const secondValue = b.is_active ? "Active" : "Inactive";
          return firstValue.localeCompare(secondValue);
        },
        sortOrder:
          sortedInfo.columnKey === "is_active" ? sortedInfo.order : null,
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
          scroll={{ y: "60vh" }}
          loading={loadingExpandedData}
          onChange={handleChange}
          onRow={() => ({
            onClick: (e) => e.stopPropagation(),
          })}
          rowKey="_id"
        />
      </>
    );
  };

  return (
    <CommonPageLayout>
      <div className="user-agent-container">
        <ProfileHeader
          title={
            showExpandedTable
              ? `User Agents - ${currentUser?.username}`
              : "User Agents"
          }
          subHeading="View agents associated with users in the organization."
          breadcrumbs={[
            { label: "Home", url: "/" },
            { label: "Agents", url: "/myAgents" },
            { label: "User Agents", url: "" },
          ]}
        />
        <div className="mb-1">
          {showExpandedTable ? (
            <div>{expandedRowRender()}</div>
          ) : (
            <>
              <div className="searchbox-container flex-wrap-style">
                <div className="searchbox-wrapper">
                  <DebouncedSearchInput
                    data={{
                      search: personalAssistantSearchQuery,
                      setSearch: setPersonalAssistantSearchQuery,
                      placeholder: "Search User Agents",
                    }}
                  />
                </div>
                <Pagination
                  className="pagination-overflow-hidden"
                  current={currentPage}
                  pageSize={pageSize}
                  total={processedAssistants?.length || 0}
                  showSizeChanger
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
                loading={loader.ASSISTANT_STATS_LOADING}
                columns={columns}
                dataSource={paginatedAssistants}
                onChange={handleChange}
                scroll={{ x:1000 ,y: "60vh" }}
                className={`${
                  loader.ASSISTANT_STATS_LOADING ||
                  paginatedAssistants.length === 0
                    ? "mt-2"
                    : ""
                }`}
                pagination={false}
                expandable={{
                  expandedRowRender,
                  onExpand,
                  expandIcon: () => null,
                }}
                rowKey="username"
              />
            </>
          )}
        </div>
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
    </CommonPageLayout>
  );
};

export default UserAgents;
