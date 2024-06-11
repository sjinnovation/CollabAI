import userTokenPreferences from "../models/userModalPreferancesModel.js";
import StatusCodes from "http-status-codes";
import { InternalServer } from "../middlewares/customError.js";
import { ConfigMessages } from "../constants/enums.js";

/**
 * @async
 * @function getAllModelConfigurations
 * @description Fetches all configurations for a user
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 * @throws {Error} Will throw an error if it fails to fetch configurations
 * @returns {Response} Returns the configurations for the user
 */

export const getAllModelConfigurations = async (req, res, next) => {
  try {
    const { _id: userId } = req.user;
    const configValues = await userTokenPreferences.findOne({ userId: userId });

    if (!configValues) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: ConfigMessages.CONFIG_VALUES_NOT_FOUND,
      });
    }

    res.status(StatusCodes.OK).json({
      configValues: configValues,
      message: ConfigMessages.CONFIGURATIONS_FETCHED,
    });
  } catch (error) {
    return next(InternalServer(error.message));
  }
};

/**
 * @async
 * @function updateAllModelConfigurations
 * @description Updates or creates configurations for a user
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 * @throws {Error} Will throw an error if it fails to update configurations
 * @returns {Response} Returns a success message after updating configurations
 */

export const updateAllModelConfigurations = async (req, res, next) => {
  const { _id: userId } = req.user;
  const {
    body: {
      openAiTemperature,
      openAiMax_tokens,
      openAiFrequency_penalty,
      openAiPresence_penalty,
      openAiTopP,
      claudeAiTemperature,
      ClaudeAIMaxToken,
      geminiTemperature,
      geminiTopK,
      geminiTopP,
      geminiMaxOutputTokens,
    },
  } = req;
  
  try {
    // Update openAiTemperature
    if (openAiTemperature !== undefined) {
      await updateConfiguration(
        userId,
        "openAiTemperature",
        openAiTemperature,
        ConfigMessages.OPENAI_TEMPERATURE_UPDATED,
        ConfigMessages.OPENAI_TEMPERATURE_SAVED
      );
    }

    // Update openAiMax_tokens 
    if (openAiMax_tokens !== undefined) {
      await updateConfiguration(
        userId,
        "openAiMax_tokens",
        openAiMax_tokens,
        ConfigMessages.OPENAI_MAX_TOKENS_UPDATED,
        ConfigMessages.OPENAI_MAX_TOKENS_SAVED
      );
    }

    // Update openAiFrequency_penalty
    if (openAiFrequency_penalty !== undefined) {
      await updateConfiguration(
        userId,
        "openAiFrequency_penalty",
        openAiFrequency_penalty,
        ConfigMessages.OPENAI_FREQUENCY_PENALTY_UPDATED,
        ConfigMessages.OPENAI_FREQUENCY_PENALTY_SAVED
      );
    }

    
    // Update openAiFrequency_penalty
    if (openAiTopP !== undefined) {
        await updateConfiguration(
          userId,
          "openAiTopP",
          openAiTopP,
          ConfigMessages.OPENAI_TOP_P_UPDATED,
          ConfigMessages.OPENAI_TOP_P_SAVED
        );
      }

    // Update geminiTemperature
    if (geminiTemperature !== undefined) {
      await updateConfiguration(
        userId,
        "geminiTemperature",
        geminiTemperature,
        ConfigMessages.GEMINI_TEMPERATURE_UPDATED,
        ConfigMessages.GEMINI_TEMPERATURE_SAVED
      );
    }

    // Update openAiPresence_penalty
    if (openAiPresence_penalty !== undefined) {
      await updateConfiguration(
        userId,
        "openAiPresence_penalty",
        openAiPresence_penalty,
        ConfigMessages.OPENAI_PRESENCE_PENALTY_UPDATED,
        ConfigMessages.OPENAI_PRESENCE_PENALTY_SAVED
      );
    }

    // Update Gemini API Key
    if (claudeAiTemperature !== undefined) {
      await updateConfiguration(
        userId,
        "claudeAiTemperature",
        claudeAiTemperature,
        ConfigMessages.CLAUDE_AI_TEMPERATURE_UPDATED,
        ConfigMessages.CLAUDE_AI_TEMPERATURE_SAVED
      );
    }

    // Update ClaudeAIMaxToken
    if (ClaudeAIMaxToken !== undefined) {
      await updateConfiguration(
        userId,
        "ClaudeAIMaxToken",
        ClaudeAIMaxToken,
        ConfigMessages.CLAUDE_AI_MAX_TOKEN_UPDATED,
        ConfigMessages.CLAUDE_AI_MAX_TOKEN_SAVED
      );
    }

    // Update geminiTopK
    if (geminiTopK !== undefined) {
      await updateConfiguration(
        userId,
        "geminiTopK",
        geminiTopK,
        ConfigMessages.GEMINI_TOP_K_UPDATED,
        ConfigMessages.GEMINI_TOP_K_SAVED
      );
    }

    // Update geminiMaxOutputTokens
    if (geminiMaxOutputTokens !== undefined) {
      await updateConfiguration(
        userId,
        "geminiMaxOutputTokens",
        geminiMaxOutputTokens,
        ConfigMessages.GEMINI_MAX_OUTPUT_TOKENS_UPDATED,
        ConfigMessages.GEMINI_MAX_OUTPUT_TOKENS_SAVED
      );
    }

    // Update geminiTopP
    if (geminiTopP !== "") {
      await updateConfiguration(
        userId,
        "geminiTopP",
        geminiTopP,
        ConfigMessages.GEMINI_TOP_P_UPDATED,
        ConfigMessages.GEMINI_TOP_P_SAVED
      );
    }

    res.status(StatusCodes.OK).json({
      message: ConfigMessages.CONFIGURATIONS_UPDATED,
    });
  } catch (error) {
    console.log(error);
    next(InternalServer(error.message));
  }
};

//Helper functions 

async function updateConfiguration(
  userId,
  key,
  value,
  updateMessage,
  saveMessage
) {

  const keyRec = await userTokenPreferences.findOne({ userId });

  if (keyRec) {
    // Update existing document
    const updateQuery = { userId };
    updateQuery[key] = value;
    await userTokenPreferences.updateOne({ userId }, { $set: updateQuery });
  } else {
    // Create new document
    const newUserPreferences = new userTokenPreferences({
      userId,
      [key]: value,
    });
    await newUserPreferences.save();
  }
  return {
    message: ConfigMessages[updateMessage] || ConfigMessages[saveMessage],
  };
}
