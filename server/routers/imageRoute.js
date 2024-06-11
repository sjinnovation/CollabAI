import express from 'express'
const imageRouter = express.Router();
import {uploadImage , uploadS3} from '../controllers/imageController.js'

imageRouter.route("/upload").post(uploadS3.single("image"),uploadImage);

export default imageRouter;