import React from "react";

//libraries
import { Tabs, Button, Typography, message } from "antd";
import { Modal } from "react-bootstrap";
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
  return (
    <Modal show={showValidationModal} size="lg" onHide={toggleValidationModal}>
      <Modal.Header closeButton>
        <Modal.Title>Validate Function</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          {/* Render the parameter inputs */}
          {renderParameterInputs(
            functionsParameterNames,
            parameterValues,
            handleParameterChange
          )}
        </div>
        <div>
          {/* Console */}
          <div className="mb-3">
            <label htmlFor="validateConsole" className="form-label">
              Console:
            </label>
            <textarea
              id="validateConsole"
              className="form-control inputField"
              style={{ backgroundColor: "#141414" }}
              value={validateConsole}
              readOnly
              rows={6}
            />
          </div>
          {/* Validate Function Button */}
          <Button
            variant="primary"
            onClick={() => {
              handleValidateFunction(
                setValidateConsole,
                functionDefinition,
                functionName,
                parameterValues
              );
            }}
            className="btn btn-primary definitionButton"
          >
            Validate Function
          </Button>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={toggleValidationModal}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ValidationModel;
