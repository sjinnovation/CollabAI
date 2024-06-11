import fs from 'fs';
import mime from 'mime';
import path from 'path';
import config from "../config.js";
import AWS from "aws-sdk"


const bucketName = config.AWS_BUCKET_NAME;
const bucketExpireTime = config.AWS_BUCKET_EXPIRE_TIME;

const s3 = new AWS.S3();

// Function to handle image upload using base64
export const uploadImageToS3 = async (imageData, type) => {
    let processedData = null
    let contentType = 'image/png'
    let imageName = 'images/' + Date.now().toString() + ".png";
    const expirationTimeInSeconds = 2 * 365 * 24 * 60 * 60;

  
    if (type === 'base64') {
      processedData = Buffer.from(imageData.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    } else {
      processedData =  fs.readFileSync(imageData);
      contentType = mime.lookup(imageData)
      const fileName = path.basename(imageData);
      imageName = 'images/' + Date.now().toString() +  fileName
    }
  
    const params = {
      Bucket: bucketName,
      Key: imageName,
      Body: processedData,
      ContentType: contentType
    };
  
    // Upload the image to S3
    const uploadPromise = s3.upload(params).promise();
  
    let uploadResult = null;
    try {
      uploadResult = await uploadPromise;
    } catch (err) {
      console.error('Error uploading image to S3:', err);
      return null;
    }
  
    // Generate the signed URL
    const urlParams = {
      Bucket: bucketName,          
      Key: params.Key,
      Expires: expirationTimeInSeconds,
    };
  
    const urlPromise = s3.getSignedUrlPromise('getObject', urlParams);
  
    let signedUrl = null;
    try {
      signedUrl = await urlPromise;
    } catch (err) {
      console.error('Error generating signed URL:', err);
      return null;
    }
  
    return signedUrl;
  };