import { useState, useEffect } from 'react';
import { getConfig, updateConfig } from '../../api/settings';
import { Input, message, List, Button, notification } from 'antd';
import '../../component/huggingfacecomp/huggingfaceconfig.css';
import { HfMessages } from '../../constants/huggingfaceConstants';
const HuggingfacetokenConfig = () => {
	const [formState, setFormState] = useState({});
	const [isEditing, setIsEditing] = useState(false);

	const FIELD_WIDTH = '500px';

	const getConfigData = async () => {
		try {
			const response = await getConfig();
			if (response) {
				setFormState((prevState) => ({
					...prevState,
					huggingfacetokenKey: response.huggingfacetokenKey,
				}));
			}
		} catch (error) {
			notification.error({
				message: error.message,
			  });

		}
	};

	useEffect(() => {
		getConfigData();
	}, []);

	const handleUpdateClick = async () => {
		setIsEditing(!isEditing);
		if (isEditing) {
			try {
				const response = await updateConfig(formState);
				if (response && response.message) {
					message.success(response.message);
					getConfigData();
				} else {
					message.error(HfMessages.HF_TOKEN_UPDATE_FAILED);
				}
			} catch (error) {
				message.error(HfMessages.HF_TOKEN_UPDATE_ERROR);
			}
		}
	};
	

	const renderSecretKey = () => {
		const key = formState?.huggingfacetokenKey;
		if (key?.length > 3) {
			const firstThree = key?.slice(0, 3);
			const lastThree = key?.slice(-3);
			const middlePart = key?.slice(3, -3).replace(/./g, '*');
			return firstThree + middlePart + lastThree;
		} else {
			return key;
		}
	};

	const HuggingFaceData = [
		{ title: 'Token Key', description: formState?.huggingfacetokenKey || '' },
	];

	return (
		<div className="config-container">
			<div className="text-end text-start-small" style={{width: FIELD_WIDTH}}>
				<Button
					onClick={handleUpdateClick}
					color="primary"
					variant="solid"
					className='token-button'
				>
					{isEditing ? "Update" : "Edit"}
				</Button>
				{isEditing && (
					<Button
						onClick={() => setIsEditing(false)}
						color="danger"
						variant="solid"
					>
						Cancel
					</Button>
				)}
			</div>
			<List
                className="custom-list"
                size="small"
                bordered
                dataSource={HuggingFaceData}
                renderItem={(item) => (
                    <List.Item>
                        <List.Item.Meta
                            title={<span className="item-title">{item.title}</span>}
                            description={
                                item.title === 'Token Key' ? (
                                    isEditing ? (
                                        <Input
                                            type="password"
                                            value={formState.huggingfacetokenKey}
                                            onChange={(e) => setFormState({ ...formState, huggingfacetokenKey: e.target.value })}
                                            className="field-width"
                                        />
                                    ) : (
                                        renderSecretKey()
                                    )
                                ) : null
                            }
                        />
                    </List.Item>
                )}
            />
		</div>
	);
};

export default HuggingfacetokenConfig;