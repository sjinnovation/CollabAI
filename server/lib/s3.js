import fs from 'fs';
import mime from "mime-types";
import path from 'path';
import config from "../config.js";
import AWS from "aws-sdk";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configurations
const bucketName = config.AWS_BUCKET_NAME;
const bucketExpireTime = config.AWS_BUCKET_EXPIRE_TIME; // Not used in the code
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY_ID,
  region: config.AWS_REGION,
});
const s3 = new AWS.S3();

// Function to handle image upload using base64 or file path
export const uploadImageToS3 = async (imageData, type) => {

  let processedData = null;
  let contentType = 'image/png';
  let imageName = 'images/' + Date.now().toString() + ".png";
  const expirationTimeInSeconds = 2 * 365 * 24 * 60 * 60; // 2 years in seconds

  try {
    if (type === 'base64') {
      // Remove base64 metadata and decode the string
      processedData = Buffer.from(imageData.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    } else {
      // Read file from the given path
      processedData = fs.readFileSync(imageData);
      contentType = mime.getType(imageData); // Get the MIME type of the file

      const fileName = path.basename(imageData);

      imageName = 'images/' + Date.now().toString() + '-' + fileName; // Ensure a unique file name

    }
    const params = {
      Bucket: bucketName,
      Key: imageName,
      Body: processedData,
      ContentType: contentType
    };

    // Upload the image to S3
    const uploadResult = await s3.upload(params).promise();

    // Generate the signed URL
    const urlParams = {
      Bucket: bucketName,
      Key: params.Key,
      Expires: expirationTimeInSeconds,
    };

    const signedUrl = await s3.getSignedUrlPromise('getObject', urlParams);

    return signedUrl;
  } catch (err) {
    console.error('Error uploading image to S3:', err);
    return null;
  }
};

// Function to handle image upload using base64 or file path
export const uploadToS3Bucket = async (name,fileBuffer, type,userId) => {
  let processedData = null;
  const expirationTimeInSeconds = 2 * 365 * 24 * 60 * 60; // 2 years in seconds
  const allowedFileExtension = ['c', 'cpp', 'docx', 'html', 'java', 'json', 'md', 'pdf', 'php', 'pptx', 'py', 'rb', 'tex', 'txt', 'csv', 'css', 'jpeg', 'jpg', 'js', 'gif', 'png', 'tar', 'ts', 'xlsx', 'xml', 'zip']

  try {

    const contentType = type; // Get the MIME type of the file
    const s3FileName = 'knowledgeBase/'+userId+"/" + name; // Ensure a unique file name
    const params = {
      Bucket: bucketName,
      Key: s3FileName,
      Body: fileBuffer,
      ContentType: contentType
    };

    // Upload the image to S3
    const uploadResult = await s3.upload(params).promise();

    // Generate the signed URL
    const urlParams = {
      Bucket: bucketName,
      Key: params.Key,
      Expires: expirationTimeInSeconds,
    };


    return uploadResult;
  } catch (err) {
    console.error('Error uploading image to S3:', err);
    return null;
  }
};

export const deleteSingleFileFromS3Bucket = async (Prefix, key) => {
  const param = {
    Bucket: bucketName,
    Prefix: Prefix
  };

  // Define parameters for deleting an object
  const params = {
    Bucket: bucketName,
    Key: key
  };
  // Delete the object from S3
  const data = await s3.deleteObject(params).promise();
  // List all objects in the folder prefix
  const existingFiles = await s3.listObjectsV2(param).promise();

  return data.$response.httpResponse.statusCode

}


export const deleteSingleUsersAllFileFromS3Bucket = async (key) => {
  const params = {
    Bucket: bucketName,
    Key: key
  };
  // Delete the object from S3
  const data = await s3.deleteObject(params).promise();
  // List all objects in the folder prefix
  const existingFiles = await s3.listObjectsV2(param).promise();
  return data.$response.httpResponse.statusCode

}
export const deleteAllFilesFromS3Bucket = async (Prefix) => {
  const params = {
    Bucket: bucketName,
    Prefix: Prefix
  };

  try {
    // List all objects in the folder prefix
    const data = await s3.listObjectsV2(params).promise();
    if (!data.Contents.length) {
      console.error('No objects found to delete');
      return;
    }

    // Prepare delete parameters for each object
    const deleteParams = {
      Bucket: bucketName,
      Delete: { Objects: [] }
    };

    // Add objects to delete list
    data.Contents.forEach(obj => {
      deleteParams.Delete.Objects.push({ Key: obj.Key });
    });

    // Delete objects in batches of up to 1000
    const deleteChunks = [];
    while (deleteParams.Delete.Objects.length) {
      deleteChunks.push(deleteParams.Delete.Objects.splice(0, 1000));
    }

    for (const chunk of deleteChunks) {
      const chunkDeleteParams = {
        Bucket: bucketName,
        Delete: { Objects: chunk }
      };
      const resp = await s3.deleteObjects(chunkDeleteParams).promise();
    }
    return true
  } catch (err) {
    console.error("Error deleting objects:", err);
  }
};




// Function to ensure that a directory path exists
const ensureDirectoryExistence = (filePath) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true, mode: 0o777 });
  }
}
export const downloadFileFromS3 = async (userId, fileName)=>{
  const s3Key = `knowledgeBase/${userId}/${fileName}`;
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: s3Key,
  };
  const isKeyExistInS3=await s3.headObject(params).promise();
  const directoryPath = path.join(__dirname, '../docs', 'downloads');
  const filePath = path.join(directoryPath, fileName);
  ensureDirectoryExistence(filePath);

  const file = fs.createWriteStream(filePath, { mode: 0o666 });
if(isKeyExistInS3){
  return new Promise((resolve, reject) => {
    s3.getObject(params)
      .createReadStream()
      .pipe(file)
      .on('finish', () => resolve(filePath))
      .on('error', (error) => reject(error));
  });
}else{
  return '';
}

};