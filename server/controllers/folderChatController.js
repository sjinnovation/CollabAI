import { StatusCodes } from "http-status-codes";
import { getOpenAIInstance } from "../config/openAI.js";
import { createOpenAIFileObject, deleteAssistantFileByID } from "../lib/openai.js";
import { createOpenAiVectorStoreWithFileIds, createOpenAiVectorStoreWithFileIdsForProject, deleteAllTheVectorStoresOfProject, deleteFilesFromVectorStoreUtils } from "../lib/vectorStore.js";
import { createFolderChat, deleteFolderChatById, getAiPersonaByFeatured, getAllFolderChats, getFolderChatByIdService, getFolderChatsByUserId, storeProjectsFileInfoService, updateFolderChatById } from "../service/folderChatService.js";
import { deleteLocalFile } from "../utils/assistant.js";
import fs from 'fs/promises';
import path from 'path';
import FolderChat from "../models/folderModel.js";
import { convertToPdf, findFileFromDBandDownload } from "./knowledgeBase.js";
import promptModel from "../models/promptModel.js";

/**
 * @async
 * @function addFolderChat
 * @description Creates a new folder chat, optionally linking it to a featured AI persona if available.
 * @param {Object} req - Express request object containing folder chat data in the body.
 * @param {Object} res - Express response object returning the created folder chat or an error.
 * @returns {Response} 201 with created folder chat on success, or 500 with error message on failure.
 */

