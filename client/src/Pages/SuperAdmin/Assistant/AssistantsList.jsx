import React from "react";
import { useEffect, useState } from "react";

//libraries
import { Tabs, Button, Typography, message } from "antd";


import {
  SettingOutlined,
  BuildFilled,
  UserDeleteOutlined,
  GlobalOutlined,
  HeartOutlined
} from "@ant-design/icons";
import { Modal } from "react-bootstrap";
import { MdOutlineAssistant } from "react-icons/md";

//Components
import CreateAssistantModal from "../../../component/Assistant/Assistantmodal/CreateAssistantModal";
import AssistantTable from "../../../component/Assistant/AssistantTable";
import UserAssistantList from "../../../component/Assistant/UserAssistantList";
import AssistantSettings from "../../../component/Assistant/AssistantSettings";
import AdminAssistantList from "../../../component/Assistant/AdminAssistantList";
import FunctionCallingAssistantTable from "../../../component/Assistant/FunctionCallingAssistantTable";
import { axiosSecureInstance } from "../../../api/axios";
import UserFunctionCallingAssistantTable from "../../../component/Assistant/UserFunctionCallingAssistantTable";
import { getUserID, getUserRole } from "../../../Utility/service";
import "./defineFunctionModal.css";
import {
  handleValidateFunction,
  renderParameterInputs,
  handleSaveFunctionToDB,
  getAllFunctionDefinitions,
} from "../api/functionDefinition";
import {
  fetchAllAssistant,
  fetchFunctionNamesPerAssistant,
} from "../api/functionCallingAssistant";
import FunctionDefinitionModel from "../Modals/FunctionDefinitionModal";
import ValidationModel from "../Modals/ValidationModel";

//Hooks
import useAssistantPage from "../../../Hooks/useAssistantPage";
import { useAssistantContext } from "../../../contexts/AssistantsFetchContext";

import FavoriteAssistantList from "../../../component/Assistant/FavoriteAssistantList";
import PublicAssistantList from "../../../component/Assistant/PublicAssistantList";
import { fetchSingleFavoriteAssistant, getFavoriteAssistant } from "../../../api/favoriteAssistant";

//Hooks
import { usePublicAssistant } from "../../../Hooks/usePublicAssistantPage";
import { useFavoriteAssistant } from "../../../Hooks/useFavoriteAssistantPage";
import { getAllKnowledgeBase } from "../../../api/knowledgeBase";
import { FileContext } from "../../../contexts/FileContext";
import { formatToTreeData } from "../../../component/KnowledgeBase/RAGTree";
import { fetchPublicAssistant } from "../../../api/publicAssistant";
import { getAssistantInfo } from "../../../Utility/assistant-helper";
import { CHECK_SINGLE_ASSISTANTS_INFO } from "../../../constants/Api_constants";
import { useContext } from "react";
import "./AssistantsList.scss";
import CommonLayout from "../../../component/layout/CommonStructure";
import { agentPageSideMenuItems } from "../../../Utility/SideMenuItems/AgentPageSideMenu";
import { FaPlus } from "react-icons/fa";
import CreateFunctions from "../../../component/Assistant/CreateFunctions";
//-----Constants-----//
const userId = getUserID();

//-----Constants-----//
const initialAssistantState = {
  name: "",
  instructions: "",
  description: "",
  files: [],
  assistantId: "",
  tools: [],
  model: null,
  category: "",
  static_questions: null,
  photoOption: "DEFAULT",
  knowledgeSource: false,
  fileNames: [],
  FileList: [],
  assistantTypes: null,
  imageType: "",
  image_url: "",
  dalleImageDescription: ""
};

