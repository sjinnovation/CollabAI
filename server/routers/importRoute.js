import express from 'express'
import { importExcelData } from '../controllers/importController.js';
import authenticateUser from "../middlewares/login.js";
const importRouter=express.Router();

importRouter.post('/',authenticateUser, importExcelData);
export default importRouter;
