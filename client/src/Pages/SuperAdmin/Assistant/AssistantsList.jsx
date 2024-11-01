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
import { getUserID } from "../../../Utility/service";
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
  assistantTypes: null
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

const [publicAssistant, setPublicAssistant] = useState([]);
const [isLoading, setIsLoading] = useState(true);
const [loadMyAssistants,setLoadMyAssistants] = useState(false);
const [favoriteAssistant, setFavoriteAssistant] = useState([]);
const {isEditPageLoading,setIsEditPageLoading} = useContext(FileContext);


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
        const fetchPublicRAGFiles = fetchedRAGData.allPublicKnowledgeBase;
        const formattedRAGFiles = formatToTreeData(fetchedRAGData.data);
        const formattedPublicFiles = formatToTreeData(fetchPublicRAGFiles);
        if (formattedRAGFiles && formattedRAGFiles.length > 0) {
          setFormattedRAGdData(formattedRAGFiles);

        } else {
          console.warn("Formatted RAG Files are empty or undefined");
        }

        if (formattedPublicFiles && formattedPublicFiles.length > 0) {
          setFormattedPublicFilesData(formattedPublicFiles);

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

  useEffect(() => {
    if(!showModal){
      setIsModalClosed(true);

    }
  }, [showModal]);

  const getAllfunctions = () => {
    getAllFunctionDefinitions(setFunctionDefinitionsList);
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
        const response = await axiosSecureInstance.get(CHECK_SINGLE_ASSISTANTS_INFO(assistant?.assistant_id));
        if (response) {
          myAssistant = response?.data;
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          message.error("Agent not found in openAI");
        } else {
          message.error(error);

        }
        setIsEditPageLoading(false);
        setEditMode(false);
        setShowModal(false);
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
        functions: functionList  || [],
        knowledgeSource: myAssistant?.knowledgeSource,
        knowledgeBaseInfo: knowledgeBaseInfo,
        fileNames: myAssistant?.fileNames,
        file_ids: file_ids,
        fileIdsWithKeysOfKnowledgeBase: myAssistant?.knowledgeBaseFileIdsAndKysOfOpenAI,
        fileIdsWithName : myAssistant?.fileIdsWithName

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

      const insertedFunctions = myAssistant?.tools?.filter(tool => tool?.type === "function");
      const functionNames = insertedFunctions?.map((func) => func?.function?.name);
      const filteredData = functionDefinitionsList?.filter((obj) => functionNames?.includes(obj?.name));
      const functionList = filteredData.map(obj => (JSON.stringify(obj)));
      
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
        category: myAssistant?.category,
        assistantTypes: myAssistant?.assistantTypes,
        static_questions: myAssistant?.static_questions,
        functions: functionList,
        knowledgeSource: myAssistant?.knowledgeSource,
        knowledgeBaseInfo: knowledgeBaseInfo,
        fileNames: myAssistant?.fileNames,
        file_ids: file_ids,
        fileIdsWithKeysOfKnowledgeBase: myAssistant?.knowledgeBaseFileIdsAndKysOfOpenAI,
        fileIdsWithName : myAssistant?.fileIdsWithName
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
  const toggleDefineFunctionsModal = () => {
    setShowDefineFunctionsModal(!showDefineFunctionsModal);
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

  const handleAssistantNameChange = (value) => {
    setAssistantName(value);
  };

  const [functionDefinition, setFunctionDefinition] = useState(
    `function ${functionName ? functionName : "FunctionName"
    }(${functionsParameterNames.map(param => param.name).join(', ')}) {
    try {
        //Write your Function Logic
      
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
    fetchAllAssistant(setAllAssistants);
    getAllfunctions()
  }, []);

  useEffect(() => {
    fetchFunctionNamesPerAssistant(assistantName, setAssistantFunctionNames);
  }, [assistantName]);

  return (
    <>
      <div className="mt-5">
        <div className="container">
          <div className="d-flex align-items-center justify-content-between">
            <div className="col-8 d-flex align-items-center justify-content-between">
              <Title level={2}>Agent Lists</Title>
            </div>
            <div className="d-flex align-items-center justify-content-end">
              <div className="col-2 d-flex justify-content-end">
                <Button className="" onClick={handleClose}>
                  + Agent
                </Button>
              </div>
            </div>
          </div>
          <Tabs defaultActiveKey="1">
            {renderTabPane("1", "My Agents", AdminAssistantList, {
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
              getAssistantInfo

            })}
            {renderTabPane("2", "Public Agents", PublicAssistantList, {
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
              updateLoader
            })}
            {renderTabPane("3", "Favorite Agents", FavoriteAssistantList, {
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
              setIsLoading
            })}
            {renderTabPane("4", "Organizational Agents", AssistantTable, {
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
              getAssistantInfo
            })}
            {renderTabPane(
              "5",
              "Function Definitions",
              FunctionCallingAssistantTable,
              {
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
              }
            )}

            {renderTabPane("6", "User Agents", UserAssistantList, {
              userAssistants,
              loader,
              handleDeleteAssistant,
            })}
            {renderTabPane("7", "Settings", AssistantSettings, {
              loader,
              teamList,
              handleFetchTeams,
            })}
          </Tabs>
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
        </div>

        {/* Function Definition Model */}
        <FunctionDefinitionModel
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
            handleParameterChange,
            validateConsole,
            handleValidateFunction,
            setValidateConsole,
            functionDefinition,
            functionName,
          }}
        />
      </div>
    </>
  );
};
/**
 * Creates and returns a TabPane.
 * @param {string} key - The key.
 * @param {string} label - The label.
 * @param {JSX.Element} component - The component.
 * @param {object} data - The data.
 * @returns {JSX.Element} The TabPane.
 */
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

/**
 * Returns the corresponding icon based on the label.
 * @param {string} label - The label.
 * @returns {JSX.Element} The icon.
 */
const IconComponent = ({ label }) => {
  switch (label) {
    case "My Agents":
      return <MdOutlineAssistant className="me-2" />;
    case "Public Agents":
      return <GlobalOutlined className="me-2" />;
    case "Favorite Agents":
      return <HeartOutlined className="me-2" />;
    case "Organizational Agents":
      return <BuildFilled className="me-2" />;
    case "Function Definitions":
      return <BuildFilled className="me-2" />;
    case "User Agents":
      return <UserDeleteOutlined className="me-2" />;
    case "Settings":
      return <SettingOutlined className="me-2" />;
  }
};

export default AssistantsList;
