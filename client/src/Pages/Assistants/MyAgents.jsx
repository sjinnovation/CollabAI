import { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Dropdown,
  Menu,
  Pagination,
} from "antd";
import { BsRobot, BsThreeDotsVertical } from "react-icons/bs";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import {
  IoChatbubbleEllipsesOutline,
  IoInformationCircleOutline,
} from "react-icons/io5";
import { RxCrossCircled } from "react-icons/rx";
import { CiCircleCheck } from "react-icons/ci";
import { BiSolidLock, BiSolidLockOpen } from "react-icons/bi";

import DebouncedSearchInput from "../../Pages/SuperAdmin/Organizations/DebouncedSearchInput";
import { handleSwitchChange } from "../../Utility/showModalHelper";
import { handleCheckAssistantActive } from "../../Utility/addPublicAssistantHelper";
import { FileContext } from "../../contexts/FileContext";
import useAssistantPage from "../../Hooks/useAssistantPage";
import ProfileHeader from "../../component/Proflie/ProfileHeader";
import CommonPageLayout from "../../component/layout/CommonStructure/CommonPageLayout";

const { confirm } = Modal;

const formatDate = (isoDate, fallbackText = "Invalid Date") =>
  !isoDate || Number.isNaN(Date.parse(isoDate))
    ? fallbackText
    : new Date(isoDate).toLocaleDateString("en-US", {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
      });

const sortDateDescending = (firstRow, secondRow, key) =>
  new Date(secondRow[key]) - new Date(firstRow[key]);

const sortBooleanTrueFirst = (firstRow, secondRow, key) => {
  if (firstRow[key] === secondRow[key]) return 0;
  return firstRow[key] ? -1 : 1;
};

const renderAgentCell = ({ name, image_url }) => (
  <Space>
    <div className="assistantImageDiv">
      {image_url ? (
        <img src={image_url} className="customImage" alt="avatar" />
      ) : (
        <BsRobot className="customImage" />
      )}
    </div>
    <span>{name}</span>
  </Space>
);

const renderTypeCell = ({ tools, category }) => {
  const isAgent = tools?.length > 0 ? true : false;
  return (
    <div className="type-css">
      <Tag color={isAgent ? "geekblue" : "purple"}>
        {isAgent ? "Agent" : "Assistant"}
      </Tag>
      {category === "ORGANIZATIONAL" && (
        <Tag color="volcano" style={{ marginTop: 4 }}>
          Organizational
        </Tag>
      )}
    </div>
  );
};

const buildActionMenu = ({
  agentRecord,
  navigate,
  refreshAgents,
  togglePublic,
  toggleActive,
  deleteAgent,
}) => (
  <Menu>
    <Menu.Item
      key="chat"
      onClick={() =>
        window.open(`/agents/${agentRecord.assistant_id}`, "_blank")
      }
    >
      <IoChatbubbleEllipsesOutline /> Chat with Agent
    </Menu.Item>

    <Menu.Item
      key="edit"
      onClick={() => navigate(`/editAgent/${agentRecord.assistant_id}`)}
    >
      <AiOutlineEdit /> Edit Agent
    </Menu.Item>

    <Menu.Item
      key="activate"
      onClick={async () => {
        await toggleActive(agentRecord);
        refreshAgents();
      }}
    >
      {agentRecord.is_active ? <RxCrossCircled /> : <CiCircleCheck />}{" "}
      {agentRecord.is_active ? "Make Deactivate" : "Make Activate"}
    </Menu.Item>

    <Menu.Item
      key="public"
      onClick={async () => {
        await togglePublic(agentRecord);
        refreshAgents();
      }}
    >
      {agentRecord.is_public ? <BiSolidLock /> : <BiSolidLockOpen />}{" "}
      {agentRecord.is_public ? "Make Private" : "Make Public"}
    </Menu.Item>

    <Menu.Item
      key="details"
      onClick={() =>
        Modal.info({
          title: "Model & Tools Details",
          content: (
            <>
              <p>
                <strong>AI Model:</strong>{" "}
                {Array.isArray(agentRecord.model)
                  ? agentRecord.model.join(", ")
                  : agentRecord.model ?? "N/A"}
              </p>
              <p>
                <strong>Tools Enabled:</strong>{" "}
                {Array.isArray(agentRecord.tools) && agentRecord.tools.length
                  ? (() => {
                      const toolTypes = agentRecord.tools.map((t) => t.type);
                      const labels = [];
                      if (toolTypes.includes("function"))
                        labels.push("Function Calling");
                      if (toolTypes.includes("code_interpreter"))
                        labels.push("Code Interpreter");
                      if (toolTypes.includes("file_search"))
                        labels.push("File Search");
                      return labels.length ? labels.join(", ") : "N/A";
                    })()
                  : "N/A"}
              </p>
              <p>
                <strong>Functions Used:</strong>{" "}
                {agentRecord.openAIFunctions?.length
                  ? agentRecord.openAIFunctions
                      .map(({ function: fn }) =>
                        (fn?.name || "")
                          .replace(/_[0-9a-f]+$/i, "")
                          .replace(/_/g, " ")
                      )
                      .join(", ")
                  : "N/A"}
              </p>
              <p>
                <strong>File Names:</strong>{" "}
                {agentRecord.fileNames?.length
                  ? agentRecord.fileNames.join(", ")
                  : "N/A"}
              </p>
            </>
          ),
        })
      }
    >
      <IoInformationCircleOutline /> Model & Tools Details
    </Menu.Item>

    <Menu.Item key="delete" danger onClick={() => deleteAgent(agentRecord)}>
      <AiOutlineDelete /> Delete
    </Menu.Item>
  </Menu>
);

