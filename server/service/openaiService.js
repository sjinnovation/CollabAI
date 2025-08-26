import { getOpenAIInstance } from "../config/openAI.js";
import getOpenAiConfig from "../utils/openAiConfigHelper.js";
import { getUserPreferencesById } from "../utils/getUserPrefenceConfigHelper.js";
import { openAiConfig } from "../constants/enums.js";

/**
 * Generates a context array of previous chat history.
 *
 * @param {Array} chatHistory - The chat history array.
 * @returns {Array} - Returns an array of previous chat history with a maximum of 6 chat items.
 */
export const generatePrevChatHistoryContext = (
  chatHistory,
  userPreferences = "",
  desiredAiResponse = ""
) => {
  const maxChatHistoryCount = 6;
  const contextArray = [];
  let chatHistoryCount = 0;

  if (userPreferences?.length > 0 && desiredAiResponse?.length > 0) {
    contextArray.push({
      role: "system",
      content: `User Details: ${userPreferences}. Desired AI response: ${desiredAiResponse}.`,
    });
  }

  for (let i = chatHistory.length - 1; i >= 0; i--) {
    const chatItem = chatHistory[i];

    if (chatItem.botMessage && chatHistoryCount < maxChatHistoryCount) {
      contextArray.unshift({
        role: "assistant",
        content: chatItem.botMessage,
      });
      contextArray.unshift({
        role: "user",
        content: chatItem.chatPrompt,
      });
      chatHistoryCount++;
    }

    if (chatHistoryCount === maxChatHistoryCount) {
      break;
    }
  }

  return contextArray;
};

/**
 * Generates a streaming response from an OpenAI GPT model using a provided payload.
 *
 * @async
 * @function generateOpenAIStreamResponse
 * @description Creates a stream of responses from OpenAI based on dialogue context and a user prompt.
 * @param {Object} payload - An object containing the prompt, chatLog, socket
 * @param {string} payload.prompt - The user's input to the model.
 * @param {Array} payload.chatLog - The chat history to provide context for the model's response.
 * @param {Object} payload.socket - will get user preference by using this.
 * @returns {Promise<Object>} A promise that resolves with the OpenAI stream response object.
 * @throws {Error} Will throw an error if the streaming response cannot be generated.
 */
export const generateOpenAIStreamResponse = async (payload) => {
  const {
    prompt,
    chatLog,
    userPreferences = "",
    desiredAiResponse = "",
    userId,
    selectedmodel,
  } = payload;

  const openai = await getOpenAIInstance();
  const temperature = parseFloat(await getOpenAiConfig("temperature"));
  const openaiMaxToken = parseFloat(await getOpenAiConfig("openaiMaxToken"));
  const openaiTopP = parseFloat(await getOpenAiConfig("openaiTopP"));
  const openaiFrequency = parseFloat(await getOpenAiConfig("openaiFrequency"));
  const openaiPresence = parseFloat(await getOpenAiConfig("openaiPresence"));
  const gptModel = await getOpenAiConfig("model");
  const openaiSystemInstruction = await getOpenAiConfig(
    "openaiSystemInstruction"
  );
  let contextArray = [];
  let finalTemperature = 1;
  let finalTop_p = 1;
  let finalFrequencyPenalty = 0;
  let finalPresencePenalty = 0;
  const userDefinedAdvancedParameters = await getUserPreferencesById(userId);

  if (gptModel === "o1-preview" || gptModel === "o1-mini") {
    contextArray = generatePrevChatHistoryContext(chatLog || [], "", "");
  } else {
    contextArray = generatePrevChatHistoryContext(
      chatLog || [],
      userPreferences,
      desiredAiResponse
    );
    if (!userPreferences && !desiredAiResponse && openaiSystemInstruction) {
      contextArray.unshift({
        role: "system",
        content: openaiSystemInstruction,
      });
    }
    finalTemperature = userDefinedAdvancedParameters?.openAiTemperature
      ? userDefinedAdvancedParameters.openAiTemperature
      : temperature || openAiConfig.DEFAULT_TEMPERATURE;
    finalTop_p = userDefinedAdvancedParameters?.openAiTopP
      ? userDefinedAdvancedParameters.openAiTopP
      : openaiTopP || openAiConfig.DEFAULT_TOP_P;
    finalFrequencyPenalty =
      userDefinedAdvancedParameters?.openAiFrequency_penalty
        ? userDefinedAdvancedParameters.openAiFrequency_penalty
        : openaiFrequency || openAiConfig.DEFAULT_FREQUENCY_PENALTY;
    finalPresencePenalty = userDefinedAdvancedParameters?.openAiPresence_penalty
      ? userDefinedAdvancedParameters.openAiPresence_penalty
      : openaiPresence || openAiConfig.DEFAULT_PRESENCE_PENALTY;
  }

  const stream = await openai.chat.completions.create(
    {
      model: selectedmodel || gptModel,
      messages: [...contextArray, { content: prompt, role: "user" }],
      stream: true,
      temperature: finalTemperature,
      max_completion_tokens: userDefinedAdvancedParameters?.openAiMax_tokens
        ? userDefinedAdvancedParameters.openAiMax_tokens
        : openaiMaxToken || openAiConfig.DEFAULT_MAX_TOKEN,
      top_p: finalTop_p,
      frequency_penalty: finalFrequencyPenalty,
      presence_penalty: finalPresencePenalty,
    },
    { responseType: "stream" }
  );

  return { stream, model: gptModel };
};

