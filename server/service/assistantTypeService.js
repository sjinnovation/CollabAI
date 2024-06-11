import AssistantTypes from "../models/assistantTypes.js";

export const createSingleAssistantTypesService = async (name) => {
    const isExistingType = await AssistantTypes.findOne({ name: name }).lean();
    if (!isExistingType) {
        const data = await AssistantTypes.create({ name: name });
        return data;
    }
    return false
};
export const getAllAssistantTypesService = async () => {
    return await AssistantTypes.find();
};
export const getSingleAssistantTypesService = async (id) => {
    return await AssistantTypes.findOne({ _id: id });
};

export const updateSingleAssistantTypesService = async (id, updatedType) => {
    return await AssistantTypes.findByIdAndUpdate(id, updatedType, { new: true });
};
export const deleteSingleAssistantTypesService = async (id) => {
    return await AssistantTypes.findOneAndDelete({ _id: id });
};
