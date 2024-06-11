import userTokenPreferences from '../models/userModalPreferancesModel.js';

export const getUserPreferencesById = async (userId) => {
    try {
      const preferences = await userTokenPreferences.findOne({ userId });
      return preferences || null;
    } catch (error) {
      throw new Error(`Error fetching user preferences: ${error.message}`);
    }
  };
