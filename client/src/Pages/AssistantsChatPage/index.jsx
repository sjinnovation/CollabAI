// AssistantsChatPage.jsx
import React, { useEffect, useRef, useState, useMemo } from 'react';

// libraries
import { useParams } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';
import { FaArrowDown } from 'react-icons/fa';

// components
import Loading from '../../component/common/Loading';
import ChatSkeleton from '../../component/Chat/ChatSkeleton';
import AssistantChatInputPrompt from '../../component/AssistantsChatPage/AssistantChatInputPrompt';
import MessageContainer from '../../component/Chat/MessageContainer';

// hooks & contexts
import useAssistantsChatPage from '../../Hooks/useAssistantsChatPage';

// services & helpers
import { getUserRole } from '../../Utility/service';
import ConversationStarter from './ConversationStarter';
import AssistantInfo from './AssistantInfo';

// api

const AssistantsChatPage = () => {
	const { assistant_id, assistant_name, thread_id } = useParams();

	// ----- STATES ----- //
	const [showScrollToBottomButton, setShowScrollToBottomButton] =
		useState(false);

	// ----- REFS ----- //
	const fileInputRef = useRef(null);
	const chatLogWrapperRef = useRef(null);

	// ----- HOOK & CONTEXT VARIABLES ----- //
	const {
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
	} = useAssistantsChatPage({ assistant_id, thread_id });

	// ---------- constants ---------
	const userRole = getUserRole();

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

	// ----- SIDE EFFECTS ----- //

	const chatLogMemo = useMemo(() => [...chatLog], [chatLog]);

	// local logics
	const handleFileChange = (e) => {
		e.stopPropagation();
		const files = e.target.files;
		const newFiles = Array.from(files);
		setSelectedFiles([...newFiles]);
	};

	const handleFileRemove = (file) => {
		setSelectedFiles((prevFiles) =>
			prevFiles.filter((f) => f.name !== file.name)
		);
	};

	const handleKeyDown = (e) => {
		if (e.key === 'Enter' && e.shiftKey) {
			e.preventDefault();
			return setInputPrompt((prevText) => prevText + '\n');
		}
		if (e.key === 'Enter') {
			e.preventDefault();
			handleCreateAssistantChat(e);
		}
	};

	// ----- LOCAL HANDLERS ----- //
	const handleInputPromptChange = (event) => {
		setInputPrompt(event.target.value);
	};

	const scrollToBottom = () => {
		if (chatLogWrapperRef.current) {
			chatLogWrapperRef.current.scrollTo({
				top: chatLogWrapperRef.current.scrollHeight,
				behavior: 'smooth',
			});
		}
	};

	const handleSelectStarter = (starter) => {
		setInputPrompt(starter);
	};

	const handleScrollToBottomButton = () => {
		const scrollableDiv = chatLogWrapperRef.current;

		if (scrollableDiv) {
			const isScrolledUp = scrollableDiv.scrollTop < 0;
			const isAtBottom = scrollableDiv.scrollTop === 0;

			setShowScrollToBottomButton(isScrolledUp && !isAtBottom);
		}
	};

	// determines access scope for attachments
	const hasFileAttachmentAccess = userRole === 'superadmin' ? true : false;

	let isChatLogEmpty = chatLog.length === 0 ? true : false;

	return (
		<>
			<section className="assistantChatBox d-flex flex-column justify-content-between">
				{/* -----[START] CHAT BOX - ALL PROMPTS ----- */}
				{isMessageFetching ? (
					<ChatSkeleton />
				) : (
					<div
						id="assistantScrollableDiv"
						key="assistantScrollableDiv"
						ref={chatLogWrapperRef}
					>
						<InfiniteScroll
							dataLength={chatLogMemo.length}
							next={() => {
								handleFetchAssistantChats(
									false,
									chatMetaData?.last_id,
									thread_id
								);
							}}
							style={{
								display: 'flex',
								flexDirection: 'column-reverse',
							}} //To put endMessage and loader to the top.
							inverse={true} //
							hasMore={chatMetaData?.has_more}
							loader={<Loading />}
							scrollableTarget="assistantScrollableDiv"
						>
							{chatLogMemo.length > 0 &&
								chatLogMemo.map((chat, idx) => (
									<MessageContainer
										key={idx}
										states={{
											chat,
											idx,
											loading: isGeneratingResponse,
											error: errorMessage,
										}}
									/>
								))}
							{showScrollToBottomButton && (
								<button
									onClick={scrollToBottom}
									className="AssistantScrollUpButton"
								>
									<FaArrowDown />
								</button>
							)}
						</InfiniteScroll>
					</div>
				)}
				{/* -----[END] CHAT BOX - ALL PROMPTS ----- */}
				{isChatLogEmpty ? (
					<AssistantInfo
						dataProps={{
							assistantAllInfo,
							assistant_name,
							assistant_id,
						}}
					/>
				) : null}
				{isChatLogEmpty ? (
					<ConversationStarter
						states={{
							assistant_id,
							StarterQuestions: assistantData,
							handleSelectStarter,
						}}
					/>
				) : null}
				{/* -----[START] CHAT BOX - SUBMIT INPUT ----- */}
				<AssistantChatInputPrompt
					states={{
						selectedFiles,
						isUploadingFile,
						isMessageFetching,
						isGeneratingResponse,
						hasFileAttachmentAccess,
						inputPrompt,
					}}
					refs={{ fileInputRef }}
					actions={{
						onSubmit: handleCreateAssistantChat,
						onFileUpload: handleUploadFilesForAssistant,
						handleKeyDown,
						setSelectedFiles,
						handleFileRemove,
						handleFileChange,
						onInputPromptChange: handleInputPromptChange,
					}}
				/>
				{/* -----[END] CHAT BOX - SUBMIT INPUT ----- */}
			</section>
		</>
	);
};

export default React.memo(AssistantsChatPage);
