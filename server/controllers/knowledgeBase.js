import { StatusCodes } from 'http-status-codes';
import { KnowledgeBaseMessages } from '../constants/enums.js';
import { createSingleKnowledgeBaseService, getAllKnowledgeBaseService, getSingleKnowledgeBaseService, updateSingleKnowledgeBaseService, deleteSingleKnowledgeBaseService, deleteSingleUsersAllKnowledgeBaseService, updateKnowledgeBasePublicStateService, findFileDetails } from '../service/knowledgeBase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { downloadFileFromS3, uploadToS3Bucket } from '../lib/s3.js';
import { replaceCharacters } from '../service/knowledgeBase.js';
import axios from 'axios';
import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import mime from 'mime';




// Convert import.meta.url to __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const extractFile = async (realFileId) => {
    const auth = new GoogleAuth({

        scopes: 'https://www.googleapis.com/auth/drive',
    });
    const service = google.drive({ version: 'v3', auth });

    //   fileId = realFileId;
    try {
        const file = await service.files.get({
            fileId: realFileId,
            alt: 'media',
        });
        return file.status;
    } catch (err) {
        // TODO(developer) - Handle error
        throw err;
    }
};
/**
 * @async
 * @function getKnowledgeBases
 * @description get all the KnowledgeBases
 * @param {Object} req - body contains user role and params contains userId
 * @param {Object} res - sends two types of data, 1) personal KnowledgeBase 2) all users Knowledge Base 
 * @returns {Response} 200 - as all data is getting
 * @throws {Error} Will throw an error if fetching data got any issue
 */
export const getKnowledgeBases = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;
        const { data, allUserData, allPublicKnowledgeBase } = await getAllKnowledgeBaseService(role, userId);
        return res.status(StatusCodes.OK).json({
            data, allUserData, allPublicKnowledgeBase,
            message: KnowledgeBaseMessages.FILE_FETCHED_SUCCESSFULLY
        });

    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: KnowledgeBaseMessages.ACTION_FAILED

        });

    }


};
/**
 * @async
 * @function getSingleKnowledgeBase
 * @description get single the KnowledgeBases
 * @param {Object} req -  params contains userId
 * @param {Object} res - sends single KnowledgeBase Information
 * @returns {Response} 200 - as  data is getting
 * @throws {Error} Will throw an error if fetching data got any issue
 */
export const getSingleKnowledgeBase = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await getSingleKnowledgeBaseService(id);

        return res.status(StatusCodes.OK).json({
            data,
            message: KnowledgeBaseMessages.FILE_FETCHED_SUCCESSFULLY
        });

    } catch (error) {

        return res.status(StatusCodes.BAD_REQUEST).json({
            message: KnowledgeBaseMessages.ACTION_FAILED

        });

    }


};
export const acceptedTypes = (type) => {
    const acceptedFileTypes = [
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv",
        "application/csv",
        "text/plain",
        "application/vnd.ms-excel",
    ];
    if (acceptedFileTypes.includes(type)) {
        return true;
    }
    return false

};
export const getMimeType = (base64) => {
    const match = base64.match(/^data:(.+);base64,/);
    return match ? match[1] : null;
};


/**
 * @async
 * @function createKnowledgeBase
 * @description Create a new Knowledge Base file
 * @param {Object} req - body contains fileDetails which is an array of file with it's information and userId as owner's id 
 * @param {Object} res - Response object
 * @returns {Response} 201 - Returns created Knowledge Base Information
 * @throws {Error} Will throw an error if Knowledge Base creation failed
 */
export const createKnowledgeBase = async (req, res) => {
    try {

        const { fileDetails, owner } = req.body;
        let processedFileCount=0;
        
        if (fileDetails.length === 1 && fileDetails[0].hasOwnProperty("base64") === false) {
            processedFileCount=-1;
            const { resultFileName, replacedIndices }= replaceCharacters(fileDetails[0].name);
            const fileName = resultFileName;
            const s3_link = "knowledgeBase/" + fileName;
            const data = await createSingleKnowledgeBaseService(fileName, 0, s3_link, owner,replacedIndices);
            if (data.length === 0) {
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: KnowledgeBaseMessages.ACTION_FAILED
                });

            }
            return res.status(StatusCodes.OK).json({
                message: KnowledgeBaseMessages.FOLDER_ADDED_SUCCESSFULLY
            });

        } else {
            for (const obj of fileDetails) {
                const mimeType = getMimeType(obj.base64);
                if (acceptedTypes(mimeType)) {
                    processedFileCount += 1;

                let s3_link = "";
                let name = "";
                const { resultFileName, replacedIndices } = replaceCharacters(obj.name);
                name = resultFileName;
                if (obj.hasOwnProperty("base64")) {
                    const base64Data = obj.base64.replace(/^data:.*,/, '');
                    const contentType = obj.type;
                    const unlinkFlag = true;
                    const fileBuffer = Buffer.from(base64Data, 'base64');
                    s3_link = uploadToS3Bucket(name,fileBuffer, contentType,owner);
                }
                s3_link = "knowledgeBase/"+owner+"/"+ name;
                const data = await createSingleKnowledgeBaseService(name, obj.size, s3_link, owner,replacedIndices);
                
                if (data.length === 0) {
                    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                        message: KnowledgeBaseMessages.ACTION_FAILED
                    });

                    }
                }

            }
            if (processedFileCount === 0) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: KnowledgeBaseMessages.FILE_TYPE_SHOULD_BE_PDF
                });

            }

            return res.status(StatusCodes.OK).json({
                message: KnowledgeBaseMessages.FILE_ADDED_SUCCESSFULLY
            });

        }


    } catch (error) {

        return res.status(StatusCodes.BAD_REQUEST).json({
            message: KnowledgeBaseMessages.ACTION_FAILED

        });

    }
};
/**
 * @async
 * @function updateKnowledgeBase
 * @description update KnowledgeBase information of a single file
 * @param {Object} req - Request object. Should contain the following parameters in body: {name, updatedName, owner, checkSimilar, updateTheSimilar} and KnowledgeBase id as params
 * @param {Object} res - Response object
 * @returns {Response} 200 - as updated information 
 * @throws {Error} Will throw an error if Knowledge Base updation failed
 */