const initialFunctionCallingAssistantState = {
  name: "",
  instructions: "",
  description: "",
  userId: userId,
  userSelectedModel: "gpt-4-1106-preview",
  tools: [
    {
      name: "",
      description: "",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  ],
};

const { Title } = Typography;

//----components-----//
const AssistantsList = () => {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [assistantData, setAssistantData] = useState({
    ...initialAssistantState,
  });
  const [assistantFunctionCallData, setAssistantFunctionCallData] = useState({
    ...initialFunctionCallingAssistantState,
  });
  const [formattedRAGdData, setFormattedRAGdData] = useState([]);
  const [formattedPublicFilesData, setFormattedPublicFilesData] = useState([]);
//----------for public assistants ---------------------

const [userRole, setUserRole] = useState("");
const [userIdForFunction, setUserIdForFunction] = useState("");

const [publicAssistant, setPublicAssistant] = useState([]);
const [isLoading, setIsLoading] = useState(true);
const [loadMyAssistants,setLoadMyAssistants] = useState(false);
const [favoriteAssistant, setFavoriteAssistant] = useState([]);
const {isEditPageLoading,setIsEditPageLoading} = useContext(FileContext);
const [selectedKey, setSelectedKey] = useState("1");
  //----------Side Effects-------//
  useEffect(()=>{
    handleFetchAllAssistants(1);
    handleFetchUserCreatedAssistants();
  },[loadMyAssistants]);

  useEffect(() => {
    handleFetchUserCreatedAssistants();
    handleFetchUserAssistantStats();
    handleFetchAllAssistants(1);
    handleFetchTeams();
    //fetch all KnowledgeBases
    getAllKnowledgeBase()
      .then(response => {
        const fetchedRAGData = response;
        if (fetchedRAGData?.treeData) {
          setFormattedRAGdData(fetchedRAGData?.treeData);

        } else {
          console.warn("Formatted RAG Files are empty or undefined");
        }

        if (fetchedRAGData?.publicTreeData) {
          setFormattedPublicFilesData(fetchedRAGData?.publicTreeData);

        } else {
          console.warn("Formatted Public Files are empty or undefined");
        }

      })
      .catch(error => {
        console.error('Error fetching files:', error);
      });

  }, []);


  //---------Hooks ------------//
  const {
    setAdminUserAssistants,
    adminUserAssistants,
    totalCount,
    userAssistants,
    assistants,
    functionCallingAssistants,
    setFunctionCallingAssistants,
    setAssistants,
    teamList,
    loader,
    handleAssignTeamToAssistant,
    handleUpdateAssistant,
    handleFetchUserCreatedAssistants,
    handleFetchUserAssistantStats,
    handleDeleteAssistant,
    handleFetchAllAssistants,
    handleFetchTeams,
    updateLoader,
    searchOrganizationalAssistants,
    searchPersonalAssistants,
    orgAssistantSearchQuery,
    setOrgAssistantSearchQuery,
    personalAssistantSearchQuery,
    setPersonalAssistantSearchQuery,
    handleFetchFunctionCallingAssistants,
    handlePublicAssistantAdd,
  } = useAssistantPage();

  const {
    setAllAssistants,
    allAssistants
  } = useAssistantContext();
  const {
    handleDeletePublicAssistant
  } = usePublicAssistant();
  const { handleDeleteFavoriteAssistant } = useFavoriteAssistant();

  // <---------------local-Functions------------------------->
  const [activeKey, setActiveKey] = useState("unoptimized-data");

  const [isFunctionCallingAssistant, setIsFunctionCallingAssistant] =
    useState(false);

  const [functionDefinitionsList, setFunctionDefinitionsList] = useState([]);
  const [isModalClosed, setIsModalClosed] = useState(false);
  const handleClose = () => {
    setAssistantData(() => ({ ...initialAssistantState }));
    setAssistantFunctionCallData({ ...initialFunctionCallingAssistantState })
    setShowModal((value) => !value);
    setEditMode(false);
    setIsModalClosed(true);
  };

  const [showEditModalLoading, setShowEditModalLoading] = useState(false)

  useEffect(() => {
    if(!showModal){
      setIsModalClosed(true);

    }
  }, [showModal]);

  const transformName = (name) => {
    return name.replace(/_[0-9a-fA-F]+$/, '').replace(/_/g, ' ');
  };

  const getAllfunctions = async () => {
   const functionDefinitions = await getAllFunctionDefinitions();
   setFunctionDefinitionsList(functionDefinitions)
  }

  const showEditModalHandler = async (assistant) => {
    if (assistant.functionCalling == undefined) {
      setIsFunctionCallingAssistant(false);
    }
    else {
      setIsFunctionCallingAssistant(assistant.functionCalling);
    }

    if (assistant.functionCalling === false || assistant.functionCalling == undefined) {

      let myAssistant;

      try {
        setShowEditModalLoading(true)
        const response = await axiosSecureInstance.get(CHECK_SINGLE_ASSISTANTS_INFO(assistant?.assistant_id));
        if (response) {
          myAssistant = response?.data;
        }
        setShowEditModalLoading(false)
      } catch (error) {
        if (error.response && error.response.status === 404) {
          message.error("Agent not found in openAI");
        } else {
          message.error(error);

        }
        setIsEditPageLoading(false);
        setEditMode(false);
        setShowModal(false);
        setShowEditModalLoading(false)
      }

      const insertedFunctions = myAssistant?.tools?.filter(tool => tool?.type === "function") || [];
      const functionNames = insertedFunctions?.map((func) => func?.function?.name);
      const filteredData = functionDefinitionsList?.filter((obj) => functionNames?.includes(obj?.name)) || [];
      const functionList = filteredData?.map(obj => (JSON.stringify(obj))) || [];

      let knowledgeBaseInfo = [];
      if (myAssistant?.knowledgeBaseInfo) {
        for (let info of myAssistant?.knowledgeBaseInfo) {
          knowledgeBaseInfo.push({ key: info.key, title: info.title });

        }

      }
      const file_ids = myAssistant?.file_ids.filter((id) => !myAssistant?.knowledgeBaseFileIds?.includes(id));

      if (myAssistant.connectApps.length > 0) {
        const apps = myAssistant.connectApps;
        for (let i = 0; i < apps.length; i++) {

          if ('googleDrive' in apps[i]) {
            myAssistant.googleDrive = apps[i].googleDrive || false;
          }

          if ('workBoard' in apps[i]) {
            myAssistant.workBoard = apps[i].workBoard || false;
          }
        }
      }
      let filteredAssistantData = {
        assistant_id: myAssistant?.id,
        name: assistant?.name,
        instructions: myAssistant?.instructions,
        description: assistant?.description,
        imageType: assistant?.imageType,
        image_url: assistant?.image_url,
        dalleImageDescription: assistant?.dalleImageDescription,
        userId: userId,
        model: myAssistant?.model,
        tools: myAssistant?.tools?.map(({ type }) => type) || [],
        category: myAssistant?.category,
        assistantTypes: myAssistant?.assistantTypes,
        static_questions: myAssistant?.static_questions,
        functions: functionList  || [],
        knowledgeSource: myAssistant?.knowledgeSource,
        knowledgeBaseInfo: knowledgeBaseInfo,
        fileNames: myAssistant?.fileNames,
        file_ids: file_ids,
        fileIdsWithKeysOfKnowledgeBase: myAssistant?.knowledgeBaseFileIdsAndKysOfOpenAI,
        fileIdsWithName : myAssistant?.fileIdsWithName,
        googleDrive : myAssistant.googleDrive,
        workBoard: myAssistant.workBoard,
        connectApps : myAssistant.connectApps,
        enableSync : myAssistant?.enableSync? myAssistant?.enableSync : false,
        plugins : myAssistant?.plugins ? myAssistant?.plugins : [],
        selectedassistantIds : myAssistant?.selectedassistantIds ? myAssistant?.selectedassistantIds : [],
      };
      setAssistantData(filteredAssistantData);
      setIsEditPageLoading(false);
      setEditMode(true);
      setShowModal(true);
    } else {
      const response = await axiosSecureInstance.get(
        `/api/assistants/getAssistantInfo/${assistant?.assistant_id}`
      );

      let myAssistant;

      if (response) {
        myAssistant = response?.data;
      }

      const insertedFunctions = myAssistant?.tools?.filter(tool => tool?.type === "function") || [];
      const functionNames = insertedFunctions?.map((func) => func?.function?.name);
      const filteredData = functionDefinitionsList?.filter((obj) => 
        functionNames?.some((name) => transformName(name) === obj.name)
      ) || [];
      const functionList = filteredData.map(obj => (JSON.stringify(obj)));
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
        imageType: assistant?.imageType,
        dalleImageDescription: assistant?.dalleImageDescription,
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
        fileIdsWithKeysOfKnowledgeBase: myAssistant?.knowledgeBaseFileIdsAndKysOfOpenAI,
        fileIdsWithName : myAssistant?.fileIdsWithName,
        googleDrive : myAssistant?.googleDrive,
        workBoard: myAssistant?.workBoard,
        connectApps : myAssistant?.connectApps,
        enableSync : myAssistant?.enableSync? myAssistant?.enableSync : false,
        plugins : myAssistant?.plugins ? myAssistant?.plugins : [],
        selectedassistantIds : myAssistant?.selectedassistantIds ? myAssistant?.selectedassistantIds : [],
      };

      // Update the state with the new data
      setAssistantData(filteredAssistantData);
      setIsEditPageLoading(false);
      setEditMode(true);
      setShowModal(true);
    }
  };

  //Function Defining
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
  const [definitionToValidate, setDefinitionToValidate] = useState("");
  useEffect(() => {
    // Runs every time refreshTrigger changes
    getAllfunctions();
  }, [refreshTrigger]);

  const handleAssistantNameChange = (value) => {
    setAssistantName(value);
  };

  const toCamelCase = (str) => {
    return str
      .split(' ')
      .map((word, index) => {
        if (index === 0) {
          return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join('');
  };

  const [functionDefinition, setFunctionDefinition] = useState(
    `function ${functionName ? functionName : "FunctionName"}(${functionsParameterNames
      .map(param => toCamelCase(param.name.replace(/'/g, '')))
      .join(', ')}) {
    try {
      //Write your Function Logic
      
      return 1;
    } catch (error) {
      console.log(error);
    }
  }`
  );
  
  useEffect(() => {
    setFunctionDefinition(`function ${functionName ? functionName : "FunctionName"
      }(${functionsParameterNames.map(param => param.name).join(', ')}) {
    try {
        //Write your Function Logic
      
        return 1;
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

  useEffect(() => {
    setUserIdForFunction(getUserID());
    setUserRole(getUserRole());
    fetchAllAssistant(setAllAssistants);
    getAllfunctions()
  }, []);

  useEffect(() => {
    fetchFunctionNamesPerAssistant(assistantName, setAssistantFunctionNames);
  }, [assistantName]);

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
          <AdminAssistantList
            data={{
              setAdminUserAssistants,
              adminUserAssistants,
              totalCount,
              loader,
              handleDeleteAssistant,
              handleUpdateAssistant,
              showEditModalHandler,
              handleFetchUserCreatedAssistants,
              updateLoader,
              searchPersonalAssistants,
              personalAssistantSearchQuery,
              setPersonalAssistantSearchQuery,
              handlePublicAssistantAdd,
              getAssistantInfo,
            }}
          />
        );

      case "2":
        return (
          <PublicAssistantList
            data={{
              adminUserAssistants,
              loader,
              handleDeleteAssistant,
              handleUpdateAssistant,
              showEditModalHandler,
              handleFetchUserCreatedAssistants,
              handlePublicAssistantAdd,
              getFavoriteAssistant,
              handleDeletePublicAssistant,
              publicAssistant,
              setPublicAssistant,
              setIsLoading,
              isLoading,
              setLoadMyAssistants,
              updateLoader,
            }}
          />
        );

      case "3":
        return (
          <FavoriteAssistantList
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
              favoriteAssistant,
              setFavoriteAssistant,
              isLoading,
              setIsLoading,
            }}
          />
        );

      case "4":
        return (
          <AssistantTable
            data={{
              assistants,
              setAssistants,
              loader,
              teamList,
              handleAssignTeamToAssistant,
              handleDeleteAssistant,
              handleUpdateAssistant,
              showEditModalHandler,
              handleFetchAllAssistants,
              updateLoader,
              searchOrganizationalAssistants,
              orgAssistantSearchQuery,
              setOrgAssistantSearchQuery,
              handlePublicAssistantAdd,
              getAssistantInfo,
            }}
          />
        );

      case "5":
        return (
          <CreateFunctions
          functionCallingAssistants={functionCallingAssistants}
          setFunctionCallingAssistants={setFunctionCallingAssistants}
          loader={loader}
          handleDeleteAssistant={handleDeleteAssistant}
          handleUpdateAssistant={handleUpdateAssistant}
          showEditModalHandler={showEditModalHandler}
          handleFetchFunctionCallingAssistants={handleFetchFunctionCallingAssistants}
          updateLoader={updateLoader}
          userId={userIdForFunction}
          userRole={userRole}
          refreshTrigger={refreshTrigger}
          setRefreshTrigger={setRefreshTrigger}
          toggleDefineFunctionsModal={toggleDefineFunctionsModal}
      />
        );  
    

      case "7":
        return (
          <UserAssistantList
            data={{
              userAssistants,
              loader,
              handleDeleteAssistant,
              showEditModalHandler,
              showEditModalLoading
            }}
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
        sideMenuItems={agentPageSideMenuItems}
        handleChangeSideMenu={handleChangeSideMenu}
        activeKey={selectedKey}
        HeaderContentChildren={headerContent}
      >
        {renderContent()}
        <div className="row">
            <div className="col">
              <CreateAssistantModal
                data={{
                  handleClose,
                  showModal,
                  editMode,
                  assistantData,
                  setAssistantData,
                  assistantFunctionCallData,
                  setAssistantFunctionCallData,
                  isAdmin: true,
                  handleFetchUserCreatedAssistants,
                  handleFetchAllAssistants,
                  CreateAssistantModal,
                  handleFetchFunctionCallingAssistants,
                  isFunctionCallingAssistant,
                  activeKey,
                  setActiveKey,
                  formattedRAGdData,
                  formattedPublicFilesData,
                  isModalClosed,
                }}
              />
            </div>
          </div>
        {/* Function Definition Model */}
        <FunctionDefinitionModel
          refresh={refreshTable}
          onCreateSuccess={() => {
            // Make sure to call the methods that refresh your Assistants data
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
            setDefinitionToValidate,
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


export default AssistantsList;
