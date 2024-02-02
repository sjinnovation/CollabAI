import Joi from "joi";

export const createChatPerAssistantSchema = Joi.object({
    questions: Joi.string().max(32700).required(),    
  });