import { useState, useEffect, useCallback, useContext } from "react";
import { Form, Tabs, message, Card } from "antd";
import { BsRobot } from "react-icons/bs";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import CommonPageLayout from "../../component/layout/CommonStructure/CommonPageLayout";
import ProfileHeader from "../../component/Proflie/ProfileHeader";
import AssistantForm from "../../component/Assistant/Assistantmodal/AssistantForm";

import { AssistantContext } from "../../contexts/AssistantContext";
import { FileContext } from "../../contexts/FileContext";
import useAssistantFileUpload from "../../Hooks/useAssistantFileUpload";
import useAssistantPage from "../../Hooks/useAssistantPage";
import { getUserID, getUserRole } from "../../Utility/service";
import { getAllKnowledgeBase } from "../../api/knowledgeBase";
import { getFileExtension } from "../../Utility/assistant-helper";
import {
  retrievalFileTypes,
  codeInterpreterFileTypes,
} from "../../constants/FileLIstConstants";
import { axiosSecureInstance } from "../../api/axios";
import { CHECK_SINGLE_ASSISTANTS_INFO } from "../../constants/Api_constants";
import { getAllFunctionDefinitions } from "../SuperAdmin/api/functionDefinition";

const { TabPane } = Tabs;
const userId = getUserID();
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
  imageType: "DEFAULT",
  image_url: "",
  dalleImageDescription: "",
};

