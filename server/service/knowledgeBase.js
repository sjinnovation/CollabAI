import KnowledgeBase from "../models/knowledgeBase.js";
import { deleteSingleFileFromS3Bucket } from "../lib/s3.js";
import { deleteAllFilesFromS3Bucket } from "../lib/s3.js";
import moment from "moment";
import KnowledgeBaseAssistants from "../models/knowledgeBaseAssistants.js";

import { deleteAllEmbeddingFromNameSpace } from "./rag.js";
import Assistant from "../models/assistantModel.js";
import User from "../models/user.js";

const bucket = process.env.AWS_BUCKET_NAME;

export const createSingleKnowledgeBaseService = async (name, size, s3_link, owner,spaceIndexes) => {
    const isExisting = await KnowledgeBase.findOne({ name: name, owner: owner }).lean();
    if (!isExisting) {
        const sizeInMB = (Math.ceil(size * 1e-6 * 100) / 100).toFixed(2)
        const data = await KnowledgeBase.create({ name: name, size: sizeInMB, s3_link: s3_link, owner: owner,spaceIndex : spaceIndexes });
        if (data) {
            await updateParentFolderSize(name, sizeInMB, owner, 'create');
        }
        return data;

    } else {
        return isExisting;
    }

};

export const getAllKnowledgeBaseService = async (role, userId) => {
    const findUserData = await KnowledgeBase.find({ owner: userId }).populate({ path: 'owner', model: User, select: '_id fname lname' });
    const convertedData = await convertDate(findUserData);

    const findAllUsersData = await KnowledgeBase.find({ owner: { $ne: userId } }).populate({ path: 'owner', model: User, select: '_id fname lname' });
    const allPublicFiles = await KnowledgeBase.find({ isPublic: true }).populate({ path: 'owner', model: User, select: '_id fname lname' });
    const allKnowledgeBaseIdsWithNames = await KnowledgeBaseAssistants.find({}).populate({ path: 'assistantObjectId', model: Assistant, select: 'name' });

    const allUserData = await convertDate(findAllUsersData);
    const allPublicKnowledgeBase = await convertDate(allPublicFiles);

    const data = convertedData?.map(userDataItem => {
        const assistant = allKnowledgeBaseIdsWithNames?.find(assistant => assistant?.assistantObjectId?.equals(userDataItem?.assistantId));
        return {
            ...userDataItem,
            assistantName: assistant ? assistant?.assistantObjectId?.name : null
        };
    });

    for(let file of data){
        if(file.spaceIndex){
            file.name = restoreOriginalName(file.name, file.spaceIndex);
        }
    }
    for(let file of allUserData){
        if(file.spaceIndex){
            file.name = restoreOriginalName(file.name, file.spaceIndex);
        }
    }
    for(let file of allPublicKnowledgeBase){
        if(file.spaceIndex){
            file.name = restoreOriginalName(file.name, file.spaceIndex);
        }
    }

    const files = (role === "superadmin") ? { data, allUserData, allPublicKnowledgeBase } : { data, allUserData: [], allPublicKnowledgeBase };
    return files
};

export const getSingleKnowledgeBaseService = async (id) => {
    return await KnowledgeBase.findOne({ _id: id });
};

