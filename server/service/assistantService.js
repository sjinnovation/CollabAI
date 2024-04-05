// ----- MODELS -----
import Assistant from '../models/assistantModel.js'; // Adjust the import path based on your project structure
import AssistantThread from '../models/assistantThreadModel.js';
import promptModel from '../models/promptModel.js';
// ----- CONSTANTS -----
import { getOpenAIInstance } from '../config/openAI.js';

export const getAssistantByAssistantId = async (assistant_id) => {
	const assistant = await Assistant.findOne({
		assistant_id,
		is_deleted: false
	});

	return assistant;
}


export const updateAssistantFromPlayground = async (
	assistantId,
	localAssistant
) => {
	try {
		const openai = 	await getOpenAIInstance();

		const playgroundAssistant = await openai.beta.assistants.retrieve(
			assistantId
		);
		console.log(playgroundAssistant, 'playgroundAssistant');

		// Compare the fields with the local MongoDB model
		const fieldsToCheck = [
			'name',
			'model',
			'instructions',
			'tools',
			'file_ids',
		];
		const needsUpdate = fieldsToCheck.some(
			(field) =>
				JSON.stringify(playgroundAssistant[field]) !==
				JSON.stringify(localAssistant[field])
		);

		if (needsUpdate) {
			// Update the local MongoDB model
			await Assistant.findOneAndUpdate(
				{ assistant_id: assistantId },
				{
					name: playgroundAssistant.name,
					model: playgroundAssistant.model,
					instructions: playgroundAssistant.instructions,
					tools: playgroundAssistant.tools,
					file_ids: playgroundAssistant.file_ids,
				}
			);
		}
	} catch (error) {
		console.error(
			`Error updating assistant ${assistantId} from the OpenAI Playground: ${error.message}`
		);
	}
};


// this function is for assistant function calling, responsible for getting prompts based on query
export async function meeting_summary(sDate, eDate, meetingType) {
	try {
		// Validate inputs
		if (!sDate || !eDate) {
			throw new Error('Start and end dates are required');
		}

		const startDate = new Date(sDate);
		const endDate = new Date(eDate);

		// Prepare query
		let query = {
			createdAt: {
				$gte: startDate,
				$lte: endDate,
			},
		};

		// Add tags to query if provided
		if (meetingType && meetingType.length) {
			query.tags = { $in: meetingType };
		}

		// Fetch data from DB
		const result = await promptModel
			.find(query)
			.populate('tags', 'title')
			.lean();

		// Prepare response
		const concisePrompt = result.map((item) => ({
			user: item.description,
			assistant: item.promptresponse,
			meeting_type: item.tags.length
				? item.tags.map((i) => i.title).join(' ')
				: 'Not a meeting',
			createdAt: new Date(item.createdAt).toISOString(),
		}));

		// Convert the response to JSON and remove newline characters
		const jsonString = JSON.stringify(concisePrompt).replace(/\\n/g, '');

		return jsonString;
	} catch (error) {
		console.error(error);
		throw error;
	}
}

// ----- THREAD -----

// service that gets single assistant thread by id
export const getAssistantThreadsByQuery = async (query) => {
	const threads = await AssistantThread.find({
		...query,
	});

	return threads;
};

export const getAssistantThreadById = async (threadId) => {
	const thread = await AssistantThread.findById(threadId);

	return thread;
};

export const deleteOpenAiThreadById = async (threadId) => {
	const openai = 	await getOpenAIInstance();

	const response = await openai.beta.threads.del(threadId);
	if (response.deleted) {
		return true;
	} else {
		return false;
	}
};

export const retrieveAssistantFromOpenAI = async ( assistantId) => {
    try {
        const openai = 	await getOpenAIInstance();
        return await openai.beta.assistants.retrieve(assistantId);
    } catch (error) {
        if (error.status === 404) {
            return false;
        } else {
            throw error;
        }
    }
};

/**
 * @async
 * @function retrieveOpenAIFile
 * @description Fetches the content of the file from openai.
 * @param {string} file_id - The unique identifier of the file to retrieve.
 * @returns {Promise<Object>} A promise that resolves with the content of the file when the retrieval is successful.
 * @throws {Error} Throws an error if the file retrieval fails.
 */
export const retrieveOpenAIFile = async (file_id) => {
	const openai = await getOpenAIInstance();
	const file = await openai.files.content(file_id);
	return file;
};

