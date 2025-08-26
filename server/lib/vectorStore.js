import { getFileIdsFromFileKey } from "../service/knowledgeBase.js";
import { fileSearchFileTypes } from "../utils/fileSearchFileExtensions.js";
import { getFileExtension, retrieveOpenAIFileObject } from "./openai.js";

export const createOpenAiVectorStore = async (openai,storeName)=>{
  try {
    const store = await openai.vectorStores.create({
        name: storeName
    });
    return {success: true, store}
  } catch (error) {
    console.log("VS error:", error)
    return {success: false, error: error}
  }
}

export const createOpenAiVectorStoreWithFileIds = async (openai, storeName, file_ids)=>{
  const vectorStore = await openai.vectorStores?.create({
        name: storeName,
        file_ids: file_ids,
        // expires_after: {
        //   anchor: "last_active_at",
        //   days: 7
        // }
      });
  return vectorStore;
}
export const updateOpenAiVectorStoreName = async (openai, vectorStoreId, storeName)=>{
  try {
    const vectorStore = await openai.vectorStores.update(
      vectorStoreId,
      {
        name: storeName,
      }
    );
    return {success: true, vectorStore};
  } catch (error) {
    return {success: false, error}
  }
}


export const getFileIdsFromVectorStore = async (openai, vectorStoreId)=>{
  const vectorStoreFiles = await openai.vectorStores.files.list(
    vectorStoreId
  );
  const fileIds = vectorStoreFiles?.body?.data?.map(obj => obj.id);
  return fileIds;
}


export const uploadFilesToVectorStore = async (openai, vectorStoreId, newFileIds)=>{
  let fileSearchIds = await Promise.all(newFileIds.map(async fileId => {
    const fileInfo = await retrieveOpenAIFileObject(fileId);
    const extension = getFileExtension(fileInfo?.filename);
    return fileSearchFileTypes?.includes(extension) ? fileInfo?.id : null;
}));
if(vectorStoreId){
  for (const newFileId of fileSearchIds) {
    try {
      if (newFileId) {
        // Attempt to upload to the the vector store
        const uploadedVectorStoreFile = await openai.vectorStores.files.create(
          vectorStoreId,
          {
            file_id: newFileId
          }
        );

      } else {
        continue;
      }

    } catch (error) {
      // Log the error but continue with the next iteration
      console.error(`Error uploading file with ID ${newFileId}:`, error);
    }
  }

}

  
}

export const deleteFilesFromVectorStoreUtils = async (openai, vectorStoreId, deletedFileIds,assistant_id = null)=>{
  let deletedVectorFileIds = []; 
  for (const deletedFileId of deletedFileIds) {
    try {
      // Attempt to delete the file from the vector store
      const deletedVectorStoreFile = await openai.vectorStores.files.del(
        vectorStoreId,
        deletedFileId
      );
      deletedVectorFileIds.push(deletedVectorStoreFile);
    } catch (error) {
      // Log the error but continue with the next iteration
      console.error(`Error deleting file with ID ${deletedFileId}:`, error);
    }

  }
  return deletedVectorFileIds
}
export const createOpenAiVectorStoreWithFileIdsForProject = async (openai, storeName, file_ids,initialVectorStoreId =  null)=>{
  let vectorStoreId = initialVectorStoreId;
  if(vectorStoreId === null){
    const vectorStore = await openai.vectorStores.create({
      name: storeName
    });
    vectorStoreId = vectorStore?.id
  }

  const vectorStoreFile = file_ids.map(async (file)=>{
    return await openai.vectorStores.files.create(
      vectorStoreId,
      {file_id : file}
    );

  })

  return Promise.all(vectorStoreFile);
}
export const deleteAllTheVectorStoresOfProject = async (vectorStoresIds,openai)=>{
  const deletedVectorStorePromises = vectorStoresIds.map(async (vectorStoreId) =>{
    return await openai.vectorStores.del(
      vectorStoreId
  )});
  return await Promise.all(deletedVectorStorePromises);
}