export const addFolderChat = async (req, res) => {
    try {
        let folderData = req.body;
        const featuredAiPersona = await getAiPersonaByFeatured()
        if(featuredAiPersona){
            folderData = {
                ...folderData,
                personaId: featuredAiPersona?._id
            }
        }
        if(req.user.role === 'user'){
            folderData = {
                ...folderData,
                model : 'gpt-4o'
            }
        }
        const newFolderChat = await createFolderChat(folderData);
        res.status(StatusCodes.CREATED).json({
            message: "Folder chat created successfully!",
            folderChat: newFolderChat
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @async
 * @function getFolderChats
 * @description Retrieves all folder chats from the database.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object returning the list of folder chats or an error.
 * @returns {Response} 200 with folder chats on success, or 500 with error message on failure.
 */

export const getFolderChats = async (req, res) => {
    try {
        const folderChats = await getAllFolderChats();
        res.status(StatusCodes.OK).json(folderChats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @async
 * @function getFolderChatById
 * @description Retrieves a specific folder chat by its ID.
 * @param {Object} req - Express request object with folderId in params.
 * @param {Object} res - Express response object returning the folder chat or an error.
 * @returns {Response} 200 with folder chat data on success, 404 if not found, or 500 with error message on failure.
 */

export const getFolderChatById = async (req, res) => {
    const { folderId } = req.params;

    try {
        const folderChat = await getFolderChatByIdService(folderId); 
        if (!folderChat) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Folder chat not found" });
        }
        res.status(StatusCodes.OK).json(folderChat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @async
 * @function updateFolderChat
 * @description Updates an existing folder chat using its ID and the provided data.
 * @param {Object} req - Express request object containing folderId in params and updated data in body.
 * @param {Object} res - Express response object returning the updated folder chat or an error.
 * @returns {Response} 200 with updated data on success, 404 if not found, or 500 with error message on failure.
 */

export const updateFolderChat = async (req, res) => {
    const { folderId } = req.params;
    const updatedData = req.body;

    try {
        const updatedFolderChat = await updateFolderChatById(folderId, updatedData);
        if (!updatedFolderChat) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Folder chat not found" });
        }
        return res.status(StatusCodes.OK).json({ message: "Folder chat updated successfully", data : updatedFolderChat });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};

/**
 * @async
 * @function deleteFolderChat
 * @description Deletes a folder chat and all associated files, vector stores, threads, and prompts.
 * @param {Object} req - Express request object containing folder chat ID in params.
 * @param {Object} res - Express response object returning a summary of deleted entities or an error.
 * @returns {Response} 200 with deletion summary on success, 404 if folder not found, or 500 on failure.
 */

export const deleteFolderChat = async (req, res) => {
    const { id } = req.params;
    const openai = await getOpenAIInstance();

    try {
        // Get folder information first
        const folderInfo = await getFolderChatByIdService(id);
        if (!folderInfo) {
            return res.status(StatusCodes.NOT_FOUND).json({ 
                message: "Folder chat not found" 
            });
        }

        // Collect all files and vector stores to delete
        const vectorStoreIds = new Set();
        const filesToDelete = new Set();
        const threadIds = new Set();

        // Process both fileInfo and threadFilesInfo
        ['fileInfo', 'threadFilesInfo','waitingFilesInfo'].forEach(field => {
            folderInfo[field]?.forEach(file => {
                if (file.fileId) {
                    filesToDelete.add(file.fileId);
                }
                if (file.vectorStoreId) {
                    vectorStoreIds.add(file.vectorStoreId);
                }
                if (file.threadId) {
                    threadIds.add(file.threadId);
                }
            });
        });
        // Delete from vector stores
        const vectorStoreDeletePromises = Array.from(vectorStoreIds).map(async vectorStoreId => {
            try {
                await deleteFilesFromVectorStoreUtils(openai, vectorStoreId, Array.from(filesToDelete));
                console.log(`Successfully deleted files from vector store ${vectorStoreId}`);
            } catch (error) {
                console.error(`Error deleting from vector store ${vectorStoreId}:`, error);
            }
        });


        // Delete from OpenAI
        const openAiDeletePromises = Array.from(filesToDelete).map(async fileId => {
            try {
                await deleteAssistantFileByID(openai, null, fileId);
                console.log(`Successfully deleted OpenAI file ${fileId}`);
            } catch (error) {
                console.error(`Error deleting OpenAI file ${fileId}:`, error);
            }
        });
        const vectorStoreDelete = await deleteAllTheVectorStoresOfProject(Array.from(vectorStoreIds),openai);

                // Delete all prompts associated with this folder (by folderId or threadid)
        const threadDeletePromises = await promptModel.deleteMany({
                    $or: [
                        { folderId: id },
                        { threadid: { $in: Array.from(threadIds) } }
                    ]
                });

        // Wait for all deletions to complete
        await Promise.all([
            ...vectorStoreDeletePromises,
            ...openAiDeletePromises,
            threadDeletePromises
        ]);

        // Finally, delete the folder itself
        const deletedFolderChat = await deleteFolderChatById(id);
        
        return res.status(StatusCodes.OK).json({ 
            message: "Folder chat and all associated files deleted successfully",
            summary: {
                deletedFiles: Array.from(filesToDelete),
                vectorStoresDeleted: Array.from(vectorStoreIds),
                folderDeleted:deletedFolderChat?._id,
                threadDeleteIds: Array.from(threadIds),
                vectorStoreDelete : vectorStoreDelete
            }
        });

    } catch (error) {
        console.error('Error during folder deletion:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            message: `Failed to delete folder: ${error.message}` 
        });
    }
};

/**
 * @async
 * @function getFolderChatsByUser
 * @description Retrieves all folder chats associated with a specific user ID.
 * @param {Object} req - Express request object containing userId in params.
 * @param {Object} res - Express response object returning folder chats or an error.
 * @returns {Response} 200 with folder chats on success, or 500 with error message on failure.
 */

export const getFolderChatsByUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const folderChats = await getFolderChatsByUserId(userId);
        res.status(StatusCodes.OK).json(folderChats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


/**
 * @async
 * @function addFileInFolder
 * @description Uploads files to a folder and stores metadata. Optionally supports adding files to a vector store for RAG operations.
 * @param {Object} req - Express request object containing userId, folderId, optional threadId and msgId, fileNameList, and uploaded files.
 * @param {Object} res - Express response object returning success or error message.
 * @param {Function} next - Express next middleware function.
 * @returns {Response} 200 with success message on success, or 500 with error message on failure.
 */

export const addFileInFolder =async (req,res,next)=>{
    const {userId,folderId,threadId=null,msgId = null,waitingFile =  false,fileNameList=[]}= req.body;
    const openai = await getOpenAIInstance();
    try{
        let files = req.files['files'] ?? [];
        let selectedFileKeys =[];
        const fileNameListParsed = fileNameList !== 'undefined' && fileNameList?.length > 0 ? JSON.parse(fileNameList) : [];
        if (fileNameListParsed.length > 0) {
            selectedFileKeys = fileNameListParsed.map((file) => {
                return file.key
            });
        }

        let ragFiles = [];
        let findApps = [];
        if (fileNameListParsed?.length > 0) {
          try {
            
            const knowledgeSource = false;

            await findFileFromDBandDownload(fileNameListParsed, files, ragFiles, knowledgeSource, findApps);
          } catch (downloadError) {
            return next(new Error(`Error during file downloads: ${downloadError.message}`));
        }
    }

        let assistantInformation = [];
        let fileIdWithExtension = []
        let fileSearchIds = [];
        let newFileIds = [];
        let fileSearchFileIds = []
        let systemFile = true;
        // if (threadId && msgId && threadId !== "null" && msgId !== "null") {
        //     systemFile =  false;
        // }
        const filePromises = files?.map(file => createOpenAIFileObject(openai, file, "user_data", assistantInformation, fileIdWithExtension, fileSearchIds).then(uploadedFile => uploadedFile.id));
        newFileIds = await Promise.all(filePromises);
        const foldersPreviousData = await getFolderChatByIdService(folderId);
        let vectorStoreId = null;
        let threadFile = false;
        // if(threadId && msgId && threadId !== "null" && msgId !== "null"){
        //     threadFile = true;
        //     if(foldersPreviousData?.threadFilesInfo?.[0]?.vectorStoreId){
        //         vectorStoreId = foldersPreviousData?.threadFilesInfo?.[0]?.vectorStoreId;
        //     }

        // }
        if(foldersPreviousData?.fileInfo?.length > 0){
            vectorStoreId = foldersPreviousData?.fileInfo?.[0]?.vectorStoreId;
        }
        const vectorStore = await createOpenAiVectorStoreWithFileIdsForProject(openai, folderId, newFileIds,vectorStoreId);
        const fileInfo = files.map((file)=>{
            return {
                fileName: file.filename,
                fileId: file.id,
                vectorStoreId: vectorStore?.[0]?.vector_store_id,
                threadId: threadId !== 'null' && threadId !== null ? threadId : null,
                msgId: msgId !== 'null' && msgId !== null ? msgId : null,
                systemFile: systemFile,
                key: file.key ? file.key : null
            }
        });
        const waitingFile = false;
        const dbResponse = await storeProjectsFileInfoService(folderId,fileInfo,threadFile,waitingFile,selectedFileKeys);
        Promise.all(files.map(deleteLocalFile)).then(() => console.log('All files deleted')).catch(err => console.error('Failed to delete some files:', err));
        return res.status(StatusCodes.OK).json({
            message: "File Uploaded Successfully",
          });

    } catch (fileError) {
        console.error('Error during OpenAI File Object creation:', fileError.message);
        // return next(new Error(`Failed to upload files: ${fileError.message}`));
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: `Failed to upload files: ${fileError.message}`,
          });
    }

}
/**
 * @async
 * @function addWaitingFileInFolder
 * @description Handles uploading files marked as "waiting" to a folder. 
 * Supports both image files (converted to base64 and stored locally) and other files 
 * (uploaded to OpenAI, added to a vector store). Cleans up local files after processing.
 * 
 * @param {Object} req - Express request object containing:
 *   - userId, folderId, optional threadId and msgId,
 *   - info (JSON stringified metadata),
 *   - files uploaded under 'files' key.
 * @param {Object} res - Express response object that returns success or error status.
 * @param {Function} next - Express next middleware function for error handling.
 * 
 * @returns {Response} 200 with summary of uploaded files on success,
 * or 500 with error message on failure.
 */

export const addWaitingFileInFolder = async (req, res, next) => {
    const { userId, folderId, threadId = null, msgId = null, info = [] } = req.body;
    const openai = await getOpenAIInstance();
    try {
        let files = req.files['files'] ?? [];
        
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB limit
        let assistantInformation = [];
        let fileIdWithExtension = [];
        let fileSearchIds = [];
        let newFileIds = [];
        let systemFile = false;
        const waitingFile = true;
        const waitingFileInfo = JSON.parse(info);
        
        // Separate image and non-image files
        const imageFiles = [];
        const nonImageFiles = [];
        
        files.forEach(file => {
            if (allowedImageTypes.includes(file.mimetype)) {
                if (file.size > MAX_IMAGE_SIZE) {
                    throw new Error(`Image ${file.filename} exceeds maximum size of 5MB`);
                }
                imageFiles.push(file);
            } else {
                nonImageFiles.push(file);
            }
        });

        // Process non-image files with OpenAI and vector store
        let vectorStore = null;
        if (nonImageFiles.length > 0) {
            // const changedFiles = files.map(async (file)=>await convertToPdf(file))
            for(const file of files){
                await convertToPdf(file)
            }
            console.log("files : ",files);
            const filePromises = nonImageFiles.map(async file => 
                await createOpenAIFileObject(openai, file, "user_data", assistantInformation, fileIdWithExtension, fileSearchIds)
                    .then(uploadedFile => uploadedFile.id)
            );
            newFileIds = await Promise.all(filePromises);
            console.log("newFileIds : ",newFileIds);

            const foldersPreviousData = await getFolderChatByIdService(folderId);
            let vectorStoreId = null;
            if (foldersPreviousData?.waitingFilesInfo?.[0]?.vectorStoreId) {
                vectorStoreId = foldersPreviousData?.waitingFilesInfo?.[0]?.vectorStoreId;
            }

            vectorStore = await createOpenAiVectorStoreWithFileIdsForProject(openai, folderId, newFileIds, vectorStoreId);
        }

        // Process image files to base64
        const imageFilePromises = imageFiles.map(async file => {
            try {
                // Read file from the path
                const fileData = await fs.readFile(file.path);
                // Convert to base64
                const base64Data = fileData.toString('base64');
                const base64DataUrl = `data:${file.mimetype};base64,${base64Data}`;

                
                return {
                    uid: waitingFileInfo.uid,
                    fileName: file.filename,
                    fileId: null, // No OpenAI file ID for images
                    vectorStoreId: null, // No vector store for images
                    threadId: null,
                    msgId: null,
                    systemFile: systemFile,
                    isImage: true,
                    base64Data: base64DataUrl,
                    mimeType: file.mimetype,
                    size: file.size,
                    originalName: file.originalname
                };
            } catch (error) {
                console.error(`Error processing image file ${file.filename}:`, error);
                throw error;
            }
        });

        // Process non-image files info
        const nonImageFileInfo = nonImageFiles.map((file) => {
            return {
                uid: waitingFileInfo.uid,
                fileName: file.filename,
                fileId: file.id,
                vectorStoreId: vectorStore?.[0]?.vector_store_id,
                threadId: null,
                msgId: null,
                systemFile: systemFile,
                isImage: false,
                mimeType: file.mimetype,
                size: file.size,
                originalName: file.originalname
            };
        });

        // Combine both image and non-image file info
        const imageInfoResults = await Promise.all(imageFilePromises);
        const fileInfo = [...nonImageFileInfo, ...imageInfoResults];
        let threadFile = true;

        const dbResponse = await storeProjectsFileInfoService(folderId, fileInfo, threadFile, waitingFile);

        // Clean up local files
        Promise.all(files.map(deleteLocalFile))
            .then(() => console.log('All files deleted'))
            .catch(err => console.error('Failed to delete some files:', err));

        return res.status(StatusCodes.OK).json({
            message: "File Uploaded Successfully",
            summary: {
                totalFiles: files.length,
                imageFiles: imageFiles.length,
                nonImageFiles: nonImageFiles.length,
                fileInfo : fileInfo
            }
        });

    } catch (fileError) {
        console.error('Error during file processing:', fileError.message);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: `Failed to upload files: ${fileError.message}`,
        });
    }
};

/**
 * @async
 * @function deleteProjectFiles
 * @description Deletes specified files from a folder's file and thread file info.
 * Removes files from OpenAI storage, deletes references from vector stores,
 * and updates the folder document to remove those files.
 * 
 * @param {Object} req - Express request object containing:
 *   - folderId: ID of the folder from which files are to be deleted
 *   - fileIds: Array of file IDs to delete
 * @param {Object} res - Express response object returning status and summary of deletion
 * 
 * @returns {Response} 200 with success message and deletion summary,
 * or 404 if folder not found,
 * or 500 if any internal error occurs during deletion.
 */

export const deleteProjectFiles = async (req, res) => {
    const { folderId, fileIds } = req.body;
    const openai = await getOpenAIInstance();
    
    try {
        // Get folder information
        const folderInfo = await getFolderChatByIdService(folderId);
        if (!folderInfo) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Folder not found"
            });
        }

        // Get vector store IDs and file IDs to delete
        const vectorStoreIds = new Set();
        const filesToDelete = new Set();

        // Check in fileInfo and threadFilesInfo
        ['fileInfo', 'threadFilesInfo'].forEach(field => {
            folderInfo[field]?.forEach(file => {
                if (fileIds.includes(file.fileId)) {
                    filesToDelete.add(file.fileId);
                    if (file.vectorStoreId) {
                        vectorStoreIds.add(file.vectorStoreId);
                    }
                }
            });
        });

        // Delete files from vector stores using existing utility
        for (const vectorStoreId of vectorStoreIds) {
            try {
                await deleteFilesFromVectorStoreUtils(openai, vectorStoreId, Array.from(filesToDelete));
            } catch (error) {
                console.error(`Error deleting from vector store ${vectorStoreId}:`, error);
            }
        }

        // Delete files from OpenAI using existing utility
        const deletePromises = Array.from(filesToDelete).map(fileId => 
            deleteAssistantFileByID(openai, null, fileId)
                .catch(error => console.error(`Error deleting OpenAI file ${fileId}:`, error))
        );

        await Promise.all(deletePromises);

        // Update the folder document to remove deleted files
        const updateFolder = await FolderChat.updateOne(
            { _id: folderId },
            {
                $pull: {
                    'fileInfo': { fileId: { $in: fileIds } },
                    'threadFilesInfo': { fileId: { $in: fileIds } }
                }
            }
        );

        return res.status(StatusCodes.OK).json({
            message: "Files deleted successfully",
            summary: {
                deletedFiles: Array.from(filesToDelete),
                vectorStoresUpdated: Array.from(vectorStoreIds),
                databaseUpdate: updateFolder
            }
        });

    } catch (error) {
        console.error('Error during file deletion:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: `Failed to delete files: ${error.message}`
        });
    }
};

/**
 * @async
 * @function deleteFilesByThreadId
 * @description Deletes all files associated with a given threadId within a project (folder).
 * Removes files from OpenAI storage, deletes from vector stores, and updates the folder document accordingly.
 * 
 * @param {Object} req - Express request object containing:
 *   - projectId: ID of the folder/project
 *   - threadId: ID of the thread whose files should be deleted
 * @param {Object} res - Express response object returning status and deletion summary
 * 
 * @returns {Response} 200 on successful deletion with summary,
 * 404 if folder/project not found,
 * 500 if internal error occurs during deletion.
 */

// 1. Delete all files by threadId
export const deleteFilesByThreadId = async (req, res) => {
    const { projectId, threadId } = req.body;
    const openai = await getOpenAIInstance();
    
    try {
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
                await deleteFilesFromVectorStoreUtils(openai, vectorStoreId, Array.from(filesToDelete));
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

        return res.status(StatusCodes.OK).json({
            message: "Thread files deleted successfully",
            summary: {
                deletedFiles: Array.from(filesToDelete),
                vectorStoresUpdated: Array.from(vectorStoreIds),
                databaseUpdate: updateFolder
            }
        });

    } catch (error) {
        console.error('Error during file deletion:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: `Failed to delete files: ${error.message}`
        });
    }
};