/**
 * @async
 * @function retrieveOpenAIFileObject
 * @description retrieves a file from openAi using the specified file ID.
 * @param {string} fileId - The ID of the file to retrieve.
 * @returns {Promise<Object>} A promise that resolves with the file object when retrieval is successful.
 * @throws {Error} Will throw an error if the file object cannot be retrieved.
 */
export const retrieveOpenAIFileObject = async (fileId) => {
	const openai = 	await getOpenAIInstance();
  return openai.files.retrieve(fileId);
}


/**
 * Processes an assistant message by annotating text contents and handling image files.
 * @async
 * @function processAssistantMessage
 * @description processes each content item in an assistant message based on its type.
 * @param {Object} message - The message object to process, containing `content`, an array of message contents.
 * @returns {Promise<string>} A promise that resolves with the processed response as a string.
 * @throws {Error} Will throw an error if processing fails for any content item.
 */
export const processAssistantMessage = async (message) => {
	let processedResponse = '';
	const messageContentList = message.content;

	for(const msgContent of messageContentList) {
		switch (msgContent.type) {
			case 'text':
				processedResponse += await annotateMessageContent(msgContent.text);
				break;
			case 'image_file': 
				processedResponse = await processAssistantGeneratedImage(msgContent['image_file'].file_id) + processedResponse;
				break;
			default:
				break;
		}
	}

	return processedResponse;
}

/**
 * Converts an image file's binary data to a data URI and creates an image element string.
 * @async
 * @function processAssistantGeneratedImage
 * @description Asynchronously retrieves an image file using its file ID and converts it to a base64-encoded data URI.
 * @param {string} img_file_id - The ID of the image file to process.
 * @returns {Promise<string>} A promise that resolves with the HTML string of an image element.
 * @throws {Error} Will throw an error if the image file cannot be retrieved or processed.
 */
export const processAssistantGeneratedImage = async (img_file_id) => {
  const response = await retrieveOpenAIFile(img_file_id);
  // Extract the binary data from the Response object
  const image_data = await response.arrayBuffer();
  // Convert the binary data to a Buffer
  const image_data_buffer = Buffer.from(image_data);
  const base64Image = image_data_buffer.toString("base64");
  const dataUri = "data:image/jpeg;base64," + base64Image;
  const imgElement =
    '<img src="' + dataUri + '" />';

  return imgElement;
}; 


/**
 * Annotates message content with citations for text and links for files.
 * @async
 * @function annotateMessageContent
 * @description Asynchronously processes and annotates the message content with references to cited documents or file paths.
 * @param {Object} messageContent - Message content object which has annotations and is of type 'text'
 * @returns {Promise<string>} A promise that resolves with the message content including added text citations or download links.
 * @throws {Error} Will throw an error if the citations cannot be retrieved or processed.
 */
export const annotateMessageContent = async (messageContent) => {
  const annotations = messageContent.annotations || [];
  let citationPromises = [];

  annotations.forEach((annotation, index) => {
    messageContent.value = messageContent.value.replace(annotation.text, ` [${index}]`);

    if (annotation.file_citation) {
      const promise = retrieveOpenAIFileObject(annotation.file_citation.file_id)
        .then((citedFile) => {
          return `${index + 1}. ${annotation.file_citation.quote} from ${citedFile.filename}`;
        });
      
      citationPromises.push(promise);
    } else if (annotation.file_path) {
      const promise = retrieveOpenAIFileObject(annotation.file_path.file_id)
        .then((citedFile) => {
          // Include the citation in a div with a class
          return `<div class="citation-download-link">${index+1}. Click <a href="/assistants/download/${citedFile.id}">here</a> to download ${citedFile.filename}</div>`;
        });

      citationPromises.push(promise);
    }
  });

  const citations = await Promise.all(citationPromises);

	 // Only add the citations-container div if there are any citations
	 if (citations.length > 0) {
		messageContent.value += `\n<div class="citations-container">${citations.join('')}</div>`;
 }

  return messageContent.value;
}

export const softDeleteAssistant = async (existingAssistant) => {
    existingAssistant.is_deleted = true;
    await existingAssistant.save();
};

export const hardDeleteAssistant = async (assistantId, existingAssistant) => {
    try {
        const openai = 	await getOpenAIInstance();
        const openaiAssistant = await retrieveAssistantFromOpenAI( assistantId);
        if (openaiAssistant !== false) {
            await openai.beta.assistants.del(assistantId);
        }
        await existingAssistant.delete(); 
    } catch (error) {
        throw error;
    }
};
