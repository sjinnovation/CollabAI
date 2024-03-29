import { axiosOpen } from "../../../api/axios";

export const fetchAllAssistant = async (setAllAssistants) => {
  try {
    // Replace with the correct URL to your backend endpoint
    const url = "api/assistants/getAllFunctionCallingAssistants";

    const response = await axiosOpen.get(url);

    if (response.status === 200) {
      console.log(
        "Function names fetched successfully:",
        response.data.assistants
      );
      setAllAssistants(response.data.assistants);
      console.log(response.data.assistants);
    } else {
      console.error("Error fetching function names:", response.status);
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const fetchFunctionNamesPerAssistant = async (assistantName, setAssistantFunctionNames) => {
  try {
    // Replace with the correct URL to your backend endpoint
    const url = "api/assistants/fetchFunctionNamesPerAssistant";

    const response = await axiosOpen.post(url, {
      assistantName: assistantName,
    });

    if (response.status === 200) {
      console.log(
        "Function names fetched successfully:",
        response.data.assistantFunctionName
      );
      setAssistantFunctionNames(response.data.assistantFunctionName);
    } else {
      console.error("Error fetching function names:", response.status);
    }
  } catch (error) {
    console.error(error);
  }
};

export const fetchParametersPerFunctionName = async (assistantName, functionName, setFunctionsParameterNames) => {
    try {
      // Replace with the correct URL to your backend endpoint
      const url = "api/assistants/fetchfunctionsParametersPerFunctionName";

      const response = await axiosOpen.post(url, {
        assistantName: assistantName,
        functionName: functionName,
      });

      if (response.status === 200) {
        console.log(
          "Function names fetched successfully:",
          response.data.parametersPerFunctionName
        );
        setFunctionsParameterNames(response.data.parametersPerFunctionName);
      } else {
        console.error("Error fetching function names:", response.status);
        return null;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  };
