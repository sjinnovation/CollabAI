// Batch API solution for OpenAI
import axios from "axios";
import os from "os";

import AISuggestion from "../models/ai-suggestion-settings.js";
import AISuggestionBatchProcessing from "../models/ai-suggestion-batch-processing.js";
import { StatusCodes } from "http-status-codes";
import promptModel from "../models/promptModel.js";
import User from "../models/user.js";
import { get } from "mongoose";
import { getOneDriveAccessToken } from "./oneDriveController.js";
import { getOpenAIInstance } from "../config/openAI.js";
import getOpenAiConfig from "../utils/openAiConfigHelper.js";
import OpenAI from "openai";
import PromptPatternModel from "../models/promptPatterns.js";
import PromptFeedbackModel from "../models/promptFeedbacks.js";
import fs from "fs/promises";
import path from "path";
import { createBatchFileInOpenai, createOpenAIFileObject } from "../lib/openai.js";
import { convertToPdf } from "./knowledgeBase.js";
import AssistantSuggestions from "../models/assistantSuggestions.js";
import Assistant from "../models/assistantModel.js";
import AssistantTypes from "../models/assistantTypes.js";
import { CommonMessages } from "../constants/enums.js";
import AISuggestionBatchProcessingHistory from "../models/a-suggestion-batch-processing-history.js";
// Get suggestions for a specific userId
export const getUserPromptSuggestion = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "userId is required" });
    }
    const feedback = await PromptFeedbackModel.findOne({ userId });
    let cleanedFeedback = null;
    if (feedback && Array.isArray(feedback.feedback)) {
      cleanedFeedback = JSON.parse(JSON.stringify(feedback.feedback)); // deep clone
      // Clean only the first element's suggestion array (legacy structure)
      if (cleanedFeedback[0] && Array.isArray(cleanedFeedback[0].suggestion)) {
        cleanedFeedback[0].suggestion = cleanedFeedback[0].suggestion.flatMap((item) => {
          if (
            typeof item === 'string' &&
            /\[\{\s*suggestions\s*:/.test(item)
          ) {
            // Extract the array inside suggestions: [ ... ]
            const match = item.match(/suggestions\s*:\s*\[(.*)\]\s*\}/s);
            if (match && match[1]) {
              // Split by comma, but ignore commas inside quotes
              const arr = match[1].split(/,(?=(?:[^']*'[^']*')*[^']*$)/).map(s => {
                // Remove leading/trailing spaces and quotes
                let trimmed = s.trim();
                if (trimmed.startsWith("'")) trimmed = trimmed.slice(1);
                if (trimmed.endsWith("'")) trimmed = trimmed.slice(0, -1);
                return trimmed.replace(/\\"/g, '"');
              }).filter(Boolean);
              return arr;
            }
            return [item];
          }
          return [item];
        });
      }
    }
    // if (!cleanedFeedback) {
    //   return res.status(StatusCodes.NOT_FOUND).json({ message: "No suggestion found for this user" });
    // }
    return res.status(StatusCodes.OK).json({ message: "User suggestion fetched successfully", data: { feedback: cleanedFeedback } });
  } catch (error) {
    console.error("Error fetching user suggestion:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: CommonMessages.INTERNAL_SERVER_ERROR });
  }
};

export const getAISuggestionSettings = async (req, res) => {
    try {
        let settings = await AISuggestion.findOne({});
        if (!settings) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "AI Suggestion Settings not found" });
        }
        const featuredAssistants = await Assistant.find({ is_featured: true });
        const settingsInfo = {
          settings: settings,
          featuredAssistants: featuredAssistants,
        };
        return res.status(StatusCodes.OK).json({data : settingsInfo,message: "AI Suggestion Settings fetched successfully"});
    } catch (error) {
        console.error("Error fetching AI Suggestion Settings:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: CommonMessages.INTERNAL_SERVER_ERROR });
    }
}
export const updateAISuggestionSettings = async (req, res) => {
    try {
        const settings  = req.body;
        if (!settings) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Settings data is required" });
        }
        const updatedSettings = await AISuggestion.findOneAndUpdate({}, settings, { new: true, upsert: true });
        return res.status(StatusCodes.OK).json({data : updatedSettings,message: "AI Suggestion Settings updated successfully"});
    } catch (error) {
        console.error("Error updating AI Suggestion Settings:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: CommonMessages.INTERNAL_SERVER_ERROR });
    }
}
export const getAISuggestionBatchProcessing = async (req, res) => {
    try {
        const batchProcessing = await AISuggestionBatchProcessing.find({})
            .sort({ updatedAt: -1 })
            .limit(1);
        if (!batchProcessing || batchProcessing.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "No AI Suggestion Batch Processing records found" });
        }
        return res.status(StatusCodes.OK).json({message: "AI Suggestion Batch Processing record fetched successfully", data : batchProcessing[0]});
    } catch (error) {
        console.error("Error fetching AI Suggestion Batch Processing records:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: CommonMessages.INTERNAL_SERVER_ERROR });
    }
}
export const updateAISuggestionBatchProcessing = async (req, res) => {
    try {
        const { batchId, updates } = req.body;
        if (!batchId || !updates) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Batch ID and updates are required" });
        }
        const updatedBatch = await AISuggestionBatchProcessing.findOneAndUpdate({ batchId }, updates, { new: true, upsert: true });
        if (!updatedBatch) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Batch not found" });
        }
        return res.status(StatusCodes.OK).json(updatedBatch);
    } catch (error) {
        console.error("Error updating AI Suggestion Batch Processing:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: CommonMessages.INTERNAL_SERVER_ERROR });
    }
}

