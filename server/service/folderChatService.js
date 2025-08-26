import AiPersona from "../models/aiPersonaModel.js";
import FolderChat from "../models/folderModel.js";


export const createFolderChat = async (folderData) => {
    const folderChat = new FolderChat(folderData);
    return await folderChat.save();
};

export const getAllFolderChats = async () => {
    return await FolderChat.find();
};

export const getFolderChatByIdService = async (id) => {
    return await FolderChat.findById(id).populate('personaId');
};

export const updateFolderChatById = async (id, updatedData) => {
    return await FolderChat.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
};

export const deleteFolderChatById = async (id) => {
    return await FolderChat.findByIdAndDelete(id);
};

export const getFolderChatsByUserId = async (userId) => {
    return await FolderChat.find({ userId });
};    

export const getAiPersonaByFeatured = async () => {
    try {
        const res = await AiPersona.findOne({isFeatured: true})
        return res;
    } catch (error) {
        console.log(error)
    }
}

export const storeProjectsFileInfoService = async (folderId,fileInfo,threadFile,waitingFile = false,selectedFileKeys = []) =>{
    if(waitingFile){
        const findPreviousRecord =  await FolderChat.findById({_id : folderId});
        const previousFiles = findPreviousRecord?.waitingFilesInfo
        const allFileInfo = [...previousFiles,...fileInfo]
        // For images, we want to store the base64 data and mime type
        const processedFileInfo = allFileInfo.map(file => {
            if (file.isImage) {
                return {
                    ...file,
                    base64Data: file.base64Data,
                    mimeType: file.mimeType
                };
            }
            return file;
        });
        return FolderChat.updateOne({ _id: folderId },{ $set: { waitingFilesInfo: processedFileInfo } }, { upsert: true });
    }
    if(threadFile){
        const findPreviousRecord =  await FolderChat.findById({_id : folderId});
        const previousFiles = findPreviousRecord?.threadFilesInfo
        const allFileInfo = [...previousFiles,...fileInfo]
        return FolderChat.updateOne({ _id: folderId },{ $set: { threadFilesInfo: allFileInfo } }, { upsert: true });
    }else{
        const findPreviousRecord =  await FolderChat.findById({_id : folderId});
        const previousFiles = findPreviousRecord?.fileInfo
        const previouslySelectedKeys = findPreviousRecord?.selectedFileKeys
        const allFileInfo = [...previousFiles,...fileInfo]
        const allSelectedKeys = [...previouslySelectedKeys,...selectedFileKeys]

        return FolderChat.updateOne({ _id: folderId },{ $set: { fileInfo: allFileInfo,selectedFileKeys : allSelectedKeys } }, { upsert: true });
    }

};

export const getFileInfoWithThreadIdAndMsgId = async (id, msgId, threadId) => {
    let allFileInfo = [];
    let filesOfThreadMsg = [];
    let base64Images = [];

    // const msgAndThreadBasedFiles = await FolderChat.findOne(
    //     {
    //         _id: id,
    //         'threadFilesInfo': {
    //             $elemMatch: {
    //                 msgId: msgId,
    //                 threadId: threadId,
    //             }
    //         }
    //     },
    //     {
    //         'threadFilesInfo.$': 1
    //     }
    // );
    
    // Modified query to get all matching elements
    const msgAndThreadBasedFiles = await FolderChat.findOne(
        {
            _id: id
        },
        {
            threadFilesInfo: {
                $filter: {
                    input: "$threadFilesInfo",
                    as: "file",
                    cond: {
                        $and: [
                            { $eq: ["$$file.msgId", msgId] },
                            { $eq: ["$$file.threadId", threadId] }
                        ]
                    }
                }
            }
        }
    );

    // Process message-specific files
    if (msgAndThreadBasedFiles?.threadFilesInfo?.length > 0) {
        msgAndThreadBasedFiles.threadFilesInfo.forEach((file) => {
            if ((file.isImage && file.base64Data)) {
                // Handle image files
                base64Images.push({
                    fileName: file.fileName,
                    base64Data: file.base64Data,
                    mimeType: file.mimeType,
                    isImage: true
                });
                allFileInfo.push({
                    fileName: file.fileName,
                    isImage: true,
                    mimeType: file.mimeType
                });
            } else if(file.fileId) {
                // Handle non-image files
                filesOfThreadMsg.push(file.fileId);
                allFileInfo.push({
                    fileName: file.fileName,
                    fileId: file.fileId,
                    isImage: false
                });
            }
        });
    }

    // Get thread-level files
    const threadBasedFiles = await FolderChat.findOne(
        {
            _id: id,
            'threadFilesInfo': {
                $elemMatch: {
                    threadId: threadId,
                }
            }
        }
    );

    // Process thread-level files
    let filesOfTheThread = [];
    let threadLevelImages = []; 

    if (threadBasedFiles?.threadFilesInfo?.length > 0) {
        threadBasedFiles.threadFilesInfo.forEach((file) => {
            if (file.threadId === threadId) {
                if (file.isImage) {
                    // Store thread-level images separately
                    threadLevelImages.push({
                        fileName: file.fileName,
                        base64Data: file.base64Data,
                        mimeType: file.mimeType,
                        isImage: true
                    });
                } else {
                    filesOfTheThread.push(file.fileId);
                }
            }
        });
    }

    return { 
        msgAndThreadBasedFiles, 
        threadBasedFiles,
        filesOfTheThread, // Only non-image file IDs for thread
        filesOfThreadMsg, // Only non-image file IDs for specific message
        allFileInfo,     // All files info including both images and non-images
        base64Images ,    // Only image files with base64 data
        threadLevelImages
    };
};
export const updateWaitingFileInfo = async (uploadedFiles, folderId, threadId, msgId) => {
    try {
      if (!uploadedFiles?.length || !folderId) {
        return;
      }
  
      // Get all UIDs from uploaded files
      const uploadedFileUids = uploadedFiles.map(file => file.uid);
  
      // Update the matching files in waitingFilesInfo
      const result = await FolderChat.updateMany(
        { 
          _id: folderId,
          'waitingFilesInfo.uid': { $in: uploadedFileUids }
        },
        {
          $set: {
            'waitingFilesInfo.$[elem].threadId': threadId,
            'waitingFilesInfo.$[elem].msgId': msgId,
            'waitingFilesInfo.$[elem].systemFile': false
          }
        },
        {
          arrayFilters: [{ 'elem.uid': { $in: uploadedFileUids } }],
          multi: true
        }
      );
  
      // Move the updated files to threadFilesInfo
      const folder = await FolderChat.findById(folderId);
      const filesToMove = folder.waitingFilesInfo.filter(file => uploadedFileUids.includes(file.uid));
      
      // Add files to threadFilesInfo
      await FolderChat.updateOne(
        { _id: folderId },
        { 
          $push: { threadFilesInfo: { $each: filesToMove } },
          // Remove the moved files from waitingFilesInfo
          $pull: { waitingFilesInfo: { uid: { $in: uploadedFileUids } } }
        }
      );
  
      return result;
    } catch (error) {
      console.error('Error updating waiting file info:', error);
      throw error;
    }
  };