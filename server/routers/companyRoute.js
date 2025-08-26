import express from 'express'
const companyRouter = express.Router();
import { createCompany, updateCompanyStatus, updateCompany, getCompanyById, getAllCompanies, getCompanyData, addCompanyData, getCompaniesPrompts, uploadBrandLogo, deleteBrandLogo } from '../controllers/companyController.js'

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

companyRouter.route("/register").post(createCompany);

companyRouter.route("/updatestatus/:id").put(updateCompanyStatus);

companyRouter.route("/get/:id").get(getCompanyById);

companyRouter.route("/update/:id").put(updateCompany);

companyRouter.route("/getall/").get(getAllCompanies);

companyRouter.route("/getdata/:userid").get(getCompanyData);

companyRouter.route("/adddata").post(addCompanyData);

companyRouter.route("/getcompanyprompts").get(getCompaniesPrompts);

companyRouter.route("/upload-brand-logo/:id").post(upload.single("image"), uploadBrandLogo);

companyRouter.route("/delete-brand-logo/:id").post(deleteBrandLogo);

export default companyRouter;