const EditAgent = () => {
  const [editAgentForm] = Form.useForm();
  const navigate = useNavigate();
  const backTarget = useLocation().state?.from ?? -1;
  const { assistant_id } = useParams();
  const role = getUserRole();
  const [activeKey, setActiveKey] = useState("unoptimized-data");
  const [assistantData, setAssistantData] = useState({
    ...initialAssistantState,
  });
  const [isFunctionCallingAssistant, setIsFunctionCallingAssistant] =
    useState(false);
  const [formattedRAGdData, setFormattedRAGdData] = useState([]);
  const [formattedPublicFilesData, setFormattedPublicFilesData] = useState([]);
  const [selectedTools, setSelectedTools] = useState([]);
  const [selectedPlugins, setSelectedPlugins] = useState([]);
  const [knowledgeSource, setKnowledgeSource] = useState(false);
  const [activeKeyOfKnowledgeBase, setActiveKeyOfKnowledgeBase] = useState("1");
  const [connectApps, setConnectApps] = useState([]);
  const [isWorkBoardConnected, setIsWorkBoardConnected] = useState(false);
  const [isGoogleDriveConnected, setIsGoogleDriveConnected] = useState(false);
  const [isImportWebPagesConnected, setIsImportWebPagesConnected] =
    useState(false);
  const [enableSync, setEnableSync] = useState(false);
  const [image, setImage] = useState(null);
  const [imageType, setImageType] = useState("DEFAULT");
  const [dalleImageDescription, setDalleImageDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [functionCount, setFunctionCount] = useState(0);
  const [deletedFileList, setDeletedFileList] = useState([]);
  const [functionDefinitionsList, setFunctionDefinitionsList] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { triggerRefetchAssistants } = useContext(AssistantContext);
  const {
    selectedFile,
    setSelectedFile,
    selectedFolders,
    setSelectedFolders,
    deleteFileIds,
    setDeleteFileIds,
  } = useContext(FileContext);

  const { handleFetchUserCreatedAssistants, handleFetchAllAssistants } =
    useAssistantPage();

  const handleDeleteFileId = useCallback(
    (index) => {
      const fileId = assistantData?.file_ids[index];
      setDeleteFileIds((prev) => [...prev, fileId]);
    },
    [assistantData?.file_ids, setDeleteFileIds]
  );

  const getInitialFiles = useCallback(
    () => assistantData?.fileIdsWithName?.map((file) => file.filename) || [],
    [assistantData?.fileIdsWithName]
  );

  const {
    fileList,
    setFileList,
    isUploading,
    handleCreateOrUpdateAssistantWithFiles,
    handleRemoveFile,
    handleAddFile,
    setCountTotalFile,
    countTotalFile,
    totalFileList,
    setTotalFileList,
  } = useAssistantFileUpload(
    handleDeleteFileId,
    selectedTools,
    getInitialFiles
  );

  const transformName = (name) => {
    return name.replace(/_[0-9a-fA-F]+$/, "").replace(/_/g, " ");
  };

  const getAllFunctions = async () => {
    const functionDefinitions = await getAllFunctionDefinitions();
    setFunctionDefinitionsList(functionDefinitions);
  };

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        setLoading(true);

        const metadataResponse = await axiosSecureInstance.get(
          `/api/assistants/getAssistantInfo/${assistant_id}`
        );
        const assistantMetadata = metadataResponse?.data;
        const isFunctionCalling = assistantMetadata?.functionCalling || false;
        setIsFunctionCallingAssistant(isFunctionCalling);

        let myAssistant;
        if (isFunctionCalling) {
          const response = await axiosSecureInstance.get(
            `/api/assistants/getAssistantInfo/${assistant_id}`
          );
          myAssistant = response?.data;
        } else {
          const response = await axiosSecureInstance.get(
            CHECK_SINGLE_ASSISTANTS_INFO(assistant_id)
          );
          myAssistant = response?.data;
        }

        const insertedFunctions =
          myAssistant?.tools?.filter((tool) => tool?.type === "function") || [];
        const functionNames = insertedFunctions?.map(
          (func) => func?.function?.name
        );
        const filteredData =
          functionDefinitionsList?.filter((obj) =>
            functionNames?.some((name) => transformName(name) === obj.name)
          ) || [];
        const functionList =
          filteredData?.map((obj) => JSON.stringify(obj)) || [];

        let knowledgeBaseInfo = [];
        if (myAssistant?.knowledgeBaseInfo) {
          for (let info of myAssistant?.knowledgeBaseInfo) {
            knowledgeBaseInfo.push({ key: info.key, title: info.title });
          }
        }

        const file_ids =
          myAssistant?.file_ids?.filter(
            (id) => !myAssistant?.knowledgeBaseFileIds?.includes(id)
          ) || [];

        let connectApps = myAssistant?.connectApps || [];
        let googleDrive = false;
        let workBoard = false;
        if (connectApps.length > 0 && !connectApps.some(app => app == null)) {
          connectApps.forEach((app) => {
            if ("googleDrive" in app) googleDrive = app.googleDrive || false;
            if ("workBoard" in app) workBoard = app.workBoard || false;
          });
        }

        const filteredAssistantData = {
          assistant_id: myAssistant?.id || "",
          name: myAssistant?.name || "",
          instructions: myAssistant?.instructions || "",
          description: myAssistant?.description || "",
          imageType: myAssistant?.imageType || "DEFAULT",
          image_url: myAssistant?.image_url || "",
          dalleImageDescription: myAssistant?.dalleImageDescription || "",
          userId: userId,
          model: myAssistant?.model || null,
          tools: myAssistant?.tools?.map(({ type }) => type) || [],
          category: myAssistant?.category || "",
          assistantTypes: myAssistant?.assistantTypes || null,
          static_questions: myAssistant?.static_questions || [],
          functions: functionList,
          knowledgeSource: myAssistant?.knowledgeSource || false,
          knowledgeBaseInfo: knowledgeBaseInfo,
          fileNames: myAssistant?.fileNames || [],
          file_ids: file_ids,
          fileIdsWithKeysOfKnowledgeBase:
            myAssistant?.knowledgeBaseFileIdsAndKysOfOpenAI || [],
          fileIdsWithName: myAssistant?.fileIdsWithName || [],
          googleDrive: googleDrive,
          workBoard: workBoard,
          connectApps: connectApps,
          enableSync: myAssistant?.enableSync || false,
          plugins: myAssistant?.plugins || [],
          assistantApiId: myAssistant?.assistantApiId || [],
          assistantApiServiceids: myAssistant?.assistantApiServiceids || [],
          selectedassistantIds: myAssistant?.selectedassistantIds || [],
          selectedWorkflowIds: myAssistant?.selectedWorkflowIds || [],
        };

        setAssistantData(filteredAssistantData);
        setSelectedTools(filteredAssistantData.tools);
        setSelectedPlugins(filteredAssistantData.plugins);
        setFileList(
          (filteredAssistantData.fileIdsWithName || [])
            .filter((file) => !deleteFileIds.includes(file.file_id))
            .map((file) => ({
              uid: file.file_id,
              name: file.filename,
              status: "done",
              url: null,
            }))
        );
        setTotalFileList(myAssistant?.files || []);
        setCountTotalFile(myAssistant?.files?.length || 0);
        setSelectedFile(filteredAssistantData.knowledgeBaseInfo || []);
        setImageType(filteredAssistantData.imageType);
        setDalleImageDescription(filteredAssistantData.dalleImageDescription);
        setKnowledgeSource(filteredAssistantData.knowledgeSource);
        setConnectApps(filteredAssistantData.connectApps);
        setIsWorkBoardConnected(filteredAssistantData.workBoard);
        setIsGoogleDriveConnected(filteredAssistantData.googleDrive);
        setIsImportWebPagesConnected(
          filteredAssistantData.connectApps?.some(
            (app) => app.importWebPages
          ) || false
        );
        setFunctionCount(functionList.length);

        editAgentForm.setFieldsValue({
          name: filteredAssistantData.name,
          instructions: filteredAssistantData.instructions,
          description: filteredAssistantData.description || "",
          tools: filteredAssistantData.tools,
          plugins: filteredAssistantData.plugins,
          model: filteredAssistantData.model,
          category: filteredAssistantData.category,
          static_questions: filteredAssistantData.static_questions,
          photoOption: filteredAssistantData.imageType || "DEFAULT",
          imageType: filteredAssistantData.imageType || "DEFAULT",
          dalleImageDescription: filteredAssistantData.dalleImageDescription,
          functions: filteredAssistantData.functions,
          selectedWorkflowIds: filteredAssistantData.selectedWorkflowIds,
        });
      } catch (error) {
        console.error("Error fetching agent data:", error);
        if (error.response?.status === 404) {
          message.error("Agent not found in OpenAI");
        } else {
          message.error("Failed to load agent data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAgentData();
  }, [assistant_id, editAgentForm, functionDefinitionsList]);

  useEffect(() => {
    getAllFunctions();
  }, [refreshTrigger]);

  useEffect(() => {
    getAllKnowledgeBase()
      .then((response) => {
        const fetchedRAGData = response;
        if (fetchedRAGData?.treeData) {
          setFormattedRAGdData(fetchedRAGData?.treeData);
        }
        if (fetchedRAGData?.publicTreeData) {
          setFormattedPublicFilesData(fetchedRAGData?.publicTreeData);
        }
      })
      .catch((error) => {
        console.error("Error fetching files:", error);
      });
  }, []);

  useEffect(() => {
    const photoOption = editAgentForm.getFieldValue("photoOption");
    if (photoOption && photoOption !== imageType) {
      setImageType(photoOption);
    }
  }, [editAgentForm, imageType]);

  const handleUpdateAssistant = async () => {
    try {
      const formData = new FormData();
      const formValues = editAgentForm.getFieldsValue();
      await editAgentForm.validateFields();

      formData.append("assistantId", assistant_id);
      formData.append("imageType", imageType);
      formData.append("dalleImageDescription", dalleImageDescription);
      formValues.connectApps = JSON.stringify(
        formValues.connectApps || connectApps
      );
      formValues.fileNameList = JSON.stringify(selectedFile);
      formValues.deletedFileList = JSON.stringify(deletedFileList);

      if (image) {
        formData.append("avatar", image);
      }
      fileList.forEach((file) => {
        formData.append("files", file);
      });

      formData.append("connectApps", JSON.stringify(connectApps));
      formData.append("userId", getUserID());

      if (role !== "superadmin") {
        formData.append("category", "PERSONAL");
      }

      Object.entries(formValues).forEach(([key, value]) => {
        if (key === "tools") {
          formData.append("tools", JSON.stringify(value));
        } else if (key === "plugins") {
          formData.append("plugins", JSON.stringify(value));
        } else if (key === "static_questions") {
          formData.append("staticQuestions", JSON.stringify(value));
        } else if (key === "selectedassistantIds") {
          const multiAgentSelected =
          Array.isArray(formValues.functions) &&
          formValues.functions.some((item) => {
            try {
              const obj = typeof item === "string" ? JSON.parse(item) : item;
              return obj.title === "Multi Agent";
            } catch {
              return false;
            }
          });
          if (!multiAgentSelected) {
            formData.append("selectedassistantIds", []);
          }
          else if(value==undefined){
            formData.append("selectedassistantIds", []);
          }else{
              formData.append("selectedassistantIds", JSON.stringify(value));
            }
        } else if (key === "photoOption") {
          formData.append(
            "regenerateWithDalle",
            value === "DALLE" ? "true" : "false"
          );
        } else if (key === "functions") {
          let jsonArray = value.map((item) => JSON.parse(item));
          let jsonString = JSON.stringify(jsonArray);
          formData.append("functionsArray", jsonString);
        } else if (key === "selectedWorkflowIds") {
          formData.append("selectedWorkflowIds", JSON.stringify(value));
        } else {
          formData.append(key, value ?? "");
        }
      });

      if (deleteFileIds.length > 0) {
        formData.append("deleted_files", JSON.stringify(deleteFileIds));
      }

      const success = await handleCreateOrUpdateAssistantWithFiles(
        formData,
        true,
        assistant_id
      );

      if (success) {
        handleFetchUserCreatedAssistants();
        triggerRefetchAssistants();
        if (role === "superadmin") {
          handleFetchAllAssistants(1);
        }
        setFileList([]);
        setCountTotalFile(0);
        setSelectedFile([]);
        setSelectedFolders([]);
        setKnowledgeSource(false);
        setTotalFileList([]);
        setActiveKeyOfKnowledgeBase("1");
        setIsGoogleDriveConnected(false);
        setIsWorkBoardConnected(false);
        setIsImportWebPagesConnected(false);
        setConnectApps([]);
        setEnableSync(false);
        setImage(null);
        setImageType("DEFAULT");
        setDalleImageDescription("");
        setDeleteFileIds([]);
        setDeletedFileList([]);
        editAgentForm.resetFields();
        navigate(backTarget);
      }
    } catch (error) {
      console.error("Error updating agent:", error);
      message.error("Please correct the errors in the form before proceeding.");
    }
  };

  const handleSwitchChange = (tool, checked, functionCount = 0) => {
    const tools = editAgentForm.getFieldValue("tools") || [];
    const isKBFileExist = selectedFile?.some((file) => {
      const fileExtension = getFileExtension(file?.title);
      return (
        (tool === "file_search" &&
          retrievalFileTypes.includes(fileExtension)) ||
        (tool === "code_interpreter" &&
          codeInterpreterFileTypes.includes(fileExtension))
      );
    });

    const isUploadedFileExist = fileList?.some((file) => {
      const fileExtension = getFileExtension(file?.name);
      return (
        (tool === "file_search" &&
          retrievalFileTypes.includes(fileExtension)) ||
        (tool === "code_interpreter" &&
          codeInterpreterFileTypes.includes(fileExtension))
      );
    });

    if (!checked) {
      if (
        (tool === "code_interpreter" || tool === "file_search") &&
        (isKBFileExist || isUploadedFileExist)
      ) {
        return message.error(
          `Please remove relevant files before disabling ${
            tool === "code_interpreter"
              ? "Code interpreter"
              : tool === "file_search"
              ? "File search"
              : tool
          }`
        );
      }
      if (functionCount > 0) {
        return message.error(
          `Please remove relevant functions before disabling ${
            tool === "function" ? "Function Calling" : tool
          } tool`
        );
      }
    }

    const currentDeletedFiles = [...deleteFileIds];
    const updatedTools = checked
      ? [...tools, tool]
      : tools.filter((existingTool) => existingTool !== tool);

    editAgentForm.setFieldsValue({ tools: updatedTools });
    setSelectedTools(updatedTools);
    setAssistantData((prevData) => ({
      ...prevData,
      tools: updatedTools,
    }));
    setDeleteFileIds(currentDeletedFiles);
  };

  const handleSwitchChangeOfPlugin = (plugin, checked) => {
    const plugins = editAgentForm.getFieldValue("plugins") || [];
    const updatedPlugins = checked
      ? [...plugins, plugin]
      : plugins.filter((existingPlugin) => existingPlugin !== plugin);
    editAgentForm.setFieldsValue({ plugins: updatedPlugins });
    setSelectedPlugins(updatedPlugins);
    setAssistantData((prevData) => ({
      ...prevData,
      plugins: updatedPlugins,
    }));
  };

  const handleFormChange = useCallback((changedValues) => {
    setAssistantData((prev) => ({ ...prev, ...changedValues }));
    if (changedValues.photoOption) {
      setImageType(changedValues.photoOption);
    }
  }, []);

  const breadcrumbs = [
    { label: "Home", url: "/" },
    { label: "Agents", url: "/myAgents" },
    ...(backTarget === "/organizationalAgents"
      ? [{ label: "Organizational Agents", url: "/organizationalAgents" }]
      : [{ label: "My Agents", url: "/myAgents" }]),
    { label: "Edit Agent", url: "" },
  ];

  return (
    <CommonPageLayout>
      <ProfileHeader
        title="Edit Agent"
        subHeading="Edit Agent Details"
        breadcrumbs={breadcrumbs}
      />

      <Card loading={loading}>
        <Tabs
          defaultActiveKey="unoptimized-data"
          activeKey={activeKey}
          onChange={setActiveKey}
          className="mb-3 custom-tab"
          tabBarStyle={{ justifyContent: "space-around" }}
          centered
        >
          <TabPane
            key="unoptimized-data"
            tab={
              <div
                style={{
                  display: "flex",
                  gap: ".6rem",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <BsRobot />
                <span>Update Agent</span>
              </div>
            }
          >
            <AssistantForm
              data={{
                form: editAgentForm,
                handleFormChange,
                handleSwitchChange,
                isAdmin: role === "superadmin",
                handleUploadFileAndCreateAssistant: handleUpdateAssistant,
                fileList,
                setFileList,
                setCountTotalFile,
                countTotalFile,
                isUploading,
                handleRemoveFile,
                handleAddFile,
                assistantData,
                setAssistantData,
                editMode: true,
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
                selectedPlugins,
                setSelectedPlugins,
                imageType,
                setImageType,
                dalleImageDescription,
                setDalleImageDescription,
                selectedFile,
                setSelectedFile,
                setSelectedFolders,
                functionCount,
                setFunctionCount,
                deletedFileList,
                setDeletedFileList,
                isFunctionCallingAssistant,
              }}
            />
          </TabPane>
        </Tabs>
      </Card>
    </CommonPageLayout>
  );
};

export default EditAgent;
