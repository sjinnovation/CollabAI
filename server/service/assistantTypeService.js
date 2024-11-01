import Assistant from "../models/assistantModel.js";
import AssistantTypes from "../models/assistantTypes.js";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";
const cleanText = (text) => {
    return text.replace(/^[^\w\s]+/, '').trim(); // Removes non-word characters at the beginning
};
export const createSingleAssistantTypesService = async (name) => {

    const searchText = cleanText(name);
    const regex = new RegExp(searchText, 'i'); // Case-insensitive search
    const isExistingType = await AssistantTypes.findOne({ name: regex }).lean();
    if (!isExistingType) {
        const data = await AssistantTypes.create({ name: name });
        return data;
    }
    return false
};

export const getAllAssistantTypesService = async () => {
    return await AssistantTypes.find({ delete: false }).sort({ createdAt: -1 });
};
export const getSingleAssistantTypesService = async (id) => {
    return await AssistantTypes.findOne({ _id: id });
};

export const updateSingleAssistantTypesService = async (id, updatedType) => {
    const assistantTypeId = new ObjectId(id);
    const updateAssistantsType = await Assistant.find({ assistantTypeId: id });
    for(const assistant of updateAssistantsType){
        const responseOfUpdate = await Assistant.findByIdAndUpdate({_id: assistant._id},{assistantTypes:updatedType.name})
    }
    return await AssistantTypes.findByIdAndUpdate(id, updatedType, { new: true });
};
export const deleteSingleAssistantTypesService = async (id) => {
    return await AssistantTypes.findByIdAndUpdate({ _id: id }, { delete: true });
};
export const getAssistantIdByName = async (assistantType) => {
    const getAssistantType = await AssistantTypes.findOne({ name: assistantType });
    return getAssistantType?._id;

}

export const getSortedAssistantTypes = async ()=>{
    // const assistantTypes = await AssistantTypes.find();
    const assistantTypesWithoutIcon = await AssistantTypes.find({}).collation({ locale: 'en', strength: 2 })
    .then((types) => {
      const getTextWithoutIcon = (str) => {
        return str.replace(/^[^a-zA-Z]+/, '').trim();
      };

      types.sort((a, b) => {
        const textA = getTextWithoutIcon(a.name);
        const textB = getTextWithoutIcon(b.name);
        
        return textA.localeCompare(textB, 'en', { sensitivity: 'base' });
      });
  
      return types
    })

    return assistantTypesWithoutIcon;

}