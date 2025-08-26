import { startBatchOutputMonitorCron, startAnalyzePromptsBatchCron, getBatchOutputFile, getOpenaiBatchProgressStatus } from "./lib/openai.js";
import AISuggestion from "./models/ai-suggestion-settings.js";
import PromptFeedbackModel from "./models/promptFeedbacks.js";
import OpenAI from "openai";
import fs from "fs/promises";
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
import assistantRouter from "./routers/assistantRoutes.js";
import assistantThreadRouter from './routers/assistantThreadRoutes.js';
import taskCommandRouter from "./routers/taskCommandRoutes.js";
import teamRouter from "./routers/teamRoutes.js";
import organizationRouter from "./routers/organizationRoutes.js";
import { errorLogger } from "./middlewares/errorMiddleware.js";
import { initSetup } from './controllers/initController.js'
import trackUsageRouter from "./routers/trackUsageRoute.js";
import userPreferenceRouter from "./routers/userModalPreferenceRoute.js"
import vsPluginRouter from "./routers/vsPluginRoute.js";
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
import webCrawlRouter from "./routers/webCrawlRoute.js";
import emailDomainRoutes from "./routers/emailDomainRoutes.js";
import fluxImageRoute from "./routers/fluxImageGeneratorRoutes.js";
import youTubeTranscriptRouter from "./routers/youTubeRoute.js";
import assistantRatingRouter from "./routers/assistantRatingRoutes.js";
import linkedinRouter from "./routers/linkedinRoutes.js";
import googleSheetRouter from "./routers/googleSheetRoute.js";
import activeCollabRouter from "./routers/activeCollabRoute.js";
import syncDvDsDoc from "./service/cronDvDsSyncService.js";
import config from "./config.js";
import notifyBadgeRoute from "./routers/notifyBadgeRoute.js";
import integrationRouter from "./routers/integration/integrationRoutes.js";
import path from 'path';
import { fileURLToPath } from 'url';
import folderChatRouter from "./routers/folderChatRoute.js";
import customInstructionsRouter from "./routers/customInstructionRoute.js";
import aiPersonaRouter from "./routers/aiPersonaRoute.js";

