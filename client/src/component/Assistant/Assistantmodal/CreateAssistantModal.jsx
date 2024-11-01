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
  const [deleteFileIds, setDeleteFileIds] = useState([]);
  const [selectedTools, setSelectedTools] = useState([]);
  const [knowledgeSource, setKnowledgeSource] = useState(false);
  const [activeKeyOfKnowledgeBase, setActiveKeyOfKnowledgeBase] = useState('1');

  const { triggerRefetchAssistants } = useContext(AssistantContext);
  const { selectedFile, setSelectedFile, selectedFolders, setSelectedFolders,deletedFileList,setDeletedFileList } = useContext(FileContext);

  const role = getUserRole();
  const [image, setImage] = useState(null);

  //----Callback----//
  const handleDeleteFileId = useCallback(
    (index) => {
      const fileId = assistantData?.file_ids[index];
      setDeleteFileIds((prev) => [...prev, fileId]);
    },
    [assistantData.file_ids, setDeleteFileIds]
  );

  const getInitialFiles = useCallback(() => assistantData?.fileNames || [], [assistantData?.fileNames]);

  //------Hooks Declaration ------//
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
    if (isModalClosed ||!showModal) {
      try {
        setFileList([]);
        setCountTotalFile(0);
        setSelectedFile([]);
        setSelectedFolders([]);
        setKnowledgeSource(false);
        form.resetFields();
        setActiveKeyOfKnowledgeBase('1');
        setTotalFileList([]);
      } catch (error) {
        console.error("Error resetting modal data:", error);
      }
    }
  }, [isModalClosed,showModal]);
  

  useEffect(() => {
    form.setFieldsValue(assistantData);
    const newSelectedTools = assistantData?.tools?.map((tool) => tool) || [];
    setSelectedTools(newSelectedTools);

    if(editMode && fileList.length === 0){
      setFileList((assistantData.fileIdsWithName || []).map(file => ({
        uid: file.file_id,
        name: file.filename,
        status: 'done',  // Assume files are already uploaded
        url: null,   // URL to the uploaded file
      })));
    }
    form.setFieldsValue({knowledgeSource : knowledgeSource});
    if (editMode && assistantData?.knowledgeBaseInfo?.length > 0) {
      setSelectedFile(() => [...assistantData?.knowledgeBaseInfo]);
    }
    //cleanup
    return () => {
      setDeleteFileIds([]);
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
      formValues.fileNameList = JSON.stringify(selectedFile);
      if(editMode){
        formValues.deletedFileList = JSON.stringify(deletedFileList);
        setDeleteFileIds([]);
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
        } else if (key === "static_questions") {
          formData.append("staticQuestions", JSON.stringify(value));
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
        setActiveKeyOfKnowledgeBase('1');
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
  const handleSwitchChange = (tool, checked) => {
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
          {<TabPane
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
              }}
            />
          </TabPane>}

          {/* {isAdmin && ((editMode && isFunctionCallingAssistant === true) || !editMode)? (<TabPane
                key="create-assistant-by-functionCalling"
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
                <span>{editMode ? "Update Function Calling Assistant" : "New Function Calling Assistant"}</span>
              </div>
            }
              >
            <FunctionCallingAssistantForm
              data={{
                form,
                handleFunctionCallingFormChange,
                handleSwitchChange,
                isAdmin,
                fileList,
                isUploading,
                handleRemoveFile,
                handleAddFile,
                handleFetchFunctionCallingAssistants,
                assistantData,
                setAssistantData,
                editMode,
                assistantFunctionCallData,
                setAssistantFunctionCallData,
                
                handleClose,
              }}
            /> 
          </TabPane>): null} */}


          {role == 'superadmin' && (editMode ? null : (
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
                <Form.Item style={{ width: '100%' }} label="Agent ID" name="assistantId">
                  <Input placeholder="Enter  Agent ID" />
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
          ))}
        </Tabs>
      </Modal>
    </>
  );
};

export default CreateAssistantModal;
