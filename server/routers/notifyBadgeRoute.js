import express from 'express';
import { addPushNotification, getNotificationBadge, updatePushNotification } from '../controllers/notifyBadgeController.js';
import authenticateUser from '../middlewares/login.js';
const notifyBadgeRoute = express.Router();

notifyBadgeRoute.post('/', addPushNotification);
notifyBadgeRoute.patch('/:userId',authenticateUser, updatePushNotification);
notifyBadgeRoute.get('/:userId',authenticateUser,getNotificationBadge);

export default notifyBadgeRoute;