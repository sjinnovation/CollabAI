import express from 'express';
import { addFileInFolder, addFolderChat, addWaitingFileInFolder, deleteFileByFileId, deleteFilesByFileIds, deleteFilesByThreadId, deleteFilesByUid, deleteFolderChat, deleteProjectFiles, getFolderChatById, getFolderChats, getFolderChatsByUser, updateFolderChat } from '../controllers/folderChatController.js';
import authenticateUser from '../middlewares/login.js';
import multer from 'multer';

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

const folderChatRouter = express.Router();

folderChatRouter.post('/', authenticateUser, addFolderChat);
folderChatRouter.get('/', authenticateUser, getFolderChats);
folderChatRouter.patch('/:folderId', authenticateUser, updateFolderChat); 
folderChatRouter.delete('/:id', authenticateUser, deleteFolderChat);
folderChatRouter.get('/user/:userId', authenticateUser, getFolderChatsByUser);
folderChatRouter.get('/:folderId', authenticateUser, getFolderChatById);
folderChatRouter.post('/files',upload.fields([{ name: 'files', maxCount: 21 }, { name: 'avatar', maxCount: 2 }]) , authenticateUser, addFileInFolder);
folderChatRouter.post('/waiting-files',upload.fields([{ name: 'files', maxCount: 21 }, { name: 'avatar', maxCount: 2 }]) , authenticateUser, addWaitingFileInFolder);
folderChatRouter.delete('/delete-file/:folderId', authenticateUser, deleteProjectFiles);
folderChatRouter.post('/delete-thread-files', deleteFilesByThreadId);
folderChatRouter.post('/delete-uid-files', deleteFilesByUid);
folderChatRouter.post('/delete-single-file', deleteFileByFileId);
folderChatRouter.post('/delete-system-files', deleteFilesByFileIds);





export default folderChatRouter;