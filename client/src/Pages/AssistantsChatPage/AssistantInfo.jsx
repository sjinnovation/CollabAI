import { Typography, Avatar, Modal } from 'antd';
import { useEffect, useState } from 'react';
import { getSingleAssistant } from '../../api/assistantChatPageApi';
import AssistantIcon from '../../component/common/AssistantIcon';

const { Title } = Typography;

const AssistantInfo = ({ dataProps }) => {
    const { assistantAllInfo, assistant_id } = dataProps;
    const [assistantData, setAssistantData] = useState({});
    const [isModalVisible, setIsModalVisible] = useState(false); 
    const maxWords = 50;

    const fetchAssistantData = async () => {
        const response = await getSingleAssistant(assistant_id);
        setAssistantData(response?.assistant);
    };

    useEffect(() => {
        fetchAssistantData();
    }, [assistant_id]);

    const descriptionWords = assistantData?.description
        ? assistantData.description.split(" ")
        : [];

    const truncatedDescription =
        descriptionWords.slice(0, maxWords).join(" ") +
        (descriptionWords.length > maxWords ? "..." : "");

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    return (
        <div>
            <div className="assistant-info-container-on-chat-page">
                <div className="assistant-img">
                    <div>
                        {assistantData?.image_url ? (
                            <Avatar
                                size={56}
                                src={assistantData.image_url}
                                className="mb-2"
                            />
                        ) : (
                            <AssistantIcon />
                        )}
                    </div>
                </div>
                <Title level={4}>{assistantData?.name}</Title>

                <div className="assistant-creator-container">
                    <p className="assistant-creator">
                        By {assistantData?.userId?.fname} {assistantData?.userId?.lname}
                    </p>
                </div>
                <div className="assistant-description">
                    <p>
                        {truncatedDescription}
                        {descriptionWords.length > maxWords && (
                            <span
                                onClick={showModal}
                                style={{
                                    cursor: "pointer",
                                    marginLeft: '5px',
                                    textAlign:'center',
                                }}
                            >
                                <div style={{fontWeight:"700"}}>See more. . .</div>
                            </span>
                        )}
                    </p>
                </div>
            </div>

            <Modal
            className='agent-modal'
                title="Agent Description"
                style={{
                    textAlign:'center',
                    height:"400px"
                }}
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={null}
            >
                <div className='assistant-description p'>{assistantData.description}</div>
            </Modal>
        </div>
    );
};

export default AssistantInfo;
