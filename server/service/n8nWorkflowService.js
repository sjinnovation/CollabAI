import axios from 'axios';
import { getAssistantByAssistantID } from './assistantService.js';
import { getUserDetails } from './userService.js';
import { decryptN8nSecretKey } from '../utils/n8nEncryption.js';

/**
 * Check if the question contains @n8n (case insensitive)
 * @param {string} question - The user's question
 * @returns {boolean} - True if question contains @n8n
 */
export const checkN8nPrompt = (question) => {
  const hasN8n = question.toLowerCase().includes('@n8n');
  return hasN8n;
};

/**
 * Get workflow details by ID from n8n API
 * @param {string} workflowId - The workflow ID
 * @param {string} secretKey - The n8n API secret key
 * @returns {Promise<Object>} - Workflow details
 */
export const getWorkflowById = async (workflowId, secretKey) => {
  try {
    const response = await axios.get(`https://n8n.buildyourai.consulting/api/v1/workflows/${workflowId}`, {
      headers: {
        'X-N8N-API-KEY': secretKey
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching workflow by ID:", workflowId, error.message);
    throw new Error(`Failed to fetch workflow ${workflowId}: ${error.message}`);
  }
};

/**
 * Extract webhook information from workflow nodes
 * @param {Array} nodes - Workflow nodes array
 * @returns {Object|null} - Webhook info with method and path
 */
export const extractWebhookInfo = (nodes) => {
  
  if (!nodes || !Array.isArray(nodes)) {
    return null;
  }

  const webhookNode = nodes.find(node => node.type === 'n8n-nodes-base.webhook');
  
  if (!webhookNode) {
    return null;
  }

  const webhookInfo = {
    method: webhookNode.parameters?.httpMethod || 'POST',
    path: webhookNode.parameters?.path,
    webhookId: webhookNode.webhookId
  };

  return webhookInfo;
};

/**
 * Execute webhook with the given parameters
 * @param {string} path - Webhook path
 * @param {string} method - HTTP method
 * @param {Object} payload - Request payload
 * @returns {Promise<Object>} - Webhook response
 */
export const executeWebhook = async (path, method, payload) => {
  try {
    const webhookUrl = `https://n8n.buildyourai.consulting/webhook/${path}`;

    const config = {
      method: method.toLowerCase(),
      url: webhookUrl,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (method.toLowerCase() === 'get') {
      config.params = payload;
    } else {
      config.data = payload;
    }

    const response = await axios(config);
    
    return response.data;
  } catch (error) {
    console.error("Error executing webhook:", {
      path: path,
      method: method,
      error: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText
    });
    throw new Error(`Webhook execution failed: ${error.message}`);
  }
};

/**
 * Main function to execute n8n workflows
 * @param {Object} openai - OpenAI instance
 * @param {string} assistantId - Assistant ID
 * @param {string} threadId - Thread ID
 * @param {string} question - User's question
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Modified question with workflow results
 */
export const executeWorkFlows = async (openai, assistantId, threadId, question, userId) => {
  try {
    

    // Step 1: Get assistant information
    const assistant = await getAssistantByAssistantID(assistantId);
    
    if (!assistant) {
      throw new Error("Assistant not found");
    }

    // Step 2: Get user information for n8n credentials
    const user = await getUserDetails(userId);
    
    if (!user || !user.isN8nConnected || !user.n8nSecretKey) {
      throw new Error("N8n not connected. Please connect n8n from Account Settings first.");
    }

    // Decrypt the secret key
    let decryptedSecretKey;
    try {
      decryptedSecretKey = await decryptN8nSecretKey(user.n8nSecretKey, user._id);
    } catch (decryptError) {
      console.error("Error decrypting n8n secret key:", decryptError);
      throw new Error("Failed to decrypt n8n credentials");
    }

    if (!assistant.selectedWorkflowIds || assistant.selectedWorkflowIds.length === 0) {
      throw new Error("No workflows selected. Please select workflows first.");
    }

    // Step 3: Execute each selected workflow
    const workflowResults = []; 

    for (const workflowId of assistant.selectedWorkflowIds) {
      try {
        
        // Get workflow details using decrypted n8n secret key
        const workflow = await getWorkflowById(workflowId, decryptedSecretKey);
        
        // Extract webhook information
        const webhookInfo = extractWebhookInfo(workflow.nodes);
        
        if (!webhookInfo) {
          continue;
        }

        // Execute webhook
        const webhookPayload = {
          question: question,
          userId: userId,
          assistantId: assistantId,
          threadId: threadId,
          timestamp: new Date().toISOString()
        };

        const webhookResult = await executeWebhook(
          webhookInfo.path,
          webhookInfo.method,
          webhookPayload
        );

        workflowResults.push({
          workflowId: workflowId,
          workflowName: workflow.name,
          result: webhookResult
        });

      } catch (workflowError) {
        console.error(`Error executing workflow ${workflowId}:`, workflowError.message);
        workflowResults.push({
          workflowId: workflowId,
          error: workflowError.message
        });
      }
    }

    // Step 4: Create enhanced question with workflow results
    let enhancedQuestion = question;

    if (workflowResults.length > 0) {
      const resultsText = workflowResults.map(result => {
        if (result.error) {
          return `Workflow "${result.workflowName || result.workflowId}" failed: ${result.error}`;
        } else {
          return `Workflow "${result.workflowName}" result: ${JSON.stringify(result.result)}`;
        }
      }).join('\n\n');

      enhancedQuestion = `Based on the following n8n workflow results, answer the question: ${question}\n\nWorkflow Results:\n${resultsText}`;
    }

    return enhancedQuestion;

  } catch (error) {
    console.error("Error in executeWorkFlows:", error.message);
    throw error;
  }
};

/**
 * Execute a specific workflow by name
 * @param {Object} openai - OpenAI instance
 * @param {string} assistantId - Assistant ID
 * @param {string} threadId - Thread ID
 * @param {string} question - User's question
 * @param {string} userId - User ID
 * @param {string} workflowName - Name of the workflow to execute
 * @returns {Promise<Object>} - Modified question with workflow results
 */
export const executeSpecificWorkflow = async (openai, assistantId, threadId, question, userId, workflowName) => {
  try {
    // Step 1: Get assistant information
    const assistant = await getAssistantByAssistantID(assistantId);
    
    if (!assistant) {
      throw new Error("Assistant not found");
    }

    // Step 2: Get user information for n8n credentials
    const user = await getUserDetails(userId);
    
    if (!user || !user.isN8nConnected || !user.n8nSecretKey) {
      throw new Error("N8n not connected. Please connect n8n from Account Settings first.");
    }

    // Decrypt the secret key
    let decryptedSecretKey;
    try {
      decryptedSecretKey = await decryptN8nSecretKey(user.n8nSecretKey, user._id);
    } catch (decryptError) {
      console.error("Error decrypting n8n secret key:", decryptError);
      throw new Error("Failed to decrypt n8n credentials");
    }

    if (!assistant.selectedWorkflowIds || assistant.selectedWorkflowIds.length === 0) {
      throw new Error("No workflows selected for this assistant. Please select workflows first.");
    }

    // Step 3: Get all workflows to find the one by name
    const allWorkflowsResponse = await axios.get('https://n8n.buildyourai.consulting/api/v1/workflows', {
      headers: {
        'X-N8N-API-KEY': decryptedSecretKey
      }
    });

    const allWorkflows = allWorkflowsResponse.data.data || [];
    
    // Find workflow by name (case insensitive)
    const targetWorkflow = allWorkflows.find(workflow => 
      workflow.name && workflow.name.toLowerCase() === workflowName.toLowerCase()
    );

    if (!targetWorkflow) {
      throw new Error(`Workflow "${workflowName}" not found. Available workflows: ${allWorkflows.map(w => w.name).join(', ')}`);
    }

    // Check if this workflow is selected for this assistant
    if (!assistant.selectedWorkflowIds.includes(targetWorkflow.id)) {
      throw new Error(`Workflow "${workflowName}" is not selected for this assistant. Please select it first.`);
    }

    // Step 4: Get workflow details
    const workflow = await getWorkflowById(targetWorkflow.id, decryptedSecretKey);
    
    // Step 5: Extract webhook information
    const webhookInfo = extractWebhookInfo(workflow.nodes);
    
    if (!webhookInfo) {
      throw new Error(`Workflow "${workflowName}" does not have a webhook node configured.`);
    }

    // Step 6: Execute webhook
    const webhookPayload = {
      question: question,
      userId: userId,
      assistantId: assistantId,
      threadId: threadId,
      timestamp: new Date().toISOString()
    };

    const webhookResult = await executeWebhook(
      webhookInfo.path,
      webhookInfo.method,
      webhookPayload
    );

    // Step 7: Create enhanced question with workflow results
    const enhancedQuestion = `Based on the following n8n workflow result, answer the question: ${question}\n\nWorkflow "${workflowName}" result: ${JSON.stringify(webhookResult)}`;

    return enhancedQuestion;

  } catch (error) {
    console.error("Error in executeSpecificWorkflow:", error.message);
    throw error;
  }
}; 