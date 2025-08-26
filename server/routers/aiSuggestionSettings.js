import express from "express";
import authenticateUser from "../middlewares/login.js";
import {
  getAISuggestionSettings,
  updateAISuggestionSettings,
  getAISuggestionBatchProcessing,
  updateAISuggestionBatchProcessing,
  // analyzePrompts,
  analyzePromptsBatchAPI,
  getUserPromptSuggestion,
  generateAssistantSuggestionsForDesignations,
  getAssistantSuggestionsForUser,
} from "../controllers/aiSuggestionSettingsController.js";  

const aiSuggestionSettingsRouter = express.Router();
aiSuggestionSettingsRouter.use(authenticateUser);
aiSuggestionSettingsRouter.get(
  "/get-ai-suggestion-settings",
  getAISuggestionSettings
);
aiSuggestionSettingsRouter.patch(
  "/update-ai-suggestion-settings",
  updateAISuggestionSettings
);
aiSuggestionSettingsRouter.get(
  "/get-ai-suggestion-batch-processing",
    getAISuggestionBatchProcessing
);
aiSuggestionSettingsRouter.patch(
  "/update-ai-suggestion-batch-processing",
  updateAISuggestionBatchProcessing
);
aiSuggestionSettingsRouter.get(
  "/run-batch-processing",
  // analyzePrompts
  analyzePromptsBatchAPI
);
aiSuggestionSettingsRouter.get('/user-suggestion/:userId', getUserPromptSuggestion);
aiSuggestionSettingsRouter.get('/generate-assistant-suggestions-by-designation', generateAssistantSuggestionsForDesignations);
aiSuggestionSettingsRouter.get('/assistant-suggestions/:userId', getAssistantSuggestionsForUser);
export default aiSuggestionSettingsRouter;