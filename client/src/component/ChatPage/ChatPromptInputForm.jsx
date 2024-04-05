import React from 'react';
import { Select } from 'antd';
import SendIcon from '../Chat/SendIcon';
import { botOptions } from '../../constants/chatPageConstants';

const ChatPromptInputForm = ({ states, actions, refs }) => {
	const { selectedTags, tags, loading = false, inputPrompt } = states;
	const { promptInputRef } = refs;
	const {
		onSubmit,
		handleKeyDown,
		onInputPromptChange,
		handleSelectTags,
		setSelectedTags,
		setSelectedChatModel,
	} = actions;

	const tagOptions = tags?.map((tag) => ({
		value: tag._id,
		label: tag.title,
	}));

	const handleChange = (selectedValues) => {
		setSelectedChatModel(selectedValues);
		const updatedSelectedTags = tags.filter((tag) =>
			selectedValues.includes(tag._id)
		);
		setSelectedTags(updatedSelectedTags);
		handleSelectTags(updatedSelectedTags);
	};

	return (
		<form onSubmit={onSubmit}>
			<div className="inputPrompttTextarea-container">
				<textarea
					ref={promptInputRef}
					autoComplete="off"
					placeholder="Ask me anything ..."
					name="inputPrompt"
					id=""
					className="inputPrompttTextarea"
					type="text"
					rows="2"
					value={inputPrompt}
					onKeyDown={handleKeyDown}
					onChange={onInputPromptChange}
				/>

				<button
					disabled={loading}
					aria-label="form submit"
					id="input-button"
					className="CustomNewButton"
					type="submit"
				>
					<SendIcon />
				</button>

				<div
					style={{
						position: 'relative',
						bottom: '37px',
						display: 'flex',
						alignItems: 'center',
					}}
				>
					<Select
						style={{
							width: '200px',
						}}
						placeholder="Choose Bot"
						onChange={handleChange}
						options={botOptions}
						defaultValue={botOptions[0].value}
					/>

					<Select
						mode="tags"
						style={{
							width: 'auto',
							minWidth: '200px',
						}}
						placeholder="Choose tags"
						value={selectedTags.map((tag) => tag._id)}
						onChange={handleChange}
						options={tagOptions}
						notFoundContent={loading ? 'Loading...' : null}
					/>
				</div>
			</div>
			{/* <div className="note-text-for-chat">
				<p className="text-center">
					AI models can make mistakes. Consider checking important
					information.
				</p>
			</div> */}
		</form>
	);
};

export default ChatPromptInputForm;
