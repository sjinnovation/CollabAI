import Model from "../models/huggingFaceModels.js";
import axios from "axios";  // Ensure axios is imported
import { getHuggingFaceInstance } from "../config/huggingApi.js";
import { HuggingfaceMessages } from "../constants/enums.js";
import { uploadImageToS3 } from "../lib/s3.js";
import { StatusCodes } from 'http-status-codes';


/**
 * @async
 * @function addModel
 * @description
 * Adds a new AI model with optional image upload to S3. Validates required fields before saving.
 * 
 * @param {Object} req - Express request with model data in body and optional file
 * @param {Object} res - Express response with status and result
 * 
 * @returns {Response} 201 on success, 400 on validation failure, 500 on upload or DB error
 */

// Add model
export const addModel = async (req, res) => {
  const modelData = req.body;
  if (req.file) {
    try {
      const s3Link = await uploadImageToS3(req.file.path, "image");
      modelData.image_url = s3Link;
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Error uploading image" });
    }
  }

  // Validation for required fields
  if (
    !modelData.nickname ||
    !modelData.name ||
    !modelData.inputOutputType || 
    !modelData.type ||
    modelData.temperature === undefined || 
    modelData.maxToken === undefined
  ) {
    return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: HuggingfaceMessages.HF_ADD_MODEL });
  }

  try {
    const newModel = new Model(modelData);
    await newModel.save();
    res.status(StatusCodes.CREATED).json({ success: true, data: newModel });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: HuggingfaceMessages.HF_SERVER_ERR });
  }
};


/**
 * @async
 * @function checkModelFieldAvailability
 * @description
 * Checks if a given model field value is already taken (case-insensitive).
 * 
 * @param {Object} req - Express request with `field` and `value` params
 * @param {Object} res - Express response with availability status
 * 
 * @returns {Response} 200 if available, 409 if taken, 400 if params missing, 500 on error
 */

//uniquness
export const checkModelFieldAvailability = async (req, res) => {
  try {
    const { field, value } = req.params;
    if (!field || !value) {
      return res.status(400).json({ msg: "Field and value are required." });
    }

    const lowerCaseValue = value.toLowerCase();

    const query = { [field]: new RegExp(`^${lowerCaseValue}$`, 'i') }; // Case-insensitive exact match

    const existingModel = await Model.findOne(query);

    if (existingModel) {
      return res.status(409).json({ msg: `Model ${field} already taken.` });
    }

    return res.status(200).json({ msg: `Model ${field} is available.` });
  } catch (err) {
    console.error("Error checking model field availability:", err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};


/**
 * @async
 * @function listModels
 * @description Retrieves all models with selected fields.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object with models data or error message.
 *
 * @returns {Response} 200 with model list on success, 500 on server error.
 */

// List models
export const listModels = async (req, res) => {
  try {
    const model = await Model.find().select("nickname name inputOutputType type temperature maxToken topP topK frequencyPenalty presencePenalty width height guidanceScale seed numInferenceSteps maxSequenceLength randomizeSeed image_url");
    res.status(StatusCodes.OK).json({ success: true, data: model });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: HuggingfaceMessages.HF_SERVER_ERR });
  }
};


/**
 * @async
 * @function processModel
 * @description
 * Processes input data through a specified model by name.
 * Supports text-to-image, image-to-text, text-generation, image-classification, and text-classification types.
 * Validates inputs, fetches model, calls corresponding Hugging Face API,
 * and returns the processed result or an error.
 * 
 * @param {Object} req - Express request object containing:
 *   - modelName {string}: Name of the model to use.
 *   - inputData {string}: Input data (text or image base64/URL).
 * @param {Object} res - Express response object returning success status and result or error message.
 * 
 * @returns {Response} 200 with processing result on success,
 * 400 for missing/invalid input,
 * 404 if model not found,
 * 500 on server or external API error.
 */

