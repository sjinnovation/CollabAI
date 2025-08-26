import { StatusCodes } from "http-status-codes";
import User from "../models/user.js";
import PromptFeedbackModel from "../models/promptFeedbacks.js";
import AISuggestion from "../models/ai-suggestion-settings.js";
import AISuggestionBatchProcessing from "../models/ai-suggestion-batch-processing.js";

// Get all users with AI suggestions data
export const getUsersWithAISuggestions = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            search = "", 
            role = "all", 
            status = "all",
            sortBy = "name",
            sortOrder = "asc"
        } = req.query;

        const skip = (page - 1) * limit;
        
        // Build query
        let query = {deletedEmail: { $exists: false }, status: "active"};
        
        // Search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Role filter
        if (role !== "all") {
            query.role = { $regex: role, $options: 'i' };
        }

        // Get total count for pagination
        const totalUsers = await User.countDocuments(query);
        
        // Build sort object
        let sortObject = {};
        if (sortBy === "name") {
            sortObject.fname = sortOrder === "asc" ? 1 : -1;
        } else if (sortBy === "role") {
            sortObject.role = sortOrder === "asc" ? 1 : -1;
        } else if (sortBy === "lastLogin") {
            sortObject.lastLogin = sortOrder === "asc" ? 1 : -1;
        } else if (sortBy === "suggestionDate") {
            sortObject.createdAt = sortOrder === "asc" ? 1 : -1;
        } else {
            sortObject.name = 1; // default sort
        }

        // Get users with pagination
        const users = await User.find(query)
            .sort(sortObject)
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        // Get AI suggestion settings
        const aiSettings = await AISuggestion.findOne({}).lean();
        const isAISuggestionsEnabled = aiSettings?.enableAISuggestion || false;

        // Get prompt feedbacks for these users
        const userIds = users.map(user => user._id);
        const promptFeedbacks = await PromptFeedbackModel.find({
            userId: { $in: userIds }
        }).lean();

        // Get latest batch processing data
        const latestBatch = await AISuggestionBatchProcessing.findOne({})
            .sort({ createdAt: -1 })
            .lean();

        // Combine data
        const usersWithSuggestions = users.map(user => {
            const feedback = promptFeedbacks.find(fb => fb.userId.toString() === user._id.toString());
            const userSuggestion = latestBatch?.aiSuggestions?.find(suggestion => 
                suggestion.userId.toString() === user._id.toString()
            );

            // Clean/flatten suggestion array if needed (improved pattern detection)
            let cleanedSuggestion = feedback?.feedback || null;
            if (Array.isArray(cleanedSuggestion) && cleanedSuggestion[0] && Array.isArray(cleanedSuggestion[0].suggestion)) {
                cleanedSuggestion = JSON.parse(JSON.stringify(cleanedSuggestion)); // deep clone
                cleanedSuggestion[0].suggestion = cleanedSuggestion[0].suggestion.flatMap((item) => {
                    if (
                        typeof item === 'string' &&
                        /\[\{\s*suggestions\s*:/.test(item)
                    ) {
                        // Extract the array inside suggestions: [ ... ]
                        const match = item.match(/suggestions\s*:\s*\[(.*)\]\s*\}/s);
                        if (match && match[1]) {
                            // Split by comma, but ignore commas inside quotes
                            const arr = match[1].split(/,(?=(?:[^']*'[^']*')*[^']*$)/).map(s => {
                                // Remove leading/trailing spaces and quotes
                                let trimmed = s.trim();
                                if (trimmed.startsWith("'")) trimmed = trimmed.slice(1);
                                if (trimmed.endsWith("'")) trimmed = trimmed.slice(0, -1);
                                return trimmed.replace(/\\"/g, '"');
                            }).filter(Boolean);
                            return arr;
                        }
                        return [item];
                    }
                    return [item];
                });
            }

            return {
                id: user._id.toString(),
                name: `${user.fname || ''} ${user.lname || ''}`.trim() || 'Unknown User',
                email: user.email || 'No email',
                avatar: user.fname ? user.fname.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U'),
                role: user.role || "user",
                enabled: user.aiSuggestionsEnabled !== false,
                lastLogin: user.lastLogin || user.updatedAt,
                suggestion: cleanedSuggestion,
                suggestionDate: feedback?.createdAt || null,
                isAccepted: userSuggestion?.isAccepted || false
            };
        });

        // Apply status filter after data combination
        let filteredUsers = usersWithSuggestions;
        if (status !== "all") {
            filteredUsers = usersWithSuggestions.filter(user => {
                if (status === "enabled") return user.enabled;
                if (status === "disabled") return !user.enabled;
                return true;
            });
        }

        return res.status(StatusCodes.OK).json({
            users: filteredUsers,
            pagination: {
                current: parseInt(page),
                pageSize: parseInt(limit),
                total: totalUsers,
                totalPages: Math.ceil(totalUsers / limit)
            }
        });
    } catch (error) {
        console.error("Error fetching users with AI suggestions:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            message: "Internal Server Error" 
        });
    }
};

// Toggle AI suggestions for a single user
export const toggleUserAISuggestions = async (req, res) => {
    try {
        const { userId } = req.params;
        const { enabled } = req.body;

        if (typeof enabled !== 'boolean') {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                message: "Enabled field must be a boolean" 
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { aiSuggestionsEnabled: enabled },
            { new: true }
        );

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ 
                message: "User not found" 
            });
        }

        return res.status(StatusCodes.OK).json({
            message: `AI suggestions ${enabled ? 'enabled' : 'disabled'} for user`,
            user: {
                id: user._id,
                name: `${user.fname || ''} ${user.lname || ''}`.trim() || 'Unknown User',
                email: user.email,
                aiSuggestionsEnabled: user.aiSuggestionsEnabled
            }
        });
    } catch (error) {
        console.error("Error toggling user AI suggestions:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            message: "Internal Server Error" 
        });
    }
};

