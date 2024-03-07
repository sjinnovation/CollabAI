import express from 'express';
import {
	UpdateUserPassword,
	resetPassword,
} from '../controllers/auth.js';
import authenticateUser from '../middlewares/login.js';
import {
	getUsersWithPrompts,
	getAllUsers,
	UpdateUser,
	UpdateUserStatus,
	getAllUserPrompts,
	getUserTokens,
	softUserDelete,
	bulkTeamAssignToUsers,
	getSingleUserByID,
	migrateDBForUserCollection,
} from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.get('/get-all-users', authenticateUser, getAllUsers);

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

userRouter.get('/get-user-tokens/:id', getUserTokens);

userRouter.patch('/softdelete/:id', softUserDelete);

userRouter.patch('/team-assign', bulkTeamAssignToUsers);

userRouter.get('/migrate', migrateDBForUserCollection);

export default userRouter;
