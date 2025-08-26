import { response } from 'express';
import PublicAssistant from '../models/public_assistant.js';
import mongoose from 'mongoose';
import Assistant from '../models/assistantModel.js';
import { ObjectId } from 'mongodb';
import { getSingleAssistantByIdWithUserDetailsService } from '../service/assistantService.js';
import { countFavouriteAssistantService } from '../service/favoriteAssistantService.js';
import { doesAssistantExist, isOpenAIFileObjectExist, retrieveOpenAIFileObject } from '../lib/openai.js';

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
                    createdAt: 1,
                    updatedAt: 1,
                },
            },
            { $skip: skip },
            { $limit: limit },
        ]),
        Assistant.countDocuments({ ...queryConditions, assistantTypeId: typeId, is_featured: false }),
    ]);
    return { assistants, totalCount }
};

export const getPublicAssistantsWithDetailsService = async ({
  page = 1,
  pageSize = 10,
  searchQuery = "",
  openaiInstance,
}) => {
  const skip = (Number(page) - 1) * Number(pageSize);
  const limit = parseInt(pageSize);

  let query = { is_public: true };
  if (typeof searchQuery === "string" && searchQuery.length) {
    query.name = { $regex: new RegExp(searchQuery, "i") };
  }

  const [assistants, totalCount] = await Promise.all([
  Assistant.find(query)
  .populate({
    path: "assistantApiId",
    model: "FunctionDefinition",
    select: "name"
  })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .lean(),
    Assistant.countDocuments(query),
  ]);

  if (!assistants || assistants.length === 0) {
    return { assistants: [], totalCount: 0 };
  }

  const assistantIds = assistants.map((assistant) => assistant.assistant_id);

  const [publicAssistants, assistantDetails, favoriteCounts] =
    await Promise.all([
      PublicAssistant.find({ assistant_id: { $in: assistantIds } }).lean(),
      Promise.all(
        assistantIds.map((id) =>
          getSingleAssistantByIdWithUserDetailsService(id)
        )
      ),
      Promise.all(assistantIds.map((id) => countFavouriteAssistantService(id))),
    ]);

  const existingAssistantIds = await Promise.all(
    assistantIds.map((id) => doesAssistantExist(openaiInstance, id))
  );

  // Process file names for each assistant
  await Promise.all(
    assistants.map(async (assistant) => {
      const fileIds = assistant?.file_ids || [];
  
      const validFileChecks = await Promise.all(
        fileIds.map(async (fileId) => {
          const isValid = await isOpenAIFileObjectExist(openaiInstance, fileId);
          return isValid ? fileId : null;
        })
      );
  
      const existingFileIds = validFileChecks.filter(Boolean);
      assistant.file_ids = existingFileIds;
  
      const fileNames = await Promise.all(
        existingFileIds.map((fileId) =>
          retrieveOpenAIFileObject(fileId)
            .then((fileInfo) => fileInfo?.filename)
            .catch(() => null)
        )
      );
  
      assistant.fileNames = fileNames.filter(Boolean);
    })
  );
  

  const result = assistants
    .filter((_, index) => existingAssistantIds[index])
    .map((assistant, index) => {
      const assistantDetail = assistantDetails[index];
      const publicAssistant = publicAssistants.find(
        (pa) => pa.assistant_id === assistant.assistant_id
      );
      const count = favoriteCounts[index];

      if (!assistantDetail || !publicAssistant) return null;

      const enrichedAssistant = {
        ...assistantDetail,
        count,
        assistantApiId: assistant.assistantApiId,
        fileNames: assistant.fileNames, // Add fileNames to the enriched assistant
      };
      enrichedAssistant.userInfo = `${assistantDetail?.userId?.fname || ""} ${
        assistantDetail?.userId?.lname || ""
      }`.trim();
      enrichedAssistant.userId = assistantDetail?.userId?._id;

      return enrichedAssistant;
    })
    .filter(Boolean);

  return { assistants: result, totalCount };
};
