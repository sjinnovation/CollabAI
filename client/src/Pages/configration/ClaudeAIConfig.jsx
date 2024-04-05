import { useState, useEffect } from 'react';
import { getConfig, updateConfig } from '../../api/settings';
import { Input, Select, message, List } from 'antd';
const { Option } = Select;

const ClaudeAIConfig = () => {;
	const [formState, setFormState] = useState({});
	const [isEditing, setIsEditing] = useState(false);

	const getConfigData = async () => {
		try {
			const response = await getConfig();
			if (response) {
				setFormState((prevState) => ({
					...prevState,
					claudeApiKey: response.claudeApiKey,
					claudeTemperature: response.claudeTemperature,
					claudeModel: response.claudeModel,
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
		const key = formState?.claudeApiKey;
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
			title: 'ClaudeAI API key',
			description: formState?.claudeApiKey || '',
		},
		{
			title: 'ClaudeAiTemperature (between 0 and 1)',
			description: formState?.claudeTemperature || '',
		},
		{ title: 'ClaudeModel', description: formState?.claudeModel || '' },
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
									item.title == 'ClaudeAI API key' ? (
										<Input
											type="password"
											value={formState.claudeApiKey}
											onChange={(e) =>
												setFormState({
													...formState,
													claudeApiKey:
														e.target.value,
												})
											}
										/>
									) : item.title ==
									  'ClaudeAiTemperature (between 0 and 1)' ? (
										<Input
											placeholder="Set Temperature"
											type="number"
											name="claudeTemperature"
											value={
												formState.claudeTemperature ||
												''
											}
											min={0}
											max={1}
											step={0.1}
											onChange={(e) =>
												setFormState({
													...formState,
													claudeTemperature:
														e.target.value,
												})
											}
										/>
									) : item.title == 'ClaudeModel' ? (
										<Select
											style={{ width: '290px' }}
											name="claudeModel"
											value={formState?.claudeModel || ''}
											onChange={(e) =>
												setFormState({
													...formState,
													claudeModel: e,
												})
											}
										>
											<Option value="claude-3-opus-20240229">
												claude-3-opus-20240229
											</Option>
											<Option value="claude-3-sonnet-20240229">
												claude-3-sonnet-20240229
											</Option>
											<Option value=" claude-3-haiku-20240307">
												{' '}
												claude-3-haiku-20240307
											</Option>
										</Select>
									) : null
								) : item.title == 'ClaudeAI API key' ? (
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

export default ClaudeAIConfig;
