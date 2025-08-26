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
    setParameterValues,
    handleParameterChange,
    validateConsole,
    handleValidateFunction,
    setValidateConsole,
    functionDefinition,
    functionName,
  } = data;

  const { TextArea } = Input;
  const [formInValidation] = Form.useForm();
  

  const handleClose = () => {
    formInValidation.resetFields();
    setValidateConsole('');
    
    // Reset empty strings for all parameters
    const emptyValues = functionsParameterNames.reduce((acc, paramName) => {
      acc[paramName] = '';
      return acc;
    }, {});
    setParameterValues(emptyValues);
    
    toggleValidationModal();
  };

  return (
    <Modal
      title="Validate Function"
      open={showValidationModal}
      onCancel={handleClose}
      width="40%"
      footer={[
        <Button key="back" onClick={handleClose}>
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
            // style={{ backgroundColor: "#141414" }}
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
                functionsParameterNames,
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
