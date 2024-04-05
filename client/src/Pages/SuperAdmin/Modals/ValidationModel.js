import React from "react";

//libraries
import { Modal, Button, Input, Form } from 'antd';
import "../Assistant/defineFunctionModal.css";
import { handleSaveFunctionToDB } from "../api/functionDefinition";

const ValidationModel = ({ data }) => {
  const {
    showValidationModal,
    toggleValidationModal,
    renderParameterInputs,
    functionsParameterNames,
    parameterValues,
    handleParameterChange,
    validateConsole,
    handleValidateFunction,
    setValidateConsole,
    functionDefinition,
    functionName,
  } = data;

  const { TextArea } = Input;
  const [form] = Form.useForm();

  return (
    <Modal
    title="Validate Function"
    visible={showValidationModal}
    onCancel={toggleValidationModal}
    width="40%"
    footer={[
      <Button key="back" onClick={toggleValidationModal}>
        Close
      </Button>,
    ]}
  >
    <Form layout="vertical">
      <Form.Item>
        {renderParameterInputs(
          functionsParameterNames,
          parameterValues,
          handleParameterChange
        )}
      </Form.Item>
      <Form.Item label="Console:">
        <TextArea
          id="validateConsole"
          style={{ backgroundColor: "#141414" }}
          value={validateConsole}
          readOnly
          rows={6}
        />
      </Form.Item>
      <Form.Item>
        <Button
          type="primary"
          onClick={() => {
            handleValidateFunction(
              setValidateConsole,
              functionDefinition,
              functionName,
              parameterValues
            );
          }}
        >
          Validate Function
        </Button>
      </Form.Item>
    </Form>
  </Modal>

  
  );
};

export default ValidationModel;
