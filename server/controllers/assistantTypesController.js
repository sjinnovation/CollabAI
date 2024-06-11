import { StatusCodes } from 'http-status-codes';
import { AssistantMessages } from '../constants/enums.js';
import { getAllAssistantTypesService, getSingleAssistantTypesService, createSingleAssistantTypesService, updateSingleAssistantTypesService, deleteSingleAssistantTypesService } from '../service/assistantTypeService.js';
export const getAssistantTypes = async (req, res) => {
    try {
        const data = await getAllAssistantTypesService();

        return res.status(StatusCodes.OK).json({
            data,
            message: AssistantMessages.ASSISTANT_TYPE_FETCH_SUCCESS
        });

    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: AssistantMessages.ASSISTANT_TYPE_FETCH_FAILED

        });

    }


};
export const getSingleAssistantType = async (req, res) => {
    try {
        const {id}=req.params;
        const data = await getSingleAssistantTypesService(id);

        return res.status(StatusCodes.OK).json({
            data,
            message: AssistantMessages.ASSISTANT_TYPE_FETCH_SUCCESS
        });

    } catch (error) {

        return res.status(StatusCodes.BAD_REQUEST).json({
            message: AssistantMessages.ASSISTANT_TYPE_FETCH_FAILED

        });

    }


};
export const createAssistantType = async (req, res) => {
    try {
        const { name } = req.body;
        const data = await createSingleAssistantTypesService(name);
        if (data === false) {
            return res.status(StatusCodes.OK).json({
                data,
                message: AssistantMessages.ASSISTANT_TYPE_CREATION_FAILED
            });

        }

        return res.status(StatusCodes.OK).json({
            data,
            message: AssistantMessages.ASSISTANT_TYPE_CREATED_SUCCESSFULLY
        });

    } catch (error) {

        return res.status(StatusCodes.BAD_REQUEST).json({
            message: AssistantMessages.ASSISTANT_TYPE_CREATION_FAILED

        });

    }

};
export const updateAssistantType = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedType = req.body;
        const data = await updateSingleAssistantTypesService(id,updatedType);
        return res.status(StatusCodes.OK).json({
            data,
            message: AssistantMessages.ASSISTANT_TYPE_UPDATE_SUCCESS

        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: AssistantMessages.ASSISTANT_TYPE_UPDATE_FAILED

        });

    }

};
export const deleteAssistantType = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await deleteSingleAssistantTypesService(id);
        return res.status(StatusCodes.OK).json({
            data,
            message: AssistantMessages.ASSISTANT_TYPE_DELETE_SUCCESS
        });


    } catch (error) {

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: AssistantMessages.ASSISTANT_TYPE_DELETE_FAILED
        });


    }

};