import { StatusCodes } from "http-status-codes";
import { getOpenAIInstance } from "../config/openAI.js";
import { CommonMessages } from "../constants/enums.js";
import VectorStores from "../models/vectorStoreModel.js";
import { BadRequest } from "../middlewares/customError.js";
import { createOpenAiVectorStore, deleteFilesFromVectorStoreUtils, getFileIdsFromVectorStore } from "../lib/vectorStore.js";
import { insertVectorStoreInfoToDB } from "../service/vectorStoreService.js";
import mongoose from "mongoose";

export const createVectorStore = async (req, res, next) => {
  const { storeName, userId } = req.body;
  const user = req.user;
  const openai = await getOpenAIInstance()
  try {
    if (!storeName) {
      next(BadRequest('Store name is required'));
      return;
    }
    if (!userId) {
      next(BadRequest('userId is required'));
      return;
    }

    const storeNameExist = await VectorStores.findOne({ isDeleted: false, storeName });
    if (storeNameExist) {
      return next(BadRequest("storeNameExist"));
    }
    // console.log("storeNameExist :", storeNameExist)
    // console.log("storeName :", storeName)
    // console.log("User :", userId)

    const openAiVectorStore = await createOpenAiVectorStore(openai, storeName)
    // console.log("openAiVectorStore from controller:", openAiVectorStore)


    const vectorStore = await insertVectorStoreInfoToDB(
      openAiVectorStore?.store?.id,
      openAiVectorStore?.store?.name,
      userId
    )

    res.send(vectorStore)
    console.log(openAiVectorStore);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: CommonMessages.INTERNAL_SERVER_ERROR,
    });
  }
};

export const getVectorStoresByUserId = async (req, res, next) => {
  const userId = req.params.id;
  try {
    
    const privateStores = await VectorStores.find({
      userId: userId
    });

    
    const publicStores = await VectorStores.find({
      isPublic: true,
      userId: { $ne: userId } 
    });

    
    res.status(200).json({
      private: privateStores,
      public: publicStores
    });

  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: CommonMessages.INTERNAL_SERVER_ERROR,
    });
  }
}; 


export const getFileIdsFromVectorStoreFunc = async(req, res)=>{
  const openai = await getOpenAIInstance();
  const fileIds = await getFileIdsFromVectorStore(openai, req.params.id )
  // console.log("fileIds from vector store:",  fileIds)
  res.send(fileIds)
}

export const deleteFilesFromVectorStore = async(req, res)=>{
  const openai = await getOpenAIInstance();
  const deletedVectorStoreFile = await deleteFilesFromVectorStoreUtils(openai, req.params.id )
  console.log("fileIds from vector store:",  req.params.id)
  res.send(deletedVectorStoreFile)
}