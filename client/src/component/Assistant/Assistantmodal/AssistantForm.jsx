import React, { useEffect, useRef } from "react";

//libraries
import {
  Form,
  Input,
  Radio,
  Select,
  Button,
  Upload,
  Switch,
  Tooltip,
  Alert,
  Avatar,
  Tabs,
} from "antd";
import { message } from "antd";

import { PaperClipOutlined } from "@ant-design/icons";
// Custom ConversationStater component
import ConversationStater from "./ConversationStater";
import { AiOutlineDelete } from "react-icons/ai";

//Constants
import { getAssistantModels } from "../../../constants/AssistanceModelConst";
import {
  ASSISTANT_CODE_INTERPRETER_NOTE,
  ASSISTANT_FILE_CREATION_NOTE,
  ASSISTANT_RETRIEVAL_NOTE,
} from "../../../constants/FileLIstConstants";
import { useState } from "react";
import { getAllFunctionDefinitions } from "../../../Pages/SuperAdmin/api/functionDefinition";
import { getAllAssistantType,getAllAssistantsIds } from "../../../api/assistantTypeApi";
import { RAGTree } from "../../KnowledgeBase/RAGTree";
import axios from "axios";
import { getN8nWorkflows, getN8nConnectionStatus } from "../../../api/user";
import "./RAGFileList.css";
import { getAllApis } from "../../../Pages/SuperAdmin/api/functionDefinition";
import { getAllServices } from "../../../api/api_endpoints";
import {
  modelDescriptions,
  modelNameMapping,
} from "../../../constants/AssistanceModelConst";
import { Option } from "antd/es/mentions";
import { getUserRole } from "../../../Utility/service";
const role = getUserRole();

const { TabPane } = Tabs;

// local component
const AssistantFileUploadMessage = () => {
  return (
    <>
      <p>{ASSISTANT_FILE_CREATION_NOTE}</p>
      <ul>
        <li>{ASSISTANT_RETRIEVAL_NOTE}</li>
        <li>{ASSISTANT_CODE_INTERPRETER_NOTE}</li>
      </ul>
    </>
  );
};

