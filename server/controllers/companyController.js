// TODO: Delete this controller and its routes. It is no longer used in front end
import Company from "../models/companyModel.js";
import User from "../models/user.js"
import Config from '../models/configurationModel.js';
import StatusCodes from "http-status-codes";
//import sendEmail from "../utils/sendEmail.js";
import sendEmail from "../utils/mailGun.js"
import { getCompanyPromptsByDate } from "../service/aggregationService.js"
import config from "../config.js";
import { uploadImageToS3 } from "../lib/s3.js";
import { CommonMessages } from "../constants/enums.js";
import { deleteLocalFile } from "../utils/assistant.js";

export const createCompany = async (req, res) => {
    const { name, email, password, employeeCount, firstname, lastname } = req.body;
    const status = "active";
    const comp = await Company.findOne({ email });
    const userRec = await User.findOne({ email });
    if (comp) {
        res.status(StatusCodes.OK).json({ status: "failed", message: "Company already exist with the given email" });
    }
    else if (userRec) {
        res.status(StatusCodes.OK).json({ status: "failed", message: "User already exist with the given email" });
    }
    else {
        
        const CompanyRecord = await Company.create({
            name,
            email,
            employeeCount,
            status,
        });
        const tokens = await Config.findOne({ key: 'tokens' });
        let maxusertokens = tokens.maxusertokens ? parseInt(tokens.maxusertokens) : 5000;
        console.log("isInfo:", name, firstname, lastname)
        // const user = await User.create({
        //     fname: firstname,
        //     lname: lastname,
        //     maxusertokens,
        //     password: password,
        //     email,
        //     role: "admin",
        //     username: email,
        //     status: "inactive",
        //     companyId: CompanyRecord._id,
        // });

        if (CompanyRecord) {
            res.status(StatusCodes.OK).json({ message: "Your company profile has been created successfully" });
            sendEmail(email,"Welcome to CollabAI",{name: firstname,link: config.CLIENT_URL},"../utils/template/userregister.handlebars",false);
            sendEmail(config.ADMIN_EMAIL,"Notification CollabAI : New User Onboarded ",{name: name,email: email},"../utils/template/adminNotifyNewCompany.handlebars",true);
        }
    }
};

export const updateCompanyStatus = async (req, res) => {
    const { params: { id: companyid }, } = req;
    const { status } = req.body;
    var newvalues = { $set: { status: status } };
    const companyRecord = await Company.updateOne({ _id: companyid }, newvalues);

    if (companyRecord) {
        res.status(StatusCodes.OK).json({ message: "Company Status updated" });
    }else {
        res.status(StatusCodes.BAD_REQUEST).json({ message: "No changes were made" });
    }
};

export const updateCompany = async (req, res) => {
    const { params: { id: companyid }, } = req;
    const { name, email, employeeCount, status, data } = req.body;
    var newvalues = { $set: { name: name, email: email, employeeCount: employeeCount, status: status, data: data } };
    const companyRecord = await Company.updateOne({ _id: companyid }, newvalues);

    if (companyRecord) {
        res.status(StatusCodes.OK).json({ message: "Company Data updated" });
    }else {
        res.status(StatusCodes.BAD_REQUEST).json({ message: "No changes were made" });
    }
};

export const getAllCompanies = async (req, res) => {
    const companies = await Company.find({});
    if (companies) {
        res.status(StatusCodes.OK).json({ companies });
    }
};

export const getCompanyById = async (req, res) => {
    const { params: { id: companyid }, } = req;
    const company = await Company.findOne({ _id: companyid });

    if (company) {
        res.status(StatusCodes.OK).json({ company });
    }
};


export const getCompanyData = async (req, res) => {
    const { params: { userid: userid } } = req;
    const userRec = await User.findOne({ _id: userid });
    if (userRec) {
        const companyData = await Company.findOne({ _id: userRec.companyId });
        if (!companyData) {
            res.send({ companyData: null });
        }
        else {
            res.send(companyData);
        }
    }
    else {
        res.send({ status: "user does not exist", companyData: null });
    }
};

export const addCompanyData = async (req, res) => {
    const { userid, companydata, name } = req.body;
    if (userid) {
        const userRec = await User.findOne({ _id: userid });
        if (userRec && userRec.companyId && userRec.role == "admin") {
            const companyRec = await Company.findOne({ _id: userRec.companyId });
            if (companyRec) {
                var newvalues = { $set: { data: companydata, name: name } };
                Company.updateOne({ _id: userRec.companyId }, newvalues, function (err, res) {
                    if (err) throw err;
                    console.log("company data updated");
                });
                res.send({ status: "success", msg: "Company data updated successfully" });

            }
            else {
                res.send({ status: "failed", msg: "Company does not exist" });
            }
            /* else {
               const comRecord = await company.create({
                 email : emailid,
                 companydata,
               });
             if (comRecord) {
               res.send({ status : "success", msg: "Company data added successfully" });
               }
             } */
        }
        else {
            res.send({ status: "failed", msg: "either user does not exist or you are not a admin user" });
        }
    }
    else {
        res.send({ status: "failed", msg: "user id required" });
    }

};

export const getCompaniesPrompts = async (req, res) => {
    let userid = req.query.userid;
    let date = req.query.date;
    const user = await User.findOne({ _id: userid, role: "superadmin" });
    if (!user) {
        res.status(StatusCodes.BAD_REQUEST).json({ status: "failed", message: "User does not exist or you are not a superadmin" });
        return;
    }
    const companies = await getCompanyPromptsByDate(date);
    res.status(StatusCodes.OK).json({ companies });

}


export const uploadBrandLogo = async (req, res) => {
    try {
      const { id } = req.params;
      const avatarFile = req.file ?? '';
      const avatar = avatarFile ? avatarFile : null;

      let image_url = null;
      if (avatar) {
        image_url = await uploadImageToS3(avatar.path, 'image');
      }

      const company = await Company.findOneAndUpdate(
        { _id: id },
        { brandLogo: image_url },
        {
          new: true,
        }
      );

      if (company && avatar) {
        deleteLocalFile(avatar)
          .then(() => {
            console.log('Avatar file deleted');
          })
          .catch((err) => {
            console.error('Failed to delete avatar file:', err);
          });
      }

      return res.status(StatusCodes.OK).json({
        message: "Brand logo uploaded successfully",
        company,
      });
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: CommonMessages.INTERNAL_SERVER_ERROR,
      });
    }
  };

export const deleteBrandLogo = async (req, res) => {
    const { id } = req.params;
    const company = await Company.findOneAndUpdate(
      { _id: id },
      { brandLogo: "" },
      {
        new: true,
      }
    );
    if (company) {
        return res.status(StatusCodes.OK).json({
            message: "Brand logo deleted successfully",
            company,
        });
    } else {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: "Brand logo not found",
        });
    }
  }; 