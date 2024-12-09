import express from "express";
import http from 'http';
import cors from "cors";
import cron from "node-cron";
import bodyParser from "body-parser";
import morgan from "morgan";
import router from "./routers/authRoute.js";
import userRouter from "./routers/userRoute.js";
import promptRouter from "./routers/gptPromptRoute.js";
import configRouter from "./routers/configRoute.js";
import companyRouter from "./routers/companyRoute.js";
import registeredCompanies from "./service/cronEmailService.js";
import feedbackRouter from "./routers/feedbackRoute.js";
import templateRouter from "./routers/templateRoute.js";
import categoryRouter from "./routers/categoryRoute.js";
import commandsCategoryRouter from "./routers/commandsCategoryRoute.js";
import imageRouter from "./routers/imageRoute.js";
import meetingTypeRouter from "./routers/meetingTypeRoute.js";
import assistantRouter from "./routers/assistantRoutes.js";
import assistantThreadRouter from './routers/assistantThreadRoutes.js';
import taskCommandRouter from "./routers/taskCommandRoutes.js";
import teamRouter from "./routers/teamRoutes.js";
import organizationRouter from "./routers/organizationRoutes.js";
import { errorLogger } from "./middlewares/errorMiddleware.js";
import { initSetup } from './controllers/initController.js'
import trackUsageRouter from "./routers/trackUsageRoute.js";
import userPreferenceRouter from "./routers/userModalPreferenceRoute.js"

import publicRouter from "./routers/publicAssistantRoute.js";
import favoriteRouter from "./routers/favouriteAssistantRoute.js";

import assistantTypesRoute from "./routers/assistantTypesRoutes.js";
import pinnedRouter from "./routers/pinnedAssistantRoutes.js";
import assistantUsageRoute from "./routers/assistantUsageRoutes.js";
import knowledgeBaseRouter from "./routers/knowledgeBase.js";
import ragRouter from "./routers/ragWithKnowledgeBase.js";
import googleDriveRouter from "./routers/googleDriveRouters.js";
import vectorStoreRouter from "./routers/vectorStoreRoutes.js";
import workBoardRouter from "./routers/workBoardRoute.js";
import projectrouter from "./routers/projectRoutes.js";
const app = express();
const server = http.createServer(app);

app.use(cors({
  exposedHeaders: ["x-token-expiry"],
}));

app.use(express.json({ limit: "10mb" }));
app.use(morgan("tiny"));

app.get("/", (req, res) => {
  res.send(" API is running ....");
});


app.post("/api/init", initSetup);
app.use("/api/auth", router);
app.use("/api/user", userRouter);
app.use("/api/prompt", promptRouter);
app.use("/api/config", configRouter);
app.use("/api/company", companyRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/template", templateRouter);
app.use("/api/meetingTypes", meetingTypeRouter);
app.use("/api/category", categoryRouter);
app.use("/api/assistants", assistantRouter);

app.use("/api/assistants/public", publicRouter);
app.use("/api/assistants/favourite", favoriteRouter);
app.use("/api/assistants/pinned", pinnedRouter);

app.use("/api/commandsCategory", commandsCategoryRouter);
app.use("/api/taskCommands", taskCommandRouter);
app.use('/api/assistants/threads', assistantThreadRouter);
app.use("/api/teams", teamRouter);
app.use("/api/organizations", organizationRouter);
app.use("/api/usage", trackUsageRouter);
app.use("/api/usersPreference", userPreferenceRouter)

app.use("/api/assistants/types",assistantTypesRoute);
app.use("/api/assistants/usage",assistantUsageRoute);
app.use("/api/knowledge-base",knowledgeBaseRouter);
app.use("/api/rag/",ragRouter);
app.use("/api/vectorStore",vectorStoreRouter);
app.use('/api/projects', projectrouter);

app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api/image", imageRouter);
app.use("/api/google-auth", googleDriveRouter);

//WorkBoard-API
app.use('/api/workboard', workBoardRouter);

cron.schedule("0 0 5 * * *", () => {
  registeredCompanies();
  console.log("running a task every 15 seconds");
});

app.use(errorLogger);

export default server;
