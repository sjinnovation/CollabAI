import React, { useEffect, useState } from "react";
import {
  Button,
  Space,
  Table,
  Tag,
  Modal,
  Tooltip,
  Switch,
  message,
  Menu,
  Dropdown,
  Pagination,
} from "antd";
import ConfirmationModal from "../../Pages/SuperAdmin/Team/ConfirmationModal";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { LucideSquareFunction } from "lucide-react";
import {
  deleteFunctionDefinition,
  getSingleFunctionDefinitions,
  handleValidateFunction,
  renderParameterInputs,
} from "../../Pages/SuperAdmin/api/functionDefinition";
import { getUser } from "../../api/user";
import FunctionDefinitionModel from "../../Pages/SuperAdmin/Modals/FunctionDefinitionModal";
import DebouncedSearchInput from "../../Pages/SuperAdmin/Organizations/DebouncedSearchInput";
//-----Helper----------//

import ValidationModel from "../../Pages/SuperAdmin/Modals/ValidationModel";
import ProfileHeader from "../Proflie/ProfileHeader";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { BsThreeDotsVertical } from "react-icons/bs";

const UserFunctionCallingAssistantTable = ({ data }) => {
  const { toggleDefineFunctionsModal, userId, refreshTrigger } = data;
  const [functionIdToDelete, setFunctionIdToDelete] = useState(null);
  const [functionDefinitions, setFunctionDefinitions] = useState([]);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [editFunctionModalOpen, setEditFunctionModalOpen] = useState(false);
  const [userMap, setUserMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [functionToEdit, setFunctionToEdit] = useState(null);
  const [refreshFunctions, setRefreshFunctions] = useState(false);
  const [definitionToValidate, setDefinitionToValidate] = useState("");
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validateConsole, setValidateConsole] = useState("");
  const [parameterValues, setParameterValues] = useState({});
  const [functionName, setFunctionName] = useState("");
  const [functionsParameterNames, setFunctionsParameterNames] = useState([]);
  const [functionDefinition, setFunctionDefinition] = useState("");
  const [functionBody, setFunctionBody] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [functionAgentMap, setFunctionAgentMap] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentAgents, setCurrentAgents] = useState([]);

  const handleParameterChange = (event) => {
    const { name, value } = event.target;
    setParameterValues({
      ...parameterValues,
      [name]: value,
    });
  };

  const validateFunctionDefinition = async (definition) => {
    setDefinitionToValidate(definition);
  };

  useEffect(() => {
    getAllfunctions();
  }, [refreshFunctions]);

  useEffect(() => {
  }, [functionDefinitions]);

  const getAllfunctions = async () => {
    try {
      setLoading(true);
      const functions = await getSingleFunctionDefinitions(userId, searchQuery);
      setFunctionDefinitions(functions);
      const userIds = [
        ...new Set(functions.map((item) => item.userId).filter(Boolean)),
      ];
      if (userIds.length === 0) {
        setUserMap({});
        return;
      }
      const userPromises = userIds.map((id) => getUser(id));
      const users = await Promise.all(userPromises);
      const userInfoMap = {};
      users.forEach((userInfo) => {
        if (userInfo && userInfo.data && userInfo.data.user) {
          userInfoMap[userInfo.data.user._id] = userInfo.data.user; // Map to user object
        }
      });
      setUserMap(userInfoMap);
      setRefreshFunctions(false);
    } catch (error) {
      console.error("Error fetching functions or users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFunction = async (id) => {
    try {
      setLoading(true);
      const { success, message: responseMessage } =
        await deleteFunctionDefinition(id);
      if (success) {
        message.success(responseMessage);
        getAllfunctions();
        setConfirmationModalOpen(false);
      } else {
        message.error(responseMessage);
      }
    } catch (error) {
      console.error("Error deleting function:", error);
      message.error(error.message);
    } finally {
      setLoading(false);
      setConfirmationModalOpen(false);
    }
  };

  const handleFunctionNameChange = (value) => {
    setFunctionName(value);
    updateFunctionDefinition(value);
  };

  const showEditModalHandler = (record) => {
    setFunctionToEdit(record);
    const functionBody = record.definition.match(/\{([\s\S]*)\}/)?.[1]?.trim();
    setFunctionName(record.name);
    setFunctionsParameterNames(record.parameters.properties);
    setFunctionBody(functionBody);
    setFunctionDefinition(
      `function ${record.name}(${Object.keys(record.parameters.properties).join(
        ", "
      )}) {\n${functionBody}\n}`
    );
    setEditFunctionModalOpen(true);
  };

  const showDeleteConfirm = (id) => {
    setFunctionIdToDelete(id);
    setConfirmationModalOpen(true);
  };

  const toggleValidationModal = () => {
    setShowValidationModal(!showValidationModal);
  };

  useEffect(() => {
    getAllfunctions(); // Fetch data on initial render
  }, [searchQuery]);

  useEffect(() => {
    if (functionToEdit && functionToEdit.definition) {
      setDefinitionToValidate(functionToEdit.definition);
    }
  }, [functionToEdit]);

  const updateFunctionDefinition = (newName) => {
    if (
      functionToEdit &&
      functionToEdit.parameters &&
      functionToEdit.parameters.properties
    ) {
      const parameters = Object.keys(functionToEdit.parameters.properties).join(
        ", "
      );
      setFunctionDefinition(
        `function ${newName}(${parameters}) {\n${functionBody}\n}`
      );
    }
  };

  useEffect(() => {
    if (editFunctionModalOpen && functionToEdit) {
      updateFunctionDefinition(functionName);
    }
    if (!editFunctionModalOpen) {
      setFunctionToEdit(null);
    }
  }, [editFunctionModalOpen, functionToEdit]);

  const showDetails = (record) => {
    setSelectedFunction(record);
    setIsDetailsModalVisible(true);
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

  const sortDateDescending = (firstItem, secondItem, key) =>
    new Date(secondItem[key]) - new Date(firstItem[key]);

  const sortBoolean = (firstItem, secondItem, key) => {
    return firstItem[key] === secondItem[key] ? 0 : firstItem[key] ? -1 : 1;
  };

  const createActionMenu = (record) => {
    return (
      <Menu>
        <Menu.Item key="edit">
          <span
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
            onClick={() => showEditModalHandler(record)}
          >
            <AiOutlineEdit /> Edit Function
          </span>
        </Menu.Item>
        <Menu.Item key="view">
          <span
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
            onClick={() => showDetails(record)}
          >
            <IoMdInformationCircleOutline /> View Details
          </span>
        </Menu.Item>
        <Menu.Item key="delete" danger>
          <span
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
            onClick={() => showDeleteConfirm(record._id)}
          >
            <AiOutlineDelete /> Delete Function
          </span>
        </Menu.Item>
      </Menu>
    );
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      align: "left",
      render: (text) => <span className="text-left">{text}</span>,
      sorter: (firstFunction, secondFunction) =>
        firstFunction?.title?.localeCompare(secondFunction?.title),
      sortOrder: sortedInfo?.columnKey === "title" ? sortedInfo?.order : null,
    },
    {
      title: "Description",
      key: "description",
      align: "left",
      dataIndex: "description",
      render: (text) => <span className="text-left">
      {text?.length > 60 ? `${text.substring(0, 60)}...` : text}
    </span>,
    },
    {
      title: "Created By",
      align: "center",
      dataIndex: "userId",
      key: "userId",
      render: (userId) => {
        if (!userId) {
          return <span className="text-left">N/A</span>;
        }
        const user = userMap[userId];
        const fname = user ? user?.fname : "Unknown";
        return <span className="text-left">{fname}</span>;
      },
    },
    {
      title: "Creation Date",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      width: "15%",
      render: (date) => <span>{formatDate(date)}</span>,
      sorter: (firstRecord, secondRecord) =>
        sortDateDescending(firstRecord, secondRecord, "createdAt"),
      sortOrder:
        sortedInfo?.columnKey === "createdAt" ? sortedInfo?.order : null,
    },
    {
      title: "Last Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      align: "center",
      width: "12%",
      render: (date) => <span>{formatDate(date, "Not updated")}</span>,
      sorter: (firstRecord, secondRecord) =>
        sortDateDescending(firstRecord, secondRecord, "updatedAt"),
      sortOrder:
        sortedInfo?.columnKey === "updatedAt" ? sortedInfo?.order : null,
    },
    {
      title: "Associated Agents",
      key: "associatedAgents",
      align: "left",
      render: (_, record) => {
        const agents = record?.associateAgents || [];
        if (agents?.length === 0) {
          return <span>No associated agents</span>;
        }

        const handleSeeMore = () => {
          setCurrentAgents(agents);
          setIsModalVisible(true);
        };

        return (
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {agents.slice(0, 4).map((agent, index) => (
              <Tag key={index} color="blue">
                {agent.name || agent}
              </Tag>
            ))}
            {agents.length > 4 && (
              <Tag
                color="default"
                onClick={handleSeeMore}
                style={{ cursor: "pointer" }}
              >
                +{agents.length - 4} more
              </Tag>
            )}
          </div>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
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

  const refreshTable = () => {
    setLoading(true);
    getAllfunctions().finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    refreshTable();
  }, [refreshTrigger]);

  return (
    <div>
    <ProfileHeader
      title="My Functions"
      subHeading=" View and manage your custom AI functions."
    />
    <div className="mb-3">
      <div className="col-2 d-flex justify-content-start">
        <Button
          onClick={() => {
            setFunctionToEdit(null);
            toggleDefineFunctionsModal();
          }}
        >
          <LucideSquareFunction /> Create Functions
        </Button>
      </div>
    </div>

    {/* Flex container for search box and pagination */}
    <div className="d-flex justify-content-between align-items-center mb-3">
      <div className="searchbox-wrapper">
        <DebouncedSearchInput
          data={{
            search: searchQuery,
            setSearch: setSearchQuery,
            placeholder: "Search Function",
          }}
        />
      </div>
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={functionDefinitions?.length} // Adjust this based on your total count
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
      columns={columns}
      dataSource={functionDefinitions}
      rowKey="id"
      loading={loading}
      scroll={{ y: "50vh" }}
      onChange={handleChange}
      pagination={false}
    />

    {/* Edit Function Modal */}
    {functionToEdit && (
      <FunctionDefinitionModel
        refresh={refreshTable}
        data={{
          editMode: true,
          showDefineFunctionsModal: editFunctionModalOpen,
          toggleDefineFunctionsModal: () => setEditFunctionModalOpen(false),
          functionTitle: functionToEdit.title,
          // functionName: functionToEdit.name,
          functionName: functionName,
          // handleFunctionNameChange: (value) => setFunctionToEdit({ ...functionToEdit, name: value }),
          handleFunctionNameChange: handleFunctionNameChange,
          functionsParameterNames:
            functionToEdit.parameters && functionToEdit.parameters.properties
              ? Object.keys(functionToEdit.parameters.properties).map(
                  (key) => ({
                    name: key,
                    type: functionToEdit.parameters.properties[key].type,
                    description:
                      functionToEdit.parameters.properties[key].description,
                  })
                )
              : [],
          demoFunctionDefinition: functionToEdit.definition,
          functionDescription: functionToEdit.description,
          setFunctionsParameterNames: (params) =>
            setFunctionToEdit({
              ...functionToEdit,
              parameters: {
                ...functionToEdit.parameters,
                properties: params.reduce((acc, param) => {
                  acc[param.name] = {
                    type: param.type,
                    description: param.description,
                  };
                  return acc;
                }, {}),
              },
            }),
          // functionDefinition: functionToEdit.definition,
          functionDefinition: functionDefinition,
          functionInstruction: functionToEdit.instruction,
          functionId: functionToEdit._id,
          toggleValidationModal: toggleValidationModal,
          setFunctionName: (name) =>
            setFunctionToEdit({ ...functionToEdit, name }),
          setFunctionDefinition: (def) =>
            setFunctionToEdit({ ...functionToEdit, functionDefinition: def }),
          setShowDefineFunctionsModal: () => setEditFunctionModalOpen(false),
          validateFunctionDefinition,
        }}
      />
    )}

    {showValidationModal && (
      <ValidationModel
        data={{
          showValidationModal,
          toggleValidationModal,
          renderParameterInputs,
          functionsParameterNames:
            functionToEdit.parameters && functionToEdit.parameters.properties
              ? Object.keys(functionToEdit.parameters.properties).map(
                  (key) => ({
                    name: key,
                    type: functionToEdit.parameters.properties[key].type,
                    description:
                      functionToEdit.parameters.properties[key].description,
                  })
                )
              : [],
          parameterValues,
          setParameterValues,
          handleParameterChange,
          validateConsole,
          handleValidateFunction,
          setValidateConsole,
          functionDefinition: definitionToValidate,
          functionName: functionToEdit.name,
        }}
      />
    )}

    {/* Confirmation Modal */}
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
      className="function-details-modal"
    >
      {selectedFunction && (
        <>
          <p>
            <b>Title:</b> {selectedFunction?.title}
          </p>
          <p>
            <b>Description:</b> {selectedFunction?.description}
          </p>
          <p>
            <b>Parameters: </b>{" "}
            {selectedFunction?.parameters?.properties
              ? Object.entries(selectedFunction?.parameters?.properties)?.map(
                  ([key, value]) => (
                    <Tag key={key} style={{ margin: "4px" }}>
                      {key}: {value?.type}
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
      open={isModalVisible}
      onCancel={() => setIsModalVisible(false)}
      footer={null}
    >
      {currentAgents.map((agent, index) => (
        <Tag key={index} color="blue" style={{ marginBottom: "8px" }}>
          {agent?.name || agent}
        </Tag>
      ))}
    </Modal>
  </div>
  );
};

export default UserFunctionCallingAssistantTable;
