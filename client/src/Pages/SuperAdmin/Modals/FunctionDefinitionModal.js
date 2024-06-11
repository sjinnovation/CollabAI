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
} from "antd";
import "../Assistant/defineFunctionModal.css";
import { handleSaveFunctionToDB } from "../api/functionDefinition";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";

const FunctionDefinitionModel = ({ data }) => {
  const {
    showDefineFunctionsModal,
    toggleDefineFunctionsModal,
    functionName,
    handleFunctionNameChange,
    functionsParameterNames,
    setFunctionsParameterNames,
    showDemo,
    demoFunctionDefinition,
    functionDefinition,
    handleFunctionDefinitionChange,
    toggleValidationModal,
    setFunctionName,
    setFunctionDefinition,
    setShowDefineFunctionsModal,
  } = data;

  const { TextArea } = Input;
  const [form] = Form.useForm();
  const [description, setDescription] = useState();
  const [purpose, setPurpose] = useState();
  const [required, setRequired] = useState([]);
  const [paramRequired, setParamRequired] = useState(false);

  useEffect(() => {
    form.setFieldsValue({
      functionName: functionName,
      functionDefinition: functionDefinition,
      demoFunctionDefinition: demoFunctionDefinition,
      functionsParameterNames: functionsParameterNames,
      description: description,
      purpose: purpose,
      parameter: { required: false },
    });
  }, [data, form]);

  return (
    <Modal
      title="Create Function"
      visible={showDefineFunctionsModal}
      onCancel={toggleDefineFunctionsModal}
      footer={[
        <Button key="back" onClick={toggleDefineFunctionsModal}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={() => {
            form
              .validateFields()
              .then((values) => {
                let parameters = {};
                functionsParameterNames.forEach((param) => {
                  parameters[param.name] = {
                    type: param.type,
                    description: param.description,
                  };
                });
                handleSaveFunctionToDB(
                  functionName,
                  values.functionDefinition,
                  description,
                  purpose,
                  {
                    type: "object",
                    properties: parameters,
                    required: required,
                  },
                  setFunctionName,
                  setFunctionDefinition,
                  setShowDefineFunctionsModal,
                  showDefineFunctionsModal
                );
              })
              .catch((info) => {
                console.log("Validate Failed:", info);
              });
          }}
        >
          Create Function
        </Button>,
      ]}
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          label="Function Name:"
          className="mb-3"
          name={["tools", 0, "name"]} //Here '0' is the index of function in tools
          rules={[{ required: true, message: "Please enter function name" }]}
        >
          <Input
            value={functionName}
            onChange={(e) => handleFunctionNameChange(e.target.value)}
          />
        </Form.Item>
        <Form.Item
          label="Description:"
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
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Form.Item>
        <Form.Item
          label="Purpose:"
          className="mb-3"
          name={["tools", 0, "purpose"]} //Here '0' is the index of function in tools
          rules={[
            {
              required: true,
              message: "Please enter functions purpose",
            },
          ]}
        >
          <TextArea
            rows={3}
            value={purpose}
            onChange={(event) => setPurpose(event.target.value)}
          />
        </Form.Item>
        <Typography className="mb-2">Add Parameters</Typography>
        <div style={{ display: "flex", width: "100%", gap: 20 }}>
          <Form.Item name={["parameter", "name"]} style={{ width: "50%" }}>
            <Input placeholder="Parameter Name" />
          </Form.Item>
          <Form.Item name={["parameter", "type"]} style={{ width: "50%" }}>
            <Select placeholder="Select Parameter Type">
              <Select.Option value="string">String</Select.Option>
              <Select.Option value="number">Number</Select.Option>
              <Select.Option value="boolean">Boolean</Select.Option>
            </Select>
          </Form.Item>
        </div>
        <Form.Item name={["parameter", "description"]}>
          <Input placeholder="Parameter Description" />
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
              }
            }}
            block
          >
            Add Parameter
          </Button>
        </Form.Item>
        <Form.Item label="Parameters:">
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
          label="Function Definition"
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
          <Button type="link" onClick={toggleValidationModal}>
            Validate Function
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FunctionDefinitionModel;
