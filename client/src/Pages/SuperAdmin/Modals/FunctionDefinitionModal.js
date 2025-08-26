import React, { useEffect, useState } from "react";

//libraries
import {
  Modal,
  Form,
  Select,
  Input,
  Switch,
  Button,
  Space,
  Typography,
  Checkbox,
  Tooltip
} from "antd";
import "../Assistant/defineFunctionModal.css";
import { handleSaveFunctionToDB, handleEditFunctionToDB } from "../api/functionDefinition";
import { MinusCircleOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { getUserID } from "../../../Utility/service";
const FunctionDefinitionModel = ({ refresh,onCreateSuccess, data }) => {
  const {
    editMode,
    showDefineFunctionsModal,
    toggleDefineFunctionsModal,
    functionTitle,
    functionName,
    handleFunctionNameChange,
    functionsParameterNames,
    setFunctionsParameterNames,
    functionId,
    showDemo,
    demoFunctionDefinition,
    functionDefinition,
    functionDescription,
    functionInstruction,
    handleFunctionDefinitionChange,
    toggleValidationModal,
    setFunctionName,
    setFunctionDefinition,
    setShowDefineFunctionsModal,
    refreshTrigger,
    setRefreshTrigger,
    validateFunctionDefinition
  } = data;
  const userId = getUserID();
  const { TextArea } = Input;
  const [form] = Form.useForm();
  const [required, setRequired] = useState([]);
  const [paramRequired, setParamRequired] = useState(false);

useEffect(() => {
  const currentValues = form.getFieldsValue();
  form.setFieldsValue({
    "title":  currentValues.title || functionTitle,
    "name":  functionName,
    functionDefinition: editMode? functionDefinition || functionDefinition : functionDefinition,
    demoFunctionDefinition: currentValues.demoFunctionDefinition || demoFunctionDefinition,
    functionsParameterNames: functionsParameterNames,
    "instruction": currentValues.instruction || functionInstruction,
    "description": currentValues.description || functionDescription,
  });
}, [
  form,
  functionTitle,
  functionName,
  functionDefinition,
  demoFunctionDefinition,
  functionsParameterNames,
  functionInstruction,
  functionDescription,
]);

  const handleCancel = () => {
    form.resetFields();
    setFunctionName("");
    setFunctionDefinition("");
    setRequired([]);
    setParamRequired(false);
    setFunctionsParameterNames([]);
    toggleDefineFunctionsModal();
    if (refresh) refresh();
  };

  const LabelWithTooltip = ({ label, tooltip }) => (
    <span>
      {label}&nbsp;
      <Tooltip title={tooltip}>
        <QuestionCircleOutlined />
      </Tooltip>
    </span>
  );

  const handleSubmit = async () => {
    form
      .validateFields()
      .then(async (values) => {
        if (functionsParameterNames.length === 0) {
          form.setFields([
            {
              name: ["parameter", "name"],
              errors: ["Please add at least one parameter."],
            },
          ]);
          return;
        }
        let parameters = {};
        functionsParameterNames.forEach((param) => {
          parameters[param.name] = {
            type: param.type,
            description: param.description,
          };
        });
  
        if (editMode) {
          handleEditFunctionToDB(
            functionId,
            values.title,
            values.name,
            values.functionDefinition,
            values.instruction,
            values.description,
            {
              type: "object",
              properties: parameters,
              required: required,
            },
            setFunctionName,
            setFunctionDefinition,
            setShowDefineFunctionsModal,
            showDefineFunctionsModal,
            userId
          );
        } else {
          const saveFunction = await handleSaveFunctionToDB(
            values.title,
            functionName,
            values.functionDefinition,
            values.instruction,
            values.description,
            {
              type: "object",
              properties: parameters,
              required: required,
            },
            setFunctionName,
            setFunctionDefinition,
            setShowDefineFunctionsModal,
            showDefineFunctionsModal,
            userId,
          ).then((success,message) => {
            if (success) {
              handleCancel();
              setRefreshTrigger((prev) => prev + 1);
              if (onCreateSuccess) onCreateSuccess();
            }});
          }
        
        handleCancel(); 
        
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };
  
  const validateFunction = () => {
    try{
      if(editMode){
        const value = form.getFieldValue("functionDefinition");
        validateFunctionDefinition(value);
        }
        toggleValidationModal();
    } catch{
      toggleValidationModal();
    }
  };
  
  return (
    <Modal
      title={editMode ? "Edit Function" : "Create Function"}
      open={showDefineFunctionsModal}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
        >
         {editMode ? "Update Function" : "Create Function"}
        </Button>,
      ]}
    >
      <Form layout="vertical" form={form}>
      <Form.Item
          label={<LabelWithTooltip label="Title:" tooltip="Enter a unique title for your function. Use at least 3 characters. Title should start with an letter and can contain letters and special characters. (e.g., Google Sheet Fetch)" />}
          className="mb-3"
          name="title"
          rules={[{ required: true, message: "Please enter title" },
          {
            validator: (_, value) => {
              if (!value) return Promise.resolve();
              const isProperlyFormatted = /^[a-zA-Z][a-zA-Z0-9\s\-_.,!@#$%^&*()]{2,}$/.test(value);

              if (!isProperlyFormatted) {
                return Promise.reject(
                  "Please use a proper title with at least 3 characters. Title should start with an letter and can contain letters. (e.g., Google Sheet Fetch)"
                );
              }

              return Promise.resolve();
            },
          },
          ]}
        >
          <Input
            value={functionName}
            placeholder="Enter Title"
            onChange={(event) => {
              form.setFieldsValue({ "title": event.target.value });
            }}
          />
        </Form.Item>
        <Form.Item
          label={<LabelWithTooltip label="Function Name:" tooltip="Enter a unique name for your function. Use at least 3 characters. Function name should start with an letter and at least 3 characters. No whitespaces or special characters (e.g., googleSheetFetch)" />}
          className="mb-3"
          name="name"
          rules={[{ required: true, message: "Please enter function name" },
          {
            validator: (_, value) => {
              if (!value) return Promise.resolve();
              const isProperlyFormatted = /^[a-zA-Z]{3,}$/.test(value);

              if (!isProperlyFormatted) {
                return Promise.reject(
                  "Please use a proper function name with at least 3 characters. No whitespaces or special characters (e.g., googleSheetFetch)"
                );
              }

              return Promise.resolve();
            },
          },
          ]}
        >
          <Input
            value={functionName}
            placeholder="Enter Function Name"
            onChange={(e) => handleFunctionNameChange(e.target.value)}
          />
        </Form.Item>
        <Form.Item
          label={<LabelWithTooltip label="Instruction:" tooltip="Enter a brief instruction for your function. This will be displayed to the user when they use the function. (e.g., Fetch data from Google Sheet)" />}
          className="mb-3"
          name="instruction" 
          rules={[
            {
              required: true,
              message: "Please enter function's instruction",
            },
          ]}
        >
          <TextArea
            rows={3}
            value={functionInstruction}
            placeholder="Enter Instruction"
            onChange={(event) => {
              
              form.setFieldsValue({ "instruction": event.target.value });
            }
            }
          />
        </Form.Item>
        <Form.Item
          label={<LabelWithTooltip label="Description:" tooltip="Enter a detailed description for your function. This will be displayed to the user when they use the function. (e.g., This function fetches data from a Google Sheet and returns it as a JSON object)" />}
          className="mb-3"
          name="description"
          rules={[
            {
              required: true,
              message: "Please enter function's description",
            },
          ]}
        >
          <TextArea
            rows={3}
            value={functionDescription}
            placeholder="Enter Description"
            onChange={(event) => {
              setFunctionDefinition(event.target.value);
              form.setFieldsValue({ "description": event.target.value });
            }}
          />
        </Form.Item>
        <Typography
          className="mb-2">Add Parameters</Typography>
        <div style={{ display: "flex", width: "100%", gap: 20 }}>
          <Form.Item
            name={["parameter", "name"]}
            style={{ width: "50%" }}
            rules={[
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  // Check if the function name is properly formatted
                  const isProperlyFormatted = /^[a-zA-Z]{2,}$/.test(value);
                  if (!isProperlyFormatted) {
                    return Promise.reject(
                      "Please use a proper function name with at least 2 characters. No numbers or special characters allowed."
                    );
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="Parameter Name" />
          </Form.Item>
          <Form.Item name={["parameter", "type"]} style={{ width: "50%" }}>
            <Select placeholder="Select Parameter Type">
              <Select.Option value="" disabled>
                Select Parameter Type
              </Select.Option>
              <Select.Option value="string">String</Select.Option>
              <Select.Option value="number">Number</Select.Option>
              <Select.Option value="boolean">Boolean</Select.Option>
              <Select.Option value="array">Array</Select.Option>
              <Select.Option value="object">Object</Select.Option>
            </Select>
          </Form.Item>
        </div>
        <Form.Item name={["parameter", "description"]}>
          <Input.TextArea
            placeholder="Parameter Description"
            style={{ height: '100px' }}
          />
        </Form.Item>
        <Form.Item name={["parameter", "required"]}>
          <Checkbox
            checked={paramRequired}
            onChange={(e) => {
              setParamRequired(!paramRequired);
              form.setFieldsValue({
                parameter: { required: e.target.checked },
              });
            }}
          >
            Required
          </Checkbox>
        </Form.Item>
        <Form.Item>
          <Button
            type="dashed"
            onClick={() => {
              const name = form.getFieldValue(["parameter", "name"]);
              const type = form.getFieldValue(["parameter", "type"]);
              const isRequired = form.getFieldValue(["parameter", "required"]);
              const description = form.getFieldValue([
                "parameter",
                "description",
              ]);
              if (name && type && description) {
                setFunctionsParameterNames([
                  ...functionsParameterNames,
                  { name, type, description },
                ]);
                if (isRequired) {
                  setRequired([...required, name]);
                }
                form.setFieldsValue({
                  parameter: {
                    name: "",
                    type: "",
                    description: "",
                    required: false,
                  },
                });
                setParamRequired(false);
              } else {
                form.setFields([
                  {
                    name: ["parameter", "name"],
                    errors: name ? [] : ["Please enter parameter name"],
                  },
                  {
                    name: ["parameter", "type"],
                    errors: type ? [] : ["Please select parameter type"],
                  },
                  {
                    name: ["parameter", "description"],
                    errors: description ? [] : ["Please enter parameter description"],
                  },
                ]);
              }
            }}
            block
          >
            Add Parameter
          </Button>

        </Form.Item>
        <Form.Item
          label={<LabelWithTooltip label="Created Parameters:" tooltip="List of created parameters that the function accepts. Each parameter should have a unique name, type, and description. You can also mark a parameter as required." />}
        >
          <ul>
            {functionsParameterNames.map((param, index) => (
              <div className="d-flex">
                <li key={index}>{param.name}</li>
                &emsp;
                <MinusCircleOutlined
                  className="text-danger"
                  onClick={() => {
                    setFunctionsParameterNames(
                      functionsParameterNames.filter(
                        (p) => p.name !== param.name
                      )
                    );
                  }}
                />
              </div>
            ))}
          </ul>
        </Form.Item>
        {showDemo && (
          <Form.Item label="Demo:" name="demoFunctionDefinition">
            <TextArea readOnly rows={6} />
          </Form.Item>
        )}

        <Form.Item
          label={<LabelWithTooltip label="Function Definition:" tooltip="Enter the function definition here. This is the code that will be executed when the function is called. You can use the parameters defined above in the function definition." />}
          name="functionDefinition"
          rules={[
            {
              required: true,
              message: "Please input the function definition!",
            },
          ]}
        >
          <TextArea
            placeholder="Enter your function definition here..."
            rows={12}
            onChange={handleFunctionDefinitionChange}
          />
        </Form.Item>

        <Form.Item>
          {/* <Button type="link" onClick={toggleValidationModal}> */}
          <Button type="link" onClick={validateFunction}>
            Validate Function
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FunctionDefinitionModel;
