import { StatusCodes } from "http-status-codes";
import { CommonMessages, KnowledgeBaseMessages, WebCrawlKnowledgeBaseMessages } from "../constants/enums.js";
import { writeFile } from "node:fs/promises";
import Replicate from "replicate";
import Together from "together-ai";
import { uploadToS3Bucket } from "../lib/s3.js";
import { createOrUpdateAppAuthService, deleteAppAuthCredentialService, getGoogleAuthCredentialService } from "../service/googleAuthService.js";
import { getConfigKeyValue } from "../service/configService.js";
import { config } from "dotenv";
import AWS from "aws-sdk";

const bucketName = process.env.AWS_BUCKET_NAME;
const bucketExpireTime = config.AWS_BUCKET_EXPIRE_TIME; // Not used in the code
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY_ID,
  region: config.AWS_REGION,
});
const s3 = new AWS.S3();


/**
 * @async
 * @function createFluxImage
 * @description Generates an image based on a prompt using TogetherAI's FLUX model, uploads it to S3,
 *              and returns the base64 image data.
 * @param {Object} req - Request object with body containing:
 *   - prompt {string} - Text prompt for image generation.
 * @param {Object} res - Response object returning status and JSON with image data or error message.
 * @returns {Response} 200 with base64 image string on success, 500 on internal error.
 */

export const createFluxImage = async (req, res) => {
    const replicate = new Replicate();
    const { prompt } = req.body;
    const togetheraiKey = await getConfigKeyValue('togetheraiKey');
    let together = new Together({apiKey : togetheraiKey});

    try {

        let output = await together.images.create({
            prompt: prompt,
            model: "black-forest-labs/FLUX.1-schnell",
            width: 1024,
            height: 768,
            steps: 3,
            response_format: "base64",
          });
        const fileBuffer = Buffer.from(output.data[0].b64_json, 'base64');
        const name = "test.jpg"
        const contentType = "image/jpeg"
        const s3_link = await uploadToS3Bucket(name,fileBuffer, contentType,null);

        return res.status(StatusCodes.OK).json({"image" : output.data[0].b64_json });

    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: CommonMessages.INTERNAL_SERVER_ERROR });
    }

};


/**
 * @async
 * @function storeFluxCredential
 * @description Stores or updates Flux API credentials for a user.
 * @param {Object} req - Request object with body containing:
 *   - userId {string} - User identifier.
 *   - fluxKey {string} - Flux API key.
 * @param {Object} res - Response object returning status and JSON with result or error message.
 * @returns {Response} 200 on successful storage, 400 on failure.
 */

export const storeFluxCredential = async(req,res)=>{
    const {userId,fluxKey} = req.body;

    try {
        const code = fluxKey;
        const accessToken = fluxKey;
        const refreshToken = fluxKey;
        const appName="flux";
    
        const responseOfFluxKeyStore = await createOrUpdateAppAuthService(userId,code,accessToken,refreshToken,appName);
        return res.status(StatusCodes.OK).json({
            responseOfFluxKeyStore,
            message: WebCrawlKnowledgeBaseMessages.ADDED_IN_FILE_LIST_SUCCESSFULLY
        });

    } catch (error) {
        console.log("error :",error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: KnowledgeBaseMessages.ACTION_FAILED

        });
    }
};

/**
 * @async
 * @function getFluxCredential
 * @description Retrieves stored Flux API credentials for a given user.
 * @param {Object} req - Request object with params containing:
 *   - userId {string} - User identifier.
 * @param {Object} res - Response object returning status and JSON with credentials or error message.
 * @returns {Response} 200 with credentials on success, 400 on failure.
 */

export const getFluxCredential = async (req,res)=>{
    const {userId} = req.params;
    try {
        const appName="flux";
        const getFluxCredential = userId?await getGoogleAuthCredentialService(userId,appName):null;
        return res.status(StatusCodes.OK).json({
            getFluxCredential,
            message: WebCrawlKnowledgeBaseMessages.FILE_FETCHED_SUCCESSFULLY
        });

    } catch (error) {
        console.log("error :",error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: KnowledgeBaseMessages.ACTION_FAILED
        });
    }
};

/**
 * @async
 * @function deleteFluxCredential
 * @description Deletes stored Flux API credentials for a specified user.
 * @param {Object} req - Request object with params containing:
 *   - userId {string} - User identifier.
 * @param {Object} res - Response object returning status and JSON with delete result or error message.
 * @returns {Response} 200 on successful deletion, 400 on failure.
 */

export const deleteFluxCredential = async(req,res)=>{
    const {userId} = req.params;

    try {
        const appName="flux";
        const responseOfFluxKeyDelete = await deleteAppAuthCredentialService(userId,appName);
        return res.status(StatusCodes.OK).json({
            responseOfFluxKeyDelete,
            message: WebCrawlKnowledgeBaseMessages.DELETED_SUCCESSFULLY
        });

    } catch (error) {
        console.log("error :",error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: KnowledgeBaseMessages.ACTION_FAILED

        });
    }
};

/**
 * @async
 * @function getImageBodyForDownload
 * @description Retrieves an image from S3 by key and returns it as a base64-encoded data URL.
 * @param {Object} req - Request object with query containing:
 *   - s3Key {string} - The S3 object key of the image to download.
 * @param {Object} res - Response object that returns JSON with base64 image string or error message.
 * @returns {Response} 200 with base64 image data or 500 on failure.
 */

export const getImageBodyForDownload =  async (req, res) => {
    const { s3Key } = req.query;
    const params = {
      Bucket: bucketName,
      Key: s3Key,
    };
  
    try {
      const data = await s3.getObject(params).promise();
    // Convert the image data to base64
    const base64Data = Buffer.from(data.Body).toString('base64');
    
    // Send the base64 string as the response
    res.json({ base64: `data:${data.ContentType};base64,${base64Data}` });
    } catch (err) {
      console.error("Error downloading image:", err);
      res.status(500).send("Failed to download image");
    }
};