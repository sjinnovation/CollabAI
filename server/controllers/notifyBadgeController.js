import BadgeStatus from "../models/badge_status.js";
import User from "../models/user.js";
import { getUserNotificationUpdate, updateAllUsersPushNotification, updateSingleUserPushNotification } from "../service/notifyBadgeService.js";


/**
 * @async
 * @function addPushNotification
 * @description Updates the push notification badge visibility for all users based on the `showBadge` value in the request body.
 * @param {Object} req - Express request object containing `showBadge` in the body.
 * @param {Object} res - Express response object returning the updated badge visibility status or an error.
 * @returns {Response} 200 with updated badge visibility on success, or 500 with an error message on failure.
 */

export const addPushNotification =  async (req, res) => {
    try {
      const { showBadge } = req.body;
      const doc = await updateAllUsersPushNotification(showBadge);
      return res.json({ status: 'ok', badgeVisible: doc.isVisible, });
    } catch (error) {
      console.error('Error updating badge status:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  
/**
 * @async
 * @function updatePushNotification
 * @description Updates the push notification badge visibility for a specific user based on the `userId` parameter and `showBadge` value in the request body.
 * @param {Object} req - Express request object containing `userId` in params and `showBadge` in the body.
 * @param {Object} res - Express response object returning the updated badge visibility status or an error.
 * @returns {Response} 200 with updated badge visibility on success, or 500 with an error message on failure.
 */

  export const updatePushNotification =  async (req, res) => {
    try {
      const { userId } = req.params;
      const { showBadge } = req.body;
      const updateNotificationStatusForUser = await updateSingleUserPushNotification(userId,showBadge);

      return res.json({ status: 'ok', badgeVisible: false, });
    } catch (error) {
      console.error('Error updating badge status:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
 * @async
 * @function getNotificationBadge
 * @description Retrieves the push notification badge visibility status for a specific user by userId.
 * @param {Object} req - Express request object containing `userId` in params.
 * @param {Object} res - Express response object returning the badge visibility status or an error.
 * @returns {Response} 200 with badge visibility status (true/false) on success, or 500 with an error message on failure.
 */

export const getNotificationBadge = async (req, res) => {
  const {userId} = req.params
    try {
      // const doc = await BadgeStatus.findOne({ _id: 'globalBadge' });
      const doc = await getUserNotificationUpdate(userId);

      if (!doc) {
        // If no doc found, default to false
        return res.json({ badgeVisible: false });
      }
  
      return res.json({ badgeVisible: doc.isPushVisible });
    } catch (error) {
      console.error('Error fetching badge status:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }