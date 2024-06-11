import { message } from "antd";
import { axiosOpen, axiosSecureInstance } from "../../../api/axios";
import {Form, Input } from 'antd';


//Validates Function defintion
export const handleValidateFunction = async (setValidateConsole, functionDefinition, functionName, parameterValues ) => {
  try {
    const response = await axiosOpen.post(
      "/api/assistants/validateFunctionDefinition",
      {
        functionDefinition: functionDefinition,
        functionName: functionName,
        parameters: parameterValues,
      }
    );

    if (response.status === 200) {
      setValidateConsole("Function runs correctly ✅");
    } else if (response.status === 500) {
      setValidateConsole(response.data.message);
    }
  } catch (err) {
    console.log(err);
    let errorMessage;
    // setValidateConsole("Function is Incorrect ❌");
    if (err.response && err.response.data && err.response.data.message) {
      // If the server sends back an error message, use it
      errorMessage = err.response.data.message;
    } else if (err.message) {
      // If the error has a 'message' property, use it
      errorMessage = err.message;
    } else {
      // If the error object doesn't have a 'message' property, stringify it
      errorMessage = JSON.stringify(err, null, 2);
    }
    console.log(errorMessage);
    setValidateConsole(errorMessage);
  }
};

// This function will generate input fields based on functionsParameterNames
export const renderParameterInputs = (functionsParameterNames, parameterValues, handleParameterChange ) => {
  return functionsParameterNames.map((paramName, index) => (
    <div key={index} className="mb-3">
      <label style={{ marginRight: "5px" }} htmlFor={paramName}>
        {paramName.name}:
      </label>
      <input
        type="text"
        id={paramName.name}
        name={paramName.name}
        value={parameterValues[paramName.name] || ""}
        onChange={handleParameterChange}
        className="form-select inputField"
      />
    </div>
  ));
};


export const handleSaveFunctionToDB = async (functionName, functionDefinition, description, purpose, parameters, setFunctionName, setFunctionDefinition, setShowDefineFunctionsModal, showDefineFunctionsModal ) => {
  try {
    const response = await axiosSecureInstance.post(
      "/api/assistants/function-definition",
      {
        name: functionName,
        definition: functionDefinition,
        description,
        purpose,
        parameters
      }
    );

    if (response.status === 201) {
      setFunctionName("");
      setFunctionDefinition("");
      setShowDefineFunctionsModal(!showDefineFunctionsModal);
      message.success("Function saved successfully!");
    } else if (response.status === 400) {
      message.error("Name Already Exists");
    }
  } catch (error) {
    message.error(error.response.data.error || error);
    console.error(error);
  }
};

export const getAllFunctionDefinitions = async (setFunctionDefinitions) => {
  try {
    const response = await axiosSecureInstance.get(
      "/api/assistants/function-definitions"
    );

    if (response.status === 200) {
      setFunctionDefinitions(response.data.functionDefinitions)
    }
  } catch (error) {
    message.error(error.response.data.error || error);
    console.error(error);
  }
};
