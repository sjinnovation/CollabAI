import { useState, useEffect } from 'react';
import { getConfig, updateConfig } from '../../api/settings';
import { Input, message, List } from 'antd';


const UsersTokenConfig = () => {

	const [formState, setFormState] = useState({});
	const [isEditing, setIsEditing] = useState(false);

	const getConfigData = async () => {
		try {
			const response = await getConfig();
			if (response) {
				setFormState((prevState) => ({
					...prevState,
                    tokens:response?.tokens
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


	const maxTokenData = [
		{
			title: 'Max Users Token',
			description: formState?.tokens || '',
		},

	];

	return (
		<>
			<List
				header={<div>Change Settings</div>}
				size="medium"
				bordered
				dataSource={maxTokenData}
				renderItem={(item) => (
					<List.Item>
						<List.Item.Meta
							title={item.title}
							description={
								isEditing ? (
									 item.title ==
									  'Max Users Token' ? (
										<Input
											placeholder="Set Max Token "
											type="number"
											name="tokens"
											className="editConfigInputField"
											value={
												formState.tokens ||
												''
											}
											min={0}
											max={8000}
											step={10}
											onChange={(e) =>
												setFormState({
													...formState,
													tokens:
														e.target.value,
												})
											}
										/>
									)  : null
								)  : (
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

export default UsersTokenConfig;
