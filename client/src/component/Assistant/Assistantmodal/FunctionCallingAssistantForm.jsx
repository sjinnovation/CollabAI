import React, { useEffect, useState } from "react";
import { axiosSecureInstance, axiosOpen } from "../../../api/axios";
import { toast } from "react-hot-toast";
import { MinusCircleOutlined } from "@ant-design/icons";

//libraries
import {
  // Form,
  Input,
  Radio,
  Select,
  Button,
  Upload,
  Switch,
  Tooltip,
  Alert,
  List,
  message,
} from "antd";

import {
  ASSISTANT_CODE_INTERPRETER_NOTE,
  ASSISTANT_FILE_CREATION_NOTE,
  ASSISTANT_RETRIEVAL_NOTE,
} from "../../../constants/FileLIstConstants";
import { Modal, Container, Form, Row, Col } from "react-bootstrap";
import { useAssistantContext } from "../../../contexts/AssistantsFetchContext";
import "./functionCallingAssForm.css";

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
    form,
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

  //------Side effects---------//
  //   useEffect(() => {
  //     form.setFieldsValue(assistantData);
  //   }, [assistantData, form]);

  //-----Local functions-------//
  const uploadProps = {
    onRemove: handleRemoveFile,
    beforeUpload: handleAddFile,
    fileList,
  };

  const [assistant, setAssistant] = useState();

  const [isFunctionCallingAssUploading, setIsFunctionCallingAssUploading] =
    useState(false);
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setIsFunctionCallingAssUploading(true);
      if (!editMode) {
        console.log("Assistant data submitted:", assistantFunctionCallData);
        // Assuming your backend endpoint is '/api/createAssistant'
        const response = await axiosOpen.post(
          "api/assistants/createassistantFunctionCalling",
          assistantFunctionCallData
        );
        console.log(response.data.assistant);

        setIsFunctionCallingAssUploading(false);
        message.success("Assistant created Successfully");

        setAssistant(response.data.assistant);
        handleClose();

        handleFetchFunctionCallingAssistants();
      } else {
        console.log("Assistant data submittedss:", assistantFunctionCallData);
        // Assuming your backend endpoint is '/api/createAssistant'
        const response = await axiosOpen.patch(
          `api/assistants/updateFunctionCallingAssistantdata/${assistantFunctionCallData.assistant_id}`,
          assistantFunctionCallData
        );
        setIsFunctionCallingAssUploading(false);
        handleClose();
        console.log("yyyyy", response.data.assistant);
        message.success("Assistant updated Successfully");

        handleFetchFunctionCallingAssistants();
      }
    } catch (error) {
      console.error("Error sending data to backend:", error);
      toast.error("Something went wrong");
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
    // You may want to validate newPropertyName before calling addProperty
    if (newPropertyName != undefined || newPropertyName != "") {
      addProperty(toolIndex, newPropertyName);
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
      <ul className="list-unstyled">
        {assistantFunctionCallData.tools.map((tool, index) => (
          <li key={index} className="mb-4 p-3 border rounded">
            <div className="d-flex justify-content-end">
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() => removeTool(index)}
              >
                Remove Function
              </button>
            </div>

            <div className="mb-3">
              <label className="form-label">Function Name:</label>
              <input
                type="text"
                className="form-control inputField"
                name="name"
                value={tool.name}
                onChange={(event) =>
                  handleToolInputChange(index, "name", event.target.value)
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Instructions:</label>
              <textarea
                className="form-control inputField"
                name="description"
                rows="3"
                value={tool.description}
                onChange={(event) =>
                  handleToolInputChange(
                    index,
                    "description",
                    event.target.value
                  )
                }
              />
            </div>

            <div>
              <label className="form-label">Properties:</label>
              <div className="mb-3">
                {tool.parameters && renderPropertyInputs(index)}
              </div>
              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control inputField"
                  placeholder="Enter Property Name"
                  value={newPropertyName}
                  onChange={handleNewPropertyNameChange}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleAddPropertyClick(index)}
                >
                  Add Property
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
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

  return (
    <Form
      form={form}
      onValuesChange={handleFunctionCallingFormChange}
      layout="vertical"
      onSubmit={handleSubmit}
    >
      <Row>
        <Col className="mb-3">
          {editMode ? (
            <>
              <b>Assistant Id :</b>
              {assistantFunctionCallData.assistant_id}
        
              {/* Other content related to edit mode */}
            </>
          ) : null}
        </Col>
      </Row>
      <Row>
        <Col className="mb-3">
          <Form.Group controlId="formName">
            <Form.Label>
              <b>Assistant Name:</b>
            </Form.Label>
            <Form.Control
              className="inputField"
              type="text"
              placeholder="Enter name"
              value={assistantFunctionCallData.name}
              onChange={(e) =>
                setAssistantFunctionCallData((prevData) => ({
                  ...prevData,
                  name: e.target.value,
                }))
              }
            />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col className="mb-3">
          <Form.Group controlId="formInstructions">
            <Form.Label>
              <b>Instructions: </b>
            </Form.Label>
            <Form.Control
              className="inputField"
              as="textarea"
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
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col className="mb-3">
          <Form.Group controlId="formDescription">
            <Form.Label>
              <b>Description: </b>
            </Form.Label>
            <Form.Control
              className="inputField"
              as="textarea"
              rows={2}
              placeholder="Enter Description"
              value={assistantFunctionCallData.description}
              onChange={(e) =>
                setAssistantFunctionCallData((prevData) => ({
                  ...prevData,
                  description: e.target.value,
                }))
              }
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col className="mb-3">
          <Form.Group controlId="formUserSelectedModel">
            <Form.Label>
              <b>Model: </b>
            </Form.Label>
            <Form.Control
              className="inputField"
              as="select"
              value={assistantFunctionCallData.userSelectedModel}
              onChange={(e) =>
                setAssistantFunctionCallData((prevData) => ({
                  ...prevData,
                  userSelectedModel: e.target.value,
                }))
              }
            >
              <option value="gpt-4-1106-preview">gpt-4-1106-preview</option>
              <option value="gpt-3.5-turbo-1106">gpt-3.5-turbo-1106</option>
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col className="mb-3">
          <Form.Group controlId="formTools">
            <Form.Label>
              <b>Functions: </b>
            </Form.Label>
            <ul>{renderToolInputs()}</ul>
          </Form.Group>
          <button type="button" onClick={addTool} className="btn btn-primary">
            Add Function
          </button>
        </Col>
      </Row>
      <Row>
        <Col>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isFunctionCallingAssUploading}
          >
            {isFunctionCallingAssUploading
              ? "Loading..."
              : editMode
              ? "Update Assistant"
              : "Create Assistant"}
          </button>
        </Col>
      </Row>
    </Form>
  );
};

export default FunctionCallingAssistantForm;
