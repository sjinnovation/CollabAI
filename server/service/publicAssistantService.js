import { response } from 'express';
import PublicAssistant from '../models/public_assistant.js';
import mongoose from 'mongoose';
import Assistant from '../models/assistantModel.js';
import { ObjectId } from 'mongodb';
export const createPublicAssistantService = async (assistant_id, creators_id) => {
    return await PublicAssistant.create({ assistant_id, creators_id });
};

export const getAllPublicAssistantService = async () => {
    return await PublicAssistant.find();
};

export const getSinglePublicAssistantService = async (assistant_id) => {
    return await PublicAssistant.findOne({ assistant_id: assistant_id });
};
export const getSinglePublicAssistantByIdOrAssistantIdService = async (id) => {
    const isValidObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = isValidObjectId ? { _id: id } : { assistant_id: id };
    return await PublicAssistant.findOne(query);
};
export const deletePublicAssistantService = async (assistant_id) => {
    return await PublicAssistant.deleteOne({ assistant_id: assistant_id });
};

export const getPublicFeaturedAssistantWithQueryService = async(queryConditions,featuredSkip,featuredLimit)=>{
    return await Assistant.find({
        is_public: true,
        is_featured: true,
        ...queryConditions
    }).skip(featuredSkip)
    .limit(featuredLimit)
    .populate({ path: 'userId', select: 'fname lname' });

};


export const getPublicAssistantWithQueryService =async (type,queryConditions,skip,limit)=>{
    return await Assistant.find({ assistantTypes: type, ...queryConditions,is_featured : false })
    .skip(skip)
    .limit(limit)
    .populate({ path: 'userId', select: 'fname lname' });

};


export const getDistinctPublicAssistantWithQueryService = async (queryConditions)=>{
    return await Assistant.distinct('assistantTypes', queryConditions);
}
