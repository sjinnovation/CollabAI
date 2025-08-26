import { useState, useEffect } from 'react';
import { getConfig, updateConfig } from '../../api/settings';
import { Input, message, List, Slider, Button } from 'antd';
import "./style.css"
import ConfigurationHeader from '../../component/Configuration/ConfigurationHeader/ConfigurationHeader';


const UsersTokenConfig = () => {

	const [formState, setFormState] = useState({});
	const [isEditing, setIsEditing] = useState(false);

	const FIELD_WIDTH = '500px';

	const getConfigData = async () => {
		try {
			const response = await getConfig();
			if (response) {
				setFormState((prevState) => ({
					...prevState,
					tokens: response?.tokens
				}));
			}
		} catch (error) {
			message.error(error.message);
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


	const maxTokenData = [
		{
			title: 'Max Users Token',
			description: formState?.tokens || '',
			sliderValue: isEditing && <span>: {formState.tokens}</span>,
			subtitle: "Set a custom token limit for users. Once a user uses all their tokens, they won’t be able to generate any more responses until a Super Admin resets their limit or increases their token allowance."
		},

	];

	return (
		<div className="custom-list-max-token">
			<ConfigurationHeader title="AI Model Configuration" subHeading="Set and manage custom token limits for users. Control token usage and access to AI-generated responses."/>
			<div className="text-end">
				<Button
					onClick={handleUpdateClick}
					key="list-loadmore-edit"
				>
					{isEditing ? 'Update' : 'Edit'}
				</Button>
				{isEditing && (
					<Button
						onClick={() => setIsEditing(!isEditing)}
						key="list-loadmore-cancel"
						danger
						className="ms-2"
					>
						Cancel
					</Button>
				)}
			</div>
			<List
				header={<div className="list-header">Set Custom Max Token</div>}
				size="medium"
				className="custom-list"
				dataSource={maxTokenData}
				renderItem={(item) => (
					<List.Item>
						<List.Item.Meta
							title={<span className="item-title">{item.title}{item.sliderValue}</span>}
							description={
								item.title === 'Max Users Token' ? (
									<>
										<Input
											type="number"
											className="token-input"
											disabled={!isEditing}
											value={formState?.tokens || 0}
											onChange={(e) => {
												const newValue = Math.max(0, Number(e.target.value));
												setFormState(prevState => ({
													...prevState,
													tokens: newValue
												}))
											}}
										/>
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

export default UsersTokenConfig;
