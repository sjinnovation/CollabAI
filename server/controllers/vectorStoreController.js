import { StatusCodes } from "http-status-codes";
import { getOpenAIInstance } from "../config/openAI.js";
import { CommonMessages } from "../constants/enums.js";
import VectorStores from "../models/vectorStoreModel.js";
import { BadRequest } from "../middlewares/customError.js";
import { createOpenAiVectorStore, deleteFilesFromVectorStoreUtils, getFileIdsFromVectorStore } from "../lib/vectorStore.js";
import { insertVectorStoreInfoToDB } from "../service/vectorStoreService.js";
import mongoose from "mongoose";

/**
 * @async
 * @function createVectorStore
 * @description Creates a new vector store for a user using OpenAI services and saves it to the database.
 * @param {Object} req - Request object; expects 'storeName' and 'userId' in body, and authenticated user in `req.user`.
 * @param {Object} res - Returns the created vector store data.
 * @param {Function} next - Express middleware next function for error handling.
 * @throws {BadRequest} If required fields are missing or store name already exists.
 * @returns {Response} 
 *  - 200: Vector store created successfully.
 *  - 400: Bad request errors forwarded via next().
 *  - 500: Internal server error.
 */

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

/**
 * @async
 * @function getVectorStoresByUserId
 * @description Retrieves both private vector stores of the user and public vector stores of other users.
 * @param {Object} req - Request object; expects 'id' as the user ID in route parameters.
 * @param {Object} res - Returns JSON with user's private stores and other users' public stores.
 * @param {Function} next - Express middleware next function (not used here but typically for error handling).
 * @throws {Error} If database query fails.
 * @returns {Response}
 *  - 200: Returns private and public vector stores.
 *  - 500: Internal server error.
 */
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

/**
 * @async
 * @function getFileIdsFromVectorStoreFunc
 * @description Retrieves file IDs from a vector store by its ID.
 * @param {Object} req - Request object; expects vector store 'id' in route parameters.
 * @param {Object} res - Sends back the list of file IDs.
 * @returns {Response} 200 - Success with file IDs.
 */
export const getFileIdsFromVectorStoreFunc = async(req, res)=>{
  const openai = await getOpenAIInstance();
  const fileIds = await getFileIdsFromVectorStore(openai, req.params.id )
  // console.log("fileIds from vector store:",  fileIds)
  res.send(fileIds)
}

/**
 * @async
 * @function deleteFilesFromVectorStore
 * @description Deletes files from a vector store by its ID.
 * @param {Object} req - Request object; expects vector store 'id' in route parameters.
 * @param {Object} res - Sends back deletion result.
 * @returns {Response} 200 - Success with deletion details.
 */
export const deleteFilesFromVectorStore = async(req, res)=>{
  const openai = await getOpenAIInstance();
  const deletedVectorStoreFile = await deleteFilesFromVectorStoreUtils(openai, req.params.id )
  console.log("fileIds from vector store:",  req.params.id)
  res.send(deletedVectorStoreFile)
}