const convertDate = async (data) => {
    const now = moment();

    const result = await Promise.all(data?.map(async document => {
        const createdAt = moment(document?.createdAt);
        const duration = moment.duration(now?.diff(createdAt));

        let timeDifference;
        if (duration?.asMinutes() < 60) {
            timeDifference = `${Math?.floor(duration?.asMinutes())} minutes`;
        } else if (duration?.asHours() < 24) {
            timeDifference = `${Math?.floor(duration?.asHours())} hours`;
        } else {
            timeDifference = `${Math?.floor(duration?.asDays())} days`;
        }
        const isPrefix = document?.name?.includes('.');
        const regex = new RegExp(`\\b${document?.name}\\b`);
        const assistantNameList=[];
        if(!isPrefix){
            const allCollectionOfFolder= await KnowledgeBase.find({ name: { $regex: regex } ,owner : document?.owner?._id});
            const allKnowledgeBaseIds=allCollectionOfFolder?.map(collection=>collection?._id);
            for(let id of allKnowledgeBaseIds){
                const findAssistants = await KnowledgeBaseAssistants.find({ knowledgeBaseId: id })
                .populate({ path: 'assistantObjectId', model: Assistant, select: 'name' })
            
            const assistantNames = findAssistants?.map(assistant => assistant?.assistantObjectId?.name);

            for(let name of assistantNames){
                if(!assistantNameList?.includes(name)){
                    assistantNameList?.push(name);

                }

            }

            }
        }else{
            const findAssistants = await KnowledgeBaseAssistants.find({ knowledgeBaseId: document?._id })
            .populate({ path: 'assistantObjectId', model: Assistant, select: 'name' })
        
        const assistantNames = findAssistants?.length> 0 ?findAssistants?.map(assistant => assistant?.assistantObjectId?.name):'-';
        if(assistantNameList?.length === 0){
                assistantNameList?.push(assistantNames);

        
        }else{
            assistantNameList?.push(', '+assistantNames);


        }
    }


        return {
            ...document?.toObject(),
            owner: `${document?.owner?.fname} ${document?.owner?.lname}`,
            userId: document?.owner?._id,
            assistantNameList,
            timeDifference
        };
    }));

    return result;
};



export const updateSingleKnowledgeBaseService = async (id, name, updatedName, owner, checkSimilar, updateTheSimilar) => {
    try {

        // Update the name of the similar document
        const resp = await KnowledgeBase.findByIdAndUpdate({ _id: id }, { name: updateTheSimilar }, { new: true });
        // Find and update related documents with the new name
        const documents = await KnowledgeBase.find({ name: { $regex: `(^${name}/|/${name}/)` } });

        for (let doc of documents) {
            let newFileName = doc.name.replace(new RegExp(`(^${name}/|/${name}/)`, 'g'), match => match.replace(name, updatedName));
            await KnowledgeBase.updateOne({ _id: doc._id }, { $set: { name: newFileName } });
        }

        return true;
    } catch (error) {
        console.error('Error updating documents:', error);
        throw error;
    }
};
export const updateKnowledgeBasePublicStateService = async (id, isPublic, owner) => {
    const getFile = await KnowledgeBase.findOne({ _id: id });
    let isUpdated = false;
    if (getFile.name.includes(".")) {
        const response = await KnowledgeBase.findByIdAndUpdate(id, { isPublic: isPublic }, { new: true });
        const updateParentStatus = await updateParentFolderPublicState(getFile.name, owner, isPublic);
        if (updateParentStatus) {
            isUpdated = true;

        } else {
            isUpdated = false;

        }
    } else {
        const regex = new RegExp(`\\b${getFile.name}\\b`);
        const resp = await KnowledgeBase.updateMany({ name: { $regex: regex }, owner: owner }, { isPublic: isPublic }, { new: true });
        isUpdated = true;

    }
    return isUpdated

};
async function updateFilePaths() {
    const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {

        // Find all documents with the file paths and update them
        const documents = await collection.find({ file_name: { $regex: "(^e/|/e/)" } }).toArray();

        for (let doc of documents) {
            let newFileName = doc.file_name.replace(/(^e\/|\/e\/)/g, match => match.replace('e', 'x'));
            await collection.updateOne({ _id: doc._id }, { $set: { file_name: newFileName } });
        }
    } catch (error) {
        console.error("Error updating file paths:", error);
    } finally {
        await client.close();
    }
}


