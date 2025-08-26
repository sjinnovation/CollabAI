//TODO: Delete file as none of its functions are called
import User from "../models/user.js";
import Uprompt from "../models/userPromptModel.js";
import promptModel from "../models/promptModel.js";
import Company from "../models/companyModel.js";
import AssistantRating from "../models/assistantRatingModel.js";

export const createAssistantRatingService = async (
  assistantIdRef,
  userId,
  rating,
  assistantId
) => {
  try {
    const isUserAlreadyRated = await AssistantRating.findOne({
      assistant_id: assistantId,
      user_id: userId,
    });
    if (isUserAlreadyRated) {
        const updatedAssistantRating = await AssistantRating.findOneAndUpdate(
            { assistant_id: assistantId, user_id: userId },
            { rating: rating },
            { new: true }
        );
        return { updatedAssistantRating, isUserAlreadyRated: true };
    } else {
      const assistantRating = new AssistantRating({
        assistantIdRef: assistantIdRef,
        assistant_id: assistantId,
        user_id: userId,
        rating: rating,
      });
      await assistantRating.save();
      return { assistantRating, isUserAlreadyRated: false };
    }
  } catch (error) {
    console.error("Error creating assistant rating:", error);
    throw error;
  }
};

export const getAssistantRatingService = async (assistantId) => {
  try {
    const assistantRating = await AssistantRating.aggregate([
      { $match: { assistant_id: assistantId } },
      {
        $group: {
          _id: "$assistant_id",
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
        },
      },
    ]);
    return assistantRating;
  } catch (error) {
    console.error("Error getting assistant rating:", error);
    throw error;
  }
};

export const getAllAssistantRatingService = async () => {
  try {
    const assistantRating = await AssistantRating.aggregate([
      {
        $group: {
          _id: "$assistant_id",
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
        },
      },
    ]);
    return assistantRating;
  } catch (error) {
    console.error("Error getting all assistant rating:", error);
    throw error;
  }
}

export const getAssistantRatingByUserIdService = async (userId, assistantId) => {
  try {
    const userRating = await AssistantRating.findOne({ 
      user_id: userId,
      assistant_id: assistantId 
    });

    const overallRating = await AssistantRating.aggregate([
      { $match: { assistant_id: assistantId } },
      {
        $group: {
          _id: "$assistant_id",
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    return {
      userRating: userRating ? userRating.rating : null,
      overallRating: overallRating[0] || null
    };

  } catch (error) {
    console.error("Error getting assistant rating by user id:", error);
    throw error;
  }
}