import PinnedAssistant from '../models/pinnedAssistantModel.js';

export const createPinnedAssistantService = async (assistant_id, user_id) => {
    return await PinnedAssistant.create({ assistantId : assistant_id,userId : user_id });
};

export const getAllPinnedAssistantService = async (assistant_id) => {
    return await PinnedAssistant.find({assistant_id});
};

export const getSinglePinnedAssistantService = async (assistant_id) => {
    return await PinnedAssistant.findOne({ assistant_id: assistant_id });
};
export const getSinglePinnedAssistantByIdOrUserIdService = async (id) => {
    return await PinnedAssistant.find({ $or: [{ _id: id }, { user_id: id }] });
};

export const getPinnedAssistantByAssistantIdAndUserIdService = async (assistant_id, user_id) => {
    return await PinnedAssistant.findOne({ assistantId: assistant_id, userId : user_id });
};

export const deletePinnedAssistantService = async (assistant_id) => {
    return await PinnedAssistant.findOneAndDelete({ assistant_id: assistant_id });
};
export const deleteManyPinnedAssistantService = async (assistant_id) => {
    return await PinnedAssistant.deleteMany({ assistant_id: assistant_id });
};

export const updateSinglePinnedAssistantService = async (id, updatedData) => {
    return await PinnedAssistant.findByIdAndUpdate(id, updatedData, { new: true });
};

export const countPinnedAssistantService = async (assistant_id) => {
    return await PinnedAssistant.countDocuments({ assistant_id: assistant_id })
};

