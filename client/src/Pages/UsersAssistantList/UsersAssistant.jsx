import React, { useEffect, useState } from "react";
import {
  Button,
  Space,
  Tag,
  Tooltip,
  Typography,
  Switch,
  Tabs,
  message,
} from "antd";
//Libraries
import {
  AiOutlineDelete,
  AiOutlineEdit,
  AiOutlineArrowUp,
} from "react-icons/ai";
//Component imports
import CreateAssistantModal from "../../component/Assistant/Assistantmodal/CreateAssistantModal";
import FunctionCallingAssistantTable from "../../component/Assistant/FunctionCallingAssistantTable";
import UserFunctionCallingAssistantTable from "../../component/Assistant/UserFunctionCallingAssistantTable";
import FunctionDefinitionModel from "../../Pages/SuperAdmin/Modals/FunctionDefinitionModal";
import ValidationModel from "../../Pages/SuperAdmin/Modals/ValidationModel";
//hooke
import useAssistantPage from "../../Hooks/useAssistantPage";

//-----Helper----------//
import { showDeleteConfirm } from "../../Utility/assistant-helper";
import DebouncedSearchInput from "../SuperAdmin/Organizations/DebouncedSearchInput";
import { axiosSecureInstance } from "../../api/axios";
import { SEARCH_ALL_USER_CREATED_ASSISTANTS_SLUG } from "../../constants/Api_constants";
import { getUserID, getUserRole } from "../../Utility/service";
import FavoriteAssistantList from "../../component/Assistant/FavoriteAssistantList";
import SingleUserAssistants from "../../component/Assistant/PersonalAssistantList";
import { usePublicAssistant } from "../../Hooks/usePublicAssistantPage";
import { useFavoriteAssistant } from "../../Hooks/useFavoriteAssistantPage";
import {
  fetchSingleFavoriteAssistant,
  getFavoriteAssistant,
} from "../../api/favoriteAssistant";
import { MdOutlineAssistant } from "react-icons/md";
import { getAssistantInfo } from "../../Utility/assistant-helper";

import "../../Pages/SuperAdmin/Assistant/defineFunctionModal.css";
import {
  handleValidateFunction,
  renderParameterInputs,
  handleSaveFunctionToDB,
  getAllFunctionDefinitions,
} from "../../Pages/SuperAdmin/api/functionDefinition";
import {
  fetchAllAssistant,
  fetchFunctionNamesPerAssistant,
} from "../../Pages/SuperAdmin/api/functionCallingAssistant";