// export const analyzePrompts = async (req, res) => {
//   const openAiKey = await getOpenAiConfig("openaikey");
//   if (!openAiKey)
//     return res.status(StatusCodes.BAD_REQUEST).json({ success: false });
//   const openai = new OpenAI({ apiKey: openAiKey });
//   // Use path.join to ensure cross-platform compatibility for the temp directory
//   const TMP_DIR = path.join(process.cwd(), "tmp_prompt_batches");
//   const MAX_FILE_SIZE = 32 * 1024 * 1024; // 100MB
//   const openAIBatchModel = "gpt-4o-mini";
//   const batchModelSystemPrompt =
//     "Analyze these user prompts, find stylistic prompt patterns, summarize concisely. Return actionable tips for each user in JSON: [{userId, suggestions:[]}].";

//   try {
//     await fs.mkdir(TMP_DIR, { recursive: true });
//     // For testing: only process three specific users
//     const users = await User.find({ 
//       email: { $not: /deletedEmail/ },
//       _id: { $in: [
//         //   "66a891c5b1aff965586287d0",
//         "66a891c5b1aff965586287d0",
//       ] } 
//     });
//     // 1. Gather all prompts grouped by user
//     const userPromptData = [];
//     await Promise.all(users.map(async (user) => {
//       const prompts = await promptModel
//         .find({ userid: user._id })
//         .sort({ createdAt: 1 })
//         .lean();
//       if (!prompts.length) return null;
//       const promptText = prompts.map((p) => p.description).join("\n");
//       const size = Buffer.byteLength(promptText, "utf8");
//       userPromptData.push({ userId: user._id, promptText, size });
//     }));

