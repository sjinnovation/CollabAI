import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import config from '../config.js';
// const path = require("path");

handlebars.registerHelper("inc", function (value, options) {
  return parseInt(value) + 1;
});

 const sendEmail = async (email, subject, payload, template) => {
  try {
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: config.NODE_MAILER_HOST,
      port: 465,
      auth: {
        user: config.NODE_MAILER_USER,
        pass: config.NODE_MAILER_PASS , // naturally, replace both with your real credentials or an application-specific password
      },
    });
    console.log("dir name" + process.cwd());
    const source = fs.readFileSync(path.join(process.cwd()+'/utils', template), "utf8");
    const compiledTemplate = handlebars.compile(source);
    const options = () => {
      return {
        from: config.NODE_MAILER_HOST,
        to: email,
        subject: subject,
        html: compiledTemplate(payload),
        cc: config.CC_EMAILS
      };
    };

    // Send email
    transporter.sendMail(options(), (error, info) => {
      if (error) {
        console.log( "err" + error);
        return error;
      } else {
        console.log("Email sent: " + info.response);
        return res.status(200).json({
          success: true,
        });
      }
    });
  } catch (error) {
    console.log("err1" + error);
    return error;
  }
};

/*
Example:
sendEmail(
  "youremail@gmail.com,
  "Email subject",
  { name: "Eze" },
  "./templates/layouts/main.handlebars"
);
*/

export default sendEmail