export const deleteSingleKnowledgeBaseService = async (id, userId, isAdmin) => {

    const checkFileOrFolderExistOrNot = await KnowledgeBase.find({ _id: id });
    
    if (checkFileOrFolderExistOrNot.length > 0) {
        if ((userId === checkFileOrFolderExistOrNot[0].owner.toString()) || isAdmin === 'true' || isAdmin === true) {
            const key = "knowledgeBase/" + checkFileOrFolderExistOrNot[0].owner + "/" + checkFileOrFolderExistOrNot[0].name;
            const isPrefix = key.includes('.');
            const prefix = isPrefix ? 'knowledgeBase' + '/' + checkFileOrFolderExistOrNot[0].owner : 'knowledgeBase' + '/' + checkFileOrFolderExistOrNot[0].owner + "/" + checkFileOrFolderExistOrNot[0].name
            const responseOfDeletingFileFromS3 = isPrefix ? deleteSingleFileFromS3Bucket(prefix, key) : deleteAllFilesFromS3Bucket(prefix);
            const fileName = fileNameWithEscape(checkFileOrFolderExistOrNot[0].name);
            const regex = new RegExp(`\\b${fileName}\\b`);
            if (!isPrefix) {
                const allCollectionOfFolder = await KnowledgeBase.find({ name: { $regex: regex }, owner: checkFileOrFolderExistOrNot[0].owner });
                for (let ids of allCollectionOfFolder) {
                    const hasPrefix = ids.name.includes('.');
                    const makeNameSpace = checkFileOrFolderExistOrNot[0].owner + "/" + ids.name
                    const responseOfVectorDelete = hasPrefix ? await deleteAllEmbeddingFromNameSpace(makeNameSpace):null;

                }
                const responseOfDelete = await KnowledgeBase.deleteMany({ name: { $regex: regex }, owner: checkFileOrFolderExistOrNot[0].owner });

            } else {
                const namespace = checkFileOrFolderExistOrNot[0].owner + "/" + checkFileOrFolderExistOrNot[0].name
                const responseOfVectorDelete = await deleteAllEmbeddingFromNameSpace(namespace);
                const responseOfDelete = await KnowledgeBase.findByIdAndDelete({ _id: id });
            }

            const parentFolderUpdate = await updateParentFolderSize(checkFileOrFolderExistOrNot[0].name, checkFileOrFolderExistOrNot[0].size, checkFileOrFolderExistOrNot[0].owner, 'delete');
            return true

        } else {
            return false
        }

    } else {
        return false
    }


};
export const deleteSingleUsersAllKnowledgeBaseService = async (userId) => {
    const checkFileOrFolderExistOrNot = await KnowledgeBase.find({ owner: userId });
    const prefix = 'knowledgeBase' + '/' + userId
    for (let ids in checkFileOrFolderExistOrNot) {
        const namespace = userId + "/" + checkFileOrFolderExistOrNot[ids].name;
        const deleteNamespace = await deleteAllEmbeddingFromNameSpace(namespace);

    }
    const responseOfDeletingFileFromS3 = deleteAllFilesFromS3Bucket(prefix);


    if (checkFileOrFolderExistOrNot) {
        const regex = new RegExp(`\\b${checkFileOrFolderExistOrNot[0].name}\\b`);
        return await KnowledgeBase.deleteMany({ owner: userId });
    } else {
        return false
    }


};


export const storeKnowledgeBaseAssistantsReference = async (assistantObjectId, assistantId, knowledgeBaseInfo, assistantInformation, knowledgeSource,editMode = false,clone = false) => {
    let knowledgeBaseIds =[];
    if(!clone){
        for (const knowledgeBase of knowledgeBaseInfo) {
            knowledgeBaseIds.push(knowledgeBase.key);
        }

    }else{
        knowledgeBaseIds = knowledgeBaseInfo;

    }
    if(knowledgeSource ==="true"){
        knowledgeSource = true;
    }else if(knowledgeSource ==="false"){
        knowledgeSource = false;
    }

    const isExistKnowledgeBaseAssistant = await KnowledgeBaseAssistants.findOne({assistantId: assistantId});

    if (knowledgeBaseIds.length > 0) {
        assistantInformation = assistantInformation.filter(info => 
          knowledgeBaseIds.includes(info.key)
        );
      } else {
        assistantInformation = [];
      }
    if(knowledgeBaseIds.length === 0 && knowledgeSource === false){
        if(isExistKnowledgeBaseAssistant){
            const deleteInfo = await KnowledgeBaseAssistants.deleteMany({assistantId: assistantId});
        }
    }
    if(isExistKnowledgeBaseAssistant){
        const responseOfInfoStore = await KnowledgeBaseAssistants.findOneAndUpdate({ assistantId: assistantId, assistantObjectId: assistantObjectId},{knowledgeBaseId: knowledgeBaseIds,file_ids : assistantInformation, knowledgeSource: knowledgeSource});
    }else{
        const responseOfInfoStore = await KnowledgeBaseAssistants.create({ assistantId: assistantId, assistantObjectId: assistantObjectId, knowledgeBaseId: knowledgeBaseIds,file_ids : assistantInformation, knowledgeSource: knowledgeSource });
    }

    return true
};


