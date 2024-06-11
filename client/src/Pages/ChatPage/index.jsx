import React, { useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Select, Typography } from 'antd';

// libraries
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowDown } from 'react-icons/fa';

import { message } from 'antd';

// components
import ChatSkeleton from '../../component/Chat/ChatSkeleton';
import PromptTemplatesIntro from '../../component/ChatPage/PromptTemplatesIntro';
import ChatPromptInputForm from '../../component/ChatPage/ChatPromptInputForm';
import MessageContainer from '../../component/Chat/MessageContainer';

// hooks & contexts
import useChatPage from '../../Hooks/useChatPage';
import { PromptTemplateContext } from '../../contexts/PromptTemplateContext';
import { SidebarContext } from '../../contexts/SidebarContext';

// services & helpers
import {
	generateThreadId,
	getIdsFromItems,
	getItemsFromIds,
	inputElementAutoGrow,
	scrollToBottomForRefElement,
} from '../../Utility/chat-page-helper';
import { getGptResponse } from '../../api/chat-page-api';
import useSocket from '../../Hooks/useSocket';
import { CHAT_EVENTS } from '../../constants/sockets/chat';

// api

const ChatPage = () => {
	// ----- STATES ----- //
	const [selectedTags, setSelectedTags] = useState([]);
	const [inputPrompt, setInputPrompt] = useState('');
	const [selectedChatModel, setSelectedChatModel] = useState('openai');
	const [showScrollToBottomButton, setShowScrollToBottomButton] =
		useState(true);
	const [showPromptDropdown, setShowPromptDropdown] = useState(false);

	// ----- REFS ----- //
	const chatLogWrapperRef = useRef(null);
	const promptInputRef = useRef(null);
	const cancelTokenSourceRef = useRef();
	const timeOutIds = [];

	// ----- HOOK & CONTEXT VARIABLES ----- //
	const { currentPromptTemplate } = useContext(PromptTemplateContext);
	const {
		chatLog,
		templateCategories,
		tagList,
		errorMessage,
		isFetchingChatLog,
		isFirstMessage,
		isGeneratingResponse,
		setChatLog,
		setErrorMessage,
		setIsFirstMessage,
		setIsGeneratingResponse,
		fetchChatLogPerThread,
		fetchTagList,
		fetchTemplates,
		updateLastPrompt
	} = useChatPage();

	const { thread_id } = useParams();
	const navigate = useNavigate();
	const { setTriggerNavContent } = useContext(SidebarContext);
	// Get a ref to the socket instance
	const chatSocketRef = useSocket(CHAT_EVENTS.CHAT_NAMESPACE);


	//----- Edit last Prompt --------// 
	const emitUpdateLastPrompt = async (payload, promptId, newPrompt) => {
		const payloadData = {
			...payload,
			chatLog
		}
        
        const chatSocket = chatSocketRef.current;
		
        if (chatSocket) {
			chatSocket.emit(CHAT_EVENTS.EDIT_LAST_CHAT, payloadData);
		} else {
			const { success, data } = await updateLastPrompt(promptId, newPrompt)

			if (success) {
				onChatEditedEvent({
					...payload,
					success,
					promptResponse: data?.promptResponse,
					isCompleted: true,
					promptId: data.promptId
				});

			} else {
				// console.log("An unexpected error occurred. Please reload the page.")
				setErrorMessage("An unexpected error occurred. Please reload the page.");
			}

		}
	};

	const onChatEditedEvent = (response) => {
		const {
			success,
			message,
			userPrompt,
			promptResponse,
			botProvider,
			promptId,
			threadId,
			isCompleted,
			chatLog
		} = response;
		

		if (success) {
			setChatLog(prevChatLog => {
				const index = prevChatLog.findIndex(chat => chat.promptId === promptId);
				if (index !== -1) {
					const newChatLog = [...prevChatLog];
					newChatLog[index] = {
						...newChatLog[index],
						chatPrompt: userPrompt,
						botMessage: promptResponse
					};
					return newChatLog;
				}
				// If the message is not found, just return the previous chat log
				return prevChatLog;
			})
		}
	};

	// ----- SIDE EFFECTS ----- //

	useEffect(() => {
		if (thread_id && !isFirstMessage) {
			console.log(
				'not first message and thread_id exists -> empty chat-log and fetch new chat-log'
			);
			// not first message and thread_id exists -> empty chat-log and fetch new chat-log
			setChatLog([]);
			fetchChatLogPerThread(thread_id);
		} else if (thread_id && isFirstMessage) {
			console.log(
				'is first message -> no need to fetch chat-log, thread_id has been added to url'
			);
			// is first message -> no need to fetch chat-log, thread_id has been added to url
			setIsFirstMessage(false);
		} else if (!thread_id) {
			console.log(
				'new thread created exception -> empty chat-log and set isFirstMessage to false'
			);
			// new thread created exception -> empty chat-log and set isFirstMessage to false
			setChatLog([]);
			setIsFirstMessage(false);
		}

		// setting prompt input in focus
		if (promptInputRef.current) {
			promptInputRef.current.focus();
		}
	}, [thread_id]);

	useEffect(() => {
		const scrollableDiv = chatLogWrapperRef.current;
		if (scrollableDiv) {
			scrollableDiv.addEventListener(
				'scroll',
				handleScrollToBottomButton
			);
		}

		return () => {
			if (scrollableDiv) {
				scrollableDiv.removeEventListener(
					'scroll',
					handleScrollToBottomButton
				);
			}
		};
	}, [chatLogWrapperRef.current]);

	useEffect(() => {
		fetchTagList();
		fetchTemplates();

		if (promptInputRef.current) {
			inputElementAutoGrow(promptInputRef.current);
		}

		return () => {
			if (timeOutIds.length) {
				timeOutIds.forEach((id) => clearTimeout(id));
			}
		};
	}, []);

	useEffect(() => {
		if (currentPromptTemplate) {
			setInputPrompt(currentPromptTemplate);
		}
	}, [currentPromptTemplate]);

	useEffect(() => {
		inputElementAutoGrow(promptInputRef.current);
	}, [inputPrompt]);

	// [SOCKET] - setting listener for sockets
	useEffect(() => {
		const bindSocketEvents = () => {
			const chatSocket = chatSocketRef.current;
			chatSocket?.on(CHAT_EVENTS.CREATED_CHAT, onChatCreatedEvent);
			chatSocket?.on(CHAT_EVENTS.EDITED_PROMPT, onChatEditedEvent)
		};

		const unbindSocketEvents = () => {
			const chatSocket = chatSocketRef.current;
			chatSocket?.off(CHAT_EVENTS.CREATED_CHAT, onChatCreatedEvent);
			chatSocket?.off(CHAT_EVENTS.EDITED_PROMPT, onChatEditedEvent);
		};

		bindSocketEvents();
		return unbindSocketEvents;
	}, [chatSocketRef.current]);




	const onChatCreatedEvent = (response) => {
		const {
			tags,
			success,
			message,
			userPrompt,
			promptResponse,
			msg_id,
			threadId,
			botProvider,
			chatLog,
			isFistThreadMessage,
			isCompleted,
			promptId
		} = response;
		
		if (success) {
			let tagsList = [];
			if (tags.length) {
				tagsList = getItemsFromIds(tagList, tags);
			}

			setChatLog([
				...chatLog,
				{
					chatPrompt: userPrompt,
					botMessage: promptResponse,
					tags: tagsList,
					msg_id,
					botProvider,
					promptId
				},
			]);
			// scroll to bottom
			scrollToBottomForRefElement(chatLogWrapperRef);
		} else {
            setIsGeneratingResponse(false)
			return setErrorMessage(message);
		}
		// if user is making the first message in the thread -> trigger update threads in the sidebar
		if (isFistThreadMessage && isCompleted) {
			handleNewThreadException(threadId);
		}

		// after the whole chat completion is done, reset the generating response state
		isCompleted && setIsGeneratingResponse(false);
	};

	const handleNewThreadException = (threadId) => {
		console.log('[HELPER LOG] navigating to new route', threadId);
		setIsFirstMessage(true);

		const timeoutId = setTimeout(() => {
			// will navigate only if url is not already set with thread_id
			if(!thread_id) {
				navigate(`${threadId}`, {
					preventScrollReset: true,
					replace: false,
				});
			}
			setTriggerNavContent((state) => state + 1);
		}, 1000);
		timeOutIds.push(timeoutId);
	};

	// ----- HANDLE API CALLS ----- //
	/**
	 * Handles the submission of a prompt in the chat page.
	 *
	 * @param {Event} e - The event object.
	 * @param {boolean} [prompt=null] - If `true`, the `prompt` parameter is used as the main user prompt. Otherwise, the `inputPrompt` state is considered.
	 * @returns {Promise<void>} - A promise that resolves when the submission is handled.
	 */
	const handlePromptSubmit = async (e, prompt=null) => {
		e?.preventDefault();
		if (isGeneratingResponse) return;

		try {
			scrollToBottomForRefElement(chatLogWrapperRef);
			setErrorMessage(null);
			setIsGeneratingResponse(true);

			const tagIds = getIdsFromItems(selectedTags);
			setSelectedTags([]);
			const threadId = thread_id ? thread_id : generateThreadId();
			let isFistThreadMessage = thread_id ? false : true;

			if (inputPrompt.trim() !== '') {
				const msgId = new Date().toISOString();
				let userInputtedPrompt = prompt ?? inputPrompt;
				
				setChatLog([...chatLog, { chatPrompt: userInputtedPrompt, msgId, 	botProvider: selectedChatModel }]);

				setInputPrompt('');
				promptInputRef.current.style.height = '51px';

				const compid = localStorage.getItem('compId');
				const body = {
					threadId,
					// userPrompt: temp,
					botProvider: selectedChatModel,
					userPrompt: userInputtedPrompt,
					temp: userInputtedPrompt,
					chatLog,
					compId: compid,
					tags: tagIds,
					msg_id: msgId,
					isFistThreadMessage,
				};


				// Access the chat namespace socket if needed
				const chatSocket = chatSocketRef.current;
				if (chatSocket) {
					chatSocket.emit(CHAT_EVENTS.CREATE_CHAT, body);
				} else {
					const { success, promptResponse, message, promptId } =
						await getGptResponse(
							body,
							cancelTokenSourceRef.current
						);
 
					if (success) {
						onChatCreatedEvent({
							...body,
							success,
							promptResponse,
							isCompleted: true,
							promptId
						});
					} else {
						setIsGeneratingResponse(false);
						return setErrorMessage(message);
					}
				}
			}
		} catch (error) {
			setIsGeneratingResponse(false);
			setErrorMessage(
				error?.response?.data?.message ||
				error?.response?.message ||
				'Something went wrong, please reload!'
			);
		}
	};

	// ----- LOCAL HANDLERS ----- //
	const handleStopGeneratingButton = async () => {
		if (cancelTokenSourceRef.current) {
			cancelTokenSourceRef.current.cancel(
				'Canceled.!! Ask a new question.'
			);
		}
		setIsGeneratingResponse(false);
	};

	const handleSelectTags = (selectedTags) => {
		setSelectedTags(selectedTags);
	};

	const handleScrollToBottomButton = () => {
		const scrollableDiv = chatLogWrapperRef.current;

		if (scrollableDiv) {
			const isScrolledUp = scrollableDiv.scrollTop >= 0;
			const isAtBottom =
				scrollableDiv.scrollTop + scrollableDiv.clientHeight >=
				scrollableDiv.scrollHeight - 1;

			setShowScrollToBottomButton(isScrolledUp && !isAtBottom);
		}
	};

	return (
		<section className="chat-box">
			<Typography.Title level={5} className="floating-title py-2 px-3 rounded">
				Multi-provider AI Chat
			</Typography.Title>
			{/* chatLogWrapper */}
			<div className="chat-list-container" ref={chatLogWrapperRef}>
				{/* if chats loading, show skeleton */}
				{isFetchingChatLog ? (
					<ChatSkeleton />
				) : (
					<>
						{chatLog.length === 0 ? (
							<>
								{/* ----- TEMPLATE LIST ----- */}
								<PromptTemplatesIntro
									templateCategories={templateCategories}
									setInputPrompt={setInputPrompt}
								/>
							</>
						) : (
							<>
								{/* ----- CHAT LIST ----- */}
								{chatLog.map((chat, idx) => (
									<MessageContainer
										key={chat.msg_id || idx}
										states={{
											chat,
											idx,
											loading: isGeneratingResponse,
											error: errorMessage,
											editProps: {
												emitUpdateLastPrompt,
												isLastItem: idx === chatLog.length - 1,
											}
										}}
									/>
								))}
								{showScrollToBottomButton && (
									<button
										onClick={() =>
											scrollToBottomForRefElement(chatLogWrapperRef)
										}
										className="GptScrollUpButton"
									>
										<FaArrowDown />
									</button>
								)}
							</>
						)}
					</>
				)}
			</div>

      {/* ----- CHAT INPUT -----  */}
      <ChatPromptInputForm
        states={{
          selectedTags,
          tags: tagList,
          loading: isGeneratingResponse,
          inputPrompt,
					showPromptDropdown
        }}
        refs={{ promptInputRef }}
        actions={{
          onSubmit: handlePromptSubmit,
          handleStopGeneratingButton,
          handleSelectTags,
          setSelectedTags,
          setSelectedChatModel,
					setInputPrompt,
					setShowPromptDropdown
        }}
      />
    </section>
  );
};

export default ChatPage;
