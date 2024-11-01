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
export const getSingleFavouriteAssistantByIdOrUserIdService = async (id, skip, limit, query) => {
    if (Object.keys(query).length > 0) {
        const results = await FavouriteAssistant.aggregate([
            {
                $lookup: {
                    from: "assistants",
                    localField: "assistant_id",
                    foreignField: "assistant_id",
                    as: "assistantInfo",
                },
            },
            {
                $unwind: "$assistantInfo",
            },
            {
                $match: {
                    "assistantInfo.name": query.name,
                    "assistantInfo.is_public": true
                },
            },
            {
                $project: {
                    assistant_id: 1,
                    user_id: 1,
                    "assistantInfo.name": 1,
                },
            },
            {
                $match: {
                    assistant_id: { $exists: true },
                },
            },
        ]);
        const totalCount = results.length;
        return { favoriteAssistantById: results, totalCount };

    }
    const [favoriteAssistantById, totalCount] = await Promise.all([
        FavouriteAssistant.find({ $or: [{ _id: id }, { user_id: id }] })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        FavouriteAssistant.countDocuments({ $or: [{ _id: id }, { user_id: id }] }),
    ]);
    return { favoriteAssistantById, totalCount };
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

