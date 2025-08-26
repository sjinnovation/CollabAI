import { StatusCodes } from 'http-status-codes';
import { CommonMessages, KnowledgeBaseMessages } from '../constants/enums.js';
import { createSingleKnowledgeBaseService, getAllKnowledgeBaseService, getSingleKnowledgeBaseService, updateSingleKnowledgeBaseService, deleteSingleKnowledgeBaseService, deleteSingleUsersAllKnowledgeBaseService, updateKnowledgeBasePublicStateService, findFileDetails, getAllImportedWebCrawledKnowledgeBaseService, updateFolderName, moveFile } from '../service/knowledgeBase.js';
import fs from 'fs';
import path , { join } from 'path';
import { fileURLToPath } from 'url';
import { downloadFileFromS3, ensureDirectoryExistence, uploadToS3Bucket } from '../lib/s3.js';
import { replaceCharacters } from '../service/knowledgeBase.js';
import axios from 'axios';
import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import mime from 'mime';
import mimeTypes from 'mime-types';
import { getUserBasedWorkBoardActivityService, syncWorkBoardFiles } from '../service/workBoardService.js';
import { extractAllGoogleDriveLinks, extractWorkBoardIdFromQuestion } from '../utils/googleDriveHelperFunctions.js';
import KnowledgeBase from '../models/knowledgeBase.js';
import mongoose from 'mongoose';
import { downloadFile, getFileMetadata } from './googleAuth.js';
import { syncGoogleDriveFiles } from '../service/googleAuthService.js';
import KnowledgeBaseAssistants from '../models/knowledgeBaseAssistants.js';
import { getOpenAIInstance } from '../config/openAI.js';
import Assistant from '../models/assistantModel.js';
import { promises as fsp } from 'fs';
import PDFDocument from 'pdfkit';
import mammoth from 'mammoth';
import { getServiceIdBySlug, getUserServiceCredentials } from '../service/integration/serviceIntegration.js';
import { downloadFileFromSharePoint, getOneDriveFileMetadata } from './oneDriveController.js';



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
        const { role } = req.body;
        const { userId } = req.params;
        const selectedTree = parseInt(req?.query?.selectedTree) || 0;
        const page = parseInt(req?.query?.page) || 1;
        const pageSize = parseInt(req?.query?.pageSize) || 10;
        const searchQuery = req?.query?.searchQuery ||"";
        const { data, allUserData, allPublicKnowledgeBase,treeData,publicTreeData } = await getAllKnowledgeBaseService(role, userId,page,pageSize ,searchQuery,selectedTree);
        return res.status(StatusCodes.OK).json({
            data, allUserData, allPublicKnowledgeBase,treeData,publicTreeData,
            message: KnowledgeBaseMessages.FILE_FETCHED_SUCCESSFULLY
        });

    } catch (error) {
        console.log(error)
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
        let processedFileCount = 0;

        if (fileDetails.length === 1 && fileDetails[0].hasOwnProperty("base64") === false) {
            processedFileCount = -1;
            const { resultFileName, replacedIndices } = replaceCharacters(fileDetails[0].name);
            const fileName = resultFileName;
            const s3_link = "knowledgeBase/" + fileName;
            const url = null;

            const data = await createSingleKnowledgeBaseService(fileName, 0, s3_link, owner, replacedIndices, url);
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
                const url = null;

                const data = await createSingleKnowledgeBaseService(name, obj.size, s3_link, owner,replacedIndices, null, obj.parentId, obj.isKnowledgeBaseShareable, obj.isFileShared, obj.sharedKnowledgeBaseOwner);
                
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
        console.error(error);
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
        const { isPublic, owner, name } = req.body;

        const responseInfo = await updateKnowledgeBasePublicStateService(id, isPublic, owner);
        if (responseInfo.isUpdated) {
           if(responseInfo.type === 'folder') {
               return res.status(StatusCodes.OK).json({
                   message: (isPublic === true) ? KnowledgeBaseMessages.FOLDER_MADE_PUBLIC : KnowledgeBaseMessages.FOLDER_MADE_PRIVATE
               });
           }
           else {
               return res.status(StatusCodes.OK).json({
                   message: (isPublic === true) ? KnowledgeBaseMessages.FILE_MADE_PUBLIC : KnowledgeBaseMessages.FILE_MADE_PRIVATE
               });
           }
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

export const updateKnowledgeBaseFolderName = async (req, res) => {
    try {

        const { id } = req.params;
        const { name, oldFolderPath, owner } = req.body;

        const isUpdated = await updateFolderName(oldFolderPath, name, owner, id);

        if (isUpdated) {
            return res.status(StatusCodes.OK).json({
                message: KnowledgeBaseMessages.FOLDER_NAME_UPDATED,
                data: isUpdated
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
 }

export const moveKnowledgeBaseFile = async (req, res) => {
    try {

        const { id } = req.params;
        const { parentFolder, owner } = req.body;

        const isUpdated = await moveFile(parentFolder, owner, id);

        if (isUpdated) {
            return res.status(StatusCodes.OK).json({
                message: KnowledgeBaseMessages.FILE_MOVED_SUCCESSFULLY,
                data: isUpdated
            });
        } else {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: KnowledgeBaseMessages.ACTION_FAILED
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: KnowledgeBaseMessages.ACTION_FAILED
        });
    }
 }

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
        console.error(error);
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

export const findFileFromDBandDownload = async (fileNameListParsed, files, ragFiles, knowledgeSource,findApps=[]) => {
    let isGoogleDrive = false;
    let isWorkBoard = false;
    for (const fileDetails of fileNameListParsed) {
        try {
            const fileRecord = await findFileDetails(fileDetails.key);
            if (!fileRecord || fileRecord?.length === 0) {
                continue;
            }
            const nameOfFile = fileRecord?.name
            const lastDotIndex = nameOfFile?.lastIndexOf('.');
            let namePart = nameOfFile;
            let extensionPart = '';
        
            if (lastDotIndex > 0 && lastDotIndex !== namePart.length - 1) {
              namePart = nameOfFile.substring(0, lastDotIndex);
              extensionPart = nameOfFile.substring(lastDotIndex); 
            }
            let googleIds = []
            const isSharePointUrl = fileRecord?.url?.includes('sharepoint.com') ||
                fileRecord?.url?.includes('onedrive.com');
            const links = extractAllGoogleDriveLinks(fileRecord?.url,googleIds);
            if (extensionPart === '.ai') {
                try {
                    const ids = extractWorkBoardIdFromQuestion(fileRecord?.url);
                    if (ids?.length > 0) {
                        if (!isWorkBoard) {
                            isWorkBoard = true;
                            findApps.push({ workBoard: true });
                        }
                        const workBoardActionItemJson = await getUserBasedWorkBoardActivityService(fileRecord.owner, ids[0]);
                        const directoryPath = path.join(__dirname, '../docs', 'downloads');
                        const fileName = namePart + '.json'
                        const filePath = path.join(directoryPath, fileName);
                        ensureDirectoryExistence(filePath);
                        // Ensure the directory exists
                        fs.mkdirSync(directoryPath, { recursive: true });
                        fs.writeFileSync(filePath, JSON.stringify(workBoardActionItemJson, null, 2), 'utf8');
                        let fileSizeInBytes = 0;
                        let encodingInfo = 'N/A';

                        const fileObject = {
                            fieldname: 'files',
                            originalname: fileRecord?.name,
                            encoding: encodingInfo,
                            mimetype: mime.getType(fileRecord?.name),
                            destination: '../docs/downloads/',
                            filename: fileRecord?.name,
                            path: filePath,
                            size: fileSizeInBytes,
                            key: fileDetails?.key,
                            url: fileRecord?.url ? fileRecord?.url : null
                        };

                        files.push(fileObject);
                    }
                } catch (error) {
                    console.error('Error processing WorkBoard:', error?.message);
                    throw new Error('Failed to process WorkBoard data');
                }

            }
            else if (links?.length > 0) {
                try {
                    if (!isGoogleDrive) {
                        isGoogleDrive = true;
                        findApps.push({ googleDrive: true });
                    }
                    const baseDir = join(__dirname, './../docs/googleDrive');
                    if (!fs.existsSync(baseDir)) {
                        fs.mkdirSync(baseDir, { recursive: true });
                    }
                    const { fileName, mimeType, fileSize } = await getFileMetadata(googleIds[0], fileRecord?.owner);

                    const fileDirectory = await downloadFile(googleIds[0], fileRecord?.name, mimeType, baseDir);
                    const normalizedPath = path.resolve(fileDirectory);

                    let fileSizeInBytes = fileSize;
                    let encodingInfo = 'N/A';
                    const fileObject = {
                        fieldname: 'files',
                        originalname: fileRecord?.name,
                        encoding: encodingInfo,
                        mimetype: mime.getType(fileRecord?.name),
                        destination: '../docs/googleDrive/',
                        filename: fileRecord?.name,
                        path: normalizedPath,
                        size: fileSizeInBytes,
                        key: fileDetails?.key,
                        url: fileRecord?.url ? fileRecord?.url : null
                    };

                    files.push(fileObject);
                } catch (error) {

                    console.error('Error downloading from Google Drive:', error.message);

                    throw new Error('Failed to download from Google Drive');

                }

            }
            else if (isSharePointUrl) {
                let isSharePoint = false;

                if (!isSharePoint) {
                    isSharePoint = true;
                    findApps.push({ sharePoint: true });
                }

                try {
                    const oneDriveService = await getServiceIdBySlug('onedrive'); // or 'sharepoint' depending on your slug

                    if (!oneDriveService) {
                        throw new Error(SharePointMessages.ONE_DRIVE_SERVICE_MISSING);
                    }
                    const serviceCredentials = await getUserServiceCredentials(
                        fileRecord.owner.toString(),
                        oneDriveService._id.toString()
                    );
                    const authFields = serviceCredentials?.credentials?.get('authFields');
                    const accessToken = authFields?.access_token;

                    if (!serviceCredentials || !accessToken) {
                        throw new Error(SharePointMessages.USER_NOT_CONNECTED_ONE_DRIVE);
                    }
                    let fileMetadata;
                    try {
                        fileMetadata = await getOneDriveFileMetadata(fileRecord.url, accessToken);
                    } catch (metadataError) {
                        console.warn('Could not fetch file metadata:', metadataError.message);
                    }
                    const mimeType = fileMetadata?.mimeType || mime.getType(fileRecord.name);
                    const filePath = await downloadFileFromSharePoint(
                        fileRecord.url,
                        fileRecord.name,
                        fileRecord.owner,
                        accessToken,
                        mimeType
                    );

                    if (filePath) {
                        const stats = await fs.promises.stat(filePath);

                        const fileObject = {
                            fieldname: 'files',
                            originalname: fileRecord.name,
                            encoding: 'binary', 
                            mimetype: mimeType,
                            destination: '../docs/sharepoint/',
                            filename: fileRecord.name,
                            path: filePath,
                            size: fileMetadata?.size || stats.size,
                            key: fileDetails.key,
                            url: fileRecord.url
                        };

                        files.push(fileObject);
                    } else {
                        throw new Error('File download returned empty path');
                    }

                } catch (error) {
                    throw new Error(`${SharePointMessages.DOWNLOAD_FAILED}: ${error.message}`);
                }
            }
            else {
                try {
                    const ownerName = fileRecord?.owner?.toString();
                    const filePath = await downloadFileFromS3(ownerName, fileRecord?.name);
                    let fileSizeInBytes = 0;
                    let encodingInfo = 'N/A';
                    try {
                        const stats = await fs.promises.stat(filePath);
                        fileSizeInBytes = stats?.size;
                        const mimeType = mime.getType(fileRecord?.name);
                        if (mimeType && mimeType.startsWith('text/')) {
                            encodingInfo = 'UTF-8';
                        }
                    } catch (err) {
                        console.error('Error getting file stats:', err);
                        continue;
                    }

                    const fileObject = {
                        fieldname: 'files',
                        originalname: fileRecord?.name,
                        encoding: encodingInfo,
                        mimetype: mime.getType(fileRecord?.name),
                        destination: '../docs/downloads/',
                        filename: fileRecord?.name,
                        path: filePath,
                        size: fileSizeInBytes,
                        key: fileDetails?.key,
                        url: fileRecord?.url ? fileRecord?.url : null
                    };

                    files.push(fileObject);
                } catch (error) {

                    console.error('Error downloading from S3:', error.message);

                    throw new Error('Failed to download from S3');

                }
            }

        } catch (error) {
            console.error('Error processing file:', error);
        }
    }

};



export const addParentIdToFiles = async (req,res)=> {
  try {
    // Fetch all documents from the collection
    const allDocs = await KnowledgeBase.find();
    // Create a map to store folder paths and their IDs
    const folderMap = {};
    // First, identify all folders
    allDocs.forEach(doc => {
      if (!doc.name.includes('.')) {
        // It's a folder
        folderMap[doc.name] = doc._id.toString();
      }
    });

    // Now, update all files with parentId
    for (const doc of allDocs) {
      if (doc.name.includes('.')) {
        // It's a file
        const pathParts = doc.name.split('/');
        const folderName = pathParts.slice(0, -1).join('/');
        const parentId = folderMap[folderName];

        if (parentId) {
          await KnowledgeBase.updateOne(
            { _id: doc._id },
            { $set: { parentId: new mongoose.Types.ObjectId(parentId) } }
          );
        }
      }
    }

    return res.status(StatusCodes.OK).json({message:"updated the parent id"})
  } catch (error) {
    console.error("Error updating parent IDs:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message:"Parent id update failed"})

  }
};


export const syncFilesFromNavBar = async (req, res) => {
    try {
        const {assistantId} = req.params;
        const checkKnowledgeBaseAssistants = await KnowledgeBaseAssistants.findOne({ assistantId: assistantId });
        if(checkKnowledgeBaseAssistants){
            for(const fileId of checkKnowledgeBaseAssistants?.file_ids){
                const knowledgeBaseInfo = await KnowledgeBase.findById({_id : fileId?.key});
                if(knowledgeBaseInfo?.url){
                    let googleIds = [];
                    const links = extractAllGoogleDriveLinks(knowledgeBaseInfo?.url,googleIds);
                    const ids = extractWorkBoardIdFromQuestion(knowledgeBaseInfo?.url);
                    const openai = await getOpenAIInstance();
    
                    if(ids){
                        const responseOfWBSync = await syncWorkBoardFiles(openai,fileId?.key)
        
                    }else if(links?.length > 0){
                        const responseOfGoogleDrive = await syncGoogleDriveFiles(openai,fileId?.key,knowledgeBaseInfo?.owner)
        
                    }
                }
            }
        }

        return res.status(StatusCodes.OK).json({message:"Files Synced Successfully"})

    } catch (error) {
        console.error(error)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: KnowledgeBaseMessages.INTERNAL_SERVER_ERROR
        });
    }
};
export const checkAssistantSyncEnable = async (req,res)=>{
    const {assistantId} = req.params;
    try{
        const responseOfCheckAssistant = await Assistant.findOne({assistant_id: assistantId});
        let enableSync = false;
        let fluxEnable = false;
        if(responseOfCheckAssistant){
            enableSync = responseOfCheckAssistant?.plugins?.some(plugin => plugin.type === 'enableSync') || false;
            fluxEnable = responseOfCheckAssistant?.plugins?.some(plugin => plugin.type === 'flux') || false;
        }
        return res.status(StatusCodes.OK).json({message:"Sync is enabled",enableSync,fluxEnable})

    }catch(error){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: CommonMessages.INTERNAL_SERVER_ERROR,enableSync : false});

    }

}



/**
 * Convert file to PDF and save as .pdf (correct extension)
 * Also add file.newFilePath = PDF path
 */
export const convertToPdf = async(file)=> {
  const ext = path.extname(file.originalname).toLowerCase();
  const filePath = file.path;
  const baseFilePath = filePath.replace(ext, ''); // remove extension
  const baseName = path.parse(file.originalname).name;
  const newPdfPath = baseFilePath + '.pdf'; // uploads/abcd1234.pdf

  // Add newFilePath to the multer file object
  file.newFilePath = newPdfPath;
  file.path = newPdfPath
  file.originalName = `${baseName}.pdf`


  // If already a PDF, return original
  if (ext === '.pdf') {
    file.newFilePath = filePath;
    return { pdfPath: filePath, originalName: `${baseName}.pdf` };
  }

  // .txt → PDF
  if (ext === '.txt') {
    const text = await fsp.readFile(filePath, 'utf8');
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(newPdfPath);
    doc.pipe(stream);
    doc.fontSize(12).text(text);
    doc.end();
    await new Promise((resolve) => stream.on('finish', resolve));
    return { pdfPath: newPdfPath, originalName: `${baseName}.pdf` };
  }

  // .json → PDF
  if (ext === '.json') {
    const jsonStr = await fsp.readFile(filePath, 'utf8');
    const json = JSON.parse(jsonStr);
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(newPdfPath);
    doc.pipe(stream);
    doc.fontSize(12).text(JSON.stringify(json, null, 2));
    doc.end();
    await new Promise((resolve) => stream.on('finish', resolve));
    return { pdfPath: newPdfPath, originalName: `${baseName}.pdf` };
  }

  // .docx → PDF
  if (ext === '.docx') {
    const { value: html } = await mammoth.convertToHtml({ path: filePath });
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = fs.createWriteStream(newPdfPath);
    doc.pipe(stream);
    doc.fontSize(12).text(html.replace(/<[^>]+>/g, '')); // remove HTML tags
    doc.end();
    await new Promise((resolve) => stream.on('finish', resolve));
    return { pdfPath: newPdfPath, originalName: `${baseName}.pdf` };
  }

  // Not supported
  if (ext === '.pptx' || ext === '.tex') {
    throw new Error(`File type ${ext} not supported for conversion`);
  }

  throw new Error('Unsupported file type');
}
