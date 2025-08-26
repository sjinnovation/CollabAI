import { useState, useEffect, useContext, useCallback } from "react";
import { Button, Form, Tabs, message, Input, Radio, Card } from "antd";
import { BsRobot } from "react-icons/bs";
import { FaHashtag } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

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

const { TabPane } = Tabs;
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
  dalleImageDescription: "",
};

const CreateAgent = () => {
  const [newAgentForm] = Form.useForm();
  const [agentIdForm] = Form.useForm();
  const navigate = useNavigate();
  const role = getUserRole();
  const [activeKey, setActiveKey] = useState("unoptimized-data");
  const [assistantData, setAssistantData] = useState({
    ...initialAssistantState,
  });
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [functionCount, setFunctionCount] = useState(0);

  const { triggerRefetchAssistants } = useContext(AssistantContext);
  const {
    selectedFile,
    setSelectedFile,
    selectedFolders,
    setSelectedFolders,
    deletedFileList,
    setDeletedFileList,
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
    () => assistantData?.fileNames || [],
    [assistantData?.fileNames]
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

    setFileList([]);
    setCountTotalFile(0);
    setSelectedFile([]);
    setSelectedFolders([]);
    setKnowledgeSource(false);
    newAgentForm.resetFields();
    setActiveKeyOfKnowledgeBase("1");
    setTotalFileList([]);
    setIsGoogleDriveConnected(false);
    setIsWorkBoardConnected(false);
    setIsImportWebPagesConnected(false);
    setConnectApps([]);
    setEnableSync(false);
    setImage(null);
    setImageType("DEFAULT");
    setDeleteFileIds([]);
    setDeletedFileList([]);
  }, [newAgentForm]);

  const handleUploadFileAndCreateAssistant = async () => {
    try {
      let formData = new FormData();
      let formValues;

      if (activeKey === "unoptimized-data") {
        // Handle "New Agent" tab submission
        formValues = newAgentForm.getFieldsValue();
        await newAgentForm.validateFields();

        formData.append("imageType", imageType);
        formData.append("dalleImageDescription", dalleImageDescription);
        formValues.connectApps = JSON.stringify(formValues.connectApps);
        formValues.fileNameList = JSON.stringify(selectedFile);

        if (image) {
          formData.append("avatar", image);
        }
        fileList.forEach((file) => {
          formData.append("files", file);
        });

        let connectApps = [];

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
            if(value==undefined){
              formData.append("selectedassistantIds", []);
            }else{
              formData.append("selectedassistantIds", JSON.stringify(value));
            }
          } else if (key === "photoOption") {
            formData.append(
              "generateDalleImage",
              value === "DALLE" ? "true" : "false"
            );
          } else if (key === "functions") {
            let jsonArray = value.map((item) => JSON.parse(item));
            let jsonString = JSON.stringify(jsonArray);
            formData.append("functionsArray", jsonString);
          } else if (key === "selectedWorkflowIds") {
            formData.append("selectedWorkflowIds", JSON.stringify(value));
          } else {
            formData.append(key, value);
          }
        });
      } else {
        // Handle "New Agent by ID" tab submission
        formValues = agentIdForm.getFieldsValue();
        await agentIdForm.validateFields();

        formData.append("assistantId", formValues.assistantId);
        formData.append("category", formValues.category);
        formData.append("userId", getUserID());
      }

      const success = await handleCreateOrUpdateAssistantWithFiles(
        formData,
        false
      );

      if (success) {
        handleFetchUserCreatedAssistants();
        triggerRefetchAssistants();
        if (role === "superadmin") {
          handleFetchAllAssistants(1);
        }
        if (activeKey === "unoptimized-data") {
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
          newAgentForm.resetFields();
        } else {
          agentIdForm.resetFields();
        }
        navigate("/myAgents");
      }
    } catch (error) {
      message.error("Please correct the errors in the form before proceeding.");
    }
  };

  const handleSwitchChange = (tool, checked, functionCount = 0) => {
    const tools = newAgentForm.getFieldValue("tools") || [];
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

    newAgentForm.setFieldsValue({ tools: updatedTools });
    setSelectedTools(updatedTools);
    setAssistantData((prevData) => ({
      ...prevData,
      tools: updatedTools,
    }));
    setDeleteFileIds(currentDeletedFiles);
  };

  const handleSwitchChangeOfPlugin = (plugin, checked) => {
    const plugins = newAgentForm.getFieldValue("plugins") || [];
    const updatedPlugins = checked
      ? [...plugins, plugin]
      : plugins.filter((existingPlugin) => existingPlugin !== plugin);
    newAgentForm.setFieldsValue({ plugins: updatedPlugins });
    setSelectedPlugins(updatedPlugins);
    setAssistantData((prevData) => ({
      ...prevData,
      plugins: updatedPlugins,
    }));
  };

  const handleFormChange = useCallback((changedValues) => {
    setAssistantData((prev) => ({ ...prev, ...changedValues }));
  }, []);

  return (
    <CommonPageLayout>
      <ProfileHeader
        title="Create Agent"
        subHeading="Create your own agents."
        breadcrumbs={[
          { label: "Home", url: "/" },
          { label: "Agents", url: "/myAgents" },
          { label: "My Agents", url: "/myAgents" },
          { label: "Create Agent", url: "" },
        ]}
      />
      <Card>
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
                <span>New Agent</span>
              </div>
            }
          >
            <AssistantForm
              data={{
                form: newAgentForm,
                handleFormChange,
                handleSwitchChange,
                isAdmin: role === "superadmin",
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
                editMode: false,
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
                isModalOpen,
                setIsModalOpen,
                loading,
                setLoading,
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
              }}
            />
          </TabPane>
          {/* {role === "superadmin" && (
            <TabPane
              key="optimized-data"
              tab={
                <div
                  style={{
                    display: "flex",
                    gap: ".6rem",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <FaHashtag />
                  <span>New Agent by ID</span>
                </div>
              }
            >
              <Form
                form={agentIdForm}
                layout="vertical"
                style={{ width: "100%" }}
                onFinish={handleUploadFileAndCreateAssistant}
              >
                <Form.Item
                  style={{ width: "100%" }}
                  label="Agent ID"
                  name="assistantId"
                  rules={[{ required: true, message: "Please enter Agent ID" }]}
                >
                  <Input placeholder="Enter Agent ID" />
                </Form.Item>
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
                <Form.Item>
                  <Button
                    style={{ display: "block", marginLeft: "auto" }}
                    type="primary"
                    htmlType="submit"
                  >
                    Create Agent
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
          )} */}
        </Tabs>
      </Card>
    </CommonPageLayout>
  );
};

export default CreateAgent;
