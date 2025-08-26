import { StatusCodes } from "http-status-codes";
import { getExistingAccessedUsersByFolderService, getUserForFolderAccessService, grantAccessToKnowledgeBaseService, removeAccessFromSharedKnowledgeBaseService } from "../service/ShareKnowledgeBaseService.js";
import { KnowledgeBaseMessages } from "../constants/enums.js";
import User from "../models/user.js";

export const grantAccessToKnowledgeBase = async (req, res) => {
    try {
        const { id } = req.params;

        const response = await grantAccessToKnowledgeBaseService(id,req.body);

        if(response) {
            return res.status(StatusCodes.OK).json({
                message: KnowledgeBaseMessages.GRANT_ACCESS_TO_USER
            });
        } else {
            console.error(response);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: KnowledgeBaseMessages.GRANT_ACCESS_TO_USER_FAILED
            }); 
        }

    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: KnowledgeBaseMessages.INTERNAL_SERVER_ERROR
        });
    }
}

export const removeAccessFromSharedKnowledgeBase = async (req, res) => { 
    try {
        const { id } = req.params;
        const response = await removeAccessFromSharedKnowledgeBaseService(id, req.body);

        if(response) {
            return res.status(StatusCodes.OK).json({
                message: KnowledgeBaseMessages.REMOVE_ACCESS_FROM_USER
            });
        } else {
            console.error(response);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: KnowledgeBaseMessages.REMOVE_ACCESS_FROM_USER_FAILED
            });
        }
    } catch (error) {
        console.error(error)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: KnowledgeBaseMessages.INTERNAL_SERVER_ERROR
        });
    }
}

export const getAllGrantedKnowledgeBaseByUser = async (req, res) => {
    try {
        
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: KnowledgeBaseMessages.INTERNAL_SERVER_ERROR
        });
    }
}


export const getUserForFolderAccess = async (req, res) => {
    try {
        const {id} = req.params;
        const { page = 1, limit = 10, search } = req.query;
        const pageNumber = Number(page);
        const limitNumber = Number(limit);
        const sanitizedSearchTerm = search?.trim() || ''; // Sanitize input
        const userId = req.user.id;

        const data = await getUserForFolderAccessService(id, pageNumber, limitNumber, sanitizedSearchTerm, userId);
        
        if(data) {
            return res.status(StatusCodes.OK).json({
                message: KnowledgeBaseMessages.GRANT_ACCESS_TO_USER,
                data: data.data,
                total: data.totalCount,
                page: data.page,
                totalPages: data.totalPages,
            });
        } else {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: KnowledgeBaseMessages.GRANT_ACCESS_TO_USER_FAILED
            }); 
        }
    } catch (error) {
        console.error(error)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: KnowledgeBaseMessages.INTERNAL_SERVER_ERROR
        });
    }
}

export const getExistingAccessedUsersByFolder = async (req, res) => {
    try {

        const {id} = req.params;
        
        const { page = 1, limit = 10 } = req.query;
        const pageNumber = Number(page);
        const limitNumber = Number(limit);
        const data = await getExistingAccessedUsersByFolderService(id, pageNumber, limitNumber);

        if(data) {
            return res.status(StatusCodes.OK).json({
                message: KnowledgeBaseMessages.GRANT_ACCESS_TO_USER,
                data: data.data,
                total: data.totalCount,
                page: data.page,
                totalPages: data.totalPages,
            });
        } else {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: KnowledgeBaseMessages.GRANT_ACCESS_TO_USER_FAILED
            }); 
        }
    } catch (error) {
        console.error(error)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: KnowledgeBaseMessages.INTERNAL_SERVER_ERROR
        });
    }
}