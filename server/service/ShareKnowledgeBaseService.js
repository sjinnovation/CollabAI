import KnowledgeBase from "../models/knowledgeBase.js";
import ShareKnowledgeBase from "../models/shareKnowledgeBase.js"
import User from "../models/user.js";

export const grantAccessToKnowledgeBaseService = async (id, body) => {
    try {
        const isKnowledgeBaseExists = await KnowledgeBase.findById(id);

        if(!isKnowledgeBaseExists) return false;

        const updateKnowledgeBase = await KnowledgeBase.findByIdAndUpdate(
            id,
            { isKnowledgeBaseShareable: true },
            { new: true }
        );

        if(updateKnowledgeBase) {
            const response = await ShareKnowledgeBase.insertMany(body);
            if(response) {
               const updatedAllChildData =  await KnowledgeBase.updateMany(
                    { parentId: updateKnowledgeBase._id },
                    { $set: { isFileShared: true, isKnowledgeBaseShareable: true,sharedKnowledgeBaseOwner: updateKnowledgeBase?.owner } }    
                );

                if(!updatedAllChildData) {
                    console.error("Couldn't store data to db");
                    return false;
                }

            }
            if(response) {
                return response;
            } 
            else {
                console.error("Couldn't store data to db");
                return false;
            }
        }
        else {
            console.error("Failed to update knowledge base");
            return false;
        }
        
    } catch (error) {
        console.error(error);
        return false;
    }
}

export const removeAccessFromSharedKnowledgeBaseService = async (knowledgeBaseId, body) => {
    try {
        // const deletedIds = body.map(() => knowledgeBaseId);
        const deletedIds = body.map((user) => user.collaborator);
       
        const removeAccess = await ShareKnowledgeBase.deleteMany({
            knowledgeBaseId: knowledgeBaseId,
            collaborator: { $in: deletedIds }   
        });

        if(removeAccess) {
            const sharedKnowledgeBase = await ShareKnowledgeBase.find({ knowledgeBaseId: knowledgeBaseId});
            if(sharedKnowledgeBase.length <= 0) {
                const updateKnowledgeBase = await KnowledgeBase.findByIdAndUpdate(
                    knowledgeBaseId,
                    { isKnowledgeBaseShareable: false, isFileShared: false },
                    { new: true }
                );
                await KnowledgeBase.updateMany(
                    { parentId: knowledgeBaseId },
                    { $set: { isFileShared: false, isKnowledgeBaseShareable: false } }
                )
                if(!updateKnowledgeBase) {
                    console.error("Failed to update knowledge base");
                    return false;
                }
                return true;
            }
            return true;
        }
        else {
            console.error("Failed to delete data from db");
            return false;
        }
    } catch (error) {
        console.error(error);
        return false;
    }
}

export const getUserForFolderAccessService = async (knowledgeBaseId, page = 1, limit = 10, searchTerm, userId) => {
    try {
        const existingUsers = await ShareKnowledgeBase.find({knowledgeBaseId: knowledgeBaseId}).select("collaborator");

        const existingUserIds = existingUsers.map(access => access.collaborator);

        let usersWithoutAccess = []

        const query = {
            _id: { $nin: existingUserIds }, 
             $or: [
                { fname: { $regex: searchTerm, $options: 'i' } }, 
                { lname: { $regex: searchTerm, $options: 'i' } } 
            ]
        };

        if(searchTerm) {
            usersWithoutAccess  = await User.find({
                _id: { $nin: [...existingUserIds, userId] },
                 $or: [
                    { fname: { $regex: searchTerm, $options: 'i' } }, 
                    { lname: { $regex: searchTerm, $options: 'i' } } 
                ]
            }).select("_id fname lname email userAvatar");
        } else {
            usersWithoutAccess = await User.find({
                _id: { $nin: [...existingUserIds, userId] }
            }).select("_id fname lname email userAvatar").skip((page - 1) * limit) 
            .limit(parseInt(limit));
        }

        const totalCount = await User.countDocuments(query);

        if(usersWithoutAccess) {
            return {
            success: true,
            data: usersWithoutAccess,
            total: totalCount,
            page: parseInt(page),
            totalPages: Math.ceil(totalCount / limit),
        }
        }else {
            console.error("Couldn't get data from db");
            return false;
        }
    } catch (error) {
        console.error(error);
        return false;
    }
} 

export const getExistingAccessedUsersByFolderService = async (knowledgeBaseId, page = 1, limit = 10) => {
    try {
        let existingUsers = await ShareKnowledgeBase.find({knowledgeBaseId: knowledgeBaseId}).select("collaborator").populate({ 
            path: 'collaborator',
            select: '_id fname lname email userAvatar',
            model: User
        })


        existingUsers = existingUsers.map(user => user.collaborator);

        const totalCount = await ShareKnowledgeBase.countDocuments({knowledgeBaseId: knowledgeBaseId});

        if(existingUsers) {
            return {
            success: true,
            data: existingUsers,
            total: totalCount,
            page: parseInt(page),
            totalPages: Math.ceil(totalCount / limit),
        }
        }else {
            console.error("Couldn't get data from db");
            return false;
        }
    } catch (error) {
        console.error(error);
        return false;
    }
} 