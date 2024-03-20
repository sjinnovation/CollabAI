import React from "react";

//libraries
import { Tabs, Button, Typography, message } from "antd";
import { Modal } from "react-bootstrap";
import "../Assistant/defineFunctionModal.css";
import {
  handleSaveFunctionToDB,
} from "../api/functionDefinition";


const functionDefinitionModel = ({data}) => {
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
  return (
    
     <Modal
          show={showDefineFunctionsModal}
          onHide={toggleDefineFunctionsModal}
        >
          <Modal.Header closeButton>
            <Modal.Title>Define Function</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form>
              <div className="mb-3">
                <label htmlFor="functionNameSelect" className="form-label">
                  Select an Assistant
                </label>
                <select
                  id="functionNameSelect"
                  className="form-select inputField"
                  value={assistantName}
                  onChange={handleAssistantNameChange}
                >
                  <option value="">Choose...</option>
                  {allAssistants.map((name, index) => (
                    <option key={index} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dropdown for selecting a function name */}
              <div className="mb-3">
                <label htmlFor="functionNameSelect" className="form-label">
                  Select a Function
                </label>
                <select
                  id="functionNameSelect"
                  className="form-select inputField"
                  value={functionName}
                  onChange={handleFunctionNameChange}
                >
                  <option value="">Choose...</option>
                  {assistantFunctionNames.map((name, index) => (
                    <option key={index} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Parameters list */}
              <div className="mb-3">
                <label className="form-label">Parameters:</label>
                <ul>
                  {functionsParameterNames.map((param, index) => (
                    <li key={index}>{param}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-3 form-check form-switch">
                <input
                  className="form-check-inputc inputField"
                  type="checkbox"
                  id="demoToggle"
                  checked={showDemo}
                  onChange={toggleDemo}
                />
                <label className="form-check-label" htmlFor="demoToggle">
                  Demo Function
                </label>
              </div>

              {showDemo && (
                <div className="mb-3">
                  <label
                    htmlFor="demoFunctionDefinition"
                    className="form-label"
                  >
                    Demo:
                  </label>
                  <textarea
                    id="demoFunctionDefinition"
                    className="form-control inputField"
                    value={demoFunctionDefinition}
                    readOnly
                    rows={6}
                  />
                </div>
              )}

              <div className="mb-3">
                <label htmlFor="functionDefinition" className="form-label">
                  Function Definition
                </label>
                <textarea
                  id="functionDefinition"
                  className="form-control inputField"
                  value={functionDefinition}
                  onChange={handleFunctionDefinitionChange}
                  placeholder="Enter your function definition here..."
                  style={{ backgroundColor: "#141414" }}
                  rows={12}
                />
              </div>

              <div className="mb-3">
                <Button
                  variant="link"
                  className="btn btn-primary definitionButton"
                  onClick={toggleValidationModal}
                >
                  Validate Function
                </Button>
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={toggleDefineFunctionsModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              className="btn btn-primary definitionButton"
              onClick={() => {
                handleSaveFunctionToDB(
                  functionName,
                  functionDefinition,
                  setFunctionName,
                  setFunctionDefinition,
                  setShowDefineFunctionsModal,
                  showDefineFunctionsModal
                );
              }}
            >
              Insert Function
            </Button>
          </Modal.Footer>
        </Modal>

  );
};

export default functionDefinitionModel;