//     // 2. Build 100MB files: if user >100MB, split their prompts into multiple files; else batch users into files
//     let files = [];
//     let currentFile = [];
//     let currentSize = 0;
//     for (const up of userPromptData) {
//       if (up.size > MAX_FILE_SIZE) {
//         // Split this user's prompts into 100MB chunks
//         let offset = 0;
//         const promptArr = up.promptText.split("\n");
//         let chunk = [];
//         let chunkSize = 0;
//         for (let i = 0; i < promptArr.length; i++) {
//           const line = promptArr[i];
//           const lineSize = Buffer.byteLength(line + "\n", "utf8");
//           if (chunkSize + lineSize > MAX_FILE_SIZE) {
//             files.push([{ userId: up.userId, promptText: chunk.join("\n") }]);
//             chunk = [];
//             chunkSize = 0;
//           }
//           chunk.push(line);
//           chunkSize += lineSize;
//         }
//         if (chunk.length) {
//           files.push([{ userId: up.userId, promptText: chunk.join("\n") }]);
//         }
//       } else {
//         if (currentSize + up.size > MAX_FILE_SIZE) {
//           files.push([...currentFile]);
//           currentFile = [];
//           currentSize = 0;
//         }
//         currentFile.push({ userId: up.userId, promptText: up.promptText });
//         currentSize += up.size;
//       }
//     }
//     if (currentFile.length) files.push(currentFile);

//     // 3. For each file, upload to OpenAI, get suggestions, store in DB
//     let uploadedFiles = [];
//     let allSuggestions = [];
//     for (let i = 0; i < files.length; i++) {
//       const fileUsers = files[i];
//       const filePath = path.join(TMP_DIR, `prompts_batch_${i + 1}.txt`);
//       const fileContent = fileUsers
//         .map((up) => `User: ${up.userId}\n${up.promptText}`)
//         .join("\n\n");
//       await fs.writeFile(filePath, fileContent, "utf8");

//       // Upload file to OpenAI using createOpenAIFileObject for consistency
//       let openaiFile = null;
//       try {
//         const fileObj = {
//           path: filePath,
//           originalname: path.basename(filePath),
//         };
//         const pdfPath = await convertToPdf(fileObj);

//         openaiFile = await createOpenAIFileObject(
//           openai,
//           fileObj,
//           "user_data"
//         );
//         console.log(`Uploaded file to OpenAI: ${openaiFile.id}`);
//         uploadedFiles.push({ openaiFile, filePath });
//       } catch (err) {
//         console.error(`Failed to upload file to OpenAI: ${filePath}`, err);
//         await fs.unlink(filePath);
//         continue;
//       }

//       // Call OpenAI with file id in message (as you do)
//       let inputContent = [{
//         type: "file",
//         file: { file_id: openaiFile.id },
//       }];
//       let messages = [
//         { role: "system", content: batchModelSystemPrompt },
//         { role: "user", content: inputContent },
//       ];
//       const completion = await openai.chat.completions.create({
//         model: openAIBatchModel,
//         messages,
//         max_tokens: 16384,
//       });
//       const feedback = completion.choices[0].message.content;

//       // Try to parse JSON, fallback to storing as text
//       let suggestions = [];
//       try {
//         suggestions = JSON.parse(feedback);
//       } catch (e) {
//         suggestions = fileUsers.map((u) => ({
//           userId: u.userId,
//           suggestion: feedback,
//         }));
//       }
//       allSuggestions.push(...suggestions);

//       // Store suggestions in DB for each user in this batch
//       for (const s of suggestions) {
//         const addPromptFeedback = await PromptFeedbackModel.updateOne(
//           { userId: s.userId },
//           {
//             $set: {
//               feedback: s.suggestions || s.suggestion || feedback,
//               updatedAt: new Date(),
//             },
//           },
//           { upsert: true }
//         );
//       }
//     }

//     // After all batches, delete all files from local and OpenAI
//     for (const { openaiFile, filePath } of uploadedFiles) {
//       if (openaiFile && openaiFile.id) {
//         console.log(`Deleting OpenAI file: ${openaiFile.id}`);
//         try {
//           await openai.files.del(openaiFile.id);
//         } catch (err) {
//           console.error(`Failed to delete OpenAI file: ${openaiFile.id}`, err);
//         }
//       }
//       try {
//         await fs.unlink(filePath);
//       } catch (err) {
//         // ignore if already deleted
//         console.error(`Failed to delete local file: ${filePath}`, err);
//       }
//     }