const MyAgents = () => {
  const navigate = useNavigate();
  const { isEditPageLoading } = useContext(FileContext);

  const {
    adminUserAssistants,
    loader,
    handleDeleteAssistant,
    handleUpdateAssistant,
    handleFetchUserCreatedAssistants,
    totalCount,
    personalAssistantSearchQuery,
    setPersonalAssistantSearchQuery,
    handlePublicAssistantAdd,
  } = useAssistantPage();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});

  const fetchAgents = useCallback(() => {
    handleFetchUserCreatedAssistants(
      currentPage,
      personalAssistantSearchQuery,
      pageSize
    );
  }, [currentPage, personalAssistantSearchQuery, pageSize]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const clearFilters = () => setFilteredInfo({});
  const clearAll = () => {
    setFilteredInfo({});
    setSortedInfo({});
  };

  const confirmDeleteAgent = (assistantId, assistantName) =>
    confirm({
      title: "Are you sure you want to delete this agent?",
      content: `You are deleting "${assistantName}".`,
      okType: "danger",
      okText: "Yes",
      cancelText: "No",
      onOk: () => handleDeleteAssistant(assistantId),
    });

  const toggleAgentActive = async (agentRecord) =>
    handleSwitchChange(
      agentRecord,
      !agentRecord.is_active,
      handleUpdateAssistant
    );

  const toggleAgentPublic = async (agentRecord) =>
    handleCheckAssistantActive(
      !agentRecord.is_public,
      agentRecord,
      handlePublicAssistantAdd
    );

  const columns = [
    {
      title: "Agent",
      dataIndex: "name",
      key: "name",
      align: "left",
      width: "20%",
      sorter: (first, second) => first.name.localeCompare(second.name),
      sortOrder: sortedInfo.columnKey === "name" && sortedInfo.order,
      render: (_, record) => renderAgentCell(record),
    },
    {
      title: "Type",
      key: "type",
      align: "center",
      width: "14%",
      render: (_, record) => renderTypeCell(record),
      filters: [
        { text: "Agent", value: "agent" },
        { text: "Assistant", value: "assistant" },
      ],
      filteredValue: filteredInfo.type || null,
      onFilter: (filterValue, record) => {
        if (filterValue === "agent")
          return record.tools?.some((tool) => tool.type === "function");
        if (filterValue === "assistant") return !(record.tools?.length ?? 0);
        return true;
      },
    },
    {
      title: "Creation Date",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      width: "12%",
      sorter: (rowA, rowB) => sortDateDescending(rowA, rowB, "createdAt"),
      sortOrder: sortedInfo.columnKey === "createdAt" && sortedInfo.order,
      render: (date) => formatDate(date),
    },
    {
      title: "Last Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      align: "center",
      width: "12%",
      sorter: (rowA, rowB) => sortDateDescending(rowA, rowB, "updatedAt"),
      sortOrder: sortedInfo.columnKey === "updatedAt" && sortedInfo.order,
      render: (date) => formatDate(date, "Not updated"),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      align: "center",
      width: "8%",
      sorter: (rowA, rowB) => sortBooleanTrueFirst(rowA, rowB, "is_active"),
      sortOrder: sortedInfo.columnKey === "is_active" && sortedInfo.order,
      render: (_, { is_active }) => (
        <Tag color={is_active ? "green" : "red"}>
          {is_active ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Published",
      dataIndex: "is_public",
      key: "is_public",
      align: "center",
      width: "10%",
      sorter: (rowA, rowB) => sortBooleanTrueFirst(rowA, rowB, "is_public"),
      sortOrder: sortedInfo.columnKey === "is_public" && sortedInfo.order,
      render: (_, { is_public }) => (
        <Tag color={is_public ? "blue" : "default"}>
          {is_public ? "Public" : "Private"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      width: "8%",
      render: (_, agentRecord) => (
        <Dropdown
          overlay={buildActionMenu({
            agentRecord,
            navigate,
            refreshAgents: fetchAgents,
            togglePublic: toggleAgentPublic,
            toggleActive: toggleAgentActive,
            deleteAgent: () =>
              confirmDeleteAgent(agentRecord.assistant_id, agentRecord.name),
          })}
          trigger={["click"]}
        >
          <BsThreeDotsVertical style={{ cursor: "pointer" }} />
        </Dropdown>
      ),
    },
  ];

  return (
    <CommonPageLayout>
      <div className="my-agent-container">
        <ProfileHeader
          title="My Agents"
          subHeading="List of agents created by you."
          breadcrumbs={[
            { label: "Home", url: "/" },
            { label: "Agents", url: "/myAgents" },
            { label: "My Agents", url: "" },
          ]}
        />

        <div className="searchbox-container flex-wrap-style">
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
            className="pagination-overflow-hidden"
            current={currentPage}
            pageSize={pageSize}
            total={totalCount}
            showSizeChanger
            onShowSizeChange={(_, newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            onChange={setCurrentPage}
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total}`}
          />
        </div>

        <Space style={{ marginBottom: 12 }}>
          <Button onClick={clearFilters}>Clear filters</Button>
          <Button onClick={clearAll}>Clear filters & sorters</Button>
        </Space>

        <Table
          loading={loader.ASSISTANT_LOADING || isEditPageLoading}
          columns={columns}
          dataSource={adminUserAssistants}
          onChange={(_, newFilters, newSorter) => {
            setFilteredInfo(newFilters);
            setSortedInfo(newSorter);
          }}
          pagination={false}
          scroll={{ x: 1000 ,y: "60vh" }}
          className={
            loader.ASSISTANT_LOADING ||
            isEditPageLoading ||
            adminUserAssistants.length === 0
              ? "mt-2"
              : ""
          }
        />
      </div>
    </CommonPageLayout>
  );
};

export default MyAgents;
