import express from 'express'
const imageRouter = express.Router();
import {uploadImage , upload} from '../controllers/imageController.js'

imageRouter.route("/upload").post(upload.single("image"),uploadImage);


export default imageRouter;