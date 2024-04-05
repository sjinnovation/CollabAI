import dotEnv from "dotenv";
import path from 'path';

dotEnv.config({
    path: path.resolve(`${process.cwd()}`, `.env.${process.env.NODE_ENV}`),
});
const config = {
	NODE_ENV: process.env.NODE_ENV || 'dev',
    PORT: process.env.PORT || 8002,
    MONGO_URI: process.env.MONGO_URI || '',
    JWT_SECRET: process.env.JWT_SECRET,
    CLIENT_URL: process.env.CLIENT_URL,
    NODE_MAILER_USER: process.env.NODE_MAILER_USER,
    NODE_MAILER_PASS: process.env.NODE_MAILER_PASS,
    NODE_MAILER_HOST: process.env.NODE_MAILER_HOST || "",
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    MAILGUN_API_KEY: process.env.MAILGUN_API_KEY,
    MAILGUN_DOMAIN: process.env.MAILGUN_DOMAIN,
    CC_EMAILS: process.env.CC_EMAILS,
    MONGODB_NAME: process.env.MONGODB_NAME,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_KEY_ID: process.env.AWS_SECRET_KEY_ID,
    AWS_REGION: process.env.AWS_REGION,
    AWS_BUCKET_EXPIRE_TIME: process.env.AWS_BUCKET_EXPIRE_TIME,
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME || 'image-upload-bucket',
}

export default config;