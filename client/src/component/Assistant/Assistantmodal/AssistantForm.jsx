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
} from "antd";
import { PaperClipOutlined } from "@ant-design/icons";

// Custom ConversationStater component
import ConversationStater from "./ConversationStater";

//Constants
import { assistantGptModels } from "../../../constants/AssistanceModelConst";
import { ASSISTANT_CODE_INTERPRETER_NOTE, ASSISTANT_FILE_CREATION_NOTE, ASSISTANT_RETRIEVAL_NOTE } from "../../../constants/FileLIstConstants";

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
    editMode,
    handleFormChange,
    handleSwitchChange,
    isAdmin,
    handleUploadFileAndCreateAssistant,
    fileList,
    isUploading,
    handleRemoveFile,
    handleAddFile,
    assistantData,
    setAssistantData,
  } = data;
  const { TextArea } = Input;

  //------Side effects---------//
  useEffect(() => {
    form.setFieldsValue(assistantData);
  }, [assistantData, form]);

  //-----Local functions-------//
  const uploadProps = {
    onRemove: handleRemoveFile,
    beforeUpload: handleAddFile,
    fileList,
  };

  return (
    <Form
      form={form}
      onValuesChange={handleFormChange}
      onFinish={handleUploadFileAndCreateAssistant}
      layout="vertical"
    >
      {editMode ? (
        <Form.Item label="Assistant Id" name="assistant_id">
          <>{assistantData?.assistant_id}</>
        </Form.Item>
      ) : null}
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
          style={{ resize: "vertical", scrollbarWidth: 'thin', scrollbarColor: '#888 #41414e' }}
          rows={3}
          placeholder="You are a helpful assistant."
        />
      </Form.Item>
      <Form.Item label="Description" name="description">
        <TextArea
          style={{ resize: "vertical", scrollbarWidth: 'thin', scrollbarColor: '#888 #41414e' }}
          rows={2}
          placeholder="Enter Description"
        />
      </Form.Item>
      {isAdmin && (
        <Form.Item
          label="Select type"
          name="category"
          rules={[
            {
              required: true,
              message: "Please Select the type of assistant",
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
          staticQuestions={assistantData.static_questions}
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
          <Tooltip title="Code Interpreter enables the assistant to write and run code. This tool can process files with diverse data and formatting, and generate files such as graphs.">
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
          }}
        >
          <span>Retrieval</span>
          <Tooltip title="Retrieval enables the assistant with knowledge from files that you or your users upload. Once a file is uploaded, the assistant automatically decides when to retrieve content based on user requests.">
            <Switch
              checked={form.getFieldValue("tools")?.includes("retrieval")}
              onChange={(checked) => handleSwitchChange("retrieval", checked)}
            />
          </Tooltip>
        </div>
      </Form.Item>

      <Form.Item
        label="FILES"
        name="upload"
        valuePropName="fileList"
        getValueFromEvent={(e) => {
          if (Array.isArray(e)) {
            return e;
          }
          return e && e.fileList;
        }}
      >
        {/* ----- NOTES FOR ASSISTANT FILE */}
        <Alert
          className="mb-2"
          message={<AssistantFileUploadMessage />}
          type="info"
          showIcon
        />
        <Tooltip title="By uploading files, you enable the assistant to use the content from these files for retrieval and code interpreter.">
          <Upload {...uploadProps} maxCount={5}>
            <Button icon={<PaperClipOutlined />}> Add</Button>
          </Upload>
        </Tooltip>
      </Form.Item>
      <Form.Item>
        <Button
          style={{ display: "block", marginLeft: "auto" }}
          type="primary"
          onClick={handleUploadFileAndCreateAssistant}
          loading={isUploading()}
        >
          {isUploading()
            ? "Loading..."
            : editMode
            ? "Update Assistant"
            : "Create Assistant"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AssistantForm;
