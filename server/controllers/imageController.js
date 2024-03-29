import AWS from "aws-sdk"
import multer from "multer"
import multerS3 from "multer-s3"
import StatusCodes from "http-status-codes";
import imageModel from "../models/imageModel.js"
import { ImageMessages } from "../constants/enums.js";
import config from "../config.js";

AWS.config.update({
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_KEY_ID,
  region: config.AWS_REGION,
});

const bucketName = config.AWS_BUCKET_NAME;
const bucketExpireTime = config.AWS_BUCKET_EXPIRE_TIME;

const s3 = new AWS.S3();

// Multer middleware to handle the file upload
export const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: bucketName,
    // acl: 'public-read',
    contentType:multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      cb(null, 'images/' + Date.now().toString() + '_' + file.originalname);
    },
  }),
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB file size limit
});
// Function to handle image upload
export const uploadImage = (req, res) => {   
  try {
    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No file provided' });
    }
    const params = {
      Bucket: bucketName, // Replace with your S3 bucket name
      Key: req.file.key,
      Expires: bucketExpireTime,
    };

    s3.getSignedUrl('getObject', params, (err, url) => {
      if (err) {
        console.error('Error generating signed URL:', err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: ImageMessages.CANNOT_GENERATE_URL });
      }
      const image = new imageModel({
        imageurl: url,
      });

      res.status(200).json({ imageUrl: url });
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Unexpected error' });
  }
};