import {
  SettingOutlined,
  BuildFilled,
  UserDeleteOutlined,
  GlobalOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import AdminAssistantList from "../../component/Assistant/AdminAssistantList";
import { FaPlus } from "react-icons/fa";
import { userAgentPageSideMenuItems } from "../../Utility/SideMenuItems/UserAgentPageSideMenu";
import { getAllKnowledgeBase } from "../../api/knowledgeBase";
import { formatToTreeData } from "../../component/KnowledgeBase/RAGTree";
import { useAssistantContext } from "../../contexts/AssistantsFetchContext";
import CommonLayout from "../../component/layout/CommonStructure";
import CreateFunction from "./CreateFunction";
import CreateFunctions from "../../component/Assistant/CreateFunctions";
const { Title } = Typography;
const userId = getUserID();

const IconComponent = ({ label }) => {
  switch (label) {
    case "My Agents":
      return <MdOutlineAssistant className="me-2" />;
    case "Favorite Agents":
      return <HeartOutlined className="me-2" />;
    case "My Functions":
      return <BuildFilled className="me-2" />;
    case "All Functions":
      return <BuildFilled className="me-2" />;
  }
};
const renderTabPane = (key, label, Component, data) => (
  <Tabs.TabPane
    key={key}
    tab={
      <span>
        <IconComponent label={label} />
        {label}
      </span>
    }
  >
    <Component data={data} />
  </Tabs.TabPane>
);
//constants
const initialAssistantState = {
  name: "",
  instructions: "",
  description: "",
  files: [],
  assistantId: "",
  tools: [],
  model: "",
  category: "",
  static_questions: [],
};

const role = getUserRole();

const UserAssistants = () => {
  const {
    loader,
    adminUserAssistants,
    handleUpdateAssistant,
    handleFetchUserCreatedAssistants,
    handleFetchAllAssistants,
    handleDeleteAssistant,
    totalCount,
    setAdminUserAssistants,
    updateLoader,
    searchPersonalAssistants,
    handlePublicAssistantAdd,
    functionCallingAssistants,
    setFunctionCallingAssistants,
    handleFetchFunctionCallingAssistants,
  } = useAssistantPage();
  //-----States ------//
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeKey, setActiveKey] = useState("unoptimized-data");
  const [isFunctionCallingAssistant, setIsFunctionCallingAssistant] =
    useState(false);
  const [assistantData, setAssistantData] = useState({
    ...initialAssistantState,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [formattedRAGdData, setFormattedRAGdData] = useState([]);
  const [formattedPublicFilesData, setFormattedPublicFilesData] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [userId, setUserID] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [favoriteAssistant, setFavoriteAssistant] = useState([]);
  //------Side Effects ---------//
  const [selectedKey, setSelectedKey] = useState("1");

  useEffect(() => {
    setUserRole(getUserRole());
    setUserID(getUserID());
    handleFetchUserCreatedAssistants();
    // Fetch all the favorite assistants
    fetchSingleFavoriteAssistant(setFavoriteAssistant, setIsLoading);
    getAllKnowledgeBase()
      .then((response) => {
        const fetchedRAGData = response;
        if (fetchedRAGData?.treeData) {
          setFormattedRAGdData(fetchedRAGData.treeData);
        } else {
          console.warn("Formatted RAG Files are empty or undefined");
        }

        if (fetchedRAGData?.publicTreeData) {
          setFormattedPublicFilesData(fetchedRAGData?.publicTreeData);
        } else {
          console.warn("Formatted Public Files are empty or undefined");
        }
      })
      .catch((error) => {
        console.error("Error fetching files:", error);
      });
  }, []);

  useEffect(() => {
    setIsLoading(true);
    handleFetchUserCreatedAssistants(1);
    handleFetchAllAssistants(1);
    setIsLoading(false);
  }, [showModal]);

  const transformName = (name) => {
    return name.replace(/_[0-9a-fA-F]+$/, '').replace(/_/g, ' ');
  };

  //----------Hooks--------------//

  const [isModalClosed, setIsModalClosed] = useState(false);

  const { handleDeleteFavoriteAssistant } = useFavoriteAssistant();

  const showEditModalHandler = async (assistant) => {
    setIsLoading(true);

    if (assistant.functionCalling == undefined) {
      setIsFunctionCallingAssistant(false);
    } else {
      setIsFunctionCallingAssistant(assistant.functionCalling);
    }

    if (
      assistant.functionCalling === false ||
      assistant.functionCalling == undefined
    ) {
      let myAssistant;

      try {
        const response = await axiosSecureInstance.get(
          `/api/assistants/getAssistantInfo/${assistant?.assistant_id}`
        );
        if (response) {
          myAssistant = response?.data;
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          message.error("Assistant not found in openAI");
        } else {
          message.error(error);
        }
        setEditMode(false);
        setShowModal(false);
        setIsLoading(false);
      }

      const insertedFunctions =
        myAssistant?.tools?.filter((tool) => tool?.type === "function") || [];
      const functionNames = insertedFunctions?.map(
        (func) => func?.function?.name
      );
      const filteredData =
        functionDefinitionsList?.filter((obj) =>
          functionNames?.includes(obj?.name)
        ) || [];
      const functionList =
        filteredData?.map((obj) => JSON.stringify(obj)) || [];
      let knowledgeBaseInfo = [];
      if (myAssistant?.knowledgeBaseInfo) {
        for (let info of myAssistant?.knowledgeBaseInfo) {
          knowledgeBaseInfo.push({ key: info.key, title: info.title });
        }
      }
      const file_ids = myAssistant?.file_ids.filter(
        (id) => !myAssistant.knowledgeBaseFileIds.includes(id)
      );
      let filteredAssistantData = {
        assistant_id: myAssistant?.id,
        name: assistant?.name,
        instructions: myAssistant?.instructions,
        description: assistant?.description,
        userId: userId,
        model: myAssistant?.model,
        tools: myAssistant?.tools?.map(({ type }) => type) || [],
        category: myAssistant?.category,
        assistantTypes: myAssistant?.assistantTypes,
        static_questions: myAssistant?.static_questions,
        functions: functionList,
        knowledgeSource: myAssistant?.knowledgeSource,
        knowledgeBaseInfo: knowledgeBaseInfo,
        fileNames: myAssistant?.fileNames,
        file_ids: file_ids,
        fileIdsWithKeysOfKnowledgeBase:
          myAssistant?.knowledgeBaseFileIdsAndKysOfOpenAI,
        fileIdsWithName: myAssistant?.fileIdsWithName,
        enableSync: myAssistant?.enableSync ? myAssistant?.enableSync : false,
        plugins: myAssistant?.plugins ? myAssistant?.plugins : [],
        image_url: myAssistant?.image_url,
        imageType: myAssistant?.imageType,
        dalleImageDescription: myAssistant?.dalleImageDescription,
      };
      setAssistantData(filteredAssistantData);

      setEditMode(true);
      setShowModal(true);
      setIsLoading(false);
    } else {
      const response = await axiosSecureInstance.get(
        `/api/assistants/getAssistantInfo/${assistant?.assistant_id}`
      );
      let myAssistant;
      if (response) {
        myAssistant = response?.data;
      }

      const insertedFunctions = myAssistant?.tools?.filter(tool => tool?.type === "function") || [];
      const functionNames = insertedFunctions?.map(
        (func) => func?.function?.name
      );
      const filteredData = functionDefinitionsList?.filter((obj) => 
        functionNames?.some((name) => transformName(name) === obj.name)
      ) || [];
      const functionList =
        filteredData?.map((obj) => JSON.stringify(obj)) || [];

      if (myAssistant.connectApps.length > 0) {
        const connectedAppsList = myAssistant.connectApps;
        for (let i = 0; i < connectedAppsList.length; i++) {

          if ('googleDrive' in connectedAppsList[i]) {
            myAssistant.googleDrive = connectedAppsList[i].googleDrive || false;
          }

          if ('workBoard' in connectedAppsList[i]) {
            myAssistant.workBoard = connectedAppsList[i].workBoard || false;
          }
        }
      }      
      let knowledgeBaseInfo = [];
      if (myAssistant?.knowledgeBaseInfo) {
        for (let info of myAssistant?.knowledgeBaseInfo) {
          knowledgeBaseInfo.push({ key: info.key, title: info.title });
        }

      }
      const file_ids = myAssistant?.file_ids.filter((id) => !myAssistant?.knowledgeBaseFileIds?.includes(id));

      let filteredAssistantData = {
        assistant_id: myAssistant?.id,
        name: assistant?.name,
        instructions: myAssistant?.instructions,
        description: assistant?.description,
        userId: userId,
        model: myAssistant?.model,
        tools: myAssistant?.tools?.map(({ type }) => type) || [],
        assistantApiId: myAssistant?.assistantApiId || [],
        assistantApiServiceids: myAssistant?.assistantApiServiceids || [],
        category: myAssistant?.category,
        assistantTypes: myAssistant?.assistantTypes,
        static_questions: myAssistant?.static_questions,
        functions: functionList,
        knowledgeSource: myAssistant?.knowledgeSource,
        knowledgeBaseInfo: knowledgeBaseInfo,
        fileNames: myAssistant?.fileNames,
        file_ids: file_ids,
        fileIdsWithKeysOfKnowledgeBase:
        myAssistant?.knowledgeBaseFileIdsAndKysOfOpenAI,
        fileIdsWithName: myAssistant?.fileIdsWithName,
        googleDrive: myAssistant?.googleDrive,
        workBoard: myAssistant?.workBoard,
        connectApps: myAssistant?.connectApps,
        enableSync: myAssistant?.enableSync ? myAssistant?.enableSync : false,
        plugins: myAssistant?.plugins ? myAssistant?.plugins : [],
        image_url: myAssistant?.image_url,
        imageType: myAssistant?.imageType,
        dalleImageDescription: myAssistant?.dalleImageDescription,
      };

      // Update the state with the new data
      setAssistantData(filteredAssistantData);
      setEditMode(true);
      setShowModal(true);
      setIsLoading(false);
    }
  };

  const [showDefineFunctionsModal, setShowDefineFunctionsModal] = useState();
  const toggleDefineFunctionsModal = (onCloseCallback) => {
    setShowDefineFunctionsModal((prevState) => {
      const nextState = !prevState;
      // Execute callback when modal is closing
      if (!nextState && onCloseCallback) {
        onCloseCallback();
      }
      return nextState;
    });
  };

  const handleFunctionNameChange = (value) => {
    setFunctionName(value);
  };
  const [assistantFunctionNames, setAssistantFunctionNames] = useState([]);
  const demoFunctionDefinition = `
function FunctionName(param1, param2) {
  try {
      //Write your Function Logic
  } catch (error) {
    console.log(error);
  }
}`;
  const [showDemo, setShowDemo] = useState(false);
  const toggleDemo = () => setShowDemo(!showDemo);

  const [validateConsole, setValidateConsole] = useState("");
  const [parameterValues, setParameterValues] = useState({});
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [isDeletingAssistant, setIsDeletingAssistant] = useState(false);
  const [isUpdatingAssistant, setIsUpdatingAssistant] = useState(false);
  const toggleValidationModal = () => {
    setShowValidationModal(!showValidationModal);
  };
  const handleFunctionDefinitionChange = (event) => {
    setFunctionDefinition(event.target.value);
  };
  const [functionName, setFunctionName] = useState("");
  const [functionsParameterNames, setFunctionsParameterNames] = useState([]);
  const [assistantName, setAssistantName] = useState("");

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  useEffect(() => {
    // Runs every time refreshTrigger changes
    getAllfunctions();
  }, [refreshTrigger]);

  const handleAssistantNameChange = (value) => {
    setAssistantName(value);
  };
  const toCamelCase = (str) => {
    return str
      .split(" ")
      .map((word, index) => {
        if (index === 0) {
          return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join("");
  };
  const [functionDefinition, setFunctionDefinition] = useState(
    `function ${
      functionName ? functionName : "FunctionName"
    }(${functionsParameterNames
      .map((param) => toCamelCase(param.name.replace(/'/g, "")))
      .join(", ")}) {
    try {
        //Write your Function Logic
      
    } catch (error) {
      console.log(error);
    }
  }`
  );
  useEffect(() => {
    setFunctionDefinition(`function ${
      functionName
        ? toCamelCase(functionName.replace(/'/g, ""))
        : "FunctionName"
    }(${functionsParameterNames
      .map((param) => toCamelCase(param.name.replace(/'/g, "")))
      .join(", ")}) {
    try {
        //Write your Function Logic
      
    } catch (error) {
      console.log(error);
    }
  }`);
  }, [functionName, functionsParameterNames]);

  const handleParameterChange = (event) => {
    const { name, value } = event.target;
    setParameterValues({
      ...parameterValues,
      [name]: value,
    });
  };
  const [functionDefinitionsList, setFunctionDefinitionsList] = useState([]);
  const getAllfunctions = async () => {
    const functionDefinitions = await getAllFunctionDefinitions();
    setFunctionDefinitionsList(functionDefinitions);
  };
  const { setAllAssistants, allAssistants } = useAssistantContext();

  useEffect(() => {
    fetchAllAssistant(setAllAssistants);
    getAllfunctions();
  }, []);

  useEffect(() => {
    fetchFunctionNamesPerAssistant(assistantName, setAssistantFunctionNames);
  }, [assistantName]);

  const handleClose = () => {
    setAssistantData(() => ({ ...initialAssistantState }));
    setShowModal((value) => !value);
    setEditMode(false);
    setIsModalClosed(true);
  };

  useEffect(() => {
    if (!showModal) {
      setIsModalClosed(true);
    }
  }, [showModal]);

  const redirectToAssistant = (record) => {
    const assistantId = record.assistant_id;
    const url = `/agents/${assistantId}`;
    window.open(url, "_blank");
  };

  //------Columns----------//

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="text-left">{text}</span>,
    },
    {
      title: "Status",
      key: "is_active",
      dataIndex: "is_active",
      width: 100,
      render: (_, { is_active }) => (
        <Tag color={is_active ? "green" : "red"}>
          {is_active ? "active" : "inactive"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            onClick={() => redirectToAssistant(record)}
            icon={<AiOutlineArrowUp />}
          ></Button>
          <Button
            onClick={async () => {
              const isExisting = await getAssistantInfo(record?.assistant_id);
              if (isExisting === true) {
                await showEditModalHandler(record);
              }
            }}
            icon={<AiOutlineEdit />}
          ></Button>
          <Tooltip title="Activate or Deactivate">
            <Switch
              checked={record.is_active}
              onChange={(checked) =>
                handleUpdateAssistant(record._id, {
                  is_active: checked,
                })
              }
            />
          </Tooltip>
          <Button
            onClick={() =>
              showDeleteConfirm(
                record.assistant_id,
                record.name,
                handleDeleteAssistant
              )
            }
            danger
            icon={<AiOutlineDelete />}
          />
        </Space>
      ),
    },
  ];

  useEffect(() => {
    searchPersonalAssistants(searchQuery);
  }, [searchQuery]);

  const refreshTable = async () => {
    setIsLoading(true);
    await getAllfunctions().finally(() => {
      setIsLoading(false);
    });
  };
  const renderContent = () => {
    switch (selectedKey) {
      case "1":
        return (
          <SingleUserAssistants
            data={{
              adminUserAssistants,
              loader,
              handleDeleteAssistant,
              handleUpdateAssistant,
              showEditModalHandler,
              handleFetchUserCreatedAssistants,
              handlePublicAssistantAdd,
              getFavoriteAssistant,
              handleDeleteFavoriteAssistant,
              getAssistantInfo,
              isLoading,
              setIsLoading,
              totalCount,
            }}
          />
        );
      case "3":
        return (
          <UserFunctionCallingAssistantTable
            data={{
              functionCallingAssistants,
              setFunctionCallingAssistants,
              loader,
              handleDeleteAssistant,
              handleUpdateAssistant,
              showEditModalHandler,
              handleFetchFunctionCallingAssistants,
              updateLoader,
              setActiveKey,
              toggleDefineFunctionsModal,
              userId,
              userRole,
              refreshTrigger,
              setRefreshTrigger,
            }}
          />
        );

      case "4":
        return (
          <CreateFunction
            functionCallingAssistants={functionCallingAssistants}
            setFunctionCallingAssistants={setFunctionCallingAssistants}
            loader={loader}
            handleDeleteAssistant={handleDeleteAssistant}
            handleUpdateAssistant={handleUpdateAssistant}
            showEditModalHandler={showEditModalHandler}
            handleFetchFunctionCallingAssistants={
              handleFetchFunctionCallingAssistants
            }
            updateLoader={updateLoader}
            setActiveKey={setActiveKey}
            toggleDefineFunctionsModal={toggleDefineFunctionsModal}
            userId={userId}
            userRole={userRole}
            refreshTrigger={refreshTrigger}
            setRefreshTrigger={setRefreshTrigger}
          />
        );
      default:
        return null;
    }
  };

  const handleChangeSideMenu = ({ key }) => {
    setSelectedKey(key);
  };

  const headerContent = (
    <Button
      size="small"
      className="plusNewButton m-0"
      type="primary"
      block
      icon={<FaPlus />}
      onClick={handleClose}
    >
      Create Agent
    </Button>
  );

  return (
    <div className="assistant-table-container-wrapper">
      <CommonLayout
        sideMenuItems={userAgentPageSideMenuItems}
        buttonText="Create Agent"
        buttonIcon={<FaPlus />}
        handleChangeSideMenu={handleChangeSideMenu}
        buttonOnClick={handleClose}
        activeKey={selectedKey}
        HeaderContentChildren={headerContent}
        buttonVisible={true}
      >
        {renderContent()}

        <CreateAssistantModal
          data={{
            handleClose,
            showModal,
            editMode,
            setEditMode,
            assistantData,
            setAssistantData,
            isAdmin: false,
            handleFetchUserCreatedAssistants,
            handleFetchAllAssistants,
            isFunctionCallingAssistant,
            activeKey,
            setActiveKey,
            formattedRAGdData,
            formattedPublicFilesData,
            isModalClosed,
          }}
        />

        <FunctionDefinitionModel
          refresh={refreshTable}
          onCreateSuccess={() => {
            handleFetchUserCreatedAssistants();
            handleFetchFunctionCallingAssistants();
            handleFetchAllAssistants(1);
            refreshTable();
          }}
          data={{
            showDefineFunctionsModal,
            toggleDefineFunctionsModal,
            functionName,
            handleFunctionNameChange,
            functionsParameterNames,
            setFunctionsParameterNames,
            showDemo,
            demoFunctionDefinition,
            functionDefinition,
            handleFunctionDefinitionChange,
            toggleValidationModal,
            setFunctionName,
            setFunctionDefinition,
            setShowDefineFunctionsModal,
            refreshTrigger,
            setRefreshTrigger,
          }}
        />

        {/* Validation Modal */}
        <ValidationModel
          data={{
            showValidationModal,
            toggleValidationModal,
            renderParameterInputs,
            functionsParameterNames,
            parameterValues,
            setParameterValues,
            handleParameterChange,
            validateConsole,
            handleValidateFunction,
            setValidateConsole,
            functionDefinition,
            functionName,
          }}
        />
      </CommonLayout>
    </div>
  );
};
export default UserAssistants;
