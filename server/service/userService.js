import User ,{UserRole} from "../models/user.js";
import { UserMessages, PromptMessages } from "../constants/enums.js";

export const getUserCustomization = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
          throw new Error('User not found');
        }
    
        const { userPreferences, desiredAiResponse } = user;
        return { userPreferences, desiredAiResponse };
      } catch (error) {
        console.error(error);
        throw error;
      }
}

/**
 * Updates the maximum user tokens after a usage.
 *
 * @async
 * @function updateMaxUserTokens
 * @description Deducts a specified number of tokens from the user's token balance.
 * @param {string} userId - The ID of the user whose token count needs updating.
 * @param {number} tokensUsed - The number of tokens to deduct.
 * @returns {Promise<Object>} A promise that resolves with the success status and any relevant messages.
 * @throws {Error} Will throw an error if the update operation fails.
 */

export const updateMaxUserTokens = async (userId, tokensUsed) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: UserMessages.USER_NOT_FOUND };
    }
    if (user.role === UserRole.SUPER_ADMIN) {
        return { success: true }; 
    }
    const totalMaxUserTokens = user.maxusertokens - tokensUsed;

    user.maxusertokens = totalMaxUserTokens;
    await user.save();

    return { success: true };
  } catch (error) {
    console.error(`Failed to update max user tokens: ${error.message}`);
  }
};

/**
 * Checks if a user's token count is exhausted.
 *
 * @async
 * @function checkMaxUserTokensExhausted
 * @description Checks if a user has any tokens left before allowing further operations.
 * @param {string} userId - The ID of the user whose token count is being checked.
 * @param {Function} [next] - Optional next function for middleware use in Express.
 * @returns {void}
 * @throws {Error} Will throw an error if the user's tokens are exhausted or the user is not found.
 */
export const checkMaxUserTokensExhausted = async (userId, next) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error(UserMessages.USER_NOT_FOUND);
    }

    const maxTokens = user.maxusertokens;

    if (maxTokens <= 0) {
      throw new Error(PromptMessages.TOKEN_LIMIT_EXCEEDED);
    }

    if (next) {
      next();
    }
  } catch (error) {
    throw new Error(error.message);
  }
};
