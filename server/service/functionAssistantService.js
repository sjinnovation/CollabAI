import FunctionAssistant from "../models/functionAssistantModel.js";
import AgentFunctionAssociation from "../models/functionAssistantModel.js";


export const createFunctionAssociations = async (agentId, functionIds) => {
  const associations = functionIds.map(functionId => ({
    agentid: agentId,
    functionid: functionId,
  }));

  try {
    await AgentFunctionAssociation.insertMany(associations);
  } catch (error) {
    throw new Error(`Error creating function associations: ${error.message}`);
  }
};

const getFunctionsForAgent = async (agentId) => {
  try {
    const agent = await Assistant.findById(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    const associations = await AgentFunctionAssociation.find({ agentid: agentId })
      .populate('functionid', 'name definition createdAt') // Populate function details
      .exec();

    return associations;
  } catch (error) {
    throw new Error(`Error fetching functions for agent: ${error.message}`);
  }
};


export const getAllFunctionAssistants = async (functionId) => {
  try {
    const associations = await AgentFunctionAssociation.find({ functionid: functionId })
      .populate('agentid', 'name') 
      .exec();

    const agents = associations
      .filter(assoc => assoc?.agentid && assoc?.agentid?.name) 
      .map(assoc => assoc?.agentid?.name); 

    return agents;
  } catch (error) {
    console.error("Error fetching function assistants:", error); 
    throw new Error("Error fetching function assistants");
  }
};


export const deleteFunctionAssociations = async (agentId, functionIds) => {
  try {
    await AgentFunctionAssociation.deleteMany({
      agentid: agentId,
      functionid: { $in: functionIds },
    });
  } catch (error) {
    throw new Error(`Error deleting function associations: ${error.message}`);
  }
};