export const checkKnowledgeBasedAssistants = async (assistantId, restoreFileName = true, editMode = false) => {
    const checkInformationAboutTheAssistant = await KnowledgeBaseAssistants.findOne({ assistantId: assistantId });
    if (checkInformationAboutTheAssistant && checkInformationAboutTheAssistant?.knowledgeBaseId) {
        let existingKnowledgeBaseIds = [];
        let existingFileIds = checkInformationAboutTheAssistant?.file_ids || [];
        let shouldSave = false;

        // Loop through knowledgeBaseId and check existence
        for (const id of checkInformationAboutTheAssistant?.knowledgeBaseId) {
            // Corrected findById usage
            const isExistingKnowledgeBase = await KnowledgeBase.findById(id);

            if (isExistingKnowledgeBase) {
                existingKnowledgeBaseIds.push(id);
            } else {
                // Ensure we are not filtering non-existent keys
                if (Array.isArray(existingFileIds) && existingFileIds?.length > 0) {
                    existingFileIds = existingFileIds.filter(fileIds => {
                        return fileIds.key && fileIds.key !== id.toString();
                    });
                }
            }
        }
        // Check if knowledgeBaseId array needs updating
        if (existingKnowledgeBaseIds.length !== checkInformationAboutTheAssistant?.knowledgeBaseId.length) {
            checkInformationAboutTheAssistant.knowledgeBaseId = existingKnowledgeBaseIds;
            shouldSave = true;
        }



        // Check if file_ids array needs updating
        if (Array.isArray(existingFileIds) && checkInformationAboutTheAssistant?.file_ids?.length > 0 && existingFileIds.length !== checkInformationAboutTheAssistant.file_ids.length) {
            checkInformationAboutTheAssistant.file_ids = existingFileIds;
            shouldSave = true;
        }
        if(existingKnowledgeBaseIds.length ===0){
            checkInformationAboutTheAssistant.knowledgeBaseId=[];
            checkInformationAboutTheAssistant.file_ids =[];
        }

        if (shouldSave) {
            checkInformationAboutTheAssistant.markModified('knowledgeBaseId');
            checkInformationAboutTheAssistant.markModified('file_ids');0
            try {
                await checkInformationAboutTheAssistant.save();
            } catch (error) {
                console.error("Error forcing save:", error);
            }
        }

    }

    const informationAboutTheAssistant = await KnowledgeBaseAssistants.find({ assistantId: assistantId }).populate('knowledgeBaseId', 'name owner spaceIndex');
    if (restoreFileName) {
        if (informationAboutTheAssistant && informationAboutTheAssistant?.length > 0) {
            for (const file of informationAboutTheAssistant[0]?.knowledgeBaseId) {
                if (file.spaceIndex) {
                    file.name = restoreOriginalName(file.name, file.spaceIndex);
                }
            }
        }

    }

    return informationAboutTheAssistant;
};
const updateParentFolderSize = async (name, sizeInMB, owner, actionType) => {

    const filePathWithName = name;
    const lastIndex = filePathWithName.lastIndexOf('/');
    const folderPath = filePathWithName.substring(0, lastIndex);
    const fileName = filePathWithName.substring(lastIndex + 1);
    let path = folderPath;
    try {
        while (path.length > 0) {
            const findFolder = await KnowledgeBase.findOne({ name: path, owner: owner })
            const addSize = parseFloat(findFolder.size) + parseFloat(sizeInMB);
            const reduceSize = parseFloat(findFolder.size) - parseFloat(sizeInMB);
            const finalSize = actionType === 'create' ? (addSize) : (reduceSize);
            const roundSize = Math.ceil(finalSize * 1000) / 1000;
            const twoPointsRoundFileSize = roundSize.toFixed(2)
            const updateFolder = await KnowledgeBase.findOneAndUpdate({ name: path, owner: owner }, { size: twoPointsRoundFileSize })
            const lastIndex = path.lastIndexOf('/');
            const folder = path.substring(0, lastIndex);
            path = folder;

        }
        return true
    } catch (error) {
        return error

    }


};

