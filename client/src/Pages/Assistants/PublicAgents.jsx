import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Space,
  Tag,
  Menu,
  Dropdown,
  Button,
  Pagination,
  Modal,
} from "antd";
import { BsRobot, BsThreeDotsVertical } from "react-icons/bs";
import {
  IoChatbubbleEllipsesOutline,
  IoInformationCircleOutline,
} from "react-icons/io5";
import { LuCopyPlus } from "react-icons/lu";
import { RiPushpinLine, RiUnpinLine } from "react-icons/ri";
import { AiOutlineDelete } from "react-icons/ai";

import { fetchPublicAssistant } from "../../api/publicAssistant";
import { personalizeAssistant } from "../../api/personalizeAssistant";
import {
  handleCheckboxChange,
  showDeletePublicConfirm,
} from "../../Utility/showModalHelper";
import DebouncedSearchInput from "../../Pages/SuperAdmin/Organizations/DebouncedSearchInput";
import useAssistantPage from "../../Hooks/useAssistantPage";
import { usePublicAssistant } from "../../Hooks/usePublicAssistantPage";
import ProfileHeader from "../../component/Proflie/ProfileHeader";
import CommonPageLayout from "../../component/layout/CommonStructure/CommonPageLayout";

const PublicAgents = () => {
  const navigate = useNavigate();
  const { handleUpdateAssistant } = useAssistantPage();
  const { handleDeletePublicAssistant } = usePublicAssistant();

  const [publicAssistants, setPublicAssistants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});

  useEffect(() => {
    fetchPublicAssistant(
      publicAssistants,
      setPublicAssistants,
      setIsLoading,
      setTotalCount,
      currentPage,
      searchQuery,
      pageSize
    );
  }, [searchQuery, currentPage, pageSize]);

  const openAgentPage = (assistantId) => navigate(`/agents/${assistantId}`);

  const formatDate = (dateStr, fb = "Invalid Date") =>
    !dateStr || isNaN(Date.parse(dateStr))
      ? fb
      : new Date(dateStr).toLocaleDateString("en-US", {
          year: "2-digit",
          month: "2-digit",
          day: "2-digit",
        });

  const compareDateDesc = (firstRow, secondRow, key) =>
    new Date(secondRow[key]) - new Date(firstRow[key]);

  const compareBool = (firstRow, secondRow, key) =>
    firstRow[key] === secondRow[key] ? 0 : firstRow[key] ? -1 : 1;

  const rowMenu = (agent) => (
    <Menu>
      <Menu.Item key="chat" onClick={() => openAgentPage(agent.assistant_id)}>
        <IoChatbubbleEllipsesOutline /> Chat with Agent
      </Menu.Item>

      <Menu.Item
        key="personalize"
        onClick={async () => {
          await personalizeAssistant(agent.assistant_id);
          navigate("/myAgents");
        }}
      >
        <LuCopyPlus /> Personalize Agent
      </Menu.Item>

      <Menu.Item
        key="feature"
        onClick={() =>
          handleCheckboxChange(
            agent,
            !agent.is_featured,
            publicAssistants,
            setPublicAssistants,
            handleUpdateAssistant
          )
        }
      >
        {agent.is_featured ? <RiPushpinLine /> : <RiUnpinLine />}{" "}
        {agent.is_featured ? "Unmark as featured" : "Mark as Featured"}
      </Menu.Item>

      <Menu.Item
        key="details"
        onClick={() =>
          Modal.info({
            title: "Model & Tools Details",
            content: (
              <div>
                <p>
                  <strong>AI Model:</strong>{" "}
                  {Array.isArray(agent.model)
                    ? agent.model.join(", ")
                    : agent.model || "N/A"}
                </p>
                <p>
                  <strong>Tools Enabled:</strong>{" "}
                  {Array.isArray(agent.tools) && agent.tools.length
                    ? agent.tools
                        .map((tool) => tool.type || tool.name)
                        .join(", ")
                    : "N/A"}
                </p>
                <p>
                  <strong>Functions Used:</strong>{" "}
                  {agent.openAIFunctions?.length
                    ? agent.openAIFunctions
                        .map((f) => f.function?.name)
                        .join(", ")
                    : "N/A"}
                </p>
                <p>
                  <strong>File Names:</strong>{" "}
                  {agent.fileNames?.length ? agent.fileNames.join(", ") : "N/A"}
                </p>
              </div>
            ),
          })
        }
      >
        <IoInformationCircleOutline /> Model & Tools Details
      </Menu.Item>

      <Menu.Item
        key="delete"
        danger
        onClick={() =>
          showDeletePublicConfirm(
            agent,
            handleDeletePublicAssistant,
            handleUpdateAssistant,
            publicAssistants,
            setPublicAssistants
          )
        }
      >
        <AiOutlineDelete /> Delete
      </Menu.Item>
    </Menu>
  );

  const creatorFilters = Array.from(
    new Set(publicAssistants.map((assistant) => assistant.userInfo))
  )
    .filter(Boolean)
    .map((name) => ({ text: name, value: name }));

  const columns = [
    {
      title: "Agent",
      dataIndex: "name",
      key: "name",
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
          <span className="ms-2 text-start">{name}</span>
        </Space>
      ),
      sorter: (firstRow, secondRow) =>
        firstRow.name.localeCompare(secondRow.name),
      sortOrder: sortedInfo.columnKey === "name" ? sortedInfo.order : null,
    },
    {
      title: "Type",
      key: "type",
      width: "10%",
      align: "center",
      render: (_, { tools }) => (
        <Tag color={tools?.length ? "geekblue" : "purple"}>
          {tools?.length ? "Agent" : "Assistant"}
        </Tag>
      ),
      filters: [
        { text: "Agent", value: "agent" },
        { text: "Assistant", value: "assistant" },
      ],
      filteredValue: filteredInfo.type || null,
      onFilter: (value, row) =>
        value === "agent"
          ? row.tools?.length > 0
          : !row.tools || !row.tools.length,
    },
    {
      title: "Created By",
      dataIndex: "userInfo",
      key: "created_by",
      width: "12%",
      sorter: (firstRow, secondRow) =>
        (firstRow.userInfo || "").localeCompare(secondRow.userInfo || ""),
      sortOrder:
        sortedInfo.columnKey === "created_by" ? sortedInfo.order : null,
      filters: creatorFilters,
      filteredValue: filteredInfo.created_by || null,
      onFilter: (value, row) => row.userInfo === value,
    },
    {
      title: "Creation Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: "12%",
      render: (dateStr) => <span>{formatDate(dateStr)}</span>,
      sorter: (firstRow, secondRow) =>
        compareDateDesc(firstRow, secondRow, "createdAt"),
      sortOrder: sortedInfo.columnKey === "createdAt" ? sortedInfo.order : null,
    },
    {
      title: "Last Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: "12%",
      render: (dateStr) => <span>{formatDate(dateStr, "Not updated")}</span>,
      sorter: (firstRow, secondRow) =>
        compareDateDesc(firstRow, secondRow, "updatedAt"),
      sortOrder: sortedInfo.columnKey === "updatedAt" ? sortedInfo.order : null,
    },
    {
      title: "Favorite Count",
      dataIndex: "count",
      key: "count",
      width: "10%",
      sorter: (firstRow, secondRow) => firstRow.count - secondRow.count,
      sortOrder: sortedInfo.columnKey === "count" ? sortedInfo.order : null,
      defaultSortOrder: "descend",
    },
    {
      title: "Featured",
      dataIndex: "is_featured",
      key: "is_featured",
      width: "8%",
      render: (is_featured) => (
        <Tag color={is_featured ? "blue" : "default"}>
          {is_featured ? "Yes" : "No"}
        </Tag>
      ),
      sorter: (firstRow, secondRow) =>
        compareBool(firstRow, secondRow, "is_featured"),
      sortOrder:
        sortedInfo.columnKey === "is_featured" ? sortedInfo.order : null,
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      width: "8%",
      render: (_, row) => (
        <Dropdown overlay={rowMenu(row)} trigger={["click"]}>
          <BsThreeDotsVertical style={{ cursor: "pointer" }} />
        </Dropdown>
      ),
    },
  ];

  const handleTableChange = (_, filters, sorter) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };
  const clearFilters = () => setFilteredInfo({});
  const clearAll = () => {
    setFilteredInfo({});
    setSortedInfo({});
  };

  return (
    <CommonPageLayout>
      <div className="public-agent-container">
        <ProfileHeader
          title="Public Agents"
          subHeading="Explore publicly available AI agents."
          breadcrumbs={[
            { label: "Home", url: "/" },
            { label: "Agents", url: "/myAgents" },
            { label: "Public Agents", url: "" },
          ]}
        />

        <div className="searchbox-container flex-wrap-style">
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
            className="pagination-overflow-hidden"
            current={currentPage}
            pageSize={pageSize}
            total={totalCount}
            showSizeChanger
            onShowSizeChange={(_, size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            onChange={setCurrentPage}
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} items`
            }
          />
        </div>

        <Space style={{ marginBottom: 12 }}>
          <Button onClick={clearFilters}>Clear filters</Button>
          <Button onClick={clearAll}>Clear filters & sorters</Button>
        </Space>

        <Table
          loading={isLoading}
          columns={columns}
          dataSource={publicAssistants}
          onChange={handleTableChange}
          scroll={{ x: 1000, y: "60vh" }}
          pagination={false}
          className={isLoading || !publicAssistants.length ? "mt-2" : ""}
        />
      </div>
    </CommonPageLayout>
  );
};

export default PublicAgents;
