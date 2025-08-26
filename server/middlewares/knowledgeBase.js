import { StatusCodes } from "http-status-codes";
import KnowledgeBase from "../models/knowledgeBase.js";
import { KnowledgeBaseMessages } from "../constants/enums.js";

export const knowledgeBaseOwner = async (req, res, next) => {
    const { owner } = req.body;
    const { id } = req.params; // Folder ID from URL parameters

    try {
        const isKnowledgeBaseExists = await KnowledgeBase.findOne({
            _id: id,
            owner: owner
        });

        if (isKnowledgeBaseExists) {
            return next();
        } else {
            return res.status(StatusCodes.FORBIDDEN).json({
                message: KnowledgeBaseMessages.FOLDER_ACCESS_GRANTED_DENIED
            });
        }

    } catch (error) {
        console.error("Error checking folder owner:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: KnowledgeBaseMessages.FOLDER_ACCESS_GRANTED_DENIED
        });
    }
};