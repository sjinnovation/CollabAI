import { StatusCodes } from "http-status-codes";
import LinkedinService from "../service/linkedinService.js";


/**
 * @async
 * @function getLinkedInUrl
 * @description Retrieves the LinkedIn OAuth authorization URL for client redirection.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object returning JSON with the LinkedIn auth URL or an error.
 * @returns {Response} JSON containing `authUrl` on success, or error message with status 500 on failure.
 */

export const getLinkedInUrl = async (req, res) => {
    try {
        const linkedinUrl = await LinkedinService.getLinkedInUrl();
        return res.json({ authUrl: linkedinUrl });
    } catch (error) {
        console.log("error in getLinkedInUrl", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
}

/**
 * @async
 * @function getAccessToken
 * @description Exchanges the LinkedIn authorization code for an access token.
 * @param {Object} req - Express request object containing the authorization code in query parameters.
 * @param {Object} res - Express response object returning JSON with the access token or error.
 * @returns {Response} JSON with `accessToken` on success, or error message with status 500 on failure.
 */

export const getAccessToken = async (req, res) => {
    try {
        const { code } = req.query;
        const accessToken = await LinkedinService.getAccessToken(code);
        return res.json({ accessToken });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
}


/**
 * @async
 * @function createPost
 * @description Creates a LinkedIn post using the provided access token and content.
 * @param {Object} req - Express request object containing accessToken, chatPrompt, and textToShare in body.
 * @param {Object} res - Express response object returning the created post data or error.
 * @returns {Response} 200 with post data on success, or 500 with error message on failure.
 */

export const createPost = async (req, res) => {
    try {
        const { accessToken, chatPrompt, textToShare } = req.body;
        const post = await LinkedinService.createPost(accessToken, chatPrompt, textToShare);
        return res.status(StatusCodes.OK).json(post);
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
}


