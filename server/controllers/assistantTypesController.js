import { StatusCodes } from 'http-status-codes';
import { AssistantMessages } from '../constants/enums.js';
import { getAllAssistantTypesService, getSingleAssistantTypesService, createSingleAssistantTypesService, updateSingleAssistantTypesService, deleteSingleAssistantTypesService } from '../service/assistantTypeService.js';


const hasIconMiddleOrEnd = (text) => {
    const iconPattern =  /[^\w\s]+$/;
     // Non-word, non-whitespace character in the middle or at the end
    return iconPattern.test(text);
  };
  /**
 * @async
 * @function getAssistantTypes
 * @description Fetches all available assistant types.
 * @param {Object} req - The request object (no body or params needed).
 * @param {Object} res - Returns a list of assistant types.
 * @throws {Error} If fetching assistant types fails.
 * @returns {Response} 200 - Success with data, 400 - Failed to fetch data.
 */

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
/**
 * @async
 * @function getSingleAssistantType
 * @description Fetch a single assistant type by ID.
 * @param {Object} req - The request object. 'id' must be passed as a route parameter.
 * @param {Object} res - Returns the assistant type data.
 * @throws {Error} If fetching the assistant type fails.
 * @returns {Response} 200 - Success with data, 400 - Failed to fetch data.
 */

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
/**
 * @async
 * @function createAssistantType
 * @description Creates a new assistant type. Validates that the icon is not in the middle or end of the name.
 * @param {Object} req - Request object with 'name' in the body.
 * @param {Object} res - Returns the creation result or validation error.
 * @throws {Error} If creation fails or validation fails.
 * @returns {Response} 200 - Success or already exists, 400 - Validation or creation error.
 */

export const createAssistantType = async (req, res) => {
    try {
        const { name } = req.body;
        const hasIconInTheMiddleOrInTheEnd=hasIconMiddleOrEnd(name);
        if(hasIconInTheMiddleOrInTheEnd){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: AssistantMessages.ASSISTANT_TYPE_ICON_IN_THE_MID_OR_END
    
            });

        }
        const data = await createSingleAssistantTypesService(name);
        if (data === false) {
            return res.status(StatusCodes.OK).json({
                data,
                message: AssistantMessages.ASSISTANT_TYPE_EXIST
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
/**
 * @async
 * @function updateAssistantType
 * @description Updates an existing assistant type by ID with the provided data.
 * @param {Object} req - The request object; expects 'id' in params and updated data in body.
 * @param {Object} res - Returns the updated assistant type data.
 * @throws {Error} If the update operation fails.
 * @returns {Response} 200 - Success with updated data, 500 - Internal server error.
 */

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
/**
 * @async
 * @function deleteAssistantType
 * @description Deletes an assistant type by its ID.
 * @param {Object} req - The request object; expects 'id' in the route parameters.
 * @param {Object} res - Returns deletion result and status message.
 * @throws {Error} If deletion fails.
 * @returns {Response} 200 - Success message, 500 - Internal server error.
 */

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