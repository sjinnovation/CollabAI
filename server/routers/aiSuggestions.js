import express from "express";
import authenticateUser from "../middlewares/login.js";
import {
  getUsersWithAISuggestions,
  toggleUserAISuggestions,
  bulkToggleAISuggestions,
  exportAISuggestionsReport,
} from "../controllers/aiSuggestionsController.js";

const aiSuggestionsRouter = express.Router();

// Apply authentication middleware
aiSuggestionsRouter.use(authenticateUser);

// Get all users with AI suggestions (with pagination, search, filters)
aiSuggestionsRouter.get("/users", getUsersWithAISuggestions);

// Toggle AI suggestions for a single user
aiSuggestionsRouter.patch("/toggle/:userId", toggleUserAISuggestions);

// Bulk toggle AI suggestions for multiple users
aiSuggestionsRouter.patch("/bulk-toggle", bulkToggleAISuggestions);

// Export AI suggestions report
aiSuggestionsRouter.get("/export", exportAISuggestionsReport);

export default aiSuggestionsRouter; 