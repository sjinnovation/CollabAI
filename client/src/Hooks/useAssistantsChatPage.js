import React, { useContext, useEffect, useState } from 'react';

// libraries
import { useNavigate } from 'react-router-dom';

// hooks & contexts
import { AssistantContext } from '../contexts/AssistantContext';

// api
import {
	createChatPerAssistant,
	getAssistantChatsPerThread,
	getSingleAssistant,
	uploadFilesForAssistant,
} from '../api/assistant-chat-page-api';

// init constants
const initialChatMetaData = {
	has_more: false,
	first_id: false,
	last_id: false,
};

const useAssistantsChatPage = ({ assistant_id, thread_id }) => {
	// ----- STATES ----- //
	const [selectedFiles, setSelectedFiles] = useState([]);
	const [isUploadingFile, SetIsUploadingFile] = useState(false);
	const [inputPrompt, setInputPrompt] = useState('');
	const [chatLog, setChatLog] = useState([]);
	const [chatMetaData, setChatMetaData] = useState(initialChatMetaData);
	const [errorMessage, setErrorMessage] = useState(null);
	const [isFirstMessage, setIsFirstMessage] = useState(false);
	const [assistantData, setAssistantData] = useState(null);
	const [assistantAllInfo, setAssistantAllInfo] = useState(null);
	// loading states
	const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
	const [isMessageFetching, setIsMessageFetching] = useState(false);

	const navigate = useNavigate();
	const { setTriggerUpdateThreads } = useContext(AssistantContext);



	useEffect(() => {
		console.log('[MOUNT] assistants');
		if (thread_id && !isFirstMessage) {
			setChatLog([]);
			setChatMetaData(initialChatMetaData);
			handleFetchAssistantChats(false, false, thread_id);
		} else if (thread_id && isFirstMessage) {
			setIsFirstMessage(false);
		} else if (!thread_id) {
			setChatLog([]);
			setChatMetaData(initialChatMetaData);
			setIsFirstMessage(false);
		}
		handleFetchAssistantInfo(assistant_id);

		return () => {
			console.log('[UNMOUNT] assistants');
		};
	}, [thread_id]);


	// ----- HANDLE API CALLS ----- //
	const handleFetchAssistantChats = async (
		limit = false,
		after = false,
		threadId
	) => {
		if (!threadId) return;
		try {
			setIsMessageFetching(true);

			const asstArguments = {
				assistant_id,
				threadId,
				limit,
				after,
			};

			const response = await getAssistantChatsPerThread(asstArguments);

			if (response.messages) {
				setChatLog((prevChatLog) => {
					if (prevChatLog.length) {
						if (
							chatMetaData?.first_id !==
							response.metadata?.first_id
						) {
							return [...prevChatLog, ...response.messages];
						} else {
							return prevChatLog;
						}
					} else {
						return response.messages;
					}
				});
				setChatMetaData(response.metadata);
			}
		} catch (error) {
			console.log(
				'🚀 ~ file: Assistants.jsx:94 ~ handleFetchAssistantChats ~ error:',
				error
			);
		} finally {
			setIsMessageFetching(false);
		}
	};

	const handleFetchAssistantInfo = async (assistant_id) => {
		try {
			const response = await getSingleAssistant(assistant_id);
			setAssistantData(response?.assistant?.static_questions);
			setAssistantAllInfo(response?.assistant);
		} catch (error) {
			console.log(error);
		}
	};


	const handleCreateAssistantChat = async (event) => {
		try {
			event.preventDefault();

			if (isGeneratingResponse || inputPrompt.trim() === '') return;

			setIsGeneratingResponse(true);
			// setIsMessageFetching(true);

			const userPrompt = inputPrompt.trim();
			setInputPrompt('');
			prependToChatLog(userPrompt);

			const reqBody = { question: userPrompt };
			if (thread_id) reqBody.thread_id = thread_id;

	
		

				const { success, chat, message } = await createChatPerAssistant(
					assistant_id,
					reqBody
				);
				if (success) {
					chat.userPrompt = inputPrompt;
					appendBotResponseToChat(chat);
					if (!thread_id) handleFirstThreadMessage(chat);
					event.target.blur();
				} else {
					setErrorMessage(
						message ||
							'An unexpected error occurred. Please reload the page.'
					);
				}
			
		} catch (error) {
			console.error('Error in handleCreateAssistantChat:', error);
			setErrorMessage(
				'An error occurred while creating the response, please reload or try again.'
			);
		} finally {
			setIsGeneratingResponse(false);
			setIsMessageFetching(false);
		}
	};

	const prependToChatLog = (userPrompt) => {
		setChatLog([{ chatPrompt: userPrompt }, ...chatLog]);
	};

	const appendBotResponseToChat = (chat) => {
		const botResponse = {
			chatPrompt: chat.userPrompt,
			botMessage: chat.response,
			msgId: chat.msg_id,
		};
		setChatLog([botResponse, ...chatLog]);
	};

	const handleFirstThreadMessage = (chat) => {
		setIsFirstMessage(true);
		setTriggerUpdateThreads(true);
		navigate(`${chat.thread_id}`);
	};

	// [POST] - @desc: handles uploading files to the assistant
	const handleUploadFilesForAssistant = async (e) => {
		e.stopPropagation();
		if (!selectedFiles.length) return;
		try {
			SetIsUploadingFile(true);
			const formData = new FormData();
			selectedFiles.forEach((file) => {
				formData.append('files', file);
			});

			const response = await uploadFilesForAssistant(
				assistant_id,
				formData
			);

			setSelectedFiles([]);
			// toast("Files uploaded to the assistant successfully.");
		} catch (error) {
			console.error('Error uploading files:', error.message);
			// toast(error.message
		} finally {
			SetIsUploadingFile(false);
		}
	};

	return {
		// STATES,
		chatLog,
		chatMetaData,
		assistantData,
		selectedFiles,
		inputPrompt,
		assistantAllInfo,
		// BOOLEANS
		isMessageFetching,
		isFirstMessage,
		isGeneratingResponse,
		isUploadingFile,
		errorMessage,
		// SETTERS,
		setErrorMessage,
		setChatLog,
		setChatMetaData,
		setAssistantData,
		setSelectedFiles,
		SetIsUploadingFile,
		setInputPrompt,
		// API CALLS,
		handleFetchAssistantChats,
		handleFetchAssistantInfo,
		handleCreateAssistantChat,
		handleUploadFilesForAssistant,
		// HANDLERS,
	};
};

export default useAssistantsChatPage;
