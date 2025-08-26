import { message } from "antd";
import { axiosOpen, axiosSecureInstance } from "../../../api/axios";
import {Form, Input } from 'antd';
import { getUserID } from "../../../Utility/service";
import { DELETE_FUNCTION_DB, GET_ALL_FUNCTION_DB, GET_SINGLE_FUNCTION_DB, SAVE_FUNCTION_DB, UPDATE_FUNCTION_DB, VALIDATE_FUNCTION, SERVICE_GET_ALL_USER_BASED_APIS } from "../../../constants/Api_constants";
const userId = getUserID();
//Validates Function defintion
const validateAllInputs = (functionsParameterNames, parameterValues) => {
  let errors = {};

  functionsParameterNames.forEach(param => {
    const value = parameterValues[param.name];
    const paramType = param.type.toLowerCase();

    if (value === undefined || value === '') {
      errors[param.name] = 'This field is required';
    } else {
      switch (paramType) {
        case 'number':
          if (!/^-?\d+(\.\d+)?$|^-?\.\d+$/.test(value)) {
            errors[param.name] = 'Must be a valid number';
          }
          break;
        case 'boolean':
          if (String(value).toLowerCase() !== 'true' && String(value).toLowerCase() !== 'false') {
            errors[param.name] = 'Must be true or false';
          }
          break;
        case 'array':
          try {
            JSON.parse(value);
          } catch (e) {
            errors[param.name] = 'Must be a valid array';
          }
          break;
        case 'object':
          try {
            JSON.parse(value);
          } catch (e) {
            errors[param.name] = 'Must be a valid object';
          }
          break;
      }
    }
  });

  return errors;
};

