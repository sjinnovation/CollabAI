import express from 'express';
import {
  UpdateUserPassword,
  resetPassword,
} from '../controllers/auth.js';
import authenticateUser from '../middlewares/login.js';
import {
  getUsersWithPrompts,
  fetchAllUsers,
  getAllUsers,
  UpdateUser,
  UpdateUserStatus,
  getAllUserPrompts,
  getUserTokens,
  softUserDelete,
  bulkTeamAssignToUsers,
  getSingleUserByID,
  migrateDBForUserCollection,
  UpdateUserPreferences,
  getSingleUserInfoByID,
  uploadUserImage,
  checkingUserPassword,
    changeUserPassword,
	deleteUserPhoto,
	updateUserAcToken,
	UpdateAllUserPreferences,
	createNewPasswordForSSOUser,
  generateAPIKeyForUser,
  connectN8n,
  disconnectN8n,
  getN8nConnectionStatus,
  getN8nWorkflows
} from '../controllers/userController.js';

import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "docs/");
  },
  filename: (req, file, cb) => {
    const uniqueFilename = file.originalname;
    cb(null, uniqueFilename);
  },
});

const upload = multer({ storage: storage });

const userRouter = express.Router();

userRouter.get('/get-all-users', authenticateUser, getAllUsers);
userRouter.get('/fetch-all', authenticateUser, fetchAllUsers);

userRouter.get('/get-user-prompts', authenticateUser, getUsersWithPrompts);

userRouter.post('/get-single-user', authenticateUser, getSingleUserByID);

userRouter.post('/delete/:id', UpdateUserStatus);

userRouter.post('/forgotpassword/', UpdateUserPassword);

userRouter.patch('/resetPassword', resetPassword);

userRouter.patch('/update-user/:id', authenticateUser, UpdateUser);

userRouter.post(
  '/get-all-user-prompts/:id',
  authenticateUser,
  getAllUserPrompts
);

userRouter.patch('/update-status/:id', authenticateUser, UpdateUserStatus);

userRouter.patch('/update-preference/:id', authenticateUser, UpdateUserPreferences);

userRouter.get('/get-user-tokens/:id', getUserTokens);

userRouter.patch('/softdelete/:id', softUserDelete);

userRouter.patch('/team-assign', bulkTeamAssignToUsers);

userRouter.get('/migrate', migrateDBForUserCollection);

userRouter.post("/user-profile-avatar-upload/:id", upload.single("image"), uploadUserImage);
   
userRouter.post("/user-password-checking", authenticateUser, checkingUserPassword);

userRouter.post("/user-password-update", authenticateUser, changeUserPassword);

userRouter.put("/sso-user-password-update", authenticateUser, createNewPasswordForSSOUser);

userRouter.patch("/user-ac-token-update/:id", authenticateUser, updateUserAcToken);

userRouter.delete("/user-photo-delete/:id", authenticateUser, deleteUserPhoto);
userRouter.patch("/update-all-users/", UpdateAllUserPreferences);
userRouter.get("/get-single-user-info/:id", authenticateUser, getSingleUserInfoByID);
userRouter.post("/generate-api-key/:userId", authenticateUser, generateAPIKeyForUser);

// n8n integration routes
userRouter.post("/:userId/n8n-connection", authenticateUser, connectN8n);
userRouter.delete("/:userId/n8n-connection", authenticateUser, disconnectN8n);
userRouter.get("/:userId/n8n-connection", authenticateUser, getN8nConnectionStatus);
userRouter.get("/:userId/n8n-workflows", authenticateUser, getN8nWorkflows);

export default userRouter;