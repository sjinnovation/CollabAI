import React, { useState, useEffect, useCallback, useContext } from "react";

//libraries
import { Button, Input, Radio, Tabs, Modal, Form, message } from "antd";
import { BsRobot } from "react-icons/bs";
import { FaHashtag } from "react-icons/fa6";

//Hooks
import useAssistantFileUpload from "../../../Hooks/useAssistantFileUpload";

//Components
import AssistantForm from "./AssistantForm";
import { getUserID, getUserRole } from "../../../Utility/service";
import { AssistantContext } from "../../../contexts/AssistantContext";
import FunctionCallingAssistantForm from "./FunctionCallingAssistantForm";
import { FileContext } from "../../../contexts/FileContext";
import "../Assistant.css";
import { getFileExtension } from "../../../Utility/assistant-helper";
import { codeInterpreterFileTypes, retrievalFileTypes } from "../../../constants/FileLIstConstants";

const { TabPane } = Tabs;

const CreateAssistantModal = ({ data }) => {
  const {
    assistantData,
    setAssistantData,
    assistantFunctionCallData,
    setAssistantFunctionCallData,
    showModal,
    handleClose,
    editMode,
    isAdmin,
    handleFetchUserCreatedAssistants,
    handleFetchAllAssistants,
    handleFetchFunctionCallingAssistants,
    isFunctionCallingAssistant,
    activeKey,
    setActiveKey,
    formattedRAGdData,
    formattedPublicFilesData,
    isModalClosed,
  } = data;

  const [form] = Form.useForm();
  const [selectedTools, setSelectedTools] = useState([]);
  const [selectedPlugins, setSelectedPlugins] = useState([]);

  const [knowledgeSource, setKnowledgeSource] = useState(false);
  const [activeKeyOfKnowledgeBase, setActiveKeyOfKnowledgeBase] = useState('1');
  const [connectApps, setConnectApps] = useState([]);
  const [isWorkBoardConnected, setIsWorkBoardConnected] = useState(false);
  const [isGoogleDriveConnected, setIsGoogleDriveConnected] = useState(false);
  const [isImportWebPagesConnected, setIsImportWebPagesConnected] = useState(false);
  const [enableSync, setEnableSync] = useState(false);

  const { triggerRefetchAssistants } = useContext(AssistantContext);
  const { selectedFile, setSelectedFile, selectedFolders, setSelectedFolders, deletedFileList, setDeletedFileList,deleteFileIds, setDeleteFileIds } = useContext(FileContext);
  const [functionCount, setFunctionCount] = useState(0);
  const role = getUserRole();
  const [image, setImage] = useState(null);
  const [imageType, setImageType] = useState("DEFAULT");
  const [dalleImageDescription, setDalleImageDescription] = useState("");

  //----Callback----//
  const handleDeleteFileId = useCallback(
    (index) => {
      const fileId = assistantData?.file_ids[index];
      setDeleteFileIds((prev) => [...prev, fileId]);
    },
    [assistantData.file_ids, setDeleteFileIds]
  );
  const getInitialFiles = useCallback(
    () => assistantData?.fileNames || [],
    [assistantData?.fileNames]
  );

  // ------Hooks Declaration ------
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
    setTotalFileList
  } = useAssistantFileUpload(
    handleDeleteFileId,
    selectedTools,
    getInitialFiles
  );
  //--Side Effects---//
  useEffect(() => {
    if (isModalClosed || !showModal) {
      try {
        setFileList([]);
        setCountTotalFile(0);
        setSelectedFile([]);
        setSelectedFolders([]);
        setKnowledgeSource(false);
        form.resetFields();
        setActiveKeyOfKnowledgeBase("1");
        setTotalFileList([]);
        setIsGoogleDriveConnected(false);
        setIsWorkBoardConnected(false);
        setIsImportWebPagesConnected(false);
        setConnectApps([]);
        setEnableSync(false);
        setImage(null);
        setImageType("DEFAULT");
      } catch (error) {
        console.error("Error resetting modal data:", error);
      }
    }
  }, [isModalClosed, showModal]);


  useEffect(() => {
    form.setFieldsValue(assistantData);
    const newSelectedTools = assistantData?.tools?.map((tool) => tool) || [];
    setSelectedTools(newSelectedTools);
    if (editMode && fileList.length === 0) {
      setFileList((assistantData.fileIdsWithName || [])
      .filter(file => !deleteFileIds.includes(file.file_id))
      .map(file => ({
        uid: file.file_id,
        name: file.filename,
        status: 'done',  // Assume files are already uploaded
        url: null,   // URL to the uploaded file
      })));
    }
    form.setFieldsValue({ knowledgeSource: knowledgeSource });

    if (editMode && assistantData?.dalleImageDescription) {
      setDalleImageDescription(assistantData.dalleImageDescription); 
    }

    // Only set selected files if we haven't already tracked them as deleted
    const nonDeletedFiles = assistantData?.knowledgeBaseInfo?.filter(
      file => !deletedFileList.includes(file.key)
    );
    
    // Only update selectedFile if it's empty or different from current
    if (!selectedFile?.length || JSON.stringify(selectedFile) !== JSON.stringify(nonDeletedFiles)) {
      setSelectedFile(nonDeletedFiles || []);
    }
    if (editMode && assistantData?.connectApps) {
      setConnectApps(assistantData?.connectApps);
      setIsGoogleDriveConnected(assistantData?.googleDrive);
      setIsWorkBoardConnected(assistantData?.workBoard);
    }
    if (editMode && assistantData?.enableSync) {
      setEnableSync(assistantData?.enableSync);
    }
  }, [assistantData, form]);



  //------Api calls --------//
  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };
  
  const handleUploadFileAndCreateAssistant = async () => {
    try {
      const formData = new FormData();
      const formValues = form.getFieldsValue();
      formData.append("imageType", imageType);
      formData.append("dalleImageDescription", dalleImageDescription);
      formValues.connectApps = JSON.stringify(formValues.connectApps);
      formValues.fileNameList = JSON.stringify(selectedFile);

      
      // formValues.enableSync = formValues?.enableSync
      if (editMode) {
        formValues.deletedFileList = JSON.stringify(deletedFileList);
      }

      if (!formValues.assistantId && !editMode) {
        await form.validateFields();
      }

      if (image) {
        formData.append('avatar', image);
      }
      fileList.forEach((file) => {
        formData.append("files", file);
      });

      if (deleteFileIds.length > 0) {
        formData.append("deleted_files", JSON.stringify(deleteFileIds));
      }
      formData.append("userId", getUserID());
      if (!isAdmin) {
        formData.append("category", "PERSONAL");
      }

      Object.entries(formValues).forEach(([key, value]) => {
        if (key === "tools") {
          formData.append("tools", JSON.stringify(value));
        } else if (key === "plugins") {
          formData.append("plugins", JSON.stringify(value));
        }
        else if (key === "static_questions") {
          formData.append("staticQuestions", JSON.stringify(value));
        } else if (key === "selectedassistantIds") {
            if(value==undefined){
              formData.append("selectedassistantIds", []);
            }else{
              formData.append("selectedassistantIds", JSON.stringify(value));
            }
        } else if (key === "photoOption") {
          if (editMode) {
            formData.append("regenerateWithDalle", value === "DALLE" ? "true" : "false");
          } else {
            formData.append("generateDalleImage", value === "DALLE" ? "true" : "false");
          }
        } else if (key === "functions") {
          let jsonArray = value.map(item => JSON.parse(item)); // Convert each item in the array from string to JSON
          let jsonString = JSON.stringify(jsonArray);
          formData.append("functionsArray", jsonString);
        }
        else {
          formData.append(key, value);
        }

      });

      const success = await handleCreateOrUpdateAssistantWithFiles(
        formData,
        editMode,
        assistantData?.assistant_id
      );

      if (success) {

        handleClose();
        handleFetchUserCreatedAssistants();
        if (editMode) {
          // update assistant list
          triggerRefetchAssistants();
        }
        if (isAdmin) {
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
        setDeleteFileIds([]);
        setDeletedFileList([]);
        form.resetFields();
      }
    } catch (error) {
      message.error("Please correct the errors in the form before proceeding.");
    }
  };

  //----Local Functions--------//
  const handleFormChange = (changedValues, allValues) => {
    setAssistantData((prevData) => ({
      ...prevData,
      ...changedValues,
    }));
  };

  const handleFunctionCallingFormChange = (changedValues, allValues) => {
    setAssistantFunctionCallData((prevData) => ({
      ...prevData,
      ...changedValues,
    }));
  };

  const handleSwitchChangeOfKnowledgeBase = (tool, checked) => {
    const tools = form.getFieldValue("tools") || [];

    const updatedTools = checked
      ? [...tools, tool]
      : tools.filter((existingTool) => existingTool !== tool);
    form.setFieldsValue({ tools: updatedTools });
    setSelectedTools([updatedTools])

    setAssistantData((prevData) => ({
      ...prevData,
      tools: updatedTools
    }));
  };

  const handleSwitchChange = (tool, checked, functionCount = 0) => {
  const tools = form.getFieldValue("tools") || [];
  const isKBFileExist = selectedFile?.some(file => {
    const fileExtension = getFileExtension(file?.title);
    return (
      (tool === 'file_search' && retrievalFileTypes.includes(fileExtension)) ||
      (tool === 'code_interpreter' && codeInterpreterFileTypes.includes(fileExtension))
    );
  });

  // Check files in fileList (Uploaded files)
  const isUploadedFileExist = fileList?.some(file => {
    const fileExtension = getFileExtension(file?.name);
    return (
      (tool === 'file_search' && retrievalFileTypes.includes(fileExtension)) ||
      (tool === 'code_interpreter' && codeInterpreterFileTypes.includes(fileExtension))
    );
  });
    
  
    if (!checked) {
      if ((tool === "code_interpreter" || tool === "file_search") && (isKBFileExist || isUploadedFileExist)) {
        return message.error(`Please remove relevant files before disabling ${tool === "code_interpreter" ? "Code interpreter" : tool === "file_search" ? "File search" : tool}`);
      }
      
      if (functionCount > 0) {
        return message.error(`Please remove relevant functions before disabling ${tool === "function" ? "Function Calling" : tool} tool`);
      }
    }
    // Store current deleteFileIds before updating tools
    const currentDeletedFiles = [...deleteFileIds];
    const updatedTools = checked
      ? [...tools, tool]
      : tools.filter(existingTool => existingTool !== tool);
  
    form.setFieldsValue({ tools: updatedTools });
    setSelectedTools([updatedTools]);

    setAssistantData(prevData => ({
      ...prevData,
      tools: updatedTools,
    }));
    // Restore deleteFileIds after tool update
    setDeleteFileIds(currentDeletedFiles);
  };
  
  const handleSwitchChangeOfPlugin = (plugin, checked) => {
    const plugins = form.getFieldValue("plugins") || [];

    const updatedPlugins = checked
      ? [...plugins, plugin]
      : plugins.filter((existingPlugins) => existingPlugins !== plugin);
    form.setFieldsValue({ plugins: updatedPlugins });
    setSelectedPlugins([updatedPlugins])

    setAssistantData((prevData) => ({
      ...prevData,
      plugins: updatedPlugins
    }));
  };

  function handleTabChange(key) {
    setActiveKey(key);
  }

  return (
    <>
      <Modal
        title={editMode ? "" : "Create Agent"}
        open={showModal}
        onCancel={handleClose}
        afterClose={() => setActiveKey("unoptimized-data")}
        okButtonProps={{
          disabled: true,
        }}
        cancelButtonProps={{
          disabled: true,
        }}
        width={700}
        footer={null}
      >
        <Tabs
          defaultActiveKey="unoptimized-data"
          activeKey={activeKey}
          onChange={handleTabChange}
          className="mb-3 custom-tab"
          tabBarStyle={{ justifyContent: "space-around" }}
          centered
        >
          {
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
                  {editMode ? "" : <BsRobot />}
                  <span>{editMode ? "Update Agent" : "New Agent"}</span>
                </div>
              }
            >
              <AssistantForm
                data={{
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
                  selectedPlugins,
                  setSelectedPlugins,
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
                }}
              />
            </TabPane>
          }

          {/* {role === "superadmin" && (editMode ? null : (
            <TabPane
              key={"optimized-data"}
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
                form={form}
                layout="vertical"
                style={{
                  width: "100%",
                }}
              >
                <Form.Item
                  style={{ width: "100%" }}
                  label="Agent ID"
                  name="assistantId"
                >
                  <Input placeholder="Enter Agent ID" />
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
                <Form.Item label=" " colon={false}>
                  <Button
                    style={{ display: 'block', marginLeft: 'auto' }}
                    type="primary"
                    onClick={handleUploadFileAndCreateAssistant}
                  >
                    Create Agent
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
          ))} */}
        </Tabs>
      </Modal>
    </>
  );
};

export default CreateAssistantModal;