const updateParentFolderPublicState = async (name, owner, isPublic) => {
    //find the childs who have this parent and check their public status,if there is no one with public,then paren should be private
    const filePathWithName = name;
    const lastIndex = filePathWithName.lastIndexOf('/');
    const folderPath = filePathWithName.substring(0, lastIndex);
    const fileName = filePathWithName.substring(lastIndex + 1);
    let path = folderPath;
    try {
        if (path.length > 0) {
            const regex = new RegExp(`\\b${path}\\b`);
            const findFoldersInfo = await KnowledgeBase.findOne({ name: path, owner: owner })

            const findChildren = await KnowledgeBase.find({ name: { $regex: regex }, owner: owner });
            let findPublicFlag = false;
            let countPublic = 0;
            for (let child of findChildren) {
                if (child.isPublic === true && child._id !== findFoldersInfo._id) {
                    countPublic += 1;
                }
            }

            if (countPublic >= (findChildren.length - 1)) {
                const updateFolder = await KnowledgeBase.findOneAndUpdate({ name: path, owner: owner }, { isPublic: true }, { new: true });
            }
            if (countPublic === 1 && isPublic === false) {
                const updateFolder = await KnowledgeBase.findOneAndUpdate({ name: path, owner: owner }, { isPublic: false }, { new: true });

            }

        }
        return true
    } catch (error) {
        return error

    }


};
const fileNameWithEscape = (fileName) => {
    return fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};


export const replaceCharacters = (path) => {
    const replacedIndices = [];
    
    // Split the path by '/' to handle each segment separately
    const pathSegments = path?.split('/');
  
    const processedSegments = pathSegments.map((segment, segmentIndex) => {
        segment = segment.trim();
        // Remove leading special characters and spaces
        segment = segment.replace(/^[^a-zA-Z0-9]+/, '');
      // Check if the segment has a file extension
      const lastDotIndex = segment.lastIndexOf('.');
      let namePart = segment;
      let extensionPart = '';
  
      if (lastDotIndex > 0 && lastDotIndex !== segment.length - 1) {
        namePart = segment.substring(0, lastDotIndex);
        extensionPart = segment.substring(lastDotIndex); 
      }
  
      const purifiedNamePart = namePart.split('').map((char, index) => {
        if (char === ' ') {
          replacedIndices.push(index + (segmentIndex > 0 ? pathSegments.slice(0, segmentIndex).join('/').length + 1 : 0)); 
          return '_';
        } else if (/[^a-zA-Z0-9_]/.test(char)) {
            replacedIndices.push(index + (segmentIndex > 0 ? pathSegments.slice(0, segmentIndex).join('/').length + 1 : 0)); 
          return '_';
        }
        return char;
      }).join('');
  
      return purifiedNamePart + extensionPart;
    });
  
    const purifiedPath = processedSegments.join('/');
  
    return { resultFileName: purifiedPath, replacedIndices };
  };
  
  

export const findAndDeleteKnowledgeBase = async (fileName, userId,isAdmin) => {
    const fileDetails = await KnowledgeBase.find({ name: fileName });
    const resp = await deleteSingleKnowledgeBaseService(fileDetails[0].id, userId,isAdmin);
    return resp


};
export const findFileDetails = async (key) => {
    return await KnowledgeBase.find({ _id: key });

};
export const restoreOriginalName = (fileName, replacedIndices) => {
    // Restore spaces at the specified indices
    const restoredFileName = fileName.split('').map((char, index) => {
      return replacedIndices.includes(index) ? ' ' : char;
    }).join('');
  
    return restoredFileName;
  };

export const removeKnowledgeBaseIdAndFile = async (id) => {
    try {
  
      const knowledgeBaseAssistants = await KnowledgeBaseAssistants.find({
        knowledgeBaseId: id,
      });
  
      if (knowledgeBaseAssistants.length === 0) {
        return { message: "No matching documents found" };
      }

      for (const assistant of knowledgeBaseAssistants) {

        assistant.knowledgeBaseId = assistant.knowledgeBaseId.filter(
          (id) => id.toString() !== id
        );
  
        assistant.file_ids = assistant.file_ids.filter(
          (fileId) => fileId.toString() !== id
        );
  
        await assistant.save();
      }
  
      return { message: "ID and associated file_ids removed successfully from all matching documents" };
    } catch (error) {
      console.error(error);
      return { message: "Internal Server Error" };
    }
  };