/**
 * @async
 * @function deleteFilesByUid
 * @description Deletes files associated with a specific UID in a project folder.
 * Removes files from OpenAI, vector stores, and updates the folder document accordingly.
 * 
 * @param {Object} req - Express request object containing:
 *   - projectId: ID of the folder/project
 *   - uid: Unique identifier to match files for deletion
 * @param {Object} res - Express response object with status and summary of deletion
 * 
 * @returns {Response} 200 with deletion summary if successful,
 * 404 if folder not found,
 * 500 if an internal error occurs.
 */
// 2. Delete files by UID
export const deleteFilesByUid = async (req, res) => {
    const { projectId, uid } = req.body;
    const openai = await getOpenAIInstance();
    
    try {
        const folderInfo = await getFolderChatByIdService(projectId);
        if (!folderInfo) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Folder not found"
            });
        }

        const vectorStoreIds = new Set();
        const filesToDelete = new Set();

        // Find files with matching UID in threadFilesInfo
        folderInfo.waitingFilesInfo?.forEach(file => {
            if (file.uid === uid && file.fileId) {
                filesToDelete.add(file.fileId);
                if (file.vectorStoreId) {
                    vectorStoreIds.add(file.vectorStoreId);
                }
            }
        });

        // Delete from vector stores
        for (const vectorStoreId of vectorStoreIds) {
            try {
                const vectorFileDeleteResponse = await deleteFilesFromVectorStoreUtils(openai, vectorStoreId, Array.from(filesToDelete));
            } catch (error) {
                console.log(`Error deleting from vector store ${vectorStoreId}:`, error);
            }
        }

        // Delete from OpenAI
        const deletePromises = Array.from(filesToDelete).map(fileId => 
            deleteAssistantFileByID(openai, null, fileId)
                .catch(error =>  console.log(`Error deleting OpenAI file ${fileId}:`, error))
        );

        const promises = await Promise.all(deletePromises);

        // Update database
        const updateFolder = await FolderChat.updateOne(
            { _id: projectId },
            {
                $pull: {
                    'threadFilesInfo': { uid: uid }
                }
            }
        );

        return res.status(StatusCodes.OK).json({
            message: "Files deleted successfully",
            summary: {
                deletedFiles: Array.from(filesToDelete),
                vectorStoresUpdated: Array.from(vectorStoreIds),
                databaseUpdate: updateFolder
            }
        });

    } catch (error) {
        console.log('Error during file deletion:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: `Failed to delete files: ${error.message}`
        });
    }
};


