import PinnedAssistant from '../models/pinnedAssistantModel.js';
import mongoose from 'mongoose';
export const createPinnedAssistantService = async (assistant_id, user_id) => {
    return await PinnedAssistant.create({ assistantId : assistant_id,userId : user_id });
};

export const getAllPinnedAssistantService = async (assistant_id) => {
    return await PinnedAssistant.find({assistant_id});
};

export const getSinglePinnedAssistantService = async (assistantId) => {

    return await PinnedAssistant.findOne({ assistantId: assistantId.toString() });

};
export const getSinglePinnedAssistantByIdOrUserIdService = async (id) => {
    return await PinnedAssistant.find({ $or: [{ _id: id }, { user_id: id }] });
};

export const getPinnedAssistantByAssistantIdAndUserIdService = async (assistant_id, user_id) => {
    return await PinnedAssistant.findOne({ assistantId: assistant_id, userId : user_id });
};

export const deletePinnedAssistantService = async (assistantId,userId) => {
    return await PinnedAssistant.findOneAndDelete({ assistantId: assistantId,userId : userId });
};
export const deleteManyPinnedAssistantService = async (assistantId) => {
    return await PinnedAssistant.deleteMany({ assistantId: assistantId });
};

export const updateSinglePinnedAssistantService = async (id, updatedData) => {
    return await PinnedAssistant.findByIdAndUpdate(id, updatedData, { new: true });
};

export const countPinnedAssistantService = async (assistant_id) => {
    return await PinnedAssistant.countDocuments({ assistant_id: assistant_id })
};

export const getSingleUsersPinnedAssistService = async (id)=>{
    return await PinnedAssistant.find({userId : new mongoose.Types.ObjectId(id)});
};