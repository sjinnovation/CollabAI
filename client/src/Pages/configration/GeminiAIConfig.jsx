import { useState, useEffect, useContext } from 'react';
import { getConfig, updateConfig } from '../../api/settings';
import { Input, Select, message, List, Modal, Slider, Button, Switch } from 'antd';
import "./style.css"
import ExpandableText from './ExpandableText';
import { ThemeContext } from '../../contexts/themeConfig';
import TextArea from 'antd/es/input/TextArea';
const { confirm } = Modal;
const { Option } = Select;

const GeminiAIConfig = ({ formState, setFormState, isEditing }) => {
	const { theme } = useContext(ThemeContext);
	const MAX_TOKENS = 8192;

	const renderSecretKey = () => {
		const key = formState?.geminiApiKey;
		if (key?.length > 3) {
			const firstThree = key?.slice(0, 3);
			const lastThree = key?.slice(-3);
			const middlePart = key?.slice(3, -3).replace(/./g, '*');
			return firstThree + middlePart + lastThree;
		} else {
			return key;
		}
	};

	const defaultValues = {
		geminiApiKey: '',
		geminiTemperature: 0,
		geminiModel: 'gemini-pro',
		geminiReasoningEffort: 'Medium',
		geminiTopK: 1,
		geminiTopP: 0,
		geminiMaxToken: 2048,
		geminiSystemInstruction: '',
		geminiContextLimit: 'All',
		geminiPromptCaching: false,
		geminiSafetyHarassment: 0,
		geminiSafetyHateSpeech: 0,
		geminiSafetySexuallyExplicit: 0,
		geminiSafetyDangerous: 0,
		geminiSafetyCivicIntegrity: 0
	};

	const geminiAiData = [
		{ title: 'API key', description: formState?.geminiApiKey || '' },
		{ title: 'Choose a Model', description: formState?.geminiModel || '' },
		{
			title: 'Reasoning Effort',
			description: formState?.geminiReasoningEffort || '',
			subtitle: "This setting constrains the effort on reasoning for reasoning models. Reducing the reasoning effort can lead to faster responses and fewer tokens used during reasoning in a response.",
		},
		{
			title: "System Instruction",
			description: formState?.geminiSystemInstruction || "",
			subtitle: "Enter the system prompt to guide Gemini's behavior (e.g., tone, style, or context)."
		},
		{
			title: "Context Limit",
			description: formState?.geminiContextLimit || "",
			sliderValue: formState?.geminiContextLimit,
			subtitle: "The number of messages to include in the context for the AI assistant. When set to 1, the AI assistant will only see and remember the most recent message."
		},
		{
			title: 'Temperature (0-2)',
			description: formState?.geminiTemperature || '',
			sliderValue: formState?.geminiTemperature,
			defaultValue: defaultValues.geminiTemperature,
			subtitle: "Higher values, like 0.8, will result in more random output, while lower values, such as 0.2, will yield results that are more focused and deterministic."
		},
		{
			title: 'Top P (0-1)',
			description: formState?.geminiTopP || '',
			sliderValue: formState?.geminiTopP,
			defaultValue: defaultValues.geminiTopP,
			subtitle: "This is an alternative to sampling with temperature, known as nucleus sampling. Here, the model considers tokens that comprise the top P probability mass. For example, a value of 0.1 implies that only the tokens making up the top 10% of probability mass are considered."
		},
		{
			title: 'Top K (1-100)',
			description: formState?.geminiTopK || '',
			sliderValue: formState?.geminiTopK,
			defaultValue: defaultValues.geminiTopK,
			subtitle: "This setting allows sampling only from the top K options for each subsequent token. It is used to eliminate \"long tail\" low-probability responses. The minimum value is 0."
		},
		{
			title: 'Max Token',
			description: formState?.geminiMaxToken || '',
			sliderValue: formState?.geminiMaxToken,
			defaultValue: defaultValues.geminiMaxToken,
			subtitle: "This indicates the maximum number of tokens to generate before the process stops."
		},
		{
			title: 'Safety Settings (Gemini Only)',
			subtitle: "Content is blocked based on the probability that it is harmful.",
			safetySettings: [
				{ title: 'Harassment', key: 'geminiSafetyHarassment' },
				{ title: 'Hate speech', key: 'geminiSafetyHateSpeech' },
				{ title: 'Sexually explicit', key: 'geminiSafetySexuallyExplicit' },
				{ title: 'Dangerous', key: 'geminiSafetyDangerous' },
				{ title: 'Civic integrity', key: 'geminiSafetyCivicIntegrity' },
			]
		},
		{
			title: "Prompt Caching",
			description: formState?.geminiPromptCaching || "",
			subtitle: "Prompt caching helps save token costs for long conversations."
		},
	];

	return (
		<div className="config-container">
			<List
				size="medium"
				className="custom-list"
				bordered
				dataSource={geminiAiData}
				renderItem={(item) => (
					<List.Item>
						<List.Item.Meta
							title={
								<span className="item-title">
									{item.title === "Prompt Caching" ? '' : (
										<>
											{item.title}
											{item.sliderValue ? (
												item.defaultValue === Number(item.sliderValue) ?
													<>: Default</>
													: <>: {item.sliderValue}</>
											) : null}
										</>
									)}
								</span>
							}
							description={
								item.title === 'API key' ? (
									isEditing ? (
										<Input
											type="password"
											value={formState?.geminiApiKey}
											onChange={(e) => setFormState({ ...formState, geminiApiKey: e.target.value })}
											className="field-width"
										/>
									) : renderSecretKey()
								) : item.title === 'Temperature (0-2)' ? (
									<div>
										<div className="text-container">
											<p>{item.subtitle}</p>
										</div>
										<Slider
											min={0}
											max={2}
											step={0.1}
											value={formState?.geminiTemperature || 0}
											onChange={(value) => setFormState({ ...formState, geminiTemperature: value })}
											disabled={!isEditing}
											className="field-width"
											marks={{
												0: { label: <strong className="slider-label-left">Precise</strong> },
												1: 'Neutral',
												2: 'Creative'
											}}
										/>
									</div>
								) : item.title === 'Reasoning Effort' ? (
									<>
										<div className="text-container">
											<p>{item.subtitle}</p>
										</div>
										<Select
											className='editConfigSelectField field-width'
											value={formState?.geminiReasoningEffort || 'Medium'}
											onChange={(value) => setFormState({ ...formState, geminiReasoningEffort: value })}
											disabled={true}
										>
											<Option value="Low">Low</Option>
											<Option value="Medium">Medium</Option>
											<Option value="High">High</Option>
										</Select>
									</>
								) : item.title === 'Choose a Model' ? (
									<Select
										className='editConfigSelectField field-width'
										name="geminiModel"
										disabled={!isEditing}
										value={formState?.geminiModel || ''}
										onChange={(e) => setFormState({ ...formState, geminiModel: e })}
									>
										<Option value="gemini-pro">Gemini-pro</Option>
									</Select>
								) : item.title === 'Top K (1-100)' ? (
									<div>
										<div className="text-container">
											<p>{item.subtitle}</p>
										</div>
										<Slider
											min={1}
											max={100}
											step={0.1}
											value={formState?.geminiTopK || 1}
											onChange={(value) =>
												setFormState({
													...formState,
													geminiTopK: value,
												})
											}
											disabled={!isEditing}
											className="field-width"
											marks={{
												1: { label: <strong className="slider-label-left">Focused</strong> },
												50: 'Balanced',
												100: 'Creative'
											}}
										/>
									</div>
								) : item.title === 'Top P (0-1)' ? (
									<div>
										<div className="text-container">
											<p>{item.subtitle}</p>
										</div>
										<Slider
											min={0}
											max={1}
											step={0.1}
											value={formState?.geminiTopP || 0}
											onChange={(value) =>
												setFormState({
													...formState,
													geminiTopP: value,
												})
											}
											disabled={!isEditing}
											className="field-width"
											marks={{
												0: { label: <strong className="slider-label-left">Precise</strong> },
												0.5: 'Balanced',
												1: 'Creative'
											}}
										/>
									</div>
								) : item.title === 'System Instruction' ? (
									<>
										<div className="text-container">
											<p>{item.subtitle}</p>
										</div>
										<TextArea
											rows={4}
											type="text"
											value={formState.geminiSystemInstruction}
											disabled={!isEditing}
											onChange={(e) =>
												setFormState({
												...formState,
												geminiSystemInstruction: e.target.value,
												})
											}
											className="field-width"
										/>
									</>
								) : item.title === 'Max Token' ? (
									<>
										<div className="text-container">
											<p>{item.subtitle}</p>
										</div>

										<Input
											type="number"
											min={0}
											max={MAX_TOKENS}
											value={formState?.geminiMaxToken || 0}
											onChange={(e) => {
												const value = Math.min(8192, Math.max(0, Number(e.target.value)));
												setFormState({
													...formState,
													geminiMaxToken: value,
												});
											}}
											disabled={!isEditing}
											className="field-width"
										/>
									</>
								) : item.title === 'Context Limit' ? (
									<>
										<div className="text-container">
											<p>{item.subtitle}</p>
										</div>

										<Select
											className="editConfigSelectField field-width"
											name="Context Limit"
											disabled={true}
											value={formState?.geminiContextLimit || ""}
											onChange={(value) => setFormState({ ...formState, geminiContextLimit: value })}
										>
											<Option value="All">All Previous Messages</Option>
											{[...Array(100)].map((_, index) => (
												<Option key={index + 1} value={index + 1}>
													Last {index + 1} message{index !== 0 ? 's' : ''}
												</Option>
											))}
										</Select>
									</>
								) : item.title === "Safety Settings (Gemini Only)" ? (
									<>
										<div className="text-container">
											<p>{item.subtitle}</p>
										</div>
										{item.safetySettings.map((setting) => (
											<div key={setting.key}>
												<p>{setting.title}</p>
												<Slider
													min={0}
													max={3}
													step={0.1}
													value={formState?.[setting.key] || 0}
													onChange={(value) =>
														setFormState({
															...formState,
															[setting.key]: value,
														})
													}
													disabled={true}
													className="field-width"
													marks={{
														0: { label: <strong className="slider-label-left">Block none</strong> },
														1: <strong>Block few</strong>,
														2: <strong>Block some</strong>,
														3: <strong className="slider-label-right">Block most</strong>,
													}}
												/>
											</div>
										))}
									</>
								) : item.title === 'Prompt Caching' ? (
									<>
										<div className="prompt-caching">
											<span className={`prompt-caching-title ${theme === "light" ? "light-theme" : "dark-theme"}`}>{item.title}</span>
											<Switch
												checked={formState?.geminiPromptCaching}
												onChange={(checked) => setFormState({ ...formState, geminiPromptCaching: checked })}
												disabled={true}
											/>
										</div>
										<div className="text-container">
											<p>{item.subtitle}</p>
										</div>
									</>
								) : (
									item.description
								)
							}
						/>
					</List.Item>
				)}
			/>
		</div>
	);
};

export default GeminiAIConfig;