/**
 * @async
 * @function deleteFileByFileId
 * @description Deletes a single file identified by fileId from a project folder.
 * Removes the file from OpenAI, associated vector store (if any), and updates the folder document.
 * 
 * @param {Object} req - Express request object containing:
 *   - projectId: ID of the folder/project
 *   - fileId: ID of the file to be deleted
 * @param {Object} res - Express response object with status and deletion summary
 * 
 * @returns {Response} 200 with deletion summary if successful,
 * 404 if folder or file not found,
 * 500 if an internal error occurs.
 */

// 3. Delete file by fileId
export const deleteFileByFileId = async (req, res) => {
    const { projectId, fileId } = req.body;
    const openai = await getOpenAIInstance();
    
    try {
        const folderInfo = await getFolderChatByIdService(projectId);
        if (!folderInfo) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Folder not found"
            });
        }

        let vectorStoreId = null;
        let fileToDelete = null;

        // Find the specific file in threadFilesInfo
        const file = folderInfo.threadFilesInfo?.find(file => file.fileId === fileId);
        if (file) {
            fileToDelete = file.fileId;
            vectorStoreId = file.vectorStoreId;
        }

        if (!fileToDelete) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "File not found"
            });
        }

        // Delete from vector store if exists
        if (vectorStoreId) {
            try {
                await deleteFilesFromVectorStoreUtils(openai, vectorStoreId, [fileToDelete]);
            } catch (error) {
                console.error(`Error deleting from vector store ${vectorStoreId}:`, error);
            }
        }

        // Delete from OpenAI
        try {
            await deleteAssistantFileByID(openai, null, fileToDelete);
        } catch (error) {
            console.error(`Error deleting OpenAI file ${fileToDelete}:`, error);
        }

        // Update database
        const updateFolder = await FolderChat.updateOne(
            { _id: projectId },
            {
                $pull: {
                    'threadFilesInfo': { fileId: fileId }
                }
            }
        );

        return res.status(StatusCodes.OK).json({
            message: "File deleted successfully",
            summary: {
                deletedFile: fileToDelete,
                vectorStoreUpdated: vectorStoreId,
                databaseUpdate: updateFolder
            }
        });

    } catch (error) {
        console.error('Error during file deletion:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: `Failed to delete file: ${error.message}`
        });
    }
};