export const handleValidateFunction = async (setValidateConsole, functionDefinition, functionName, functionsParameterNames, parameterValues) => {
  const errors = validateAllInputs(functionsParameterNames, parameterValues);

  if (Object.keys(errors).length > 0) {
    setValidateConsole("Please correct the following errors:\n" + Object.entries(errors).map(([key, value]) => `${key}: ${value}`).join('\n'));
    return;
  }
  try {
    setValidateConsole("");
    const response = await axiosOpen.post(
      VALIDATE_FUNCTION(),
      {
        functionDefinition: functionDefinition,
        functionName: functionName,
        functionsParameterNames: functionsParameterNames,
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


export const renderParameterInputs = (functionsParameterNames, parameterValues, handleParameterChange, setValidateConsole = () => {}) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    handleParameterChange({ target: { name, value: value } });
    setValidateConsole("");
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const paramType = functionsParameterNames.find(param => param.name === name).type;

    let convertedValue;
    let errorMessage = "";

    switch (paramType.toLowerCase()) {
      case "number":
        if (!/^-?\d+(\.\d+)?$|^-?\.\d+$/.test(value)) {
          errorMessage = `Value for ${name} must be a valid integer or float.`;
        } else {
          convertedValue = Number(value);
        }
        break;
      case "string":
        convertedValue = value;
        break;
      case "boolean":
        convertedValue = String(value).toLowerCase() === "true";
        break;
      case "array":
        try {
          convertedValue = JSON.parse(value);
          if (!Array.isArray(convertedValue)) {
            errorMessage = `Value for ${name} must be a valid array.`;
          }
        } catch (error) {
          errorMessage = `Error parsing array: ${error.message}`;
        }
        break;
      case "object":
        try {
          convertedValue = JSON.parse(value);
          if (typeof convertedValue !== "object" || Array.isArray(convertedValue)) {
            errorMessage = `Value for ${name} must be a valid object.`;
          }
        } catch (error) {
          errorMessage = `Error parsing object: ${error.message}`;
        }
        break;
      default:
        errorMessage = `Unsupported parameter type: ${paramType}`;
    }

    if (errorMessage) {
      message.error(errorMessage);
    } else {
      handleParameterChange({ target: { name, value: convertedValue } });
      setValidateConsole("");
    }
  };

  return functionsParameterNames.map((param, index) => (
    <div key={index} className="mb-3">
      <label htmlFor={param.name} style={{ marginRight: "5px" }}>
        {param.name} ({param.type.charAt(0).toUpperCase() + param.type.slice(1)}):
      </label>
      {param.type.toLowerCase() === "boolean" ? (
        <select
          id={param.name}
          name={param.name}
          value={parameterValues[param.name] || ""}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className="form-select inputField"
        >
          <option value="">Select...</option>
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      ) : (
        <input
          type="text"
          id={param.name}
          name={param.name}
          value={parameterValues[param.name] || ""}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className="form-control inputField"
        />
      )}
    </div>
  ));
};


export const handleSaveFunctionToDB = async (functionTitle, functionName, functionDefinition, instruction, description, parameters, setFunctionName, setFunctionDefinition, setShowDefineFunctionsModal, showDefineFunctionsModal, userId) => {
  try {
    const response = await axiosSecureInstance.post(
      SAVE_FUNCTION_DB(),
      {
        title: functionTitle,
        name: functionName,
        definition: functionDefinition,
        instruction,
        description,
        parameters,
        userId
      }
    );

    if (response.status === 201) {
      setFunctionName("");
      setFunctionDefinition("");
      setShowDefineFunctionsModal(!showDefineFunctionsModal);
      message.success("Function saved successfully!");
      return { success: true, message: response?.data?.message };
    } else if (response.status === 400) {
      message.error("Name Already Exists");
      return { success: false, message: response?.data?.message };
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred.";
    message.error(errorMessage);
    console.error(error);
    return { success: false, message: errorMessage };
  }
};

export const getSingleFunctionDefinitions = async (userId,searchQuery) => {
  try {
    const response = await axiosSecureInstance.get(
      GET_SINGLE_FUNCTION_DB(userId,searchQuery)
    );
    if (response.status === 200) {
      return response.data.functionDefinitions;
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error) {
    // Use optional chaining to safely access nested properties
    const errorMessage = error.response?.data?.error || error.message || "An error occurred while fetching function definitions.";
    message.error(errorMessage);
    console.error("Error in getSingleFunctionDefinitions:", error);
    throw error; // Re-throw the error to handle it upstream
  }
};

export const getAllFunctionDefinitions = async (searchQuery) => {
  try {
    const response = await axiosSecureInstance.get(GET_ALL_FUNCTION_DB(searchQuery));
    if (response.status === 200) {
      return response.data.functionDefinitions;
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error) {
    // Use optional chaining to safely access nested properties
    const errorMessage = error.response?.data?.error || error.message || "An error occurred while fetching function definitions.";
    message.error(errorMessage);
    console.error("Error in getAllFunctionDefinitions:", error);
    throw error; // Re-throw the error to handle it upstream
  }
};

export const deleteFunctionDefinition = async (functionIdToDelete) => {
  try {
    const response = await axiosSecureInstance.delete(DELETE_FUNCTION_DB(functionIdToDelete));
    return { success: true, message: response?.data?.message };
  } catch (error) {
    console.error("Error in deleteFunctionDefinition:", error);
    return { success: false, message: error?.response?.data?.message || "An error occurred" };
  }
};

export const handleEditFunctionToDB = async (functionId, functionTitle, functionName, functionDefinition, instruction, description, parameters, setFunctionName, setFunctionDefinition, setShowDefineFunctionsModal, showDefineFunctionsModal) => {
  try {
    const response = await axiosSecureInstance.patch(
      UPDATE_FUNCTION_DB(functionId),
      {
        title: functionTitle,
        name: functionName,
        definition: functionDefinition,
        instruction,
        description,
        parameters,
      }
    );

    if (response.status === 200) {
      setFunctionName("");
      setFunctionDefinition("");
      setShowDefineFunctionsModal(!showDefineFunctionsModal);
      message.success("Function edited successfully!");
    } else if (response.status === 400) {
      message.error("Server Error");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred.";
    message.error(errorMessage);
    console.error(error);
  }
};

export const getAllApis = async (setServiceApis) => {
  try {
    const body = { userId };
    const response = await axiosSecureInstance.post(SERVICE_GET_ALL_USER_BASED_APIS, body);
    
    if (response.status === 200) {
      setServiceApis(response.data.data);
    }
  } catch (error) {
    message.error(error);
    console.error(error);
  }
};