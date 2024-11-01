export const createOpenAiVectorStore = async (openai,storeName)=>{
  try {
    const store = await openai.beta.vectorStores.create({
        name: storeName
    });
    return {success: true, store}
  } catch (error) {
    console.log("VS error:", error)
    return {success: false, error: error}
  }
}

export const createOpenAiVectorStoreWithFileIds = async (openai, storeName, file_ids)=>{
  const vectorStore = await openai.beta.vectorStores?.create({
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
    const vectorStore = await openai.beta.vectorStores.update(
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
  const vectorStoreFiles = await openai.beta.vectorStores.files.list(
    vectorStoreId
  );
  // console.log(vectorStoreFiles);
  const fileIds = vectorStoreFiles?.body?.data?.map(obj => obj.id);
  return fileIds;
}


export const uploadFilesToVectorStore = async (openai, vectorStoreId, newFileIds)=>{
 
  console.log("newFileIds", newFileIds)

  for (const newFileId of newFileIds) {
    try {
      
      // Attempt to upload to the the vector store
      const uploadedVectorStoreFile = await openai.beta.vectorStores.files.create(
        vectorStoreId,
        {
          file_id: newFileId
        }
      );
    } catch (error) {
      // Log the error but continue with the next iteration
      console.error(`Error uploading file with ID ${newFileId}:`, error);
    }
  }
  
}

export const deleteFilesFromVectorStoreUtils = async (openai, vectorStoreId, deletedFileIds)=>{
  for (const deletedFileId of deletedFileIds) {
    try {
      // Attempt to delete the file from the vector store
      const deletedVectorStoreFile = await openai.beta.vectorStores.files.del(
        vectorStoreId,
        deletedFileId
      );
    } catch (error) {
      // Log the error but continue with the next iteration
      console.error(`Error deleting file with ID ${deletedFileId}:`, error);
    }
  }
  
}