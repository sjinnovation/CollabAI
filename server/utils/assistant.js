import { createOpenAIFileObject, deleteAssistantFileByID, retrieveAssistantFromOpenAI, retrieveOpenAIFile, retrieveOpenAIFileObject } from "../lib/openai.js";
import { assistantFuncMap } from "./assistantFunctionMapper.js";
import fs from "fs";

/**
 * Converts the assistant response into annotated text with citations added.
 *
 * @param {Object} textDelta - The text delta object containing the assistant response.
 * @returns {Promise<string>} The final annotated response.
 */
export const onTextDelta = async (textDelta) => {
  let finalResponse = "";
  let message = textDelta.value;
  finalResponse += message;

  if (textDelta?.annotations?.length) {
    const { annotations } = textDelta;
    let annotatedResponse = await annotateMessageContent({
      value: finalResponse,
      annotations,
    });
    finalResponse += annotatedResponse;
  }

  return finalResponse;
};

/**
 * Processes the tool call delta and generates a string message.
 * This function checks if any image type file is added by code_interpreter
 * or the process that is running in code_interpreter and adds it to the message.
 * @param {Object} toolCallDelta - The tool call delta object.
 * @returns {string} - The generated string message.
 */
export const onToolCallDelta = async (toolCallDelta) => {
  if (toolCallDelta.type === "code_interpreter") {
    let outputMessages = "";
    if (toolCallDelta.code_interpreter.input) {
      outputMessages += toolCallDelta.code_interpreter.input;
    }
    if (toolCallDelta.code_interpreter.outputs) {
      const outputs = await Promise.all(
        toolCallDelta.code_interpreter.outputs.map(async (output) => {
          switch (output.type) {
            case "image":
              return await processAssistantGeneratedImage(
                output["image"].file_id
              );
            case "logs":
              return `\n${output.logs}\n`;
            default:
              return "";
          }
        })
      );
      outputMessages += outputs.join("");
    }
    return outputMessages;
  }
};

/**
 * Handles tool calls made by the assistant, calls any required functions, and returns tool outputs in an array.
 *
 * @param {string} assistant_id - The ID of the assistant.
 * @param {Array} toolCalls - An array of tool calls made by the assistant.
 * @param {boolean} [isDynamicFunctionCalling=false] - Indicates whether dynamic function calling is enabled. ( defaults to false )
 * @returns {Promise<Array>} - A promise that resolves to an array of tool outputs.
 */
export const onToolCalls = async (assistant_id, toolCalls, isDynamicFunctionCalling = false) => {
  const toolOutputs = [];

  const requiredActions = toolCalls;

  for (const action of requiredActions) {
    const funcName = action.function.name;
    console.log("🚀 ~ .on ~ funcName:", funcName);
    const argument = JSON.parse(action.function.arguments);
    console.log(argument, "arg");
    let currOutput = {
      tool_call_id: action.id,
      output: "This function doesn't exist.",
    };

    const openai = await getOpenAIInstance();
    const myAssistant = await retrieveAssistantFromOpenAI(openai, assistant_id);

    const propertiesKeysObject =
      myAssistant?.tools[0]?.function?.parameters?.properties || {};
    const propertiesKeys = Object.keys(propertiesKeysObject);

    // all conditions
    const isCustomFunctionCallingAssistant =
      isDynamicFunctionCalling === true && propertiesKeys;
    const isLocalFunctionCallingAssistant =
      isDynamicFunctionCalling === false &&
      assistantFuncMap.hasOwnProperty(funcName);

    if (isCustomFunctionCallingAssistant) {
      const argumentsList = propertiesKeys.map((key) => argument[key]);

      // Assuming argumentsList now is an array of values from the argument object based on propertiesKeys
      const functionName = myAssistant.tools[0].function.name;

      const functionMap = await createFunctionMap();
      // Create the function call dynamically using the spread operator
      if (typeof functionMap[functionName] === "function") {
        const output = await functionMap[functionName](...argumentsList);
        currOutput.output = JSON.stringify(output);
      }
    } else if (isLocalFunctionCallingAssistant) {
      const output = await assistantFuncMap[funcName](argument);
      currOutput.output = JSON.stringify(output);
    }

    toolOutputs.push(currOutput);
  }

  return toolOutputs;
};