const AssistantForm = ({ data }) => {
  const {
    form,
    handleFormChange,
    handleSwitchChange,
    isAdmin,
    handleUploadFileAndCreateAssistant,
    fileList,
    setFileList,
    setCountTotalFile,
    countTotalFile,
    isUploading,
    handleRemoveFile,
    handleAddFile,
    assistantData,
    setAssistantData,
    editMode,
    image,
    setImage,
    setDeleteFileIds,
    formattedRAGdData,
    formattedPublicFilesData,
    knowledgeSource,
    setKnowledgeSource,
    activeKeyOfKnowledgeBase,
    setActiveKeyOfKnowledgeBase,
    setTotalFileList,
    connectApps,
    setConnectApps,
    isWorkBoardConnected,
    setIsWorkBoardConnected,
    isGoogleDriveConnected,
    setIsGoogleDriveConnected,
    isImportWebPagesConnected,
    setIsImportWebPagesConnected,
    enableSync,
    setEnableSync,
    handleSwitchChangeOfPlugin,
    imageType,
    setImageType,
    dalleImageDescription,
    setDalleImageDescription,
    setSelectedFile,
    selectedFile,
    setSelectedFolders,
    functionCount,
    setFunctionCount,
    deletedFileList,
    setDeletedFileList,
  } = data;


  const [assistantGptModels, setAssistantGptModels] = useState([]);

  useEffect(() => {
    const models = getAssistantModels(role);
    setAssistantGptModels(models);
  }, [role]);

  useEffect(() => {
    if (editMode && assistantData) {
      setImageType(assistantData.imageType || "DEFAULT");
      form.setFieldsValue({ photoOption: assistantData.photoOption });
    }
  }, [editMode, assistantData, form]);

  const knowledgeBaseSourceInitialValue = editMode
    ? form.getFieldValue("knowledgeSource")
    : false;
  const isSync = !editMode ? setEnableSync(false) : null;

  const { TextArea } = Input;
  const photoOption = form.getFieldValue("photoOption");
  const [assistantTypes, setAssistantTypes] = useState([]);
  const [functionDefinitions, setFunctionDefinitions] = useState([]);
  const [folderStructure, setFolderStructure] = useState([]);
  const [files, setFiles] = useState([]);
  const [allUsersFileTreeStructure, setAllUsersFileTreeStructure] = useState(
    []
  );
  const [previousSelectedKB, setPreviousSelectedKB] = useState([]);
  const [previousUploadedFiles, setPreviousUploadedFiles] = useState([]);

  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [serviceApis, setServiceApis] = useState([]);
  const [serviceIcons, setServiceIcons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filesManuallyCleared, setFilesManuallyCleared] = useState(false);
  const [isSelectedFilesSeted, setIsSelectedFilesSeted] = useState(false);
  const [selectedFileKeys, setSelectedFileKeys] = useState([]);

  let [selectedFunctions, setSelectedFunctions] = useState([]);
  const [selectedAssistants, setSelectedAssistants] = useState([]);
  const [assistantIds, setAllAssistantsIds] = useState([]);
  
  // n8n workflow states
  const [isN8nConnected, setIsN8nConnected] = useState(false);
  const [isCheckingN8nConnection, setIsCheckingN8nConnection] = useState(true);
  const [isN8nPluginEnabled, setIsN8nPluginEnabled] = useState(false);
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflows, setSelectedWorkflows] = useState([]);
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);
  const workflowsFetchedRef = useRef(false);

  useEffect(() => {
    if (knowledgeSource) {
      setActiveKeyOfKnowledgeBase("2");
    } else {
      setActiveKeyOfKnowledgeBase("1");
    }
  }, [knowledgeSource]);

  const handleSwitchChangeOfSource = (checked) => {
    setKnowledgeSource(checked);
    form.setFieldsValue({ knowledgeSource: checked });
  };

  const handleSwitchChangeOfEnableSync = (checked) => {
    setEnableSync(checked);
    form.setFieldsValue({ enableSync: checked });
  };

  const handleSwitchChangeOfConnectApps = (appWithState) => {
    const key = Object.keys(appWithState)[0];
    const value = Object.values(appWithState)[0];

    const updatedAppsWithState = connectApps.map((app) => {
      const appKey = Object.keys(app)[0];
      if (appKey === key) {
        return appWithState;
      }
      return app;
    });

    const isAppPresent = connectApps.some((app) => Object.keys(app)[0] === key);
    const finalAppsWithState = isAppPresent
      ? updatedAppsWithState
      : [...updatedAppsWithState, appWithState];
    setConnectApps(finalAppsWithState);
    form.setFieldsValue({ connectApps: finalAppsWithState });
    form.setFieldsValue(appWithState);

    if (key === "workBoard") {
      setIsWorkBoardConnected(value);
    }
    if (key === "googleDrive") {
      setIsGoogleDriveConnected(value);
    }
    if (key === "importWebPages") {
      setIsImportWebPagesConnected(value);
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  const formData = new FormData();
  const handleDelete = (key) => {
    if (editMode) {
      const fileIds = assistantData?.fileIdsWithKeysOfKnowledgeBase?.filter(
        (file) => file.key === key
      );
      if (fileIds?.[0]?.file_id) {
        setDeleteFileIds((prev) =>
          prev?.length ? [...prev, fileIds[0].file_id] : [fileIds[0].file_id]
        );
      }
      // Add to deletedFileList for tracking deleted files in edit mode
      setDeletedFileList((prev) => [...prev, key]);
    }

    // Update selectedFile state using functional update to ensure we're working with latest state
    setSelectedFile((prevFiles) => {
      const updatedFiles = prevFiles.filter((file) => file.key !== key);
      // If this was the last file, also clear selectedFolders
      if (updatedFiles?.length === 0) {
        setSelectedFolders([]);
        form.setFieldsValue({ fileNameList: [] });
        setFilesManuallyCleared(true);
      }

      return updatedFiles;
    });

    setSelectedFolders((prev) => prev.filter((folderKey) => folderKey !== key));
  };

  const getAllfunctions = async () => {
    const functions = await getAllFunctionDefinitions();
    setFunctionDefinitions(functions);
  };

  const getAllServiceApi = () => {
    getAllApis((serviceApis) => {
      setServiceApis(serviceApis);
    });
  };

  const getAllAssistants = async () => {
    const userId = localStorage.getItem("userID");
    const response = await getAllAssistantsIds(userId);
    setAllAssistantsIds(response);
  }

  // n8n workflow functions
  const checkN8nConnection = async () => {
    try {
      setIsCheckingN8nConnection(true);
      const userId = localStorage.getItem("userID");
      const response = await getN8nConnectionStatus(userId);
      if (response.data.success) {
        setIsN8nConnected(response.data.isN8nConnected);
        return response.data.isN8nConnected;
      }
      return false;
    } catch (error) {
      console.error('Error checking n8n connection:', error);
      return false;
    } finally {
      setIsCheckingN8nConnection(false);
    }
  };

  const fetchN8nWorkflows = async () => {
    if (workflowsFetchedRef.current) return; // Prevent multiple calls
    
    try {
      setIsLoadingWorkflows(true);
      const userId = localStorage.getItem("userID");
      const response = await getN8nWorkflows(userId);
      
      if (response.data.success) {
        setWorkflows(response.data.workflows || []);
        workflowsFetchedRef.current = true;
      } else {
        setWorkflows([]);
        message.error(response.data.message || 'Failed to fetch workflows');
      }
    } catch (error) {
      console.error('Error fetching n8n workflows:', error);
      setWorkflows([]);
      message.error('Failed to fetch n8n workflows');
    } finally {
      setIsLoadingWorkflows(false);
    }
  };

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const response = await getAllServices();

        if (response?.data?.data && Array.isArray(response.data.data)) {
          const serviceDetails = response.data.data.map((service) => ({
            service_id: service._id,
            service_icon: service.service_icon || "",
          }));
          setServiceIcons(serviceDetails);
        } else {
          console.warn(
            "Expected an array inside response.data.data, but received:",
            response
          );
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // --- keep selected “functions” in sync with API list ---
  useEffect(() => {
    if (
      !assistantData?.functions?.length ||
      !serviceApis?.length ||
      !functionDefinitions?.length
    ) {
      return;
    }

    const toJSONString = (obj) => JSON.stringify(obj);

    const selected = [];

    assistantData.functions.forEach((raw) => {
      let func;
      try {
        func = typeof raw === "string" ? JSON.parse(raw) : raw;
      } catch {
        return;
      }

      if (!func.service_id) {
        const hit = functionDefinitions.find((f) => f._id === func._id);
        if (hit) selected.push(toJSONString(hit));
        return;
      }

      const service = serviceApis.find((s) => s.service_id === func.service_id);
      if (!service) return;

      const apiHit = service.apis.find(
        (api) => api.api_name === func.api_name || api.api_name === func.name
      );
      if (apiHit) selected.push(toJSONString(apiHit));
    });

    const deduped = Array.from(new Set(selected));

    form.setFieldsValue({ functions: deduped });
    setFunctionCount(deduped?.length);
  }, [assistantData, serviceApis, functionDefinitions, form, setFunctionCount]);

  const handleChange = (newFileList) => {
    if (fileList?.length > 0) {
      setCountTotalFile(newFileList?.fileList?.length);
    }
  };

  const uploadProps = {
    onRemove: handleRemoveFile,
    onChange: handleChange,
    beforeUpload: handleAddFile,
    fileList,
    multiple: true,
  };
  //------Side effects---------//

  useEffect(() => {
    if (assistantData) {
      form.setFieldsValue({
        ...form.getFieldsValue(), // Spread current form values to avoid resetting
        ...assistantData, // Update with any new data
        upload: fileList, // Preserve the fileList by explicitly setting it
      });

      setPreviousSelectedKB(assistantData?.knowledgeBaseInfo);
      setPreviousUploadedFiles(assistantData?.fileNames);
      getAllAssistantType(setAssistantTypes);
      getAllfunctions();
      getAllServiceApi();
      if (!isSelectedFilesSeted) {
        setSelectedFile(assistantData?.knowledgeBaseInfo || []);
        setIsSelectedFilesSeted(true);
      }

      // Initialize n8n plugin state for edit mode
      if (editMode && assistantData.plugins) {
        const hasN8nPlugin = assistantData.plugins.some(plugin => plugin.type === "n8n");
        if (hasN8nPlugin && isN8nConnected) {
          setIsN8nPluginEnabled(true);
        }
      }
    }
  }, [assistantData, form, fileList, deletedFileList, editMode, isN8nConnected]);

const loadAssistants=assistantData?.selectedassistantIds;
  useEffect(() => {
    getAllAssistants();
    if (assistantData?.selectedassistantIds?.length > 0 && assistantData?.selectedassistantIds[0] !== "undefined") {
      // Set the selected functions for "Multi Agent"
      setSelectedFunctions([{ title: "Multi Agent" }]);
  
      let parsedIds = [];
      if (assistantData.selectedassistantIds[0].includes("[") && assistantData.selectedassistantIds[0].includes("]")) {
        parsedIds = JSON.parse(assistantData.selectedassistantIds[0]);
      } else {
        parsedIds = assistantData.selectedassistantIds[0].split(",").map(id => id.trim());
      }
  
      // Filter assistants based on parsedIds
      const matchedAssistants = assistantIds?.filter((assistant) =>
        parsedIds.includes(assistant._id)
      ).map((assistant) => ({
        assistant_id: assistant.assistant_id,
        description: assistant.description || "",
        name: assistant.name || "",
        _id: assistant._id
      }));
      setSelectedAssistants(matchedAssistants);
    } else {
      setSelectedFunctions([]);
    }
  }, [loadAssistants]);

  // Check n8n connection on component mount
  useEffect(() => {
    checkN8nConnection();
  }, []);

  // Sync n8n plugin state with form value and connection status
  useEffect(() => {
    console.log('N8n plugin sync effect triggered:', {
      isCheckingN8nConnection,
      isN8nConnected,
      currentPlugins: form.getFieldValue("plugins") || []
    });
    
    if (!isCheckingN8nConnection) {
      const currentPlugins = form.getFieldValue("plugins") || [];
      const hasN8nPlugin = currentPlugins.includes("n8n");
      
      // Update local state based on form value and connection status
      setIsN8nPluginEnabled(hasN8nPlugin && isN8nConnected);
      
      // If user is not connected but plugin is enabled in form, disable it
      if (!isN8nConnected && hasN8nPlugin) {
        const updatedPlugins = currentPlugins.filter(plugin => plugin !== "n8n");
        form.setFieldsValue({ plugins: updatedPlugins });
        if (handleSwitchChangeOfPlugin) {
          handleSwitchChangeOfPlugin("n8n", false);
        }
      }
      
      // Note: Workflow fetching is handled by a separate effect
    }
  }, [isN8nConnected, isCheckingN8nConnection, form, handleSwitchChangeOfPlugin]);

  // Sync selectedWorkflows with form value
  useEffect(() => {
    if (selectedWorkflows.length > 0) {
      form.setFieldsValue({ selectedWorkflowIds: selectedWorkflows });
    }
  }, [selectedWorkflows, form]);

  // Load existing selected workflows when in edit mode
  useEffect(() => {
    if (editMode && assistantData?.selectedWorkflowIds?.length > 0) {
      setSelectedWorkflows(assistantData.selectedWorkflowIds);
      form.setFieldsValue({ selectedWorkflowIds: assistantData.selectedWorkflowIds });
    }
  }, [editMode, assistantData?.selectedWorkflowIds, form]);

  // Initialize n8n plugin state when assistant data is loaded in edit mode
  useEffect(() => {
    if (editMode && assistantData && !isCheckingN8nConnection) {
      const currentPlugins = assistantData.plugins || [];
      const hasN8nPlugin = currentPlugins.some(plugin => plugin.type === "n8n");
      
      // Set the n8n plugin state based on assistant data
      if (hasN8nPlugin && isN8nConnected) {
        setIsN8nPluginEnabled(true);
      }
    }
  }, [editMode, assistantData, isCheckingN8nConnection, isN8nConnected]);

  // Reset workflows fetched ref when assistant data changes
  useEffect(() => {
    workflowsFetchedRef.current = false;
  }, [assistantData?.assistant_id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      workflowsFetchedRef.current = false;
    };
  }, []);

  // Fetch workflows when n8n plugin is enabled and connected
  useEffect(() => {
    if (isN8nPluginEnabled && isN8nConnected && !workflowsFetchedRef.current && !isLoadingWorkflows) {
      fetchN8nWorkflows();
    }
  }, [isN8nPluginEnabled, isN8nConnected, isLoadingWorkflows]);

  useEffect(() => {
    if (selectedFile?.length === 0 && editMode) {
      // Ensure the form value is also cleared
      form.setFieldsValue({ fileNameList: JSON.stringify([]) });
    }
    if (!filesManuallyCleared) {
      const nonDeletedFiles = selectedFile?.filter(
        (file) => !deletedFileList.includes(file.key)
      );
      setSelectedFile(nonDeletedFiles || []);
    }
  }, [selectedFile, editMode, form, deletedFileList]);
  //-----Local functions-------//

  const typeArray = [];
  for (let type in assistantTypes) {
    typeArray.push(assistantTypes[type].name);
  }

  // console.log("setSelectedWorkflows", selectedWorkflows);

  return (
    <Form
        form={form}
        onValuesChange={handleFormChange}
        onFinish={handleUploadFileAndCreateAssistant}
        layout="vertical"
      >
      <Form.Item
        label="Name"
        name="name"
        rules={[{ required: true, message: "This field is mandatory." }]}
      >
        <Input placeholder="Enter name" />
      </Form.Item>

      {assistantData?.image_url ? (
        <Avatar size="large" className="mb-2" src={assistantData?.image_url} />
      ) : null}

      <Form.Item
        label="Select/Generate Image"
        name="photoOption"
        rules={[
          {
            required: false,
            message: "Please Select the type of Agent photo",
          },
        ]}
      >
        <Radio.Group
          defaultValue={assistantData.imageType}
          value={assistantData?.imageType}
          onChange={(e) => {
            const selectedValue = e.target.value;
            setImageType(selectedValue); // Set image type
            form.setFieldsValue({ photoOption: selectedValue });
            if (selectedValue !== "DALLE") {
              setDalleImageDescription("");
            }
            setAssistantData((prevData) => {
              return {
                ...prevData,
                imageType: selectedValue,
              };
            });
          }}
        >
          <Radio value="DEFAULT">Default Avatar</Radio>
          <Radio value="UPLOAD">Upload</Radio>
          <Radio value="DALLE">Dall-E</Radio>
        </Radio.Group>
      </Form.Item>

      {imageType === "DALLE" && (
        <Form.Item
          label="DALL-E Image Description"
          name="dalleImageDescription"
          initialValue={editMode ? dalleImageDescription : ""}
          rules={[
            {
              required: false,
              message: "Please enter a description for the DALL-E image.",
            },
          ]}
        >
          <Input.TextArea
            rows={3}
            placeholder="Enter description for DALL-E image"
            value={dalleImageDescription}
            onChange={(e) => {
              setDalleImageDescription(e.target.value);
              // form.setFieldsValue({ dalleImageDescription: e.target.value });
            }}
          />
        </Form.Item>
      )}

      {photoOption === "UPLOAD" && (
        <Form.Item
          label="Upload Photo"
          name="avatar"
          rules={[
            {
              required: true,
              message: "Please upload a photo",
            },
          ]}
        >
          {assistantData.imageType === "UPLOAD" && assistantData.image_url && (
            <img
              style={{
                height: "32px",
                width: "32px",
                marginBottom: "5px",
                borderRadius: "7px",
                border: "1px solid black",
              }}
              src={assistantData.image_url}
              alt="Uploaded"
            />
          )}
          <Upload
            maxCount={1}
            accept="image/*"
            beforeUpload={(file) => {
              const isImage = file.type.startsWith("image/");
              if (!isImage) {
                console.log("You can only upload image files!");
              } else {
                setImage(file);
                form.setFieldsValue({ avatar: file });
              }
              return false;
            }}
          >
            <Button>Upload</Button>
          </Upload>
        </Form.Item>
      )}

      <Form.Item
        label="Instructions"
        name="instructions"
        rules={[
          {
            required: true,
            message: "Please enter the instructions",
          },
        ]}
      >
        <TextArea
          style={{
            resize: "vertical",
            scrollbarWidth: "thin",
            scrollbarColor: "#888 #41414e",
          }}
          rows={3}
          placeholder="You are a helpful Agent."
        />
      </Form.Item>
      <Form.Item
        label="Description"
        name="description"
        rules={[
          {
            required: true,
            message: "Please enter the description",
          },
        ]}
      >
        <TextArea
          style={{
            resize: "vertical",
            scrollbarWidth: "thin",
            scrollbarColor: "#888 #41414e",
          }}
          rows={2}
          placeholder="Enter Description"
        />
      </Form.Item>
      <Form.Item
        label="Select Category"
        name="assistantTypes"
        rules={[
          {
            required: true,
            message: "Please Select Agent Category",
          },
        ]}
      >
        <Select placeholder="Choose">
          {typeArray.map((types) => (
            <Select.Option key={types} value={types}>
              {types}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      {isAdmin && (
        <Form.Item
          label="Select type"
          name="category"
          rules={[
            {
              required: true,
              message: "Please Select the type of Agent",
            },
          ]}
        >
          <Radio.Group>
            <Radio value="ORGANIZATIONAL">Organizational</Radio>
            <Radio value="PERSONAL">Personal</Radio>
          </Radio.Group>
        </Form.Item>
      )}
      <Form.Item label="Conversation Starters" name="static_questions">
        <ConversationStater
          staticQuestions={assistantData?.static_questions}
          onAddQuestion={(question) =>
            setAssistantData((prevData) => ({
              ...prevData,
              static_questions: [
                ...(prevData.static_questions || []),
                question,
              ],
            }))
          }
          setAssistantData={setAssistantData}
        />
      </Form.Item>
      {/* <Form.Item
        label="Model"
        name="model"
        rules={[
          {
            required: true,
            message: "Please Select GPT Model",
          },
        ]}
      >
        <Select>
          {assistantGptModels.map((model) => (
            <Select.Option key={model} value={model}>
              {model === "ft:gpt-4o-mini-2024-07-18:sj-innovation:sjinnovation-v1:AbQIZwsV"
                ? "gpt-4o-mini-sjinnovation-v1"
                : model}
            </Select.Option>
          ))}
        </Select>
      </Form.Item> */}
      <Form.Item
        label="Model"
        name="model"
        rules={[
          {
            required: true,
            message: "Please Select GPT Model",
          },
        ]}
      >
        <Select optionLabelProp="label" placeholder="Select a GPT Model">
          {assistantGptModels.map((model) => (
            <Option
              key={model}
              value={model}
              label={modelNameMapping[model] || model}
            >
              <div>
                <strong>{modelNameMapping[model] || model}</strong>
                <br />
                <small style={{ color: "#888" }}>
                  {modelDescriptions[model]}
                </small>
              </div>
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label={<span style={{ fontWeight: "bold" }}>Plugins</span>}
        name="plugins"
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "0px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <span>File Sync</span>
          <Tooltip title="By enabling this feature,you can sync your google drive files and WorkBoard files from agent chat page.">
            <Switch
              checked={form.getFieldValue("plugins")?.includes("enableSync")}
              onChange={(checked) =>
                handleSwitchChangeOfPlugin("enableSync", checked)
              }
            />
          </Tooltip>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <span>Mermaid</span>
          <Tooltip title="By enabling this feature you can generate graph during chat with agent">
            <Switch
              checked={form.getFieldValue("plugins")?.includes("mermaid")}
              onChange={(checked) =>
                handleSwitchChangeOfPlugin("mermaid", checked)
              }
            />
          </Tooltip>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <span>N8N {isCheckingN8nConnection && <span style={{ color: '#1890ff', fontSize: '12px' }}>(Checking connection...)</span>}</span>
          <Tooltip title="By enabling this feature you can execute n8n workflows during chat">
            <Switch
              disabled={isCheckingN8nConnection}
              checked={isN8nPluginEnabled && isN8nConnected}
              onChange={(checked) => {
                if (!isN8nConnected && checked) {
                  message.warning('Please connect n8n from Account Settings first');
                  return;
                }
                // Only update the form if the user is connected or is trying to disable
                if (isN8nConnected || !checked) {
                  setIsN8nPluginEnabled(checked);
                  handleSwitchChangeOfPlugin("n8n", checked);
                  if (checked) {
                    workflowsFetchedRef.current = false; // Reset ref to allow fetching
                    fetchN8nWorkflows();
                  } else {
                    workflowsFetchedRef.current = false; // Reset ref when disabled
                    setWorkflows([]);
                    setSelectedWorkflows([]);
                  }
                }
              }}
            />
          </Tooltip>
        </div>


        {isN8nPluginEnabled && isN8nConnected && !isCheckingN8nConnection && (
        <Form.Item
          label="Workflow List"
          name="selectedWorkflowIds"
          rules={[
            {
              required: isN8nPluginEnabled && isN8nConnected,
              message: "Please select at least one workflow or disable n8n plugin",
            },
          ]}
        >
          <Select
            mode="multiple"
            placeholder="Select workflows"
            loading={isLoadingWorkflows}
            onChange={(selectedWorkflowIds) => {
              setSelectedWorkflows(selectedWorkflowIds);
              form.setFieldsValue({ selectedWorkflowIds: selectedWorkflowIds });
            }}
            value={selectedWorkflows}
          >
            {workflows.map((workflow) => (
              <Select.Option key={workflow.id} value={workflow.id}>
                {workflow.name || `Workflow ${workflow.id}`}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      )}


        {/* <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Function Calling</span>
          <Tooltip title="It enables the Agent to call the custom functions">
            <Switch
              checked={form.getFieldValue("tools")?.includes("function")}
              onChange={(checked) => (
                handleSwitchChange("function", checked),
                formData.append('functionCalling', checked))
              }
            />
          </Tooltip>
        </div> */}
      </Form.Item>

      <hr />
      <Form.Item
        label={<span style={{ fontWeight: "bold" }}>Tools</span>}
        name="tools"
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "0px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <span>Code interpreter</span>
          <Tooltip title="Code Interpreter enables the Agent to write and run code. This tool can process files with diverse data and formatting, and generate files such as graphs.">
            <Switch
              checked={form
                .getFieldValue("tools")
                ?.includes("code_interpreter")}
              onChange={(checked) =>
                handleSwitchChange("code_interpreter", checked)
              }
            />
          </Tooltip>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <span>File search</span>
          <Tooltip title="File search enables the Agent with knowledge from files that you or your users upload. Once a file is uploaded, the Agent automatically decides when to retrieve content based on user requests.">
            <Switch
              checked={form.getFieldValue("tools")?.includes("file_search")}
              onChange={(checked) => handleSwitchChange("file_search", checked)}
            />
          </Tooltip>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Function Calling</span>
          <Tooltip title="It enables the Agent to call the custom functions">
            <Switch
              checked={form.getFieldValue("tools")?.includes("function")}
              onChange={(checked) => (
                handleSwitchChange("function", checked, functionCount),
                formData.append("functionCalling", checked)
              )}
            />
          </Tooltip>
        </div>
      </Form.Item>

      {form.getFieldValue("tools")?.includes("function") && (
        <Form.Item
          label="Function List"
          name="functions"
          rules={[
            {
              required: form.getFieldValue("tools")?.includes("function"),
              message:
                "Please select at least one function or disable function calling tool",
            },
          ]}
        >
          <Select
            mode="multiple"
            placeholder="Select functions"
            onChange={(selectedFunctions) => {
              setFunctionCount(selectedFunctions?.length);
              const parsedFunctions = selectedFunctions.map((funcStr) => JSON.parse(funcStr));
                setSelectedFunctions(parsedFunctions);
            }}
          >
            {functionDefinitions
              ?.filter((func) => !func.service_id) // Exclude functions with service_id
              .map((func) => (
                <Select.Option key={func._id} value={JSON.stringify(func)}>
                  {func.title}
                </Select.Option>
              ))}
            {/* Render options from serviceApis */}
            {serviceApis?.flatMap((service) => {
              return service.apis.map((api) => {
                const serviceId =
                  api.service_id && api.service_id.$oid
                    ? api.service_id.$oid
                    : api.service_id || null;
                const matchedService = serviceIcons.find(
                  (s) => s.service_id === serviceId
                );
                return (
                  <Select.Option
                    key={api._id?.$oid || api._id}
                    value={JSON.stringify(api)}
                  >
                    {matchedService && matchedService.service_icon ? (
                      <img
                        src={`${process.env.REACT_APP_BASE_URL}${matchedService?.service_icon}`}
                        alt="Service Icon"
                        style={{ width: 20, height: 20, marginRight: 8 }}
                      />
                    ) : (
                      <span></span>
                    )}
                    {api.api_name}
                  </Select.Option>
                );
              });
            })}
          </Select>
        </Form.Item>
      )}

      <Form.Item name="selectedassistantIds" noStyle hidden>
        <Input type="hidden" />
      </Form.Item>

      {selectedFunctions.some((func) => func.title === "Multi Agent") && (
        <Form.Item label="Select Agents for Multi-Agent Network. Please note there will be a set of predefined technical instructions added to this agent with your instructions.">
        <Select
          name="selectedassistantIds"
          mode="multiple"
          showSearch
          placeholder="Select one or more assistants"
          value={selectedAssistants.map((assistant) => assistant._id)}
          filterOption={(input, option) =>
            option.children
              ?.toLowerCase()
              .includes(input.toLowerCase())
          }
          onChange={(selectedIds) => {

            const selected = assistantIds
              .filter((assistant) => selectedIds.includes(assistant._id))
              .map((assistant) => ({
                _id: assistant._id,
                assistant_id: assistant.assistant_id,
                description: assistant.description || "",
                name: assistant.name || "",
              }));

            setSelectedAssistants(selected);
            form.setFieldsValue({
              selectedassistantIds: selectedIds, 
            });

          }}
        >
          {assistantIds
           .slice() 
           .sort((a, b) => a.name.localeCompare(b.name))
           .map((assistant) => (
            <Select.Option key={assistant._id} value={assistant._id}>
              {assistant.name}
            </Select.Option>
          ))}
        </Select>
        </Form.Item>
      )}

      <hr />

      <Tabs
        activeKey={activeKeyOfKnowledgeBase}
        onChange={setActiveKeyOfKnowledgeBase}
        defaultActiveKey="1"
      >
        <TabPane
          tab="Add"
          key="1"
          disabled={knowledgeSource}
          className={knowledgeSource ? "blurred-tab" : ""}
        >
          <Form.Item
            label="FILES"
            name="upload"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
          >
            <Alert
              className="mb-2"
              message={<AssistantFileUploadMessage />}
              type="info"
              showIcon
            />
            <Tooltip title="By uploading files, you enable the Agent to use the content from these files for file_search and code interpreter.">
              <Upload {...uploadProps} fileList={fileList}>
                <Button
                  icon={<PaperClipOutlined />}
                  disabled={countTotalFile >= 20}
                >
                  {" "}
                  Add
                </Button>
                {fileList?.length > 0 ? (
                  <p>
                    <b>Files Selected : {fileList?.length}</b>
                  </p>
                ) : (
                  ""
                )}
              </Upload>
            </Tooltip>
          </Form.Item>
        </TabPane>

        <TabPane
          tab="Upload From Knowledge Base"
          key="2"
          // disabled={!knowledgeSource}
          className={!knowledgeSource ? "blurred-tab" : ""}
        >
          <div>
            <p>Knowledge Base</p>
            <RAGTree
              formattedRAGdData={formattedRAGdData}
              formattedPublicFilesData={formattedPublicFilesData}
              selectedTools={form.getFieldValue("tools")}
              knowledgeSource={knowledgeSource}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              setDeletedFileList={setDeletedFileList}
              setDeleteFileIds={setDeleteFileIds}
              assistantData={assistantData}
              editMode={editMode}
              selectedFileKeys={selectedFileKeys}
            />
            <Alert
              className="mb-2"
              message={<AssistantFileUploadMessage />}
              type="info"
              showIcon
            />
            {selectedFile?.length > 0 && (
              <ul className="file-list">
                {form.getFieldValue("tools")?.length > 0 &&
                  form
                    .getFieldValue("tools")
                    .some((tool) =>
                      ["code_interpreter", "file_search", "function"].includes(
                        tool
                      )
                    ) ? (
                  <>
                    <h3>Selected Files</h3>
                    <ul>
                      {selectedFile?.map((file) => (
                        <li key={file?.key} className="file-list-item">
                          {file?.title}
                          <span className="delete-button">
                            <Button
                              onClick={() => handleDelete(file?.key)}
                              icon={<AiOutlineDelete />}
                            />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  (() => {
                    if (selectedFile?.length > 0) {
                      message.error(
                        `Unsupported file type: ${selectedFile[0].title}. Please select files that are supported for your enabled tools.`
                      );
                    }
                    setSelectedFile([]);
                    setSelectedFolders([]);
                    return null;
                  })()
                )}
                <Form.Item
                  name="fileNameList"
                  hidden
                  initialValue={JSON.stringify(selectedFile)}
                >
                  <input type="hidden" />
                </Form.Item>
              </ul>
            )}
          </div>
        </TabPane>
      </Tabs>

      <Form.Item>
        &nbsp;&nbsp;&nbsp;
        {isUploading() && knowledgeSource ? (
          <Alert
            className="mb-2"
            message={
              "It takes some time for files to get indexed. Please wait until we create an RAG Agent for you."
            }
            type="info"
            showIcon
          />
        ) : (
          ""
        )}
        &nbsp;&nbsp;&nbsp;
        <Button
          style={{ display: "block", marginLeft: "auto" }}
          type="primary"
          htmlType="submit"
          // onClick={handleUploadFileAndCreateAssistant}
          loading={isUploading()}
          disabled={countTotalFile >= 21 || selectedFile?.length >= 21}
        >
          {isUploading()
            ? "Loading..."
            : editMode
              ? "Update Agent"
              : "Create Agent"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AssistantForm;
