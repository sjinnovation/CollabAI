import AWS from "aws-sdk"
import multer from "multer"
import multerS3 from "multer-s3"
import imageModel from "../models/imageModel.js"
import config from "../config.js";

// import bodyParser from "body-parser";
// import { log } from "handlebars";
// Configure AWS with your credentials and desired region
AWS.config.update({
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_KEY_ID,
  region: config.AWS_REGION,
});


const s3 = new AWS.S3();

// Multer middleware to handle the file upload
export const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'collabai-assets',
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
      return res.status(400).json({ error: 'No file provided' });
    }

    // Expiration time (in seconds) for the image URL
    const expirationTime = 900; // 15 minutes (15 * 60 seconds)

    // Generate the signed URL with expiration
    const params = {
      Bucket: 'collabai-assets', // Replace with your S3 bucket name
      Key: req.file.key,
      Expires: expirationTime,
    };

    s3.getSignedUrl('getObject', params, (err, url) => {
      if (err) {
        console.error('Error generating signed URL:', err);
        return res.status(500).json({ error: 'Error generating signed URL' });
      }
      const image = new imageModel({
        imageurl: url,
      });

      res.status(200).json({ imageUrl: url });
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Unexpected error' });
  }
};