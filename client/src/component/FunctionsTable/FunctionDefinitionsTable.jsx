import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Space,
  Table,
  Tag,
  Modal,
  message,
  Pagination,
  Menu,
  Dropdown,
} from "antd";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import {
  getAllFunctionDefinitions,
  deleteFunctionDefinition,
} from "../../Pages/SuperAdmin/api/functionDefinition";
import { getUser } from "../../api/user";
import ConfirmationModal from "../../Pages/SuperAdmin/Team/ConfirmationModal";
import DebouncedSearchInput from "../../Pages/SuperAdmin/Organizations/DebouncedSearchInput";
import { LucideSquareFunction } from "lucide-react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { BsThreeDotsVertical } from "react-icons/bs";

const FunctionDefinitionsTable = ({ data }) => {
  const { userRole } = data;

  const navigate = useNavigate();

  const [functionDefinitions, setFunctionDefinitions] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortedInfo, setSortedInfo] = useState({});
  const [filteredInfo, setFilteredInfo] = useState({});

  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [functionIdToDelete, setFunctionIdToDelete] = useState(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [isAgentsModalVisible, setIsAgentsModalVisible] = useState(false);
  const [currentAgents, setCurrentAgents] = useState([]);

  const fetchFunctions = async () => {
    try {
      setLoading(true);
      const list = await getAllFunctionDefinitions(searchQuery);
      setFunctionDefinitions(list);

      const userIds = [
        ...new Set(list.map((func) => func.userId).filter(Boolean)),
      ];
      if (userIds.length) {
        const userResponses = await Promise.all(
          userIds.map((id) => getUser(id))
        );
        const map = {};
        userResponses.forEach(({ data }) => {
          if (data?.user?._id) map[data.user._id] = data.user;
        });
        setUserMap(map);
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to load functions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunctions();
  }, [searchQuery]);

  const formatDate = (date, fallback = "Invalid Date") => {
    if (!date || isNaN(Date.parse(date))) return fallback;
    return new Date(date).toLocaleDateString("en-US", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const sortDateDesc = (a, b, key) => new Date(b[key]) - new Date(a[key]);

  const handleDeleteFunction = async (id) => {
    try {
      setLoading(true);
      const { success, message: msg } = await deleteFunctionDefinition(id);
      success ? message.success(msg) : message.error(msg);
      await fetchFunctions();
    } catch (err) {
      console.error(err);
      message.error("Delete failed");
    } finally {
      setLoading(false);
      setConfirmationModalOpen(false);
    }
  };

  const handleEditNavigate = (id) => {
    navigate(`/editFunction/${id}`, {
      state: { from: window.location.pathname },
    });
  };

  const showDeleteConfirm = (id) => {
    setFunctionIdToDelete(id);
    setConfirmationModalOpen(true);
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      align: "left",
      sorter: (a, b) => a.title.localeCompare(b.title),
      sortOrder: sortedInfo.columnKey === "title" ? sortedInfo.order : null,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      align: "left",
      render: (text) => (
        <span>{text?.length > 60 ? `${text.slice(0, 60)}...` : text}</span>
      ),
    },
    {
      title: "Created By",
      dataIndex: "userId",
      key: "userId",
      align: "center",
      render: (id) => <span>{userMap[id]?.fname || "Unknown"}</span>,
      sorter: (a, b) => {
        const n1 = (userMap[a.userId]?.fname || "").toLowerCase();
        const n2 = (userMap[b.userId]?.fname || "").toLowerCase();
        return n1.localeCompare(n2);
      },
      sortOrder: sortedInfo.columnKey === "userId" ? sortedInfo.order : null,
      filters: Object.values(userMap).map((u) => ({
        text: u.fname,
        value: u.fname,
      })),
      filteredValue: filteredInfo.userId || null,
      onFilter: (val, record) => (userMap[record.userId]?.fname || "") === val,
    },
    {
      title: "Creation Date",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      render: formatDate,
      sorter: (a, b) => sortDateDesc(a, b, "createdAt"),
      sortOrder: sortedInfo.columnKey === "createdAt" ? sortedInfo.order : null,
    },
    {
      title: "Last Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      align: "center",
      render: (d) => formatDate(d, "Not updated"),
      sorter: (a, b) => sortDateDesc(a, b, "updatedAt"),
      sortOrder: sortedInfo.columnKey === "updatedAt" ? sortedInfo.order : null,
    },
    {
      title: "Associated Agents",
      key: "agents",
      align: "left",
      render: (_, record) => {
        const agents = record.associateAgents || [];
        if (!agents.length) return <span>No associated agents</span>;

        const seeMore = () => {
          setCurrentAgents(agents);
          setIsAgentsModalVisible(true);
        };

        return (
          <div className="associated-agents">
            {agents.slice(0, 4).map((a, i) => (
              <Tag key={i} color="blue">
                {a?.name || a}
              </Tag>
            ))}
            {agents.length > 4 && (
              <Tag style={{ cursor: "pointer" }} onClick={seeMore}>
                +{agents.length - 4} more
              </Tag>
            )}
          </div>
        );
      },
    },
    ...(userRole === "superadmin"
      ? [
          {
            title: "Actions",
            key: "actions",
            align: "center",
            render: (_, record) => (
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item
                      key="edit"
                      onClick={() => handleEditNavigate(record._id)}
                    >
                      <AiOutlineEdit /> Edit Function
                    </Menu.Item>
                    <Menu.Item
                      key="view"
                      onClick={() => {
                        setSelectedFunction(record);
                        setIsDetailsModalVisible(true);
                      }}
                    >
                      <IoMdInformationCircleOutline /> View Details
                    </Menu.Item>
                    <Menu.Item
                      key="delete"
                      danger
                      onClick={() => showDeleteConfirm(record._id)}
                    >
                      <AiOutlineDelete /> Delete Function
                    </Menu.Item>
                  </Menu>
                }
                trigger={["click"]}
              >
                <a onClick={(e) => e.preventDefault()}>
                  <Space>
                    <BsThreeDotsVertical />
                  </Space>
                </a>
              </Dropdown>
            ),
          },
        ]
      : []),
  ];

  const handleChange = (_p, filters, sorter) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };

  const paginatedData = functionDefinitions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div>
      <div className="mb-3">
        <div className="col-2 d-flex justify-content-start">
          <Button onClick={() => navigate("/createFunction")}>
            <LucideSquareFunction /> Create Functions
          </Button>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap-style">
        <DebouncedSearchInput
          data={{
            search: searchQuery,
            setSearch: setSearchQuery,
            placeholder: "Search Function",
          }}
        />
        <Pagination
          className="pagination-overflow-hidden"
          current={currentPage}
          pageSize={pageSize}
          total={functionDefinitions.length}
          showSizeChanger
          onChange={setCurrentPage}
          onShowSizeChange={(_, size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} of ${total} items`
          }
        />
      </div>

      <Space style={{ marginBottom: 16 }}>
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
        columns={columns}
        dataSource={paginatedData}
        rowKey="_id"
        loading={loading}
        scroll={{ x:1000 ,y: "60vh" }}
        onChange={handleChange}
        pagination={false}
      />

      <ConfirmationModal
        open={confirmationModalOpen}
        onConfirm={() => handleDeleteFunction(functionIdToDelete)}
        onCancel={() => setConfirmationModalOpen(false)}
        content="Are you sure you want to delete this function?"
      />

      <Modal
        title="Function Details"
        open={isDetailsModalVisible}
        onCancel={() => setIsDetailsModalVisible(false)}
        footer={null}
      >
        {selectedFunction && (
          <>
            <p>
              <b>Title:</b> {selectedFunction.title}
            </p>
            <p>
              <b>Description:</b> {selectedFunction.description}
            </p>
            <p>
              <b>Parameters:</b>{" "}
              {selectedFunction.parameters?.properties
                ? Object.entries(selectedFunction.parameters.properties).map(
                    ([k, v]) => (
                      <Tag key={k} style={{ margin: 4 }}>
                        {k}: {v.type}
                      </Tag>
                    )
                  )
                : "No parameters"}
            </p>
          </>
        )}
      </Modal>

      <Modal
        title="All Associated Agents"
        open={isAgentsModalVisible}
        onCancel={() => setIsAgentsModalVisible(false)}
        footer={null}
      >
        {currentAgents.map((agent, i) => (
          <Tag key={i} color="blue" style={{ marginBottom: 8 }}>
            {agent?.name || agent}
          </Tag>
        ))}
      </Modal>
    </div>
  );
};

export default FunctionDefinitionsTable;