/**
 * @async
 * @function deleteFilesByFileIds
 * @description
 * Deletes multiple files from a project folder by their file IDs.
 * Removes files from OpenAI, associated vector stores, and updates the folder's database entry.
 * Also updates the selectedFileKeys list by removing deleted files' keys.
 * 
 * @param {Object} req - Express request object containing:
 *   - projectId {string}: ID of the project/folder
 *   - fileIdList {string[]}: Array of file IDs to delete
 * @param {Object} res - Express response object returning the status and summary of the deletion
 * 
 * @returns {Response} 200 on success with details about deleted files and DB update,
 * 404 if folder not found or no valid files to delete,
 * 500 on server error.
 */


// Delete multiple files by fileIds
export const deleteFilesByFileIds = async (req, res) => {
    const { projectId, fileIdList } = req.body;
    const openai = await getOpenAIInstance();
    
    try {
        const folderInfo = await getFolderChatByIdService(projectId);
        if (!folderInfo) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Folder not found"
            });
        }
        const allSelectedFileKeys = folderInfo.selectedFileKeys.length > 0 ? folderInfo.selectedFileKeys : []
        

        const vectorStoreIds = new Set();
        const filesToDelete = new Set();
        const filesNotFound = [];
        let selectedFileKey = []

        // Find all specified files in threadFilesInfo
        fileIdList.forEach(fileId => {
            const file = folderInfo.fileInfo?.find(file => file.fileId === fileId);
            if(file?.key){
                selectedFileKey.push(file.key);
            }
            if (file) {
                filesToDelete.add(file.fileId);
                if (file.vectorStoreId) {
                    vectorStoreIds.add(file.vectorStoreId);
                }
            } else {
                filesNotFound.push(fileId);
            }
        });

        if (filesToDelete.size === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "No valid files found to delete",
                filesNotFound
            });
        }

        // Delete from vector stores
        for (const vectorStoreId of vectorStoreIds) {
            try {
               const vectorUpdate  = await deleteFilesFromVectorStoreUtils(openai, vectorStoreId, Array.from(filesToDelete));
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
        const finalFileKeyList = allSelectedFileKeys.filter(key => !selectedFileKey.includes(key));

        // Update database
        const updateFolder = await FolderChat.updateOne(
            { _id: projectId },
            {
                $pull: {
                    'fileInfo': { 
                        fileId: { $in: Array.from(filesToDelete) }
                    }
                },
                $set: {
                    selectedFileKeys: finalFileKeyList, // Example: updating the status field
                }
            }
        );

        return res.status(StatusCodes.OK).json({
            message: "Files deleted successfully",
            summary: {
                deletedFiles: Array.from(filesToDelete),
                vectorStoresUpdated: Array.from(vectorStoreIds),
                filesNotFound,
                databaseUpdate: updateFolder
            }
        });

    } catch (error) {
        console.error('Error during file deletion:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: `Failed to delete files: ${error.message}`
        });
    }
};