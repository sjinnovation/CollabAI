import StatusCodes from 'http-status-codes';
import { OpenAI } from "langchain/llms/openai";
import AWS from "aws-sdk";
import { InternalServer } from '../middlewares/customError.js';
import { GPTModels, customTrainDataMessages, openAiConfig } from '../constants/enums.js';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { RetrievalQAChain } from 'langchain/chains';
import getOpenAiConfig from '../utils/openAiConfigHelper.js';
import CustomTrainDataModel from '../models/customTrainDataModel.js';
import * as fs from 'fs';
import config from "../config.js";


AWS.config.update({
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_KEY_ID,
    region: config.AWS_REGION,
          
});
  
const s3 = new AWS.S3();


// run with embedded vector database 
const runWithEmbeddings = async (question, customDataLink) => {

    const urlObj = new URL(customDataLink);
    // fetch the file path key
    const filePathKey = urlObj.pathname.substring(1);
    const parts = customDataLink.split('/');
    const filenameWithExt = parts[parts.length - 1].split('?')[0];
    const filename = filenameWithExt.split('_')[1].split('.')[0];
    
    const VECTOR_STORE_PATH = `./documents/${filename}.index`;

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: filePathKey
    };
    

    try {
        const data = await s3.getObject(params).promise();
        const response = data?.Body?.toString('utf-8');
        // Initialize the OpenAI model with an empty configuration object
        const model = new OpenAI({
            temperature: openAiConfig.DEFAULT_TEMPERATURE,
            openAIApiKey: await getOpenAiConfig('openaikey'),
            modelName: GPTModels.GPT_3_5_TURBO
        });

        // store custom data in vector database of langchain
        let vectorStore;
        if (fs.existsSync(VECTOR_STORE_PATH)) {
            vectorStore = await HNSWLib.load(VECTOR_STORE_PATH, new OpenAIEmbeddings({openAIApiKey: await getOpenAiConfig('openaikey'),}));

        } else {
            const text = response;
            const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
            const docs = await textSplitter.createDocuments([text]);
            vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings({openAIApiKey: await getOpenAiConfig('openaikey'),}));
            await vectorStore.save(VECTOR_STORE_PATH);
            return customTrainDataMessages.INITIAL_STARTER_MESSAGE;
        }

        const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

        const res = await chain.call({
            query: question,
        });
        
        return { res };

        
    } catch (error) {
        return customTrainDataMessages?.NO_DATA_FOUND;
    }

};


export const trainCustomcompanyData = async (req, res, next) => {
	const { question, customdataid } = req.body;

    if (typeof question !== 'string') {
        // type error
        return res.status(StatusCodes.OK).json({ message: customTrainDataMessages.CUSTOM_TRAIN_DATA_INVALID_INPUT });
    }
    

    try {

        // Find the document by its _id
        const result = await CustomTrainDataModel.findOne({ _id: customdataid });
        if (result) {
            

            let answer = await runWithEmbeddings(question, result.customDataLink);  // fetching the answer
            res.status(StatusCodes.OK).json({
                response: answer
            });
        } else {
            res.status(StatusCodes.OK).json({
                response: customTrainDataMessages.NO_DATA_FOUND
            });
        }
    } catch (error) {
        console.log(error);
        next(InternalServer(error.message));
    }
};

const isInvalidCustomTrainDataCreatePayload = (trainCustomDataPayload)=>{

  const trimedNname = trainCustomDataPayload?.name?.trim() || null;
  const customTrainDataLink = trainCustomDataPayload?.customDataLink || null;
  if (!trimedNname) {
    return "Name is required.";
  }

  if (!customTrainDataLink) {
    return "Custom Train Data Link is required.";
  }

  return null;

};

export const createCustomTrainCompanyData = async (req, res, next) => {

    // Check if any invalid payload is passed in
    const errorMessage = isInvalidCustomTrainDataCreatePayload(req.body);

    if (errorMessage) {
        // if so, send the error message with 400
        return res.status(400).json({ message: errorMessage });
    }
    

    try {

        // Creating a new Custom Train Data instance
        const newCustomTrainData = new CustomTrainDataModel({
            name: req?.body?.name ? req?.body?.name : undefined,
            description: req?.body?.description ? req?.body?.description: undefined,
            userName: req?.body?.userName ? req?.body?.userName: undefined,
            customDataLink: req?.body?.customDataLink ? req?.body?.customDataLink: undefined,
        });

        // Saving Custom Train Data into DB and sending Custom Train Data data back
        const savedNewCustomTrainData = await newCustomTrainData.save();

        res.status(StatusCodes.OK).json({
            data: savedNewCustomTrainData
        });

    } catch (error) {
        console.log(error);
        next(InternalServer(error.message));
    }
};