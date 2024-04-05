import React from 'react';

// libraries
import { HiOutlineUpload } from 'react-icons/hi';
import { CgAttachment } from 'react-icons/cg';
import { MdDeleteOutline } from 'react-icons/md';

// components
import SendIcon from '../Chat/SendIcon';

// hooks & contexts

// services & helpers

// api

const AssistantChatInputPrompt = ({ states, actions, refs }) => {
	const {
		selectedFiles,
		isMessageFetching,
		isGeneratingResponse,
		isUploadingFile,
		hasFileAttachmentAccess,
		inputPrompt,
	} = states;
	const { fileInputRef } = refs;
	const {
		onSubmit,
		onFileUpload,
		handleKeyDown,
		setSelectedFiles,
		handleFileChange,
		handleFileRemove,
		onInputPromptChange,
	} = actions;

	return (
		<form onSubmit={onSubmit}>
			<div className="assistantInputPromptWrapper">
				{/* -----[START] CHAT BOX - SELECTED FILE LIST ----- */}
				{selectedFiles.length ? (
					<>
						<div className="assistantInputFilesContainer">
							{selectedFiles.map((file, index) => (
								<div key={index} className="assistantInputFile">
									<small className="text-truncate">
										{file.name}
									</small>
									<button
										onClick={(e) => {
											e.stopPropagation();
											handleFileRemove(file);
										}}
										disabled={isUploadingFile}
									>
										<MdDeleteOutline />
									</button>
								</div>
							))}
						</div>
					</>
				) : null}
				<div className="d-flex flex-column w-100">
					<textarea
						autoComplete="off"
						placeholder="Ask me anything ..."
						name="inputPrompt"
						id=""
						className="assistantInputPromptTextarea"
						type="text"
						rows="2"
						value={inputPrompt}
						disabled={isGeneratingResponse || isMessageFetching}
						onChange={onInputPromptChange}
						onKeyDown={handleKeyDown}
					></textarea>

					{/* -----[START] CHAT BOX - ATTACHMENT BUTTON ----- */}
					{
						<div className="p-2 d-flex align-items-center gap-2">
							{/* ----- files are selected, show file upload button ----- */}
							{selectedFiles?.length ? (
								<div className="d-flex align-items-center gap-2">
									{/* ----- file upload ----- */}
									<button
										className="assistantUploadButton px-2"
										onClick={onFileUpload}
									>
										{isUploadingFile ? (
											<div
												class="spinner-border spinner-border-sm me-1"
												role="status"
											>
												<span class="visually-hidden">
													Loading...
												</span>
											</div>
										) : (
											<HiOutlineUpload />
										)}
										<span>Upload Selected Files</span>
									</button>
									{/* ----- file delete ----- */}
									<button
										className="assistantUploadButton px-2 text-danger"
										onClick={(e) => {
											e.stopPropagation();
											setSelectedFiles([]);
										}}
										disabled={isUploadingFile}
									>
										<span>Clear All</span>
										<MdDeleteOutline />
									</button>
								</div>
							) : (
								<div>
									{/* ----- files are not selected, show attachment button here ----- */}
									<input
										type="file"
										accept="pdf/*"
										multiple
										style={{ display: 'none' }}
										onChange={handleFileChange}
										ref={fileInputRef}
									/>
									<button
										className="assistantUploadButton p-2"
										onClick={() =>
											fileInputRef.current.click()
										}
									>
										<CgAttachment />
									</button>
								</div>
							)}
						</div>
					}
				</div>
				<button
					aria-label="form submit"
					id="assistant-input-button"
					className="assistantCustomNewButton"
					type="submit"
				>
					<SendIcon />
				</button>
			</div>
		</form>
	);
};

export default AssistantChatInputPrompt;