//     res.json({
//       success: true,
//       data: allSuggestions,
//       message: "Processed all prompt batches with OpenAI.",
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: CommonMessages.INTERNAL_SERVER_ERROR, detail: err.message });
//   }
// };




export const analyzePromptsBatchAPI = async (req, res) => {


  console.log("Starting batch processing...by...cronning");
  const openAiKey = await getOpenAiConfig("openaikey");
  if (!openAiKey)
    return res.status(StatusCodes.BAD_REQUEST).json({ success: false });
  const openai = new OpenAI({ apiKey: openAiKey });

  // --- Check if any batch is already running on OpenAI ---
  try {
    
    const batchesList = await openai.batches.list();
    const runningBatch = batchesList.data && batchesList.data.find(batch => batch.status === 'in_progress' || batch.status === 'validating' || batch.status === 'queued');
    if (runningBatch) {
      return res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: `A batch is already running on OpenAI (batchId: ${runningBatch.id}, status: ${runningBatch.status}). Please wait until it completes before starting a new batch.`
      });
    }
  } catch (batchCheckErr) {
    console.error("Error checking OpenAI batches:", batchCheckErr);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to check for running OpenAI batches.",
      error: batchCheckErr.message
    });
  }

  // --- Move all previous batch processing records to history before inserting new ---
  const allPrevBatches = await AISuggestionBatchProcessing.find({});
  if (allPrevBatches && allPrevBatches.length > 0) {
    // Insert all previous records into history
    await AISuggestionBatchProcessingHistory.insertMany(allPrevBatches.map(doc => doc.toObject()));
    // Delete all previous records from main collection
    await AISuggestionBatchProcessing.deleteMany({});
  }
  const responseFormat =
  "\n\n Response Format:  Respond ONLY with a valid JSON array in the format shown below. Do not include any explanations, paragraphs, or extra text.\n"
  const aiSuggestionSettings = await AISuggestion.findOne({});
  const numberOfPromptPerUser = aiSuggestionSettings.promptPerUser || 5;
  const maxFeaturedAgents = aiSuggestionSettings.maxFeaturedAgents || 5;
  const maxTokenPerUserForProcessing =
    aiSuggestionSettings.maxTokenPerUserForProcessing || 2048;
  const openAIBatchModel =
    aiSuggestionSettings.openAIBatchModel || "gpt-4o-mini";
  // Compose system prompt with examples and response example
  const systemPrompt = aiSuggestionSettings.batchModelSystemPrompt ||
    "Analyze these user prompts, find stylistic prompt patterns, summarize concisely. Return actionable tips for each user to improve their prompts in JSON: [{suggestions:[]}].";
  const examplesArr = Array.isArray(aiSuggestionSettings.batchModelExamples)
    ? aiSuggestionSettings.batchModelExamples.filter(e => e && e.trim() !== "")
    : [];
  let examplesBlock = "";
  if (examplesArr.length > 0) {
    examplesBlock = `\n\nExample of Prompt Improvement Suggestions: [${examplesArr.map(e => `'${e.replace(/'/g, "\\'")}'`).join(", ")}]`;
  }
  // Always show the response example block
  let responseExampleBlock = "";
  if (examplesArr.length > 0) {
    responseExampleBlock = `\n\nResponse Example (JSON):\n${JSON.stringify([{ suggestions: examplesArr }], null, 2)}`;
  } else {
    const preset = [
      "When asking coding questions, include language version and relevant dependencies for more accurate answers.",
      "For creative tasks, provide 1-2 examples of the style/tone you're looking for to get better results.",
      "Instead of asking multi-part questions, try separating them into individual prompts for clearer responses.",
      "When requesting data, mention if you need JSON, tables, or bullet points to get properly structured responses."
    ];
    responseExampleBlock = `\n\nResponse Example (JSON):\n${JSON.stringify([{ suggestions: preset }], null, 2)}`;
  }
  const caution = "\n\n Your response must be strictly formatted as a JSON array, matching the example provided. Do not include any other text.";
  const batchModelSystemPrompt = systemPrompt + responseFormat + examplesBlock + responseExampleBlock + caution;
  let query = { deletedEmail: { $exists: false }, status: "active", aiSuggestionsEnabled: { $ne: false } };
  console.log("batchModelSystemPrompt : ", batchModelSystemPrompt);
  // For testing: only process three specific users
  const users = await User.find(query).sort({ createdAt: -1 }).limit(aiSuggestionSettings.batchSize || 20);
  const aiSuggestion = await AISuggestion.findOne({});
  if (!aiSuggestion) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "AI Suggestion settings not found" });
  }

  // 1. Gather all prompts grouped by user
  const userPromptData = [];
  await Promise.all(
    users.map(async (user) => {
      // Only fetch prompts from the last 1 month
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const prompts = await promptModel
        .find({ userid: user._id })
        .sort({ createdAt: -1 })
        .limit(numberOfPromptPerUser) // Limit to user-defined prompts per user
        .lean();
      if (!prompts.length) return null;
      const promptText = prompts.map((p) => p.description).join("\n");
      userPromptData.push({ userId: user._id, promptText });
    })
  );

  // 2. Prepare JSONL file for OpenAI Batch API
  const TMP_DIR = path.join(process.cwd(), "tmp_prompt_batches");
  await fs.mkdir(TMP_DIR, { recursive: true });
  const batchFilePath = path.join(TMP_DIR, `openai_batch_${Date.now()}.jsonl`);

  // Each line is a JSON object representing a chat/completions request
  const lines = userPromptData.map((up) => {
    return JSON.stringify({
      custom_id: up.userId.toString(),
      method: "POST",
      url: "/v1/chat/completions",
      body: {
        model: openAIBatchModel,
        messages: [
          { role: "system", content: batchModelSystemPrompt },
          { role: "user", content: up.promptText },
        ],
        max_tokens: maxTokenPerUserForProcessing,
      },
    });
  });
  await fs.writeFile(batchFilePath, lines.join(os.EOL), "utf8");

  const fileObj = {
    path: batchFilePath,
    originalname: path.basename(batchFilePath),
  };


  const openaiFile = await createOpenAIFileObject(openai, fileObj, "batch");

  try {
    console.log("Uploading batch file to OpenAI...");
    const createdBatch = await createBatchFileInOpenai(openai, openaiFile.id);
    console.log("Created batch file in OpenAI:", createdBatch);
    // Update lastBatchRunId in AISuggestion
    await AISuggestion.findOneAndUpdate(
      {},
      { lastBatchRunId: createdBatch.id ,isBatchCompleted : false},
      { new: true }
    );
    console.log("createdBatch :", createdBatch);

    // Create or update AISuggestionBatchProcessing record
    await AISuggestionBatchProcessing.findOneAndUpdate(
      {
        batchId: createdBatch.id,
      },
      {
        batchId: createdBatch.id,
        status: createdBatch.status || "pending",
        startTime: new Date(),
        totalUsers: users.length,
        processedUsers: 0,
        error: [],
        endTime: null,
        isBatchCompleted: false, // Set to false initially
      },
      { upsert: true }
    );

    // Optionally, clean up temp file
    await fs.unlink(batchFilePath);
    res.json({ success: true, batch: createdBatch });
  } catch (err) {
    console.error(
      "OpenAI Batch API error:",
      err?.response?.data || err.message
    );
    res.status(500).json({
      error: "Batch API error",
      detail: err?.response?.data || err.message,
    });
  }
};