// Bulk toggle AI suggestions for multiple users
export const bulkToggleAISuggestions = async (req, res) => {
    try {
        const { userIds, enabled } = req.body;

        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                message: "User IDs array is required" 
            });
        }

        if (typeof enabled !== 'boolean') {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                message: "Enabled field must be a boolean" 
            });
        }

        const result = await User.updateMany(
            { _id: { $in: userIds } },
            { aiSuggestionsEnabled: enabled }
        );

        return res.status(StatusCodes.OK).json({
            message: `AI suggestions ${enabled ? 'enabled' : 'disabled'} for ${result.modifiedCount} users`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error("Error bulk toggling AI suggestions:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            message: "Internal Server Error" 
        });
    }
};

// Export AI suggestions report
export const exportAISuggestionsReport = async (req, res) => {
    try {
        const { 
            format = 'json',
            search = "",
            role = "all",
            status = "all"
        } = req.query;

        // Build query based on search and filters
        let query = {deletedEmail: { $exists: false }, status: "active"};
        
        // Search filter
        if (search) {
            query.$or = [
                { fname: { $regex: search, $options: 'i' } },
                { lname: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Role filter
        if (role !== "all") {
            query.role = { $regex: role, $options: 'i' };
        }

        // Get users based on search and filters
        const users = await User.find(query).lean();

        // Get all prompt feedbacks
        const promptFeedbacks = await PromptFeedbackModel.find({}).lean();

        // Get latest batch processing data
        const latestBatch = await AISuggestionBatchProcessing.findOne({})
            .sort({ createdAt: -1 })
            .lean();

        // Helper function to extract suggestions from complex data structure
        const extractSuggestions = (suggestionData) => {
            if (!suggestionData) return null;
            
            // Helper function to format suggestions as numbered list
            const formatSuggestionsAsList = (suggestions) => {
                if (!Array.isArray(suggestions)) return suggestions;
                return suggestions.map((suggestion, index) => 
                    `${index + 1}. ${suggestion}`
                ).join('\n');
            };
            
            // Handle array of suggestions
            if (Array.isArray(suggestionData)) {
                // If it's an array of strings, return the first few as numbered list
                if (suggestionData.length > 0 && typeof suggestionData[0] === 'string') {
                    return formatSuggestionsAsList(suggestionData.slice(0, 4));
                }
                
                // If it's an array of objects with suggestion property
                if (suggestionData.length > 0 && suggestionData[0]?.suggestion) {
                    const suggestions = suggestionData[0].suggestion;
                    if (Array.isArray(suggestions)) {
                        return formatSuggestionsAsList(suggestions.slice(0, 4));
                    }
                    return suggestions;
                }
                
                // If it's an array of objects, try to extract meaningful text
                return suggestionData.slice(0, 2).map((item, index) => 
                    `${index + 1}. ${typeof item === 'string' ? item : JSON.stringify(item)}`
                ).join('\n');
            }
            
            // Handle object with suggestion property
            if (suggestionData?.suggestion) {
                const suggestions = suggestionData.suggestion;
                if (Array.isArray(suggestions)) {
                    return formatSuggestionsAsList(suggestions.slice(0, 4));
                }
                return suggestions;
            }
            
            // Handle plain string
            if (typeof suggestionData === 'string') {
                return suggestionData;
            }
            
            // Fallback: stringify the object
            return JSON.stringify(suggestionData);
        };

        // Combine data
        let reportData = users.map(user => {
            const feedback = promptFeedbacks.find(fb => fb.userId.toString() === user._id.toString());
            const userSuggestion = latestBatch?.aiSuggestions?.find(suggestion => 
                suggestion.userId.toString() === user._id.toString()
            );

            return {
                userId: user._id.toString(),
                name: `${user.fname || ''} ${user.lname || ''}`.trim() || 'Unknown User',
                email: user.email || 'No email',
                role: user.role || "user",
                aiSuggestionsEnabled: user.aiSuggestionsEnabled !== false,
                suggestion: extractSuggestions(feedback?.feedback) || null,
                suggestionDate: feedback?.createdAt || null,
                isAccepted: userSuggestion?.isAccepted || false,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            };
        });

        // Apply status filter after data combination
        if (status !== "all") {
            reportData = reportData.filter(user => {
                if (status === "enabled") return user.aiSuggestionsEnabled;
                if (status === "disabled") return !user.aiSuggestionsEnabled;
                return true;
            });
        }

        // Generate report based on format
        if (format === 'csv') {
            const csvHeaders = [
                'User ID', 'Name', 'Email', 'Role', 'AI Suggestions Enabled', 
                'Suggestion', 'Suggestion Date', 'Is Accepted', 
                'Created At', 'Updated At'
            ];
            
            const csvData = reportData.map(user => [
                user.userId,
                user.name,
                user.email,
                user.role,
                user.aiSuggestionsEnabled ? 'Yes' : 'No',
                user.suggestion || '',
                user.suggestionDate ? new Date(user.suggestionDate).toISOString() : '',
                user.isAccepted ? 'Yes' : 'No',
                new Date(user.createdAt).toISOString(),
                new Date(user.updatedAt).toISOString()
            ]);

            const csvContent = [csvHeaders, ...csvData]
                .map(row => row.map(field => `"${field}"`).join(','))
                .join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=ai-suggestions-report.csv');
            return res.status(StatusCodes.OK).send(csvContent);
        }

        // Default JSON format
        return res.status(StatusCodes.OK).json({
            report: {
                generatedAt: new Date().toISOString(),
                totalUsers: reportData.length,
                usersWithSuggestions: reportData.filter(user => user.suggestion).length,
                acceptedSuggestions: reportData.filter(user => user.isAccepted).length,
                data: reportData
            }
        });
    } catch (error) {
        console.error("Error exporting AI suggestions report:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            message: "Internal Server Error" 
        });
    }
}; 