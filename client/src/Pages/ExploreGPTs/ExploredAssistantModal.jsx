import React from 'react';
import { Avatar, Button, Typography, Modal } from 'antd';
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { BsRobot } from "react-icons/bs";
const { Title } = Typography;

const ExploreAssistantModal = ({
    selectedCard,
    theme,
    onCancel,
    onChat,
    handleShowModal
}) => {
    return (
        <Modal footer={null} open={handleShowModal} onCancel={onCancel}>
            <div className='modal-body-container'>
                <Avatar size={60} src={selectedCard?.image_url ? selectedCard?.image_url : <BsRobot size={60} style={{ color: theme === "light" ? "#000" : "#fff" }} />} />
                <Title className='mt-4' level={5}>{selectedCard?.name}</Title>
                <Typography className='mt-2 mb-2'>By {selectedCard?.userId?.fname} {selectedCard?.userId?.lname}</Typography>
                <Typography className='mb-2'>{selectedCard?.assistantTypes}</Typography>
                <Typography>{selectedCard?.description}</Typography>
                <div>
                    {
                        selectedCard?.static_questions.length > 0 &&
                        <div className='mt-3'>
                            <Title level={5}>Conversation Starters:</Title>
                            <div className='conversation-starter-container-on-modal' >
                                {
                                    selectedCard?.static_questions?.map(question => <div>
                                        <p className='conversation-starter-content' key={question}>{question?.length > 30 ? `${question?.slice(0, 30)} ...` : question} </p>
                                    </div>)
                                }
                            </div>
                        </div>
                    }
                </div>
                <Button className='mt-4' onClick={() => onChat(selectedCard?.assistant_id)} style={{ width: "100%" }} type="primary" icon={<IoChatboxEllipsesOutline />}>
                    Start Chat
                </Button>
            </div>
        </Modal>
    );
};

export default ExploreAssistantModal;