export const generateAssistantSuggestionsForDesignations = async (req, res) => {
  try {
    const openAiKey = await getOpenAiConfig("openaikey");
    if (!openAiKey) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, message: "OpenAI key not found" });
    }

    const openai = new OpenAI({ apiKey: openAiKey });

    // 1. Get unique designations from users (excluding null/undefined/empty)
    const designations = await User.distinct("designation", {
      designation: { $exists: true, $ne: null, $ne: "", $ne: undefined },
      email: { $not: /deletedEmail/ },
    });
    const aiSuggestionSettings = await AISuggestion.findOne({});
    const maxFeaturedAgents = aiSuggestionSettings?.maxFeaturedAgents || 1;

    // Additional filtering to remove any empty, null, or whitespace-only designations
    const validDesignations = designations.filter(
      (designation) => 
        designation && 
        typeof designation === 'string' && 
        designation.trim().length > 0
    );

    if (!validDesignations.length) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "No valid designations found" });
    }


    // 2. Get all featured assistants with required fields and populate assistant type names
    const assistants = await Assistant.find(
      { is_featured: true },
      "_id assistant_id assistantTypeId instructions description"
    ).lean();

    if (!assistants.length) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "No featured assistants found" });
    }

    // Get all assistant types to map assistantTypeId to type names
    const assistantTypeIds = [...new Set(assistants.map(a => a.assistantTypeId).filter(Boolean))];
    const assistantTypes = await AssistantTypes.find(
      { _id: { $in: assistantTypeIds }, delete: { $ne: true } },
      "_id name"
    ).lean();

    // Create a map for quick lookup
    const typeMap = {};
    assistantTypes.forEach(type => {
      typeMap[type._id.toString()] = type.name;
    });

    // Enhance assistants with type names
    const enhancedAssistants = assistants.map(assistant => ({
      ...assistant,
      assistantTypeName: assistant.assistantTypeId ? 
        (typeMap[assistant.assistantTypeId.toString()] || "Unknown Type") : 
        "No Type"
    }));

    // 3. Process each designation
    const results = [];
    for (const designation of validDesignations) {
      try {
        // Create prompt for OpenAI with enhanced assistant information
        const assistantInfo = enhancedAssistants.map((a) => ({
          assistant_id: a.assistant_id,
          _id: a._id,
          assistantTypeId: a.assistantTypeId,
          assistantTypeName: a.assistantTypeName,
          instructions: a.instructions || "No instructions provided",
          description: a.description || "No description provided",
        }));

        const systemPrompt = `You are an AI assistant recommendation expert. Given a user designation and a list of available AI assistants, recommend the most suitable ${maxFeaturedAgents} assistants for that designation which are relevant to the user's needs and role. Each assistant has a type name that describes its category/purpose. Return your response in JSON format with an array of recommended assistants, including the reason for each recommendation.

Format your response as:
{
  "recommended_assistants": [
    {
      "assistant_id": "assistant_id_here",
      "_id": "mongodb_id_here",
      "assistantTypeId": "type_id_here",
      "assistantTypeName": "type_name_here",
      "instructions": "assistant_instructions",
      "description": "assistant_description",
      "reason": "why this assistant is suitable for this designation"
    }
  ]
}`;

        const userPrompt = `User Designation: ${designation}

Available Assistants:
${JSON.stringify(assistantInfo, null, 2)}

Please recommend the most suitable assistants for someone with the designation "${designation}". Consider their job responsibilities, skills needed, the assistant type name, and how each assistant can help them be more productive. Focus on relevance - only recommend assistants that would genuinely be useful for this specific role.`;

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 4000,
          temperature: 0.7,
        });

        const response = completion.choices[0].message.content;

        // Parse JSON response - handle markdown code blocks
        let suggestedAssistants = [];
        try {
          // Remove markdown code blocks if present
          let cleanResponse = response.trim();
          if (cleanResponse.startsWith('```json')) {
            cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          } else if (cleanResponse.startsWith('```')) {
            cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }
          console.log("cleanResponse:", cleanResponse);

          const parsed = JSON.parse(cleanResponse);
          suggestedAssistants = parsed.recommended_assistants || [];
        } catch (parseError) {
          console.error(`Failed to parse JSON for ${designation}:`, parseError);
          console.error(`Original response:`, response);
          // If JSON parsing fails, skip this designation
          continue;
        }

        // 4. Save to AssistantSuggestions table with additional validation
        try {
          // Check if designation is valid before saving
          if (!designation || typeof designation !== 'string' || designation.trim().length === 0) {
            console.warn(`Skipping invalid designation: "${designation}"`);
            continue;
          }


          const dataRetentionPeriod = aiSuggestionSettings?.dataRetentionPeriod || 60; // Default to 60 days if not set

          const savedSuggestion = await AssistantSuggestions.findOneAndUpdate(
            { role: designation.trim() },
            {
              role: designation.trim(),
              suggested_assistants: suggestedAssistants,
              updatedAt: new Date(),
              expiresAt: new Date(Date.now() + dataRetentionPeriod * 24 * 60 * 60 * 1000),
            },
            { upsert: true, new: true }
          );

          results.push({
            designation,
            suggested_count: suggestedAssistants.length,
            suggestions: savedSuggestion,
          });

          console.log(
            `Processed ${designation}: ${suggestedAssistants.length} suggestions saved`
          );
        } catch (dbError) {
          console.error(`Database error for designation ${designation}:`, dbError);
          results.push({
            designation,
            error: `Database error: ${dbError.message}`,
          });
        }

        // Add small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (designationError) {
        console.error(
          `Error processing designation ${designation}:`,
          designationError
        );
        results.push({
          designation,
          error: designationError.message,
        });
      }
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Assistant suggestions generated successfully",
      data: {
        total_designations: validDesignations.length,
        total_assistants: enhancedAssistants.length,
        results,
      },
    });
  } catch (error) {
    console.error("Error generating assistant suggestions:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: CommonMessages.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};


export const getAssistantSuggestionsForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "userId is required" });
    }
    // Get user's designation
    const user = await User.findById(userId);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "User  not found" });
    }
    if (!user.designation) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Designation not found" });
    }
    // Find suggestions for this designation (case insensitive)
    const designation = user.designation.trim();
    const suggestion = await AssistantSuggestions.findOne({ 
      role: { $regex: new RegExp(`^${designation}$`, 'i') }
    }).lean();
    if (!suggestion) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "No assistant suggestions found for this designation" });
    }
    // Fetch all agent names for the suggested_assistants
    let enrichedSuggestions = [];
    if (Array.isArray(suggestion.suggested_assistants) && suggestion.suggested_assistants.length > 0) {
      const assistantIds = suggestion.suggested_assistants.map(a => a._id).filter(Boolean);
      // Fetch all assistants in one query
      const assistants = await Assistant.find({ _id: { $in: assistantIds } }, { name: 1, image_url: 1 }).lean();
      const infoMap = {};
      assistants.forEach(a => {
        infoMap[a._id.toString()] = {
          name: a.name || null,
          image_url: a.image_url || null
        };
      });
      enrichedSuggestions = suggestion.suggested_assistants.map(a => ({
        ...a,
        name: a._id && infoMap[a._id.toString()] ? infoMap[a._id.toString()].name : null,
        image_url: a._id && infoMap[a._id.toString()] ? infoMap[a._id.toString()].image_url : null
      }));
    } else {
      enrichedSuggestions = suggestion.suggested_assistants || [];
    }
    return res.status(StatusCodes.OK).json({ message: "Assistant suggestions fetched successfully", data: enrichedSuggestions });
  } catch (error) {
    console.error("Error fetching assistant suggestions for user:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: CommonMessages.INTERNAL_SERVER_ERROR });
  }
};