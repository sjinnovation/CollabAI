import express from 'express'
const companyRouter = express.Router();
import { createCompany, updateCompanyStatus, updateCompany, getCompanyById, getAllCompanies, getCompanyData, addCompanyData, getCompaniesPrompts } from '../controllers/companyController.js'

companyRouter.route("/register").post(createCompany);

companyRouter.route("/updatestatus/:id").put(updateCompanyStatus);

companyRouter.route("/get/:id").get(getCompanyById);

companyRouter.route("/update/:id").put(updateCompany);

companyRouter.route("/getall/").get(getAllCompanies);

companyRouter.route("/getdata/:userid").get(getCompanyData);

companyRouter.route("/adddata").post(addCompanyData);

companyRouter.route("/getcompanyprompts").get(getCompaniesPrompts);

export default companyRouter;