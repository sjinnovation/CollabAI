import Together from "together-ai";
import { uploadToS3Bucket } from "../lib/s3.js";
import AWS from "aws-sdk";
import config from "../config.js";
import { v4 as uuidv4 } from 'uuid';
import { getGoogleAuthCredentialService } from "./googleAuthService.js";
import Assistant from "../models/assistantModel.js";
import { createImageGenerationPrompt, getAICompletion, getFormattedThreadMessages, processImageToolCall } from "../utils/fluxHelperFunctions.js";
import { getConfigKeyValue } from "./configService.js";
import getOpenAiConfig from "../utils/openAiConfigHelper.js";

const apiKey = process.env.TOGETHER_API_KEY

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY_ID,
  region: config.AWS_REGION,
});

const s3 = new AWS.S3();

export const createFluxImage = async (prompt, userId = null, threadId = null) => {
  const appName = "flux"
  const getFluxKey = await getOpenAiConfig('togetheraiKey')
  let together = getFluxKey? new Together({apiKey: getFluxKey}) : null;
  const togetheraiKey = await getConfigKeyValue('togetheraiKey');
  const fluxModel = await getConfigKeyValue('fluxModel');
  const fluxImageWidth = await getConfigKeyValue('fluxImageWidth');
  const fluxImageHeight = await getConfigKeyValue('fluxImageHeight');
  const fluxImageSeed = await getConfigKeyValue('fluxImageSeed');
  const fluxSteps = await getConfigKeyValue('fluxSteps');
  const fluxPreviews = await getConfigKeyValue('fluxPreviews');

  
  try {
    if (together) {
      let output = await together.images.create({
        prompt: prompt,
        model: fluxModel,
        width: Number(fluxImageWidth),
        height: Number(fluxImageHeight),
        steps: Number(fluxSteps),
        response_format: "base64",
        seed: Number(fluxImageSeed),
        n: 1
      });
      const uuid = uuidv4();
      const uuid1 = uuidv4();

      const fileBuffer = Buffer.from(output.data[0].b64_json, 'base64');
      const name = uuid + uuid1 + "flux.jpg"
      const contentType = "image/jpeg"
      const s3_link = await uploadToS3Bucket(name, fileBuffer, contentType, userId);
      return s3_link;
    }
    return null;

  } catch (error) {
    return null;
  }

};

export const getSignedUrl = async (s3Key) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: s3Key,
    Expires: 31536000, 
  };

  try {
    const url = await s3.getSignedUrlPromise('getObject', params);
    return url;
  } catch (err) {
    console.error('Error generating signed URL', err);
    throw null;
  }
};
export const getQuestionAndImageUrl = (text) => {
  const imageUrlMatch = text.match(/###Image\s*:\s*(.+?)###/);
  const imageUrl = imageUrlMatch ? imageUrlMatch[1].trim() : null;

  const questionMatch = text.match(/Question\s*:\s*(.+)/);
  const query = questionMatch ? questionMatch[1].trim() : null;
  return { query, imageUrl };
}

export const checkAssistantPluginEnable = async (assistantId) => {
  let enableSync = false;
  let fluxEnable = false;
  let mermaid =  false;
  try {
    const responseOfCheckAssistant = await Assistant.findOne({ assistant_id: assistantId });
    if (responseOfCheckAssistant) {
      enableSync = responseOfCheckAssistant?.plugins?.some(plugin => plugin.type === 'enableSync') || false;
      fluxEnable = responseOfCheckAssistant?.plugins?.some(plugin => plugin.type === 'flux') || false;
      mermaid = responseOfCheckAssistant?.plugins?.some(plugin => plugin.type === 'mermaid') || false;

    }
    return { enableSync, fluxEnable,mermaid }

  } catch (error) {
    return { enableSync, fluxEnable,mermaid }

  }
}

export const handleImageGeneration = async (question, threadId, userId) => {
  try {
    // Fetch and format thread messages
    const threadMessages = await getFormattedThreadMessages(threadId);

    // Prepare prompt with image filtering instruction
    const prompt = createImageGenerationPrompt(question);
    threadMessages.push({ role: "user", content: prompt });

    // Get AI completion
    const response = await getAICompletion(threadMessages);

    // Process tool calls if present
    if (hasToolCalls(response)) {
      return await processImageToolCall(response, userId, threadId, question);
    }

    return null;
  } catch (error) {
    console.error('Error in image generation:', error);
    throw new Error('Failed to process image generation request');
  }
}

export const checkFluxPrompt = (prompt) =>{
  const regex = /@Image|@image/g;
  const hasImageTag = regex.test(prompt);
  const cleanedPrompt = prompt.replace(regex, '').trim(); 

  return {
      originalPrompt: prompt,
      cleanedPrompt,
      hasImageTag,
  }
}

export const checkAppsPrompt = (prompt) => {
  const imageRegex = /@image/gi;
  const outlookRegex = /@outlook/gi;

  const hasImageTag = imageRegex.test(prompt);
  const outlookTag = !hasImageTag && outlookRegex.test(prompt);

  const cleanedPrompt = prompt.replace(imageRegex, '').replace(outlookRegex, '').trim();

  return {
    originalPrompt: prompt,
    cleanedPrompt,
    hasImageTag,
    outlookTag
  };
};
