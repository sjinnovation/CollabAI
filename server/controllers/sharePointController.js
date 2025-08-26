import { createSingleKnowledgeBaseService, replaceCharacters } from '../service/knowledgeBase.js';
import { allMimeTypeToExtension } from './googleAuth.js';
import { getSharePointFileMetadata } from '../utils/onedriveApi.js';

export const sharePointInfoToKnowledgeBase = async (req, res) => {
  const { userId, fileDetails, token, siteId, driveId } = req.body;

  if (!fileDetails || fileDetails.length === 0) {
    console.warn(`[WARN] No files received in request body.`);
    return res.status(400).json({ message: "No file is sent" });
  }

  if (!siteId || !driveId) {
    console.warn(`[WARN] Missing SharePoint site or drive information.`);
    return res.status(400).json({ message: "SharePoint site ID and drive ID are required" });
  }

  try {
    const createFileInfoToKnowledgeBase = await Promise.all(fileDetails.map(async (file, index) => {
      const { fileName, mimeType, fileSize, webUrl } = await getSharePointFileMetadata(
        siteId, 
        driveId, 
        file.fileId, 
        token
      );

      let { resultFileName, replacedIndices } = replaceCharacters(file.name);
      const fileExtension = allMimeTypeToExtension[mimeType] || '';
      const lastDotIndex = resultFileName.lastIndexOf('.');
      let namePart = resultFileName;
      let extensionPart = '';

      if (lastDotIndex > 0 && lastDotIndex !== resultFileName.length - 1) {
        namePart = resultFileName.substring(0, lastDotIndex);
        extensionPart = resultFileName.substring(lastDotIndex);
      }
      
      let fileBaseName = resultFileName;
      if (extensionPart === '') {
        fileBaseName = resultFileName + fileExtension;
      }

      // Store SharePoint files in a separate folder structure
      const s3_link = `knowledgeBase/sharepoint/${userId}/${fileBaseName}`;

      const data = await createSingleKnowledgeBaseService(
        fileBaseName, 
        fileSize, 
        s3_link, 
        userId, 
        replacedIndices, 
        webUrl || file?.url,  
        file?.parentId,
        {
          source: 'sharepoint',
          siteId: siteId,
          driveId: driveId,
          fileId: file.fileId
        } 
      );
      return { fileId: file.fileId, data };
    }));
    return res.status(200).json({ 
      data: createFileInfoToKnowledgeBase, 
      message: "SharePoint files added successfully" 
    });

  } catch (error) {
    console.error(`[ERROR] Error in SharePoint file processing:`, error);
    return res.status(500).json({ message: "Could not process SharePoint files" });
  }
};