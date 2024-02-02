//import sendEmail from "../utils/sendEmail.js";
import config from "../config.js";
import Company from "../models/companyModel.js";
import sendEmail from "../utils/mailGun.js"

const registeredCompanies = async () => {
    var date = new Date(new Date().setDate(new Date().getDate() - 1));
    date.setHours(0,0,0,0);
    const companies = await Company.find({createdAt: {$gte: date}}).lean();
    if(companies.length > 0) {
        sendEmail(config.ADMIN_EMAIL,"New Companies on AiBidAssist",{companies: companies},"/template/newCompanies.handlebars",true);
    }
}

export default registeredCompanies