// this function is for assistant function calling, responsible for getting prompts based on query
export async function meeting_summary(sDate, eDate, meetingType) {
  try {
    // Validate inputs
    if (!sDate || !eDate) {
      throw new Error("Start and end dates are required");
    }

    const startDate = new Date(sDate);
    const endDate = new Date(eDate);

    // Prepare query
    let query = {
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    // Add tags to query if provided
    if (meetingType && meetingType.length) {
      query.tags = { $in: meetingType };
    }

    // Fetch data from DB
    const result = await promptModel
      .find(query)
      .populate("tags", "title")
      .lean();

    // Prepare response
    const concisePrompt = result.map((item) => ({
      user: item.description,
      assistant: item.promptresponse,
      meeting_type: item.tags.length
        ? item.tags.map((i) => i.title).join(" ")
        : "Not a meeting",
      createdAt: new Date(item.createdAt).toISOString(),
    }));

    // Convert the response to JSON and remove newline characters
    const jsonString = JSON.stringify(concisePrompt).replace(/\\n/g, "");

    return jsonString;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Processes an assistant message by annotating text contents and handling image files.
 * @async
 * @function processAssistantMessage
 * @description processes each content item in an assistant message based on its type.
 * @param {Object} message - The message object to process, containing `content`, an array of message contents.
 * @returns {Promise<string>} A promise that resolves with the processed response as a string.
 * @throws {Error} Will throw an error if processing fails for any content item.
 */
export const processAssistantMessage = async (message) => {
  let processedResponse = "";
  const messageContentList = message.content;

  for (const msgContent of messageContentList) {
    switch (msgContent.type) {
      case "text":
        processedResponse += await annotateMessageContent(msgContent.text);
        break;
      case "image_file":
        processedResponse =
          (await processAssistantGeneratedImage(
            msgContent["image_file"].file_id
          )) + processedResponse;
        break;
      default:
        break;
    }
  }

  return processedResponse;
};

/**
 * Converts an image file's binary data to a data URI and creates an image element string.
 * @async
 * @function processAssistantGeneratedImage
 * @description Asynchronously retrieves an image file using its file ID and converts it to a base64-encoded data URI.
 * @param {string} img_file_id - The ID of the image file to process.
 * @returns {Promise<string>} A promise that resolves with the HTML string of an image element.
 * @throws {Error} Will throw an error if the image file cannot be retrieved or processed.
 */
export const processAssistantGeneratedImage = async (img_file_id) => {
  const response = await retrieveOpenAIFile(img_file_id);
  // Extract the binary data from the Response object
  const image_data = await response.arrayBuffer();
  // Convert the binary data to a Buffer
  const image_data_buffer = Buffer.from(image_data);
  const base64Image = image_data_buffer.toString("base64");
  const dataUri = "data:image/jpeg;base64," + base64Image;
  const imgElement = '<img src="' + dataUri + '" />';

  return imgElement;
};

/**
 * Annotates message content with citations for text and links for files.
 * @async
 * @function annotateMessageContent
 * @description Asynchronously processes and annotates the message content with references to cited documents or file paths.
 * @param {Object} messageContent - Message content object which has annotations and is of type 'text'
 * @returns {Promise<string>} A promise that resolves with the message content including added text citations or download links.
 * @throws {Error} Will throw an error if the citations cannot be retrieved or processed.
 */
export const annotateMessageContent = async (messageContent) => {
  const annotations = messageContent.annotations || [];
  let citationPromises = [];

  annotations.forEach((annotation, index) => {
    messageContent.value = messageContent.value.replace(
      annotation.text,
      ` [${index}]`
    );

    if (annotation.file_citation) {
      const promise = retrieveOpenAIFileObject(
        annotation.file_citation.file_id
      ).then((citedFile) => {
        return `${index + 1}. ${annotation.file_citation.quote} from ${
          citedFile.filename
        }`;
      });

      citationPromises.push(promise);
    } else if (annotation.file_path) {
      const promise = retrieveOpenAIFileObject(
        annotation.file_path.file_id
      ).then((citedFile) => {
        // Include the citation in a div with a class
        return `<div class="citation-download-link">${
          index + 1
        }. Click <a href="/assistants/download/${
          citedFile.id
        }">here</a> to download ${citedFile.filename}</div>`;
      });

      citationPromises.push(promise);
    }
  });

  const citations = await Promise.all(citationPromises);

  // Only add the citations-container div if there are any citations
  if (citations.length > 0) {
    messageContent.value += `\n<div class="citations-container">${citations.join(
      ""
    )}</div>`;
  }

  return messageContent.value;
};

export const parseStaticQuestions = (staticQuestionsString) => {
  try {
    return JSON.parse(staticQuestionsString);
  } catch (error) {
    console.error("Error parsing static questions:", error);
    throw new Error("Invalid static questions format");
  }
};

export const parseTools = (toolsString) => {
  try {
    return JSON.parse(toolsString).map((tool) => ({ type: tool }));
  } catch (error) {
    console.error("Error parsing tools:", error);
    throw new Error("Invalid tools format");
  }
};

export const deleteAssistantFilesAndFilterIds = async (
  openai,
  assistantId,
  fileIds,
  deletedFileIds
) => {
  try {
    for (const deletedFileId of deletedFileIds) {
      await deleteAssistantFileByID(openai, assistantId, deletedFileId);
    }
    return fileIds.filter((fileId) => !deletedFileIds.includes(fileId));
  } catch (error) {
    console.error("Error deleting assistant files:", error);
    throw error;
  }
};

export const uploadFiles = async (openai, files) => {
  const filePromises = files.map(async (file) => {
    const uploadedFile = await createOpenAIFileObject(openai,file,"assistants");;

    return uploadedFile.id;
  });

  return Promise.all(filePromises);
};

/**
 * @async
 * @function createFunctionMap
 * @description A helper function which creates new function and maps it based on the function definitions stored in the database
 * @param {Object} req - No request params
 * @param {Object} res - Response object
 * @throws {Error} Will throw an error if function creation is failed
 */
export async function createFunctionMap() {
  try {
    // Get all function definitions from the database
    const definitions = await FunctionDefinition.find({});

    // Map function names to executable functions
    const functionMap = definitions.reduce((acc, def) => {
      try {
        const funcDefinition = def.definition.replace("()", "(axios)");

        const func = new Function("axios", `return async ${funcDefinition}`)(
          axios
        );

        acc[def.name] = func;
      } catch (error) {
        console.error(`Failed to compile function ${def.name}:`, error);
      }
      return acc;
    }, {});

    return functionMap;
  } catch (err) {
    console.error("Error fetching function definitions:", err);
  }
}

export const deleteLocalFile = async (file) => {
  return new Promise((resolve, reject) => {
    fs.unlink(file.path, (err) => {
      if (err) {
        console.error(`Error deleting file: ${file.path}`, err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}