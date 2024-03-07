import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Alert } from "react-bootstrap";
import { Table, Tag, Button, Modal, Typography } from "antd";
import { FaEdit } from "react-icons/fa";
import { AiOutlineDelete, AiOutlineEdit, AiOutlineTeam } from "react-icons/ai";
import {
  assignTeam,
  deleteUser,
  getAllUsers,
  getTeams,
  searchUsers,
} from "../../../api/user";
import DebouncedSearchInput from "../../SuperAdmin/Organizations/DebouncedSearchInput";
import { getUserRole } from "../../../Utility/service";
import AddUser from "../Add/AddUser";
import EditUser from "../EditUser/EditUser";
const { Title } = Typography;

const ListUser = () => {
  const role = getUserRole();
  const navigate = useNavigate();
  const [userList, setUserList] = useState(null);
  const [dataLoader, setDataLoader] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [userIdToDelete, setUserIdToDelete] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [teamList, setTeamList] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [totalUsers, setTotalUsers] = useState(0);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editActive, setEditActive] = useState(null);
  const limit = 10;
  const userRole = getUserRole();

  const showTeamAssignModal = () => {
    setIsModalOpen(true);
  };
  const handleTeamAssignOk = () => {
    handleTeamAssign(selectedTeam);
    setIsModalOpen(false);
  };
  const handleTeamAssignCancel = () => {
    setIsModalOpen(false);
  };

  const fetchTeams = async () => {
    try {
      const response = await getTeams();
      setTeamList(response.data.teams);
    } catch (error) {
      console.log(error);
    }
  };


  useEffect(() => {
    if (userRole === "admin" || userRole === "superadmin") {
      fetchTeams();
      fetchInitialData();
    }
  }, [addModal, editModal]);

  const fetchInitialData = async () => {
    try {
      const response = await getAllUsers(1, 10);

      setUserList(response?.data?.user);
      setTotalUsers(response?.data?.nbhits);

      // Calculate the number of pages based on the total count
      const pageCount = Math.ceil(response?.data?.nbhits / 10); // Assuming page size is 10
      setDataLoader(false);

      // Fetch data for the first page again to display the pagination based on total count
      if (pageCount > 1) {
        fetchUserDetails(1);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setDataLoader(false);
    }
  };

  const fetchUserDetails = async (page) => {
    try {
      const response = await getAllUsers(page, 10);
      setUserList(response?.data?.user);
      setDataLoader(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setDataLoader(false);
    }
  };

  useEffect(() => {
    async function fetchPaginateUsers() {
      if (searchQuery) return; // Exit early if searchQuery exists
      setDataLoader(true);

      try {
        const response = await searchUsers(currentPage, limit, searchQuery);
        setUserList(response?.data?.user);
        setDataLoader(false);
      } catch (error) {
        console.error("Error searching users:", error);
        setDataLoader(false);
      }
    }
    fetchPaginateUsers();
  }, [currentPage, limit, searchQuery]);

  const handleSearch = async () => {
    setDataLoader(true);
    try {
      const response = await searchUsers(1, 10, searchQuery);
      const data = response?.data?.user;
      setUserList(data);
      setDataLoader(false);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error searching users:", error);
      setDataLoader(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [searchQuery]);

  const handleDelete = async () => {
    try {
      const response = await deleteUser(userIdToDelete);
      console.log("deleted user:", response);
    } catch (error) {
      // toast.error(response.data.message);
      console.log(error);
    }
    setDeleteModalVisible(false);
    fetchUserDetails();
  };

  const handleTeamAssign = async (selectedTeamId) => {
    const requestBody = {
      selectedUsersIds: selectedRows,
      assignedTeamId: selectedTeamId,
    };
    try {
      const response = await assignTeam(requestBody);
      if (response?.status === 200) {
        fetchUserDetails();
        setSelectedRows([]);
      }
      console.log("Bulk team assign response:", response);
    } catch (error) {
      console.log(error);
    }
  };

  const columns = [
    {
      title: "First Name",
      dataIndex: "fname",
    },
    {
      title: "Last Name",
      dataIndex: "lname",
    },
    {
      title: "Username",
      dataIndex: "username",
    },
    {
      title: "Teams",
      dataIndex: "teams",
      key: "teams",
      className: "column-custom-style",
      render: (_, { teams }) => (
        <div className="d-flex align-items-center flex-wrap gap-1">
          {(teams || [])?.map((team) => {
            return (
              <Tag color="geekblue" key={team._id}>
                {team.teamTitle.toUpperCase()}
              </Tag>
            );
          })}
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text) => {
        let tagColor = "";
        if (text === "active") {
          tagColor = "green";
        } else if (text === "inactive") {
          tagColor = "red";
        }
        return <Tag color={tagColor}>{text.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <div>
          <Button
            style={{ marginRight: 10 }}
            onClick={() => {
              setEditActive(record._id);
              setEditModal(true);
            }}
            icon={<AiOutlineEdit />}
          ></Button>
          {/* Delete button */}
          <Button
            shape="circle"
            danger
            onClick={() => {
              setUserIdToDelete(record._id);
              setDeleteModalVisible(true);
            }}
          >
            <AiOutlineDelete />
          </Button>
        </div>
      ),
    },
  ];

  const onSelectChange = (newSelectedRowKeys, selectedRows) => {
    setSelectedRowKeys(newSelectedRowKeys);

    const selectedObjectIds = selectedRows.map((row) => row._id);
    setSelectedRows(selectedObjectIds);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const hasSelected = selectedRowKeys.length > 0;

  const dataWithKeys = userList?.map((user) => {
    return { ...user, key: user._id };
  });

  const showTotal = (total) => `Total ${total} items`;
  
  
  return (
    <>
      <div className="container mt-5">
      <div className="flex-grow-1 ">
        <div className="d-flex align-items-center justify-content-between">
          <div className="col-4">
            <Title level={2}>User Lists</Title>
          </div>
          <div className="col-md-5"></div>
          {role === "admin" || role === "superadmin" ? (
            <>
              <div className=" d-flex align-items-center user-prompt-btn">
                <Button onClick={() => navigate("/promptuserview")}>
                  Chat Prompts
                </Button>
              </div>
              <div className="d-flex align-items-center add-user-btn">
                <Button onClick={() => setAddModal(true)}>+ User</Button>
              </div>
            </>
          ) : null}
        </div>
        {role === "admin" || role === "superadmin" ? (
          <div>
            <div className="search-container">
              <DebouncedSearchInput
                data={{
                  search: searchQuery,
                  setSearch: setSearchQuery,
                  placeholder: "Search users",
                }}
              />
             <Button type="primary" onClick={showTeamAssignModal} disabled={!hasSelected} loading={dataLoader}>
              <AiOutlineTeam size={27}/>
            </Button>
            </div>
            <div>
            
            </div>
            <Table
              loading={dataLoader}
              rowSelection={{
                type: "checkbox",
                ...rowSelection,
              }}
              columns={columns}
              dataSource={dataWithKeys}
              pagination={{
                showTotal: showTotal,
                pageSize: 10,
                total: totalUsers,
                onChange: (page, pageSize) => {
                  fetchUserDetails(page);
                },
                showSizeChanger: false,
              }}
              scroll={{ x: true, y: "50vh" }} // Enable horizontal scrolling
              bordered
              responsive
            />
          </div>
        ) : (
          <div className="no-data-found">
            <Alert variant="info">
              <Alert.Heading>No Data Found</Alert.Heading>
            </Alert>
          </div>
        )}

        {/* Delete confirmation modal */}
        <Modal
          title="Confirm Delete"
          open={deleteModalVisible}
          onOk={handleDelete}
          onCancel={() => setDeleteModalVisible(false)}
        >
          Are you sure you want to delete this user?
        </Modal>

        {/* Modal For Choose a team*/}

        <Modal
          title="Assign a team:"
          open={isModalOpen}
          onOk={handleTeamAssignOk}
          okText="Save"
          onCancel={handleTeamAssignCancel}
          okButtonProps={{
            disabled: !selectedTeam,
          }}
        >
          <div className="team-select-content-container">
            {teamList?.map((team) => (
              <div key={team._id}>
                <label>
                  <div className="Team-select-container">
                    <div className="team-select-input">
                      <input
                        type="radio"
                        name="team"
                        value={team._id}
                        checked={selectedTeam === team._id}
                        onChange={(e) => setSelectedTeam(e.target.value)}
                      />
                    </div>
                    <div className="team-select-title">
                      <p>{team?.teamTitle}</p>
                    </div>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </Modal>

        <Modal
          title="Add User"
          open={addModal}
          onCancel={() => setAddModal(false)}
          footer={[]}
        >
          <AddUser setAddModal={setAddModal} />
        </Modal>
        <Modal
          title="Edit User"
          open={editModal}
          onCancel={() => setEditModal(false)}
          footer={[]}
        >
          <EditUser setEditModal={setEditModal} id={editActive} />
        </Modal>
      </div>
      </div>
    </>
  );
};

export default ListUser;
