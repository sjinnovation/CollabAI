import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Space,
  Table,
  Tag,
  Dropdown,
  Menu,
  Pagination,
  Modal,
} from "antd";
import { AiOutlineDelete, AiOutlineTeam, AiOutlineEdit } from "react-icons/ai";
import {
  IoChatbubbleEllipsesOutline,
  IoInformationCircleOutline,
} from "react-icons/io5";
import { BiSolidLock, BiSolidLockOpen } from "react-icons/bi";
import { BsRobot, BsThreeDotsVertical } from "react-icons/bs";
import { RxCrossCircled } from "react-icons/rx";
import { CiCircleCheck } from "react-icons/ci";

import CommonPageLayout from "../../component/layout/CommonStructure/CommonPageLayout";
import ProfileHeader from "../../component/Proflie/ProfileHeader";
import DebouncedSearchInput from "../../Pages/SuperAdmin/Organizations/DebouncedSearchInput";
import AssistantTeamAssignModal from "../../component/Assistant/AssistantTeamAssignModal";

import {
  showDeleteConfirm,
  handleSwitchChange,
} from "../../Utility/showModalHelper";
import { handleCheckAssistantActive } from "../../Utility/addPublicAssistantHelper";
import useAssistantPage from "../../Hooks/useAssistantPage";

const formatDate = (isoDate, fallbackText = "Invalid Date") =>
  !isoDate || Number.isNaN(Date.parse(isoDate))
    ? fallbackText
    : new Date(isoDate).toLocaleDateString("en-US", {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
      });

const sortDateDescending = (a, b, key) => new Date(b[key]) - new Date(a[key]);

const sortBooleanTrueFirst = (a, b, key) =>
  a[key] === b[key] ? 0 : a[key] ? -1 : 1;

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

const renderTypeCell = ({ tools }) => {
  const isAgent = tools?.length > 0 ? true : false;
  return (
    <Tag color={isAgent ? "geekblue" : "purple"}>
      {isAgent ? "Agent" : "Assistant"}
    </Tag>
  );
};

const buildActionMenu = ({
  record,
  navigate,
  refreshData,
  handleTeamAssign,
  togglePublic,
  toggleActive,
  deleteAssistant,
}) => (
  <Menu>
    <Menu.Item
      key="chat"
      onClick={() => navigate(`/agents/${record.assistant_id || record._id}`)}
    >
      <IoChatbubbleEllipsesOutline /> Chat with Agent
    </Menu.Item>

    <Menu.Item
      key="edit"
      onClick={() =>
        navigate(`/editAgent/${record.assistant_id || record._id}`, {
          state: { from: "/organizationalAgents" },
        })
      }
    >
      <AiOutlineEdit /> Edit Agent
    </Menu.Item>

    <Menu.Item
      key="activate"
      onClick={async () => {
        await toggleActive(record);
        refreshData();
      }}
    >
      {record.is_active ? <RxCrossCircled /> : <CiCircleCheck />}{" "}
      {record.is_active ? "Make Deactivate" : "Make Activate"}
    </Menu.Item>

    <Menu.Item key="teams" onClick={() => handleTeamAssign(record)}>
      <AiOutlineTeam /> View Teams
    </Menu.Item>

    <Menu.Item
      key="public"
      onClick={async () => {
        await togglePublic(record);
        refreshData();
      }}
    >
      {record.is_public ? <BiSolidLock /> : <BiSolidLockOpen />}{" "}
      {record.is_public ? "Make Private" : "Make Public"}
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
                {Array.isArray(record.model)
                  ? record.model.join(", ")
                  : record.model || "N/A"}
              </p>
              <p>
                <strong>Tools Enabled:</strong>{" "}
                {Array.isArray(record.tools) && record.tools.length
                  ? record.tools
                      .filter(Boolean)
                      .map((tool) => tool.name || tool.type)
                      .join(", ")
                  : "N/A"}
              </p>
              <p>
                <strong>Functions Used:</strong>{" "}
                {record.openAIFunctions?.length
                  ? record.openAIFunctions
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
                {record.fileNames?.length ? record.fileNames.join(", ") : "N/A"}
              </p>
            </>
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
        showDeleteConfirm(
          record.assistant_id || record._id,
          record.name,
          deleteAssistant
        )
      }
    >
      <AiOutlineDelete /> Delete
    </Menu.Item>
  </Menu>
);

