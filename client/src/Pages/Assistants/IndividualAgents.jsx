import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { BsRobot } from "react-icons/bs";
import { BsThreeDotsVertical } from "react-icons/bs";
import { AiOutlineDelete } from "react-icons/ai";
import { AiOutlineEdit } from "react-icons/ai";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { fetchAssistantsCreatedByUser } from "../../api/assistant";
import {
  showDeleteConfirm,
  redirectToAssistant,
} from "../../Utility/assistant-helper";
import "../../component/Assistant/Assistant.css";

const IndividualAgents = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const {
    userAssistants,
    loader,
    personalAssistantSearchQuery,
    setPersonalAssistantSearchQuery,
    handleDeleteAssistant,
    showEditModalHandler,
  } = useAssistantPage();
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [expandedCurrentPage, setExpandedCurrentPage] = useState(1);
  const [expandedPageSize, setExpandedPageSize] = useState(10);
  const [expandedData, setExpandedData] = useState([]);
  const [loadingExpandedData, setLoadingExpandedData] = useState(false);
  const [expandedTotal, setExpandedTotal] = useState(0);
  const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);
  const [prefilledData, setPrefilledData] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (userAssistants && username) {
      const user = userAssistants.find(
        (item) => item.username.toLowerCase() === username.toLowerCase()
      );
      setCurrentUser(user || null);
    }
  }, [userAssistants, username]);

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

  const handleInfoModalCancel = () => {
    setIsInfoModalVisible(false);
  };

  const formatDate = (date, fallbackText = "Invalid Date") => {
    if (!date || isNaN(Date.parse(date))) return fallbackText;
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
          disabled={loadingExpandedData}
        >
          <IoMdInformationCircleOutline /> View Info
        </span>
      </Menu.Item>
      {/* <Menu.Item
        key="edit"
        onClick={() => navigate(`/editAgent/${record.assistant_id}`)}
      >
        <AiOutlineEdit /> Edit Agent
      </Menu.Item> */}
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

  const columns = useMemo(
    () => [
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
        width: "20%",
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
    ],
    [sortedInfo, filteredInfo]
  );

  if (loader.ASSISTANT_STATS_LOADING || !userAssistants) {
    return (
      <CommonPageLayout>
        <ProfileHeader title="Loading..." subHeading="Fetching user data." />
        <div>Loading...</div>
      </CommonPageLayout>
    );
  }

  if (!currentUser) {
    return (
      <CommonPageLayout>
        <ProfileHeader
          title="User Not Found"
          subHeading="The specified user does not exist."
        />
        <div>User with username "{username}" not found.</div>
      </CommonPageLayout>
    );
  }

  return (
    <CommonPageLayout>
      <div className="individual-agent-container">
        <ProfileHeader
          title={`User Agents - ${currentUser.fname}`}
          subHeading="View agents associated with this user."
          breadcrumbs={[
            { label: "Home", url: "/" },
            { label: "Agents", url: "/myAgents" },
            { label: "User Agents", url: "/userAgents" },
            { label: `${currentUser.fname}'s Agents`, url: "" },
          ]}
        />
        <div className="mb-1">
          <div className="d-flex justify-content-between align-items-center">
            <Button onClick={() => navigate("/userAgents")}>Back</Button>
            <Pagination
              current={expandedCurrentPage}
              pageSize={expandedPageSize}
              total={expandedTotal}
              showSizeChanger
              onShowSizeChange={(current, size) => {
                setExpandedPageSize(size);
                setExpandedCurrentPage(1);
              }}
              onChange={(page) => setExpandedCurrentPage(page)}
              showTotal={(total) => `Total ${total} items`}
            />
          </div>
          <div className="searchbox-container">
            <div className="searchbox-wrapper">
              <DebouncedSearchInput
                data={{
                  search: personalAssistantSearchQuery,
                  setSearch: setPersonalAssistantSearchQuery,
                  placeholder: "Search User Agents",
                }}
              />
            </div>
          </div>
          <Space style={{ marginBottom: 16 }}>
            <Button onClick={clearFilters}>Clear filters</Button>
            <Button onClick={clearAll}>Clear filters and sorters</Button>
          </Space>
          <Table
            columns={columns}
            dataSource={expandedData}
            pagination={false}
            scroll={{ y: "50vh" }}
            loading={loadingExpandedData}
            onChange={handleChange}
            onRow={() => ({
              onClick: (e) => e.stopPropagation(),
            })}
          />
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

export default IndividualAgents;