//huggingFace
import modelRoutes from "./routers/huggingFaceRoutes.js"
import oneDriveRouter from "./routers/oneDriveRoute.js";
import sharePointRouter from "./routers/sharePointRouter.js";
import socketRouter from "./routers/logger/socketRoute.js";
import { cronSyncAllWorkBoardStreams } from './service/cronWorkBoardSyncService.js';
import aiSuggestionSettingsRouter from "./routers/aiSuggestionSettings.js";
import { analyzePromptsBatchAPI, generateAssistantSuggestionsForDesignations } from "./controllers/aiSuggestionSettingsController.js";
import { getOpenAIInstance } from "./config/openAI.js";
import getOpenAiConfig from "./utils/openAiConfigHelper.js";
import aiSuggestionsRouter from "./routers/aiSuggestions.js";
import AISuggestionBatchProcessing from "./models/ai-suggestion-batch-processing.js";

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
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/icons', express.static(path.join(__dirname, 'icons')));
app.post("/api/init", initSetup);
app.use("/api/auth", router);
app.use("/api/user", userRouter);
app.use("/api/prompt", promptRouter);
app.use("/api/config", configRouter);
app.use("/api/company", companyRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/template", templateRouter);
app.use("/api/category", categoryRouter);
app.use("/api/assistants", assistantRouter);

app.use("/api/assistants/public", publicRouter);
app.use("/api/assistants/favourite", favoriteRouter);
app.use("/api/assistants/pinned", pinnedRouter);
app.use("/api/assistants/rating", assistantRatingRouter);

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

app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api/image", imageRouter);
app.use("/api/google-auth", googleDriveRouter);

app.use('/api/workboard', workBoardRouter);
app.use('/api/web-crawl', webCrawlRouter);
app.use('/api/flux-image',fluxImageRoute);
app.use('/api/youtube', youTubeTranscriptRouter);

//emailDomain-API
app.use('/api/email-domains', emailDomainRoutes);
app.use('/api/integration', integrationRouter);
//linkedin-router
app.use('/api/linkedin', linkedinRouter);
app.use("/api/google-sheet", googleSheetRouter);
app.use('/api/ac', activeCollabRouter);

//vsPluggin-API
app.use('/api/vs-plugin', vsPluginRouter);

//notify-badge-route
app.use('/api/notify-badge',notifyBadgeRoute);

//folderChat-API
app.use("/api/folder-chats", folderChatRouter);

//custom-instructions-API
app.use('/api/custom-instructions', customInstructionsRouter);

// Ai persona
app.use('/api/ai-persona',aiPersonaRouter);

app.use('/api/onedrive', oneDriveRouter);
app.use('/api/sharepoint', sharePointRouter)

//huggingface
app.use("/api/models",modelRoutes);

//socket logs
app.use("/api/log",socketRouter);

app.use("/api/ai-suggestion-settings", aiSuggestionSettingsRouter);
app.use("/api/ai-suggestions", aiSuggestionsRouter);
cron.schedule("0 0 5 * * *", () => {
  registeredCompanies();
  console.log("running a task every 15 seconds");
});

const cronJobStatus = config.SYNC_DVDS_DOC_AUTOMATION_CRON_TIME;
cron.schedule(cronJobStatus, async () => {
  syncDvDsDoc();
}, {
  scheduled: true,
  timezone: 'UTC', // Adjust if necessary
});


let isSyncing = false;
cron.schedule('0 */3 * * *', async () => {
  if (isSyncing) {
    console.log('Previous WorkBoard sync still running, skipping this run.');
    return;
  }
  isSyncing = true;
  try {
    await cronSyncAllWorkBoardStreams();
    console.log('WorkBoard streams synced for all users');
  } catch (err) {
    console.error('Error during WorkBoard sync:', err);
  } finally {
    isSyncing = false;
  }
});

// Initialize batch analysis cron job
cron.schedule("0 * * * *", async () => {
  try {
    console.log("Initializing batch analysis cron job...");
    const aiSettings = await AISuggestion.findOne({});
    if (!aiSettings) {
      console.log(
        "No AI Suggestion settings found, skipping batch analysis cron job."
      );
      return;
    }
    if (aiSettings.lastBatchRunId) {
      try {
        const openAiKey = await getOpenAiConfig("openaikey");
        const openai = getOpenAIInstance(openAiKey);
        const batchInfo = await getOpenaiBatchProgressStatus(
          openai,
          aiSettings.lastBatchRunId
        );
        if (
          batchInfo &&
          (batchInfo.status === "in_progress" ||
            batchInfo.status === "validating" ||
            batchInfo.status === "queued")
        ) {
          console.log(
            `A batch is already running on OpenAI (batchId: ${aiSettings.lastBatchRunId}, status: ${batchInfo.status}). Skipping batch analysis cron job.`
          );
          return;
        }

      } catch (batchCheckErr) {
        console.error("Error checking OpenAI batch status:", batchCheckErr);
        // If error checking batch, skip starting new batch to be safe
        return;
      }
    }
            // No running batch, proceed to start the batch analysis cron job
    await startAnalyzePromptsBatchCron(analyzePromptsBatchAPI);
    console.log("Batch analysis cron job started successfully.");
  } catch (error) {
    console.error("Failed to initialize batch analysis cron job:", error);
  }
});

// Track batch status and update PromptFeedbackModel after analyzePromptsBatchAPI
let batchMonitorStarted = false;
cron.schedule("0 * * * *", async () => {
  if (batchMonitorStarted) return;
  const aiSettings = await AISuggestion.findOne({});
  console.log("aiSettings:", aiSettings);
  if (aiSettings && aiSettings.lastBatchRunId) {
    batchMonitorStarted = true;
    const openAiKey = await getOpenAiConfig("openaikey");
    const openai = new OpenAI({ apiKey: openAiKey });
    startBatchOutputMonitorCron(openai, aiSettings.lastBatchRunId, async (outputFile) => {
      // Download and parse output file
      try {
        const filePath = `tmp_prompt_batches/batch_output_${aiSettings.lastBatchRunId}.jsonl`;
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, outputFile, "utf8");
        const lines = (await fs.readFile(filePath, "utf8")).split("\n").filter(Boolean);

        for (const line of lines) {
          const result = JSON.parse(line);
          const userId = result.custom_id;
          let suggestions = [];
          try {
            // Try to parse suggestions from response
            const content = result.response.body.choices[0].message.content;
            suggestions = JSON.parse(content).suggestions || [content];
          } catch (e) {
            suggestions = [result.response.body.choices[0].message.content];
          }
          console.log("Updating feedback for user:", userId);
          
          // Process and normalize suggestions to the required format
          let finalSuggestions = [];
          
          for (const s of suggestions) {
            if (typeof s !== 'string') {
              // If already parsed, add to final suggestions
              if (Array.isArray(s)) {
                finalSuggestions.push(...s);
              } else {
                finalSuggestions.push(s);
              }
              continue;
            }
            
            // Try to extract JSON block from the text first
            const jsonMatch = s.match(/```json\n?([\s\S]*?)\n?```/);
            if (jsonMatch && jsonMatch[1]) {
              try {
                const parsed = JSON.parse(jsonMatch[1].trim());
                // Extract suggestions array from the parsed JSON
                if (Array.isArray(parsed)) {
                  // If it's an array of objects with suggestions
                  for (const item of parsed) {
                    if (item.suggestions && Array.isArray(item.suggestions)) {
                      finalSuggestions.push(...item.suggestions);
                    } else {
                      finalSuggestions.push(item);
                    }
                  }
                } else if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
                  // If it's an object with suggestions property
                  finalSuggestions.push(...parsed.suggestions);
                } else {
                  finalSuggestions.push(parsed);
                }
                continue;
              } catch (parseError) {
                console.log("Failed to parse extracted JSON:", parseError.message);
              }
            }
            
            // If no JSON block found or parsing failed, try to parse the whole string
            try {
              const parsed = JSON.parse(s);
              if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
                finalSuggestions.push(...parsed.suggestions);
              } else if (Array.isArray(parsed)) {
                finalSuggestions.push(...parsed);
              } else {
                finalSuggestions.push(parsed);
              }
            } catch (e) {
              // If all parsing fails, keep as plain text
              console.log("No valid JSON found, keeping as text:", s.substring(0, 100) + "...");
              finalSuggestions.push(s);
            }
          }
          // Format the final output as required
          // Flatten finalSuggestions if it is an array of objects with 'suggestions' arrays
          let flattenedSuggestions = [];
          if (Array.isArray(finalSuggestions) && finalSuggestions.length > 0 && typeof finalSuggestions[0] === 'object' && finalSuggestions[0].suggestions) {
            for (const item of finalSuggestions) {
              if (item.suggestions && Array.isArray(item.suggestions)) {
                flattenedSuggestions.push(...item.suggestions);
              }
            }
          } else {
            flattenedSuggestions = finalSuggestions;
          }
          const formattedFeedback = {
            suggestion: flattenedSuggestions
          };
          
          const dataRetentionPeriod = aiSettings.dataRetentionPeriod || 60; // Default to 60 days if not set
          const saveSuggestion = await PromptFeedbackModel.updateOne(
            { userId },
            { $set: {
                feedback: formattedFeedback,
                updatedAt: new Date(),
                expiresAt: new Date(Date.now() + dataRetentionPeriod * 24 * 60 * 60 * 1000) // 30 days from now
              }
            },
            { upsert: true }
          );
        }

        // --- Extract errors from error file and update AISuggestionBatchProcessing ---
        // Find the batch record for this run
        const status = await getOpenaiBatchProgressStatus(openai, aiSettings.lastBatchRunId);

        if (status && status.error_file_id) {
          try {
            // Download error file from OpenAI
            const errorFile = await getBatchOutputFile(openai, aiSettings.lastBatchRunId, status.error_file_id);

            // Save error file locally
            const errorFilePath = `tmp_prompt_batches/batch_error_${aiSettings.lastBatchRunId}.jsonl`;
            await fs.writeFile(errorFilePath, errorFile, "utf8");
            const errorLines = (await fs.readFile(errorFilePath, "utf8")).split("\n").filter(Boolean);
            let errorArray = [];
            for (const line of errorLines) {
              try {
                errorArray.push(JSON.parse(line));
              } catch (err) {
                errorArray.push({ raw: line, parseError: err.message });
              }
            }
            // Update the batch record with the error array
            await AISuggestionBatchProcessing.updateOne(
              { batchId: aiSettings.lastBatchRunId },
              { $set: { error: errorArray } }
            );
            // Optionally, remove the local error file
            await fs.unlink(errorFilePath);
          } catch (err) {
            console.error("Error extracting or saving batch error file:", err);
          }
        }
        // Optionally, clean up output file
        await fs.unlink(filePath);
        // Reset lastBatchRunId so cron doesn't repeat
        await AISuggestion.findOneAndUpdate({}, { lastBatchRunId: null });
        batchMonitorStarted = false;
        // Call generateAssistantSuggestionsForDesignations after batch output processing
        try {
          await generateAssistantSuggestionsForDesignations({},{ status: () => ({ json: () => {} }), json: () => {} });
          console.log("generateAssistantSuggestionsForDesignations called after batch output processing.");
        } catch (err) {
          console.error("Error calling generateAssistantSuggestionsForDesignations after batch output:", err);
        }
      } catch (err) {
        console.error("Error processing batch output file:", err);
      }
    });
  }
  // After batch output, run cleanup cron for expired batch files
  try {
    const dataRetentionPeriod = aiSettings.dataRetentionPeriod || 30; // Default to 30 days
    const now = new Date();
    const expiredBatches = await AISuggestionBatchProcessing.find({ endTime: { $ne: null } });
    for (const batch of expiredBatches) {
      const endTime = new Date(batch.endTime);
      const diffDays = Math.floor((now - endTime) / (24 * 60 * 60 * 1000));
      if (diffDays > dataRetentionPeriod) {
        // Delete input, output, and error files from OpenAI
        try {
          const openAiKey = await getOpenAiConfig("openaikey");
          const openai = new OpenAI({ apiKey: openAiKey });
          if (batch.inputFileId) {
            await openai.files.del(batch.inputFileId);
            console.log(`Deleted input file from OpenAI: ${batch.inputFileId}`);
          }
          if (batch.outputFileId) {
            await openai.files.del(batch.outputFileId);
            console.log(`Deleted output file from OpenAI: ${batch.outputFileId}`);
          }
          if (batch.errorFileId) {
            await openai.files.del(batch.errorFileId);
            console.log(`Deleted error file from OpenAI: ${batch.errorFileId}`);
          }
          // Optionally, remove batch record or mark as cleaned
          await AISuggestionBatchProcessing.findOneAndUpdate({ batchId: batch.batchId }, { cleaned: true });
        } catch (cleanupErr) {
          console.error(`Error cleaning up files for batch ${batch.batchId}:`, cleanupErr);
        }
      }
    }
  } catch (cleanupError) {
    console.error("Error running batch file cleanup cron:", cleanupError);
  }
});

app.use(errorLogger);

export default server;


export const extractJsonBlock = (raw) => {
    // Try to extract JSON code block
    const blockMatch = raw.match(/json\n([\s\S]?)/im) || raw.match(/\n([\s\S]?)```/im);
    if (blockMatch && blockMatch[1]) {
        return blockMatch[1].trim();
    }
    return null;
}