/**
 * Generates a http response from an OpenAI GPT model using a provided payload.
 *
 * @async
 * @function generateOpenAIHttpResponse
 * @description Creates a updated responses from OpenAI based on dialogue context and a user prompt.
 * @param {Object} payload - An object containing the prompt, chatLog, userId
 * @param {string} payload.modifiedPrompt - The user's input to the model.
 * @param {Array} payload.chatLog - The chat history to provide context for the model's response.
 * @param {Array} payload.userId - The userId to get user saved details
 * @returns {Promise<Object>} A promise that resolves with the OpenAI stream response object.
 * @throws {Error} Will throw an error if the streaming response cannot be generated.
 */
export const generateOpenAIHttpResponse = async (payload) => {
  const { modifiedPrompt, chatLog, userId } = payload;

  const openAi = await getOpenAIInstance();
  const temperature = parseFloat(await getOpenAiConfig("temperature"));
  const gptModel = await getOpenAiConfig("model");
  const openaiSystemInstruction = await getOpenAiConfig(
    "openaiSystemInstruction"
  );
  const userPreferences = await getUserPreferencesById(userId);

  let contextArray = generatePrevChatHistoryContext(
    chatLog || [],
    userPreferences,
    ""
  );
  if (!userPreferences && openaiSystemInstruction) {
    contextArray.unshift({
      role: "system",
      content: openaiSystemInstruction,
    });
  }

  const response = await openAi.chat.completions.create({
    model: gptModel,
    messages: [...contextArray, { content: modifiedPrompt, role: "user" }],
    temperature: userPreferences?.openAiTemperature
      ? userPreferences.openAiTemperature
      : temperature || openAiConfig.DEFAULT_TEMPERATURE,
    max_tokens: userPreferences?.openAiMax_tokens
      ? userPreferences.openAiMax_tokens
      : openAiConfig.DEFAULT_MAX_TOKEN,
    top_p: userPreferences?.openAiTopP
      ? userPreferences.openAiTopP
      : openAiConfig.DEFAULT_TOP_P,
    frequency_penalty: userPreferences?.openAiFrequency_penalty
      ? userPreferences.openAiFrequency_penalty
      : openAiConfig.DEFAULT_FREQUENCY_PENALTY,
    presence_penalty: userPreferences?.openAiPresence_penalty
      ? userPreferences.openAiPresence_penalty
      : openAiConfig.DEFAULT_PRESENCE_PENALTY,
  });

  return {
    response: response.choices[0].message.content,
    inputToken: response.usage.prompt_tokens,
    outputToken: response.usage.completion_tokens,
    totalToken: response.usage.total_tokens,
    modelUsed: gptModel,
  };
};