export const updateKnowledgeBase = async (req, res) => {
    try {
        const { id } = req.params;
        const { isPublic, owner } = req.body;
        const isUpdated = await updateKnowledgeBasePublicStateService(id, isPublic, owner);
        if (isUpdated) {
            return res.status(StatusCodes.OK).json({
                message: (isPublic === true) ? KnowledgeBaseMessages.RESOURCE_MADE_PUBLIC : KnowledgeBaseMessages.RESOURCE_MADE_PRIVATE

            });
        } else {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: KnowledgeBaseMessages.ACTION_FAILED
            });
        }

    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: KnowledgeBaseMessages.ACTION_FAILED

        });

    }

};
/**
 * @async
 * @function deleteKnowledgeBase
 * @description delete single KnowledgeBase file
 * @param {Object} req - contains knowledge base id as params
 * @param {Object} res - Response object
 * @returns {Response} 200 - as deletes knowledge base
 * @throws {Error} Will throw an error if deletion failed
 */
export const deleteKnowledgeBase = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.query.userId;
        const isAdmin = req.query.isAdmin;

        const data = await deleteSingleKnowledgeBaseService(id, userId, isAdmin);
        return res.status(StatusCodes.OK).json({
            data,
            message: KnowledgeBaseMessages.DELETED_SUCCESSFULLY_FROM_FILE_LIST
        });


    } catch (error) {

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: KnowledgeBaseMessages.ACTION_FAILED
        });


    }

};


/**
 * @async
 * @function deleteKnowledgeBase
 * @description delete single KnowledgeBase file
 * @param {Object} req - contains knowledge base id as params
 * @param {Object} res - Response object
 * @returns {Response} 200 - as deletes knowledge base
 * @throws {Error} Will throw an error if deletion failed
 */
export const deleteMultipleKnowledgeBase = async (req, res) => {
    try {
        const { userId, KnowledgeBaseIds, isAdmin } = req.body;
        for (const id of KnowledgeBaseIds) {
            const data = await deleteSingleKnowledgeBaseService(id, userId, isAdmin);
        }
        return res.status(StatusCodes.OK).json({
            message: KnowledgeBaseMessages.DELETED_SUCCESSFULLY_FROM_FILE_LIST
        });


    } catch (error) {

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: KnowledgeBaseMessages.ACTION_FAILED
        });


    }

};
/**
 * @async
 * @function deleteUsersAllKnowledgeBase
 * @description delete single users all KnowledgeBase file
 * @param {Object} req - contains userId as params
 * @param {Object} res - Response object
 * @returns {Response} 200 - as deletes knowledge base
 * @throws {Error} Will throw an error if deletion failed
 */
export const deleteUsersAllKnowledgeBase = async (req, res) => {
    try {
        const { userId } = req.params;
        const data = await deleteSingleUsersAllKnowledgeBaseService(userId);
        return res.status(StatusCodes.OK).json({
            message: KnowledgeBaseMessages.DELETED_SUCCESSFULLY_FROM_FILE_LIST
        });


    } catch (error) {

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: KnowledgeBaseMessages.ACTION_FAILED
        });


    }

};

export const findFileFromDBandDownload = async (fileNameListParsed, files,ragFiles,knowledgeSource) => {
  for (const fileDetails of fileNameListParsed) {
    try {
      const fileRecord = await findFileDetails(fileDetails.key);
      if (!fileRecord || fileRecord.length === 0) {
        continue;
      }

            const ownerName = fileRecord[0].owner.toString();
            const filePath = await downloadFileFromS3(ownerName, fileRecord[0].name);
            let fileSizeInBytes = 0;
            let encodingInfo = 'N/A'; // Default for binary files
            try {
                const stats = await fs.promises.stat(filePath);
                fileSizeInBytes = stats.size;

                // Determine encoding if it's a text file
                const mimeType = mime.getType(fileRecord[0].name);
                if (mimeType && mimeType.startsWith('text/')) {
                    encodingInfo = 'UTF-8'; 
                }
            } catch (err) {
                console.error('Error getting file stats:', err);
                continue;
            }

      const fileObject = {
        fieldname: 'files',
        originalname: fileRecord[0].name,
        encoding: encodingInfo,
        mimetype: mime.getType(fileRecord[0].name),
        destination: '../docs/downloads/',
        filename: fileRecord[0].name,
        path: filePath,
        size: fileSizeInBytes,
        key : fileDetails.key
      };
      if(knowledgeSource === "true" || knowledgeSource === true){
        ragFiles.push(fileObject);

      }else{
        files.push(fileObject);

      }


    } catch (error) {
      console.error('Error processing file:', error);
    }
  }

};
