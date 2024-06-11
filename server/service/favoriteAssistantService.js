import FavouriteAssistant from '../models/favourite_assistant.js';

export const createFavouriteAssistantService = async (assistant_id, user_id) => {
    return await FavouriteAssistant.create({ assistant_id, user_id });
};

export const getAllFavouriteAssistantService = async () => {
    return await FavouriteAssistant.find();
};

export const getSingleFavouriteAssistantService = async (assistant_id) => {
    return await FavouriteAssistant.findOne({ assistant_id: assistant_id });
};
export const getSingleFavouriteAssistantByIdOrUserIdService = async (id) => {
    return await FavouriteAssistant.find({ $or: [{ _id: id }, { user_id: id }] });
};

export const getFavouriteAssistantByAssistantIdAndUserIdService = async (assistant_id, user_id) => {
    return await FavouriteAssistant.findOne({ assistant_id, user_id });
};

export const deleteFavouriteAssistantService = async (assistant_id) => {
    return await FavouriteAssistant.findOneAndDelete({ assistant_id: assistant_id });
};
export const deleteManyFavouriteAssistantService = async (assistant_id) => {
    return await FavouriteAssistant.deleteMany({ assistant_id: assistant_id });
};

export const updateSingleFavouriteAssistantService = async (id, updatedData) => {
    return await FavouriteAssistant.findByIdAndUpdate(id, updatedData, { new: true });
};

export const countFavouriteAssistantService = async (assistant_id) => {
    return await FavouriteAssistant.countDocuments({ assistant_id: assistant_id })
};

