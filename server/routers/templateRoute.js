import express from "express";
import { createTemplate, getTemplates,getTemplateById , updateTemplateById , deleteTemplate , getTemplatesAdmin} from "../controllers/templateController.js";
import authenticateUser from '../middlewares/login.js';
const templateRouter = express.Router();

templateRouter.post("/create-template",authenticateUser,createTemplate);
templateRouter.get("/get-templates",authenticateUser,getTemplates);
templateRouter.post("/get-templates-admin",authenticateUser,getTemplatesAdmin);
templateRouter.put("/update-template/:id",authenticateUser,updateTemplateById);
templateRouter.get("/get-template/:id",authenticateUser,getTemplateById);
templateRouter.delete("/delete-template/:id",authenticateUser,deleteTemplate);
export default templateRouter;  