// Process model
export const processModel = async (req, res) => {
  const { modelName, inputData } = req.body;

  if (!modelName || !inputData) {
    return res.status(StatusCodes.BAD_REQUEST).json({ success: false,result: null, message: HuggingfaceMessages.HF_INPUT_REQ });
  }

  try {
    const model = await Model.findOne({ name: modelName });
    if (!model) {
      return res.status(StatusCodes.NOT_FOUND).json({ success: false, result: null,message: HuggingfaceMessages.HF_MODEL_NOT });
    }

    let result;
    const hf = await getHuggingFaceInstance();

      // Handle different model types
    if (model.inputOutputType.toLowerCase() === "text-to-image") {
      try {
        const output = await hf.textToImage({ 
          inputs: inputData, model: model.name,
          parameters: {
            width: model.width,
            height: model.height,
            guidance_scale: model.guidanceScale,
            num_inference_steps: model.numInferenceSteps,
            seed: model.randomizeSeed ? Math.floor(Math.random() * 10000) : model.seed,
          }
        });

        if (!output || !(output instanceof Blob)) {
          throw new Error(HuggingfaceMessages.HF_FORMAT_ERR);
        }

        const buffer = await output.arrayBuffer();
        const base64Image = `data:image/jpeg;base64,${Buffer.from(buffer).toString("base64")}`;
        result = base64Image;
      } catch (hfError) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false,result: null, message: HuggingfaceMessages.HF_CALL_ERR });
      }
    } else if (model.inputOutputType.toLowerCase() === "image-to-text") {
      let imageData;

      // Check if the input is base64 image
      if (inputData.startsWith("data:image")) {
        const matches = inputData.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        if (!matches) {
          return res.status(StatusCodes.BAD_REQUEST).json({ success: false, result: null,message: HuggingfaceMessages.HF_INVL_IMAGE });
        }
        const base64Image = matches[2];
        imageData = Buffer.from(base64Image, 'base64');
      } else if (inputData.startsWith("http://") || inputData.startsWith("https://")) {
        try {
          const response = await axios.get(inputData, { responseType: "arraybuffer" });
          imageData = response.data; 
        } catch (error) {
          return res.status(StatusCodes.BAD_REQUEST).json({ success: false, result: null,message: HuggingfaceMessages.HF_FETCH_IMA_ERR });
        }
      } else {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false,result: null, message: HuggingfaceMessages.HF_INV_IMA_INP });
      }

      try {
        const output = await hf.imageToText({ data: imageData, model: model.name });
        result = output;
      } catch (hfError) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, result: null,message: HuggingfaceMessages.HF_CALL_ERR });
      }
    } else if (model.inputOutputType.toLowerCase() === "text-generation") {
      try { 
        const output = await hf.textGeneration({
          model: model.name,
          inputs: inputData,
          parameters: {
            temperature: model.temperature,
            top_k: model.topK,
            top_p: model.topP,
            max_new_tokens: Math.min(model.maxToken ?? 256, 1024), // safe cap
            repetition_penalty: model.presencePenalty,
            do_sample: true,
            seed: model.randomizeSeed ? Math.floor(Math.random() * 10000) : model.seed,
          }
        });
        
        result = output;
      } catch (hfError) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, result: null,message: HuggingfaceMessages.HF_CALL_ERR });
      }
    } else if (model.inputOutputType.toLowerCase() === "image-classification") {
      let imageData;

      // Check if the input is base64 image
      if (inputData.startsWith("data:image")) {
        const matches = inputData.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        if (!matches) {
          return res.status(StatusCodes.BAD_REQUEST).json({ success: false, result: null,message: HuggingfaceMessages.HF_INVL_IMAGE });
        }
        const base64Image = matches[2];
        imageData = Buffer.from(base64Image, 'base64');
      } else if (inputData.startsWith("http://") || inputData.startsWith("https://")) {
        try {
          const response = await axios.get(inputData, { responseType: "arraybuffer" });
          imageData = response.data; 
        } catch (error) {
          return res.status(StatusCodes.BAD_REQUEST).json({ success: false,result: null, message: HuggingfaceMessages.HF_FETCH_IMA_ERR });
        }
      } else {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false,result: null, message: HuggingfaceMessages.HF_INV_IMA_INP });
      }

        try {
          const output = await hf.imageClassification({ data: imageData, model: model.name });
          result = output;
        } catch (hfError) {
          return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false,result: null, message: HuggingfaceMessages.HF_CALL_ERR });
        }
    } else if (model.inputOutputType.toLowerCase() === "text-classification") {
      try {
        const output = await hf.textClassification({ inputs: inputData, model: model.name });
        result = output
      } catch (hfError) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false,result: null, message: HuggingfaceMessages.HF_CALL_ERR});
      }
    } 
  else {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false,result: null, message: HuggingfaceMessages.HF_UNS_MODEL });
    }

    res.status(StatusCodes.OK).json({ success: true, result });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, result:null,message: HuggingfaceMessages.HF_SERVER_ERR });
  }
};

/**
 * @async
 * @function deleteModel
 * @description
 * Deletes a model from the database by its nickname.
 * Returns 404 if not found, 200 on successful deletion,
 * and 500 on server error.
 * 
 * @param {Object} req - Express request object containing:
 *   - nickname {string} in req.params: nickname of the model to delete
 * @param {Object} res - Express response object returning status and message
 * 
 * @returns {Response} HTTP response with success status and message
 */

// Delete model
export const deleteModel = async (req, res) => {
  const { nickname } = req.params;

  try {
    const deletedModel = await Model.findOneAndDelete({ nickname });

    if (!deletedModel) {
      return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: `Model "${nickname}" not found.` });
    }

    res.status(StatusCodes.OK).json({ success: true, message: `Model "${nickname}" deleted successfully.` });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: HuggingfaceMessages.HF_SERVER_ERR });
  }
};

/**
 * @async
 * @function editModel
 * @description
 * Updates a model by its ID, optionally uploading a new image to S3.
 * Validates required fields and returns the updated model.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.params._id - ID of the model to update
 * @param {Object} req.body - Model data to update
 * @param {File} [req.file] - Optional image file to upload
 * @param {Object} res - Express response object
 * 
 * @returns {Response} 200 with updated model, 400 on validation error,
 * 404 if model not found, 500 on server error.
 */

// Update model
export const editModel = async (req, res) => {
  const { _id } = req.params;
  const modelData = req.body;

  if (req.file) {
    try {
      const s3Link = await uploadImageToS3(req.file.path, "image");
      modelData.image_url = s3Link;
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Error uploading image" });
    }
  }

  // Validation for required fields
  if (
    !modelData.nickname ||
    !modelData.name ||
    !modelData.inputOutputType || 
    !modelData.type ||
    modelData.temperature === undefined || 
    modelData.maxToken === undefined
  ) {
    return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: HuggingfaceMessages.HF_EDIT_MODEL });
  }

  try {
    const updatedModel = await Model.findByIdAndUpdate(_id, modelData, { new: true, runValidators: true });

    if (!updatedModel) {
      return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: HuggingfaceMessages.HF_MODEL_NOT });
    }

    res.status(StatusCodes.OK).json({ success: true, data: updatedModel });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: HuggingfaceMessages.HF_SERVER_ERR });
  }
};