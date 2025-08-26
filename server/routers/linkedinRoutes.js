import express from 'express'
import {
    getLinkedInUrl,
    getAccessToken,
    createPost
} from "../controllers/linkedinController.js";

const linkedinRouter = express.Router();

linkedinRouter.route('/auth').get(getLinkedInUrl);
linkedinRouter.route('/callback').get(getAccessToken);
linkedinRouter.route('/post').post(createPost);

export default linkedinRouter;
