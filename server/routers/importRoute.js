import express from 'express'
import { importExcelData } from '../controllers/importController.js';

const importRouter=express.Router();

importRouter.post('/', importExcelData);
export default importRouter;
