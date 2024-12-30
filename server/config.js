import dotEnv from "dotenv";
import path from 'path';
import 'dotenv/config';
dotEnv.config({
    path: path.resolve(`${process.cwd()}`, `.env.${process.env.NODE_ENV}`),
});
const config = {
	NODE_ENV: process.env.NODE_ENV || 'dev',
    PORT: process.env.PORT || 8002,
    OPEN_AI_API_KEY: process.env.CHATGPTAPIKEY || '',
    GEMINI_AI_API_KEY: process.env.GEMINIAIAPIKEY || '',
    MONGO_URI: process.env.MONGO_URI || '',
    JWT_LIFETIME: process.env.JWT_LIFETIME || 90,
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
    GOOGLE_CREDENTIALS_PATH: process.env.GOOGLE_CREDENTIALS_PATH,
    SPREADSHEET_ID: process.env.SPREADSHEET_ID,
    SHEET_NAME: process.env.SHEET_NAME,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_KEY_ID: process.env.AWS_SECRET_KEY_ID,
    AWS_REGION: process.env.AWS_REGION,
    AWS_BUCKET_EXPIRE_TIME: process.env.AWS_BUCKET_EXPIRE_TIME,
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME || "test-bucket",
    POSTGRE_SQL_USER: process.env.POSTGRE_SQL_USER,
    POSTGRE_SQL_HOST: process.env.POSTGRE_SQL_HOST,
    POSTGRE_SQL_DATABASE: process.env.POSTGRE_SQL_DATABASE,
    POSTGRE_SQL_PASSWORD: process.env.POSTGRE_SQL_PASSWORD,
    POSTGRE_SQL_PORT: process.env.POSTGRE_SQL_PORT,
    OUTLOOK_USER: process.env.OUTLOOK_USER,
    OUTLOOK_PASSWORD: process.env.OUTLOOK_PASSWORD,
    OUTLOOK_PORT: process.env.OUTLOOK_PORT,
    OUTLOOK_SERVER_NAME: process.env.OUTLOOK_SERVER_NAME
}

export default config;