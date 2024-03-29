import React, {useEffect} from "react";

//libraries
import { Modal, Form, Select, Input, Switch, Button } from 'antd';
// import { Modal } from "react-bootstrap";
import "../Assistant/defineFunctionModal.css";
import {
  handleSaveFunctionToDB,
} from "../api/functionDefinition";


const FunctionDefinitionModel = ({data}) => {
        const {
            showDefineFunctionsModal,
            toggleDefineFunctionsModal,
            handleAssistantNameChange,
            assistantName,
            allAssistants,
            functionName,
            handleFunctionNameChange,
            assistantFunctionNames,
            functionsParameterNames,
            showDemo,
            toggleDemo,
            demoFunctionDefinition,
            functionDefinition,
            handleFunctionDefinitionChange,
            toggleValidationModal,
            setFunctionName,
            setFunctionDefinition,
            setShowDefineFunctionsModal
          } = data;

          const { Option } = Select;
const { TextArea } = Input;
const [form] = Form.useForm();

useEffect(() => {
  form.setFieldsValue({
    assistantName: assistantName,
    functionName: functionName,
    functionDefinition: functionDefinition,
    demoFunctionDefinition: demoFunctionDefinition,
    functionsParameterNames: functionsParameterNames,
  });
}, [data, form]);

  return (
  <Modal
    title="Define Function"
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
          form.validateFields()
            .then(values => {
              handleSaveFunctionToDB(
                values.functionName,
                values.functionDefinition,
                setFunctionName,
                setFunctionDefinition,
                setShowDefineFunctionsModal,
                showDefineFunctionsModal
              );
            })
            .catch(info => {
              console.log('Validate Failed:', info);
            });
        }}
      >
        Insert Function
      </Button>
    ]}
  >
  <Form layout="vertical"  form={form}>
    <Form.Item
      label="Select an Assistant"
      name="assistantName"
      rules={[{ required: true, message: 'Please select an assistant!' }]}
    >
      <Select
        placeholder="Choose..."
        onChange={handleAssistantNameChange}
      >
        {allAssistants.map((name, index) => (
          <Option key={index} value={name}>
            {name}
          </Option>
        ))}
      </Select>
    </Form.Item>

    <Form.Item
      label="Select a Function"
      name="functionName"
      rules={[{ required: true, message: 'Please select a function!' }]}
    >
      <Select
        placeholder="Choose..."
        onChange={handleFunctionNameChange}
      >
        {assistantFunctionNames.map((name, index) => (
          <Option key={index} value={name}>
            {name}
          </Option>
        ))}
      </Select>
    </Form.Item>

    <Form.Item label="Parameters:">
        <ul>
          {functionsParameterNames.map((param, index) => (
            <li key={index}>{param}</li>
          ))}
        </ul>
      </Form.Item>

      <Form.Item
        label="Demo Function"
        valuePropName="checked"
      >
        <Switch onChange={toggleDemo} checked={showDemo} />
      </Form.Item>

    {showDemo && (
      <Form.Item label="Demo:" name="demoFunctionDefinition">
        <TextArea
          readOnly
          rows={6}
        />
      </Form.Item>
    )}

    <Form.Item
      label="Function Definition"
      name="functionDefinition"
      rules={[{ required: true, message: 'Please input the function definition!' }]}
    >
      <TextArea
        placeholder="Enter your function definition here..."
        style={{ backgroundColor: "#141414" }}
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
