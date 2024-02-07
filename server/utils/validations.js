import Joi from "joi";

export const createChatPerAssistantSchema = Joi.object({
    question: Joi.string().max(32700).required(),    
  }).unknown();