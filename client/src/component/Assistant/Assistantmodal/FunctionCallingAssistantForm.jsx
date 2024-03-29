import React, { useEffect, useState } from "react";
import { message } from "antd";

//libraries
// import {
//   // Form,
//   Input,
// } from "antd";

import {
  Form,
  Space,
  Input,
  List,
  Button,
  Switch,
  Card,
  Row,
  Col,
  Checkbox,
  Select,
  Typography,
} from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";

import {
  ASSISTANT_CODE_INTERPRETER_NOTE,
  ASSISTANT_FILE_CREATION_NOTE,
  ASSISTANT_RETRIEVAL_NOTE,
} from "../../../constants/FileLIstConstants";
import {
  updateFunctionCallingAssistant,
  createAssistantWithFunctionCalling,
} from "./api/assistant_functionCallingCreation";
import "./functionCallingAssForm.css";
import { fetchAllAssistant } from "../../../Pages/SuperAdmin/api/functionCallingAssistant";

//Hooks
import { useAssistantContext } from "../../../contexts/AssistantsFetchContext";

// // local component
// const AssistantFileUploadMessage = () => {
//   return <>
//   <p>
//     {ASSISTANT_FILE_CREATION_NOTE}
//   </p>
//   <ul>
//     <li>
//     {ASSISTANT_RETRIEVAL_NOTE}
//     </li>
//     <li>
//     {ASSISTANT_CODE_INTERPRETER_NOTE}
//     </li>
//   </ul>
//   </>
// }

