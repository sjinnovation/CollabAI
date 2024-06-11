import { addFavouriteAssistant, getAllFavouriteAssistant, getSingleFavouriteAssistant, updateSingleFavouriteAssistant, deleteSingleFavouriteAssistant, getSingleUsersFavAssistWithDetails } from '../controllers/favoriteAssistantController.js';

import express from 'express'
import authenticateUser from '../middlewares/login.js';
const favoriteRouter = express.Router();

favoriteRouter.route('/').get(authenticateUser, getAllFavouriteAssistant);
favoriteRouter.get('/:id', authenticateUser, getSingleFavouriteAssistant);
favoriteRouter.get('/:id/details_info', authenticateUser, getSingleUsersFavAssistWithDetails);
favoriteRouter.post('/', authenticateUser, addFavouriteAssistant);
favoriteRouter.put('/:id', authenticateUser, updateSingleFavouriteAssistant);
favoriteRouter.delete('/:id', authenticateUser, deleteSingleFavouriteAssistant);
export default favoriteRouter;