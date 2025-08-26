import BadgeStatus from "../models/badge_status.js";
import User from "../models/user.js";

export const updateAllUsersPushNotification = async (showBadge)=>{
    const updateAllUser = await User.updateMany(
        { _badgeId: 'globalBadge' },          // match
        { $set: { isPushVisible: !!showBadge } }, // update
        { new: true, upsert: true }      // return updated doc, create if not exists
      );
    return await BadgeStatus.findOneAndUpdate(
        { _id: 'globalBadge' },          
        { $set: { isVisible: !!showBadge } }, 
        { new: true, upsert: true }  
      );
};
export const updateSingleUserPushNotification =async (userId,showBadge)=>{
    return await User.findOneAndUpdate(
        { _id : userId},          // match
        { $set: { isPushVisible: !!showBadge } }, // update
        { new: true, upsert: true }      // return updated doc, create if not exists
      );

}
export const getUserNotificationUpdate = async (userId)=>{
    return await User.findOne({ _badgeId: 'globalBadge' ,_id: userId});
}