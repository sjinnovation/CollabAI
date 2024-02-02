import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import mg from 'nodemailer-mailgun-transport';
import config from '../config.js';

const sendEmail = async (email, subject, payload, template,ccRequired) => {
    try {
        const auth = {
            auth: {
                api_key: config.MAILGUN_API_KEY,
                domain: config.MAILGUN_DOMAIN
            }
        }
        const nodemailerMailgun = nodemailer.createTransport(mg(auth));
        const source = fs.readFileSync(path.join(process.cwd()+'/utils', template), "utf8");
        const compiledTemplate = handlebars.compile(source);
        const htmlToSend = compiledTemplate(payload);
        let mailOptions = {
            from: config.NODE_MAILER_USER,
            to: email,
            subject: subject,
            html: htmlToSend
          }
        if(ccRequired) {
        const ccMails = await getCcMailsFromEnv();
        if(ccMails.length > 0) {
            mailOptions.cc = ccMails;
        }
        }
        // Send email
        nodemailerMailgun.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log( "err" + error);
                return error;
            } else {
                console.log("Email sent: " + JSON.stringify(info));
                return;
            }
        });
    }
    catch (error) {
        console.log("err1" + error);
        return error;
    }
}

const getCcMailsFromEnv = async () => {
    const ccMails = config.CC_EMAILS;
    let ccMailsArray = [];
    if(ccMails) {
        ccMailsArray = ccMails.split(",");
    }
    let ccMailsRecipents = [];
    for(const mail of ccMailsArray) {
        ccMailsRecipents.push({address: mail});
    }
    return ccMailsRecipents;
}

export default sendEmail