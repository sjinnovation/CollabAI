import React, { useEffect } from "react";

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
  message,
  Tabs,
  Typography
} from "antd";


import { PaperClipOutlined } from "@ant-design/icons";
import KnowledgeBase from "../../../Pages/KnowledgeBase";
// Custom ConversationStater component
import ConversationStater from "./ConversationStater";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { TreeSelect } from 'antd';

//Constants
import { assistantGptModels } from "../../../constants/AssistanceModelConst";
import { ASSISTANT_CODE_INTERPRETER_NOTE, ASSISTANT_FILE_CREATION_NOTE, ASSISTANT_RETRIEVAL_NOTE } from "../../../constants/FileLIstConstants";
import { useState } from "react";
import { getAllFunctionDefinitions } from "../../../Pages/SuperAdmin/api/functionDefinition";
import { getAllAssistantType } from "../../../api/assistantTypeApi";
import { RAGTree } from "../../KnowledgeBase/RAGTree";
import { FileContext } from "../../../contexts/FileContext";
import { useContext } from "react";
import { Layout } from 'antd';
import './RAGFileList.css';

const { Sider, Content } = Layout;
const { TabPane } = Tabs;
const { Title,Text } = Typography;

// local component
const AssistantFileUploadMessage = () => {
  return <>
    <p>
      {ASSISTANT_FILE_CREATION_NOTE}
    </p>
    <ul>
      <li>
        {ASSISTANT_RETRIEVAL_NOTE}
      </li>
      <li>
        {ASSISTANT_CODE_INTERPRETER_NOTE}
      </li>
    </ul>
  </>
}

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

  } = data;

  const knowledgeBaseSourceInitialValue = editMode ? form.getFieldValue('knowledgeSource') : false;

  const { TextArea } = Input;
  const photoOption = form.getFieldValue('photoOption');
  const [assistantTypes, setAssistantTypes] = useState([]);
  const [functionDefinitions, setFunctionDefinitions] = useState([]);
  const [folderStructure, setFolderStructure] = useState([]);
  const [files, setFiles] = useState([]);
  const [allUsersFileTreeStructure, setAllUsersFileTreeStructure] = useState([]);
  const [previousSelectedKB,setPreviousSelectedKB] = useState([]);
  const [previousUploadedFiles,setPreviousUploadedFiles] = useState([]);
  const [deletedFileList,setDeletedFileList] = useState([]);

  const { selectedFile, setSelectedFile, setSelectedFolders } = useContext(FileContext);
  useEffect(() => {
    if (knowledgeSource) {
      setActiveKeyOfKnowledgeBase('2');
    } else {
      setActiveKeyOfKnowledgeBase('1');
    }
  }, [knowledgeSource]);

  const handleSwitchChangeOfSource = (checked) => {
    setKnowledgeSource(checked);
    form.setFieldsValue({ knowledgeSource: checked });

  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };
  const handleDelete = (key) => {
    if(editMode){
      const fileIds = assistantData?.fileIdsWithKeysOfKnowledgeBase?.filter((file)=> file.key === key);
      setDeleteFileIds((prev) => prev.length ? [...prev, fileIds[0]?.file_id] : [fileIds[0]?.file_id]);
    }


    setSelectedFile(prev => prev.filter(file => file.key !== key));
    setSelectedFolders(prev => prev.filter(folderKey => folderKey !== key));
  }; const formData = new FormData();

  const getAllfunctions = () => {
    getAllFunctionDefinitions(setFunctionDefinitions);
  }

  const handleChange = (newFileList) => {
    if (fileList.length > 0) {
      setCountTotalFile(newFileList.fileList.length);

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

    if(assistantData){
      form.setFieldsValue({
        ...form.getFieldsValue(), // Spread current form values to avoid resetting
        ...assistantData, // Update with any new data
        upload: fileList, // Preserve the fileList by explicitly setting it
      });

    setPreviousSelectedKB(assistantData?.knowledgeBaseInfo);
    setPreviousUploadedFiles(assistantData?.fileNames);
    if(editMode && selectedFile?.length === 0){
      setSelectedFile(assistantData?.knowledgeBaseInfo);
    }
    getAllAssistantType(setAssistantTypes);
    getAllfunctions();
    if (editMode) {
      const knowledgeBaseSourceInitialValue = form.getFieldValue('knowledgeSource');
      setKnowledgeSource(knowledgeBaseSourceInitialValue || false);
    } 
    if(knowledgeSource){
      form.setFieldsValue({tools: []})
    }
  }
  }, [assistantData, form,fileList]);

  //-----Local functions-------//


  const typeArray = [];
  for (let type in assistantTypes) {
    typeArray.push(assistantTypes[type].name);

  }


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
        rules={[
          { required: true, message: "This field is mandatory." },
          {
            pattern: /^[A-Za-z0-9 ]+$/,
            message: "Special characters are not allowed.",
          },
        ]}
      >
        <Input placeholder="Enter name" />
      </Form.Item>

      {assistantData?.image_url ? (
        <Avatar size="large" className="mb-2" src={assistantData?.image_url} />
      ) : (
        null
      )}

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
        <Radio.Group defaultValue={"DEFAULT"}>
          <Radio value="DEFAULT">Default Avatar</Radio>
          <Radio value="UPLOAD">Upload</Radio>
          <Radio value="DALLE">Dall-E</Radio>
        </Radio.Group>
      </Form.Item>
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
          <Upload
            maxCount={1}
            accept="image/*"
            beforeUpload={(file) => {
              const isImage = file.type.startsWith("image/");
              if (!isImage) {
                console.log("You can only upload image files!");
              } else {
                setImage(file);
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
      <Form.Item label="Description" name="description">
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
        <Select>
          {assistantGptModels.map((model) => (
            <Select.Option key={model} value={model}>
              {model}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>




      <Form.Item
        name="knowledgeSource"
        valuePropName="checked"
        tooltip="Knowledge source is uploaded Knowledge Base Files"
        initialValue={editMode ? form.getFieldValue('knowledgeSource') : false}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <span>Retrieval Augmented Generation (RAG)</span>
          <Tooltip title="Knowledge source is uploaded Knowledge Base Files">
            <Switch
              checked={knowledgeSource}

              onChange={(checked) =>
                handleSwitchChangeOfSource(checked)
              }
            />
          </Tooltip>
        </div>
      </Form.Item>


      {!knowledgeSource && <Form.Item
        label="Tools"
        name="tools"
        style={{ display: "flex", flexDirection: "column" }}
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
                handleSwitchChange("function", checked),
                formData.append('functionCalling', checked))
              }
            />
          </Tooltip>
        </div>
      </Form.Item>
      }

      <>
        {form.getFieldValue("tools")?.includes("function") && (
          <Form.Item
            label="Function List"
            name="functions"
            rules={[
              {
                required: form
                  .getFieldValue("tools")
                  ?.includes("function"),
                message: "Please select at least one function",
              },
            ]}
          >

            <Select
              mode="multiple" placeholder="Select functions">
              {
                <>
                  {functionDefinitions?.map((func) => (
                    <>
                      <Select.Option key={func._id} value={JSON.stringify(func)}>
                        {func.name}
                      </Select.Option>
                    </>
                  ))}
                </>
              }
            </Select>
          </Form.Item>
        )}
      </>

      <Tabs activeKey={activeKeyOfKnowledgeBase} onChange={setActiveKeyOfKnowledgeBase} defaultActiveKey="1">
        <TabPane
          tab="Add"
          key="1"
          disabled={knowledgeSource}
          className={knowledgeSource ? 'blurred-tab' : ''}
        >


          <Form.Item
            label="FILES"
            name="upload"
            valuePropName="fileList"
            getValueFromEvent = {(e) => (Array.isArray(e) ? e : e?.fileList)}


          >
            <Alert
              className="mb-2"
              message={<AssistantFileUploadMessage />}
              type="info"
              showIcon
            />
            <Tooltip title="By uploading files, you enable the Agent to use the content from these files for file_search and code interpreter.">
              <Upload {...uploadProps} fileList={fileList}>
                <Button icon={<PaperClipOutlined />} disabled={countTotalFile >= 20}> Add</Button>
                {countTotalFile ? <p><b>Files Selected : {countTotalFile}</b></p> : ""}
              </Upload>
            </Tooltip>
          </Form.Item>
        </TabPane>

        <TabPane
          tab="Upload From Knowledge Base"
          key="2"
          // disabled={!knowledgeSource}
          className={!knowledgeSource ? 'blurred-tab' : ''}
        >
          <div>
            <p>Knowledge Base</p>
            <RAGTree formattedRAGdData={formattedRAGdData} formattedPublicFilesData={formattedPublicFilesData} selectedTools = {form.getFieldValue("tools")} knowledgeSource = {knowledgeSource} />

            {selectedFile && selectedFile.length > 0 && (
              <ul className="file-list">

                {
                  form.getFieldValue("tools").some(tool => ["code_interpreter", "file_search", "function"].includes(tool)) || knowledgeSource ? selectedFile.length > 0 && <h3>Selected File Details</h3> && selectedFile.map(file => (
                    <li key={file.key} className="file-list-item">
                      {file.title}
                      <span className="delete-button">
                            <Button 
                              onClick={() => handleDelete(file.key)} 
                              icon={<AiOutlineDelete />} 
                            />
                      </span>
                    </li>

                  )) : (() => {
                    fileList && message.error(`Unsupported file type: ${selectedFile[0].title} select the files that are supported for your tools enabled.`);
                    setSelectedFile([]);
                    setSelectedFolders([]);
                  })()

                }

                <Form.Item name="fileNameList" hidden initialValue={JSON.stringify(selectedFile)}>
                  <input type="hidden" />
                </Form.Item>
              </ul>
            )}
          </div>
        </TabPane>
      </Tabs>


      <Form.Item>
      &nbsp;&nbsp;&nbsp;
        {isUploading() && knowledgeSource ?
          <Alert
            className="mb-2"
            message={"It takes some time for files to get indexed. Please wait until we create an RAG Agent for you."}
            type="info"
            showIcon
          /> : ''}

        &nbsp;&nbsp;&nbsp;
        <Button
          style={{ display: "block", marginLeft: "auto" }}
          type="primary"
          onClick={handleUploadFileAndCreateAssistant}
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
