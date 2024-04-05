import React from "react";
import { useEffect, useState } from "react";

//libraries
import { Tabs, Button, Typography } from "antd";

import {
  SettingOutlined,
  BuildFilled,
  UserDeleteOutlined,
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
} from "../api/functionDefinition";
import {
  fetchAllAssistant,
  fetchFunctionNamesPerAssistant,
  fetchParametersPerFunctionName,
} from "../api/functionCallingAssistant";
import FunctionDefinitionModel from "../Modals/FunctionDefinitionModal";
import ValidationModel from "../Modals/ValidationModel";

//Hooks
import useAssistantPage from "../../../Hooks/useAssistantPage";
import { useAssistantContext } from "../../../contexts/AssistantsFetchContext";

const userId = getUserID();

//-----Constants-----//
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

  //----------Side Effects-------//
  useEffect(() => {
    handleFetchUserCreatedAssistants();
    handleFetchUserAssistantStats();
    handleFetchAllAssistants(1);
    handleFetchTeams();
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
  } = useAssistantPage();

  const {
    setAllAssistants,
    allAssistants
  } = useAssistantContext();


  // <---------------local-Functions------------------------->

  const handleClose = () => {
    setAssistantData(() => ({ ...initialAssistantState }));
    setAssistantFunctionCallData({...initialFunctionCallingAssistantState})
    setShowModal((value) => !value);
    setEditMode(false);
  };
  const [activeKey, setActiveKey] = useState("unoptimized-data");

  const [isFunctionCallingAssistant, setIsFunctionCallingAssistant] =
    useState(false);

  const showEditModalHandler = async (assistant) => {
    if(assistant.functionCalling == undefined){
      setIsFunctionCallingAssistant(false);
    }
    else{
      setIsFunctionCallingAssistant(assistant.functionCalling);
    }
   
    if (assistant.functionCalling === false || assistant.functionCalling == undefined) {
      const filterAssistantData = {
        ...assistant,
        tools: assistant?.tools?.map(({ type }) => type),
      };
      setAssistantData(filterAssistantData);

      setEditMode(true);
      setShowModal(true);
    } else {
      const response = await axiosSecureInstance.get(
        `/api/assistants/getAssistantInfo/${assistant.assistant_id}`
      );
      let myAssistant;
      if (response) {
        myAssistant = response.data;
      }
      console.log(myAssistant);

      let filteredAssistantData = {
        assistant_id: myAssistant.id,
        name: assistant.name,
        instructions: myAssistant.instructions,
        description: assistant.description,
        userId: userId,
        userSelectedModel: myAssistant.model,
        tools: [],
      };

      // Check if tools are provided and not null
      if (Array.isArray(myAssistant.tools) && myAssistant.tools.length) {
        filteredAssistantData.tools = myAssistant.tools.map((tool) => ({
          name: tool.function?.name || "",
          description: tool.function?.description || "",
          parameters: {
            type: "object",
            properties: tool.function?.parameters?.properties || {},
            required: tool.function?.parameters?.required || [],
          },
        }));
      }

      // Update the state with the new data
      setAssistantFunctionCallData(filteredAssistantData);

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
    `function ${
      functionName ? functionName : "FunctionName"
    }(${functionsParameterNames}) {
    try {
        //Write your Function Logic
      
    } catch (error) {
      console.log(error);
    }
  }`
  );
  useEffect(() => {
    setFunctionDefinition(`function ${
      functionName ? functionName : "FunctionName"
    }(${functionsParameterNames}) {
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
  }, []);

  useEffect(() => {
    fetchFunctionNamesPerAssistant(assistantName, setAssistantFunctionNames);
  }, [assistantName]);

  useEffect(() => {
    fetchParametersPerFunctionName(
      assistantName,
      functionName,
      setFunctionsParameterNames
    );
  }, [functionName]);

  return (
    <>
      <div className="mt-5">
        <div className="container">
          <div className="d-flex align-items-center justify-content-between">
            <div className="col-8 d-flex align-items-center justify-content-between">
              <Title level={2}>Assistant Lists</Title>
            </div>
            <div className="d-flex align-items-center justify-content-between">
              <div className="col-2 d-flex justify-content-end">
                <Button className="" onClick={toggleDefineFunctionsModal}>
                  Define Functions
                </Button>
              </div>
              <div className="col-2 d-flex justify-content-end">
                <Button className="" onClick={handleClose}>
                  + Assistant
                </Button>
              </div>
            </div>
          </div>
          <Tabs defaultActiveKey="1">
            {renderTabPane("1", "My Assistants", AdminAssistantList, {
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
              setPersonalAssistantSearchQuery
            })}
            {renderTabPane("2", "Organizational Assistants", AssistantTable, {
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
              setOrgAssistantSearchQuery
            })}
            {renderTabPane(
              "3",
              "Function Calling Assistants",
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
              }
            )}

            {renderTabPane("4", "User Assistants", UserAssistantList, {
              userAssistants,
              loader,
              handleDeleteAssistant,
            })}
             {renderTabPane("5", "Settings", AssistantSettings, {
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
            handleAssistantNameChange,
            assistantName,
            allAssistants,
            functionName,
            handleFunctionNameChange,
            assistantFunctionNames,
            functionsParameterNames,
            showDemo,
            toggleDemo,
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
    case "My Assistants":
      return <MdOutlineAssistant className="me-2" />;
    case "Organizational Assistants":
      return <BuildFilled className="me-2" />;
    case "Function Calling Assistants":
      return <BuildFilled className="me-2" />;
    case "User Assistants":
      return <UserDeleteOutlined className="me-2" />;
    case "Settings":
      return <SettingOutlined className="me-2" />;
  }
};

export default AssistantsList;
