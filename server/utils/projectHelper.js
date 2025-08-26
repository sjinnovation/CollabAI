import { getOpenAIInstance } from "../config/openAI.js";
import { deleteAssistantFileByID } from "../lib/openai.js";
import { deleteFilesFromVectorStoreUtils } from "../lib/vectorStore.js";
import FolderChat from "../models/folderModel.js";
import { getFolderChatByIdService } from "../service/folderChatService.js";

export const deleteThreadFromProject =async (threadId,projectId)=>{
    try{
    const openai = await getOpenAIInstance();

    const folderInfo = await getFolderChatByIdService(projectId);
    if (!folderInfo) {
        return res.status(StatusCodes.NOT_FOUND).json({
            message: "Folder not found"
        });
    }

    const vectorStoreIds = new Set();
    const filesToDelete = new Set();

    // Check both fileInfo and threadFilesInfo for matching threadId
    ['fileInfo', 'threadFilesInfo'].forEach(field => {
        folderInfo[field]?.forEach(file => {
            if (file.threadId === threadId && file.fileId) {
                filesToDelete.add(file.fileId);
                if (file.vectorStoreId) {
                    vectorStoreIds.add(file.vectorStoreId);
                }
            }
        });
    });

    // Delete from vector stores
    for (const vectorStoreId of vectorStoreIds) {
        try {
            const responseVectorDelete = await deleteFilesFromVectorStoreUtils(openai, vectorStoreId, Array.from(filesToDelete));
        } catch (error) {
            console.error(`Error deleting from vector store ${vectorStoreId}:`, error);
        }
    }

    // Delete from OpenAI
    const deletePromises = Array.from(filesToDelete).map(fileId => 
        deleteAssistantFileByID(openai, null, fileId)
            .catch(error => console.error(`Error deleting OpenAI file ${fileId}:`, error))
    );

    await Promise.all(deletePromises);

    // Update database
    const updateFolder = await FolderChat.updateOne(
        { _id: projectId },
        {
            $pull: {
                'fileInfo': { threadId: threadId },
                'threadFilesInfo': { threadId: threadId }
            }
        }
    );
    return {
        summary: {
            deletedFiles: Array.from(filesToDelete),
            vectorStoresUpdated: Array.from(vectorStoreIds),
            databaseUpdate: updateFolder
        }
    }
}catch(error){
    return 

}

}
