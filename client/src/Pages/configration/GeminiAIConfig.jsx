import { useState, useEffect } from 'react';
import { getConfig, updateConfig } from '../../api/settings';
import { Input, Select, message, List, Modal } from 'antd';
const { confirm } = Modal;
const { Option } = Select;

const GeminiAIConfig = () => {
	
	const [formState, setFormState] = useState({});
	const [isEditing, setIsEditing] = useState(false);

	const getConfigData = async () => {
		try {
			const response = await getConfig();
			if (response) {
				setFormState((prevState) => ({
					...prevState,
					geminiApiKey: response.geminiApiKey,
					geminiTemperature: response.geminiTemperature,
					geminiModel: response.geminiModel,
				}));
			}
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		getConfigData();
	}, []);

	const handleUpdateClick = async () => {
		setIsEditing(!isEditing);
		if (isEditing) {
			const response = await updateConfig(formState);
			if (response) {
				message.success(response.message);
                getConfigData();
			} else {
				message.error(response.message);
			}
		}
	};

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

	const geminiAiData = [
		{
			title: 'GeminiAI API key',
			description: formState?.geminiApiKey || '',
		},
		{
			title: 'GeminiAITemperature (between 0 and 1)',
			description: formState?.geminiTemperature || '',
		},
		{ title: 'GeminiModel', description: formState?.geminiModel || '' },
	];

	return (
		<>
			<List
				header={<div>Change Settings</div>}
				size="small"
				bordered
				dataSource={geminiAiData}
				renderItem={(item) => (
					<List.Item>
						<List.Item.Meta
							title={item.title}
							description={
								isEditing ? (
									item.title == 'GeminiAI API key' ? (
										<Input
											type="password"
											value={formState.geminiApiKey}
											onChange={(e) =>
												setFormState({
													...formState,
													geminiApiKey:
														e.target.value,
												})
											}
										/>
									) : item.title ==
									  'GeminiAITemperature (between 0 and 1)' ? (
										<Input
											placeholder="Set Temperature"
											type="number"
											name="geminiTemperature"
											value={
												formState.geminiTemperature ||
												''
											}
											min={0}
											max={1}
											step={0.1}
											onChange={(e) =>
												setFormState({
													...formState,
													geminiTemperature:
														e.target.value,
												})
											}
										/>
									) : item.title == 'GeminiModel' ? (
										<Select
											style={{ width: '290px' }}
											name="geminiModel"
											value={formState?.geminiModel || ''}
											onChange={(e) =>
												setFormState({
													...formState,
													geminiModel: e,
												})
											}
										>
											<Option value="gemini-pro">
												Gemini-pro
											</Option>
											{/* <Option value="gpt-4">GPT-4</Option> */}
										</Select>
									) : null
								) : item.title == 'GeminiAI API key' ? (
									renderSecretKey()
								) : (
									item.description
								)
							}
						/>
					</List.Item>
				)}
			/>
			<div className="text-end">
				<a
					onClick={handleUpdateClick}
					key="list-loadmore-edit"
					className="btn btn-outline-dark"
				>
					{isEditing ? 'update' : 'edit'}
				</a>
				{isEditing && (
					<a
						onClick={() => setIsEditing(!isEditing)}
						key="list-loadmore-cancel"
						class="btn btn-outline-dark"
					>
						cancel
					</a>
				)}
			</div>
		</>
	);
};

export default GeminiAIConfig;
