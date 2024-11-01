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
export const getAllPublicAssistantPaginatedService = async (skip, limit, query) => {
    if (Object.keys(query).length > 0) {

        const [allPublicAssistant, totalCount] = await Promise.all([
            Assistant.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Assistant.countDocuments(query),
        ]);
        return { allPublicAssistant, totalCount }
    }

    const [allPublicAssistant, totalCount] = await Promise.all([
        await PublicAssistant.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        PublicAssistant.countDocuments(query),
    ]);

    return { allPublicAssistant, totalCount }
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

export const getPublicFeaturedAssistantWithQueryService = async (queryConditions, featuredSkip, featuredLimit) => {
    const [featuredAssistants, totalCount] = await Promise.all([
    Assistant.find({
        is_public: true,
        is_featured: true,
        ...queryConditions
    }).skip(featuredSkip)
        .limit(featuredLimit)
        .populate({ path: 'userId', select: 'fname lname' })
        .lean(),

    Assistant.countDocuments({ ...queryConditions,is_public: true,is_featured: true, })
    ]);
    return {featuredAssistants, totalCount};

};


export const getPublicAssistantWithQueryService = async (typeId, queryConditions, skip, limit) => {
    return await Assistant.find({ assistantTypeId: typeId, ...queryConditions, is_featured: false })
        .skip(skip)
        .limit(limit)
        .populate({ path: 'userId', select: 'fname lname' });

};

export const getDistinctPublicAssistantWithQueryService = async (queryConditions) => {
    return await Assistant.distinct('assistantTypes', queryConditions)
        .collation({ locale: 'en', strength: 2 })
        .then((types) => {
            // Function to remove any leading non-alphabetic characters
            const getTextWithoutIcon = (str) => {
                return str.replace(/^[^a-zA-Z]+/, '').trim();
            };
            types.sort((a, b) => {
                const textA = getTextWithoutIcon(a);
                const textB = getTextWithoutIcon(b);

                return textA.localeCompare(textB, 'en', { sensitivity: 'base' });
            });

            return types
        })
        .catch((error) => {
            console.error('Error sorting assistantTypes:', error);
        });

}

export const getPublicAssistantWithQueryConditionService = async (typeId, queryConditions,limit,skip) => {
    const [assistants, totalCount] = await Promise.all([
        Assistant.aggregate([
            {
                $match: { ...queryConditions, assistantTypeId: typeId, is_featured: false },
            },
            {
                $lookup: {
                    from: 'users', 
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                    pipeline: [
                        { $project: { fname: 1, lname: 1 } } 
                    ]
                },
            },
            {
                $unwind: '$user', // Unwind user array
            },
            {
                $project: {
                    'user.fname': 1,
                    'user.lname': 1,
                    assistant_id: 1,
                    name: 1,
                    model: 1,
                    description: 1,
                    instructions: 1,
                    file_ids: 1,
                    is_deleted: 1,
                    model: 1,
                    teamId: 1,
                    static_questions: 1,
                    is_active: 1,
                    tools: 1,
                    category: 1,
                    createdBy: 1,
                    userId: 1,
                    image_url: 1,
                    is_public: 1,
                    is_featured: 1,
                    is_pinned: 1,
                    assistantTypes: 1,
                    assistantTypeId: 1,
                    functionCalling: 1,
                    functionDefinitionIds: 1,
    
                },
            },
            { $skip: skip },
            { $limit: limit },
        ]),
        Assistant.countDocuments({ ...queryConditions, assistantTypeId: typeId, is_featured: false }),
    ]);
    return { assistants, totalCount }
};