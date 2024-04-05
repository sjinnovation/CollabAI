import Anthropic from '@anthropic-ai/sdk';
import getOpenAiConfig from '../utils/openAiConfigHelper.js';

export const getClaudeAIInstance = async () => {
	try {
		const apiKey = await getOpenAiConfig('claudeApiKey');
		if (!apiKey) {
			throw new Error(
				'Failed to retrieve ClaudeAI API key from database, Please change the key and try again.'
			);
		}

		return new Anthropic({ apiKey: apiKey });
	} catch (error) {
		console.error('Error initializing OpenAI instance:', error);
		throw error;
	}
};
