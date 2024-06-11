import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import config from '../config.js';

const sendEmailViaOutlook = async (email, subject, payload, template, ccRequired) => {
    try {
        
        const transporter = nodemailer.createTransport({
            host: config.OUTLOOK_SERVER_NAME,
            port: config.OUTLOOK_PORT,
            secure: false,
            auth: {
                user: config.OUTLOOK_USER,
                pass: config.OUTLOOK_PASSWORD
            }
        });

        const source = fs.readFileSync(path.join(process.cwd()+'/utils', template), "utf8");
        const compiledTemplate = handlebars.compile(source);
        const htmlToSend = compiledTemplate(payload);
        
        let mailOptions = {
            from: config.OUTLOOK_USER,
            to: email,
            subject: subject,
            html: htmlToSend
        };

        if (ccRequired) {
            const ccMails = await getCcMailsFromEnv();
            if (ccMails.length > 0) {
                mailOptions.cc = ccMails;
            }
        }

        
        const info = await transporter.sendMail(mailOptions);
        
        return info;
    } catch (error) {
        
        return error;
    }
}

const getCcMailsFromEnv = async () => {
    const ccMails = config.CC_EMAILS;
    let ccMailsArray = [];
    if (ccMails) {
        ccMailsArray = ccMails.split(",");
    }
    let ccMailsRecipients = ccMailsArray.map(mail => ({ address: mail }));
    return ccMailsRecipients;
}

export default sendEmailViaOutlook;