const FunctionCallingAssistantForm = ({ data }) => {
  const {
    handleFunctionCallingFormChange,

    fileList,

    handleRemoveFile,
    handleAddFile,

    editMode,
    assistantFunctionCallData,
    setAssistantFunctionCallData,
    handleClose,
    handleFetchFunctionCallingAssistants,
  } = data;
  const { TextArea } = Input;
  const { Option } = Select;
  const { Title } = Typography;
  const [form] = Form.useForm();

  //------Side effects---------//
  useEffect(() => {
    form.setFieldsValue({
      name: assistantFunctionCallData.name,
      instructions: assistantFunctionCallData.instructions,
      description: assistantFunctionCallData.description,
      userSelectedModel: assistantFunctionCallData.userSelectedModel,
      tools: assistantFunctionCallData.tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        parameters: {
          properties: Object.entries(tool.parameters.properties).map(
            ([propName, propValue]) => ({
              name: propName,
              type: propValue.type,
              description: propValue.description,
              required: tool.parameters.required.includes(propName),
            })
          ),
        },
      })),
    });
  }, [assistantFunctionCallData, form]);

  //-----Local functions-------//
  const uploadProps = {
    onRemove: handleRemoveFile,
    beforeUpload: handleAddFile,
    fileList,
  };

  //Hooks
  const { setAllAssistants } = useAssistantContext();
  const [assistant, setAssistant] = useState();

  const [isFunctionCallingAssUploading, setIsFunctionCallingAssUploading] =
    useState(false);
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setIsFunctionCallingAssUploading(true);
      if (!editMode) {
        const response = await createAssistantWithFunctionCalling(
          assistantFunctionCallData
        );
        if (response) {
          console.log(response.data.assistant);
          setIsFunctionCallingAssUploading(false);
          message.success("Assistant created Successfully");
          setAssistant(response.data.assistant);
          handleClose();
          handleFetchFunctionCallingAssistants();
          setAssistantFunctionCallData({
            name: "",
            instructions: "",
            description: "",
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
          });
          fetchAllAssistant(setAllAssistants);
        }
      } else {
        const response = await updateFunctionCallingAssistant(
          assistantFunctionCallData
        );
        if (response) {
          setIsFunctionCallingAssUploading(false);
          handleClose();
          console.log(response.data.assistant);
          message.success("Assistant updated Successfully");
          handleFetchFunctionCallingAssistants();
          setAssistantFunctionCallData({
            name: "",
            instructions: "",
            description: "",
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
          });
          fetchAllAssistant(setAllAssistants);
        }
      }
    } catch (error) {
      console.error("Error sending data to backend:", error);
      message.error("Something went wrong");
    }
  };

  const addTool = () => {
    setAssistantFunctionCallData((prevData) => ({
      ...prevData,
      tools: [
        ...prevData.tools,
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
    }));
  };

  const removeTool = (index) => {
    setAssistantFunctionCallData((prevData) => ({
      ...prevData,
      tools: prevData.tools.filter((_, i) => i !== index),
    }));
  };

  const [newPropertyName, setNewPropertyName] = useState();

  const handleToolInputChange = (index, field, value) => {
    setAssistantFunctionCallData((prevData) => ({
      ...prevData,
      tools: prevData.tools.map((tool, i) =>
        i === index ? { ...tool, [field]: value } : tool
      ),
    }));
  };

  const handleRequiredChange = (toolIndex, propName) => {
    setAssistantFunctionCallData((prevData) => {
      const updatedTools = prevData.tools.map((tool, i) =>
        i === toolIndex
          ? {
              ...tool,
              parameters: {
                ...tool.parameters,
                required: tool.parameters.required.includes(propName)
                  ? tool.parameters.required.filter((prop) => prop !== propName)
                  : [...tool.parameters.required, propName],
              },
            }
          : tool
      );

      return {
        ...prevData,
        tools: updatedTools,
      };
    });
  };

  const handlePropertyInputChange = (
    toolIndex,
    propName,
    propField,
    propValue
  ) => {
    setAssistantFunctionCallData((prevData) => {
      const updatedTools = prevData.tools.map((tool, i) =>
        i === toolIndex
          ? {
              ...tool,
              parameters: {
                ...tool.parameters,
                properties: {
                  ...tool.parameters.properties,
                  [propName]: {
                    ...tool.parameters.properties[propName],
                    [propField]: propValue,
                  },
                },
              },
            }
          : tool
      );

      return {
        ...prevData,
        tools: updatedTools,
      };
    });
  };

  const addProperty = (toolIndex, newPropertyName) => {
    console.log("eeeeee");
    setAssistantFunctionCallData((prevData) => {
      const updatedTools = prevData.tools.map((tool, i) =>
        i === toolIndex
          ? {
              ...tool,
              parameters: {
                ...tool.parameters,
                properties: {
                  ...tool.parameters.properties,
                  [newPropertyName]: {
                    type: "string",
                    description: "",
                  },
                },
              },
            }
          : tool
      );

      return {
        ...prevData,
        tools: updatedTools,
      };
    });
  };

  const handleNewPropertyNameChange = (event) => {
    setNewPropertyName(event.target.value);
  };

  const handleAddPropertyClick = (toolIndex) => {
    if (newPropertyName) {
      // Check if newPropertyName is not empty
      addProperty(toolIndex, newPropertyName);
      setNewPropertyName("");
    } else {
      message.error("Property name is required.");
    }
  };

  const renderPropertyInputs = (toolIndex) => {
    const tool = assistantFunctionCallData.tools[toolIndex];

    return (
      <div>
        {Object.entries(tool.parameters.properties).map(
          ([propName, propValue], propIndex) => (
            <div key={propIndex} className="mb-3 card card-body propContainer">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="font-weight-bold">{propName}:</span>
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => removeProperty(toolIndex, propName)}
                >
                  Remove Property
                </button>
              </div>

              <div className="mb-2">
                <label className="form-label">Type:</label>
                <select
                  className="form-control inputField"
                  name={`${toolIndex}_${propName}_type`}
                  value={propValue.type}
                  onChange={(event) =>
                    handlePropertyInputChange(
                      toolIndex,
                      propName,
                      "type",
                      event.target.value
                    )
                  }
                >
                  <option value="array">array</option>
                  <option value="number">number</option>
                  <option value="string">string</option>
                </select>
              </div>

              <div className="mb-2">
                <label className="form-label">Instructions:</label>
                <input
                  type="text"
                  className="form-control inputField"
                  name={`${toolIndex}_${propName}_description`}
                  value={propValue.description}
                  onChange={(event) =>
                    handlePropertyInputChange(
                      toolIndex,
                      propName,
                      "description",
                      event.target.value
                    )
                  }
                  placeholder="Description"
                />
              </div>

              <div className="form-check form-switch">
                <input
                  type="checkbox"
                  className="form-check-input"
                  name={`${toolIndex}_${propName}_required`}
                  id={`${toolIndex}_${propName}_required`}
                  checked={tool.parameters.required.includes(propName)}
                  onChange={() => handleRequiredChange(toolIndex, propName)}
                />
                <label
                  className="form-check-label"
                  htmlFor={`${toolIndex}_${propName}_required`}
                >
                  Required
                </label>
              </div>
            </div>
          )
        )}
      </div>
    );
  };

  const renderToolInputs = () => {
    return (
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {assistantFunctionCallData.tools.map((tool, index) => (
          <Card key={index} className="mb-4 p-3 border rounded functionContainer">
            {/*Remove button functionality */}
            {/* <Button
              type="danger"
              onClick={() => removeTool(index)}
              style={{ marginBottom: '10px' }}
            >
              Remove Function
            </Button> */}

            <Form.Item
              label="Function Name:"
              className="mb-3"
              name={["tools", 0, "name"]} //Here '0' is the index of function in tools
              rules={[
                { required: true, message: "Please enter function name" },
              ]}
            >
              <Input
                value={tool.name}
                onChange={(event) =>
                  handleToolInputChange(index, "name", event.target.value)
                }
              />
            </Form.Item>

            <Form.Item
              label="Instructions:"
              className="mb-3"
              name={["tools", 0, "description"]} //Here '0' is the index of function in tools
              rules={[
                {
                  required: true,
                  message: "Please enter functions instructions",
                },
              ]}
            >
              <TextArea
                rows={3}
                value={tool.description}
                onChange={(event) =>
                  handleToolInputChange(
                    index,
                    "description",
                    event.target.value
                  )
                }
              />
            </Form.Item>

            <Form.Item label="Properties:" className="mb-3">
              {tool.parameters && renderPropertyInputs(index)}

              <Input.Group compact className="mb-3">
                <Input
                  style={{ flex: "auto" }}
                  placeholder="Enter Property Name"
                  value={newPropertyName}
                  onChange={handleNewPropertyNameChange}
                />
                <Button
                  type="primary"
                  onClick={() => handleAddPropertyClick(index)}
                >
                  Add Property
                </Button>
              </Input.Group>
            </Form.Item>
          </Card>
        ))}
      </Space>
    );
  };

  const removeProperty = (toolIndex, propName) => {
    setAssistantFunctionCallData((prevData) => {
      const updatedTools = prevData.tools.map((tool, i) =>
        i === toolIndex
          ? {
              ...tool,
              parameters: {
                ...tool.parameters,
                properties: Object.fromEntries(
                  Object.entries(tool.parameters.properties).filter(
                    ([key]) => key !== propName
                  )
                ),
              },
            }
          : tool
      );

      return {
        ...prevData,
        tools: updatedTools,
      };
    });
  };

  useEffect(() => {
    console.log("tttttttttttttt", assistantFunctionCallData);
  }, []);

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical">
      <Row gutter={16}>
        {editMode && (
          <Col span={24}>
            <Title level={5}>Assistant Id:</Title>
            <span>{assistantFunctionCallData.assistant_id}</span>
          </Col>
        )}
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="name"
            label="Assistant Name:"
            rules={[
              { required: true, message: "This field is mandatory." },
              {
                pattern: /^[A-Za-z0-9 ]+$/,
                message: "Special characters are not allowed.",
              },
            ]}
          >
            <Input
              placeholder="Enter name"
              value={assistantFunctionCallData.name}
              onChange={(e) =>
                setAssistantFunctionCallData((prevData) => ({
                  ...prevData,
                  name: e.target.value,
                }))
              }
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="instructions"
            label="Instructions:"
            rules={[{ required: true, message: "This field is mandatory." }]}
          >
            <TextArea
              rows={3}
              placeholder="Enter instructions"
              value={assistantFunctionCallData.instructions}
              onChange={(e) =>
                setAssistantFunctionCallData((prevData) => ({
                  ...prevData,
                  instructions: e.target.value,
                }))
              }
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="description"
            label="Description:"
            rules={[{ required: true, message: "This field is mandatory." }]}
          >
            <TextArea
              rows={2}
              placeholder="Enter description"
              value={assistantFunctionCallData.description}
              onChange={(e) =>
                setAssistantFunctionCallData((prevData) => ({
                  ...prevData,
                  description: e.target.value,
                }))
              }
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="userSelectedModel"
            label="Model:"
            rules={[{ required: true, message: "Please select a model." }]}
          >
            <Select
              placeholder="Select a model"
              value={assistantFunctionCallData.userSelectedModel}
              onChange={(value) =>
                setAssistantFunctionCallData((prevData) => ({
                  ...prevData,
                  userSelectedModel: value,
                }))
              }
            >
              <Option value="gpt-4-1106-preview">gpt-4-1106-preview</Option>
              <Option value="gpt-3.5-turbo-1106">gpt-3.5-turbo-1106</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item label="Functions:">{renderToolInputs()}</Form.Item>
          {/* <Button type="primary" icon={<PlusOutlined />} onClick={addTool}>
          Add Function
        </Button> */}
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item>
            <Button
              type="primary"
              onClick={(event) => {
                form
                  .validateFields() // Manually trigger all form validations
                  .then(() => {
                    handleSubmit(event);
                  })
                  .catch((errorInfo) => {
                    console.error("Validation Failed:", errorInfo);
                    message.error("Fill mandatory fields");
                  });
              }}
              loading={isFunctionCallingAssUploading}
            >
              {isFunctionCallingAssUploading
                ? "Loading..."
                : editMode
                ? "Update Assistant"
                : "Create Assistant"}
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default FunctionCallingAssistantForm;
