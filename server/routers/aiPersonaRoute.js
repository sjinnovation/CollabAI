import express from "express";
import authenticateUser from "../middlewares/login.js";
import { createAiPersona, deleteAiPersona, getAiPersonaById, getAllAiPersonas, getAllAiPersonasWithPersonalPersonas, updateAiPersona } from "../controllers/aiPersonaController.js";
const aiPersonaRouter = express.Router();
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

// folderChatRouter.post('/files',upload.fields([{ name: 'files', maxCount: 21 }, { name: 'avatar', maxCount: 2 }]) , addFileInFolder);



aiPersonaRouter.post("/", authenticateUser, upload.fields([ { name: 'avatar', maxCount: 2 }]) , createAiPersona);
aiPersonaRouter.get("/", authenticateUser, getAllAiPersonas);
aiPersonaRouter.get("/all", authenticateUser, getAllAiPersonasWithPersonalPersonas);
aiPersonaRouter.get("/:id", authenticateUser, getAiPersonaById); 
aiPersonaRouter.patch("/:id", authenticateUser, upload.fields([ { name: 'avatar', maxCount: 2 }]), updateAiPersona);
aiPersonaRouter.delete("/:id", authenticateUser, deleteAiPersona);

export default aiPersonaRouter;