const OrganizationalAgents = () => {
  const navigate = useNavigate();
  const {
    assistants,
    loader,
    teamList,
    handleAssignTeamToAssistant,
    handleDeleteAssistant,
    handleUpdateAssistant,
    handleFetchAllAssistants,
    handlePublicAssistantAdd,
    orgAssistantSearchQuery,
    setOrgAssistantSearchQuery,
  } = useAssistantPage();

  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAssistant, setSelectedAssistant] = useState(null);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});

  const fetchAssistants = useCallback(() => {
    handleFetchAllAssistants(currentPage, orgAssistantSearchQuery, pageSize);
  }, [currentPage, orgAssistantSearchQuery, pageSize]);

  useEffect(() => {
    fetchAssistants();
  }, [fetchAssistants]);

  const toggleAgentActive = async (record) =>
    handleSwitchChange(record, !record.is_active, handleUpdateAssistant, true);

  const toggleAgentPublic = async (record) =>
    handleCheckAssistantActive(
      !record.is_public,
      record,
      handlePublicAssistantAdd
    );

  const columns = [
    {
      title: "Agent",
      dataIndex: "name",
      key: "name",
      align: "left",
      width: "20%",
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortOrder: sortedInfo?.columnKey === "name" && sortedInfo?.order,
      render: (_, record) => renderAgentCell(record),
    },
    {
      title: "Type",
      key: "type",
      align: "center",
      width: "12%",
      render: (_, record) => renderTypeCell(record),
      filters: [
        { text: "Agent", value: "agent" },
        { text: "Assistant", value: "assistant" },
      ],
      filteredValue: filteredInfo.type || null,
      onFilter: (value, record) => {
        const isAgent = record.tools?.some((tool) => tool?.type === "function");
        return value === "agent" ? isAgent : !isAgent;
      },
    },
    {
      title: "Creation Date",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      width: "12%",
      sorter: (a, b) => sortDateDescending(a, b, "createdAt"),
      sortOrder: sortedInfo?.columnKey === "createdAt" && sortedInfo?.order,
      render: (date) => formatDate(date),
    },
    {
      title: "Last Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      align: "center",
      width: "12%",
      sorter: (a, b) => sortDateDescending(a, b, "updatedAt"),
      sortOrder: sortedInfo?.columnKey === "updatedAt" && sortedInfo?.order,
      render: (date) => formatDate(date, "Not updated"),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      align: "center",
      width: "10%",
      sorter: (a, b) => sortBooleanTrueFirst(a, b, "is_active"),
      sortOrder: sortedInfo?.columnKey === "is_active" && sortedInfo?.order,
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
      sorter: (a, b) => sortBooleanTrueFirst(a, b, "is_public"),
      sortOrder: sortedInfo?.columnKey === "is_public" && sortedInfo?.order,
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
      width: "10%",
      render: (_, record) => (
        <Dropdown
          overlay={buildActionMenu({
            record,
            navigate,
            refreshData: fetchAssistants,
            handleTeamAssign: setSelectedAssistant,
            togglePublic: toggleAgentPublic,
            toggleActive: toggleAgentActive,
            deleteAssistant: handleDeleteAssistant,
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
      <div className="organizational-agent-container">
        <ProfileHeader
          title="Organizational Agents"
          subHeading="Collaborate with AI agents within the organization."
          breadcrumbs={[
            { label: "Home", url: "/" },
            { label: "Agents", url: "/myAgents" },
            { label: "Organizational Agents", url: "" },
          ]}
        />

        <AssistantTeamAssignModal
          data={{
            selectedAssistant,
            setSelectedAssistant,
            teamList,
            handleAssignTeamToAssistant,
            isTeamAssigning: loader.ASSISTANT_UPDATING,
          }}
        />

        <div className="searchbox-container flex-wrap-style">
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
            className="pagination-overflow-hidden"
            current={currentPage}
            pageSize={pageSize}
            total={assistants?.meta?.total}
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
          <Button onClick={() => setFilteredInfo({})}>Clear filters</Button>
          <Button
            onClick={() => {
              setFilteredInfo({});
              setSortedInfo({});
            }}
          >
            Clear filters & sorters
          </Button>
        </Space>

        <Table
          loading={loader.ALL_ASSISTANT_LOADING}
          columns={columns}
          dataSource={assistants.assistants}
          onChange={(_, filters, sorter) => {
            setFilteredInfo(filters);
            setSortedInfo(sorter);
          }}
          pagination={false}
          scroll={{ x: 1000, y: "60vh" }}
          className={
            loader.ALL_ASSISTANT_LOADING || assistants?.assistants?.length === 0
              ? "mt-2"
              : ""
          }
        />
      </div>
    </CommonPageLayout>
  );
};

export default OrganizationalAgents;
