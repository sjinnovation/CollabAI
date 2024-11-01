import React, { useContext, useState } from 'react';
import { Avatar, Button, Typography, Modal, message } from 'antd';
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { IoGitCompareOutline } from 'react-icons/io5';
import { LuCopyPlus } from "react-icons/lu";
import { BsRobot } from "react-icons/bs";
import { FileContext } from '../../contexts/FileContext';
import { getUserRole } from '../../Utility/service';
const { Title } = Typography;

const ExploreAssistantModal = ({
    selectedCard,
    theme,
    onCancel,
    onChat,
    handleShowModal,
    personalizeAssistant,
    enablePersonalize,
}) => {
    const roleOfUser = getUserRole();
    let firstName = '';
    let lastName = '';
    const [loading,setLoading] = useState(false);

    if("user" in selectedCard){
        if("fname" in selectedCard.user){
            firstName = selectedCard?.user?.fname;
            lastName = selectedCard?.user?.lname;
        }
    }else if("userId" in selectedCard && !("user" in selectedCard)){
        if("fname" in selectedCard.userId){
            firstName = selectedCard?.userId?.fname;
            lastName = selectedCard?.userId?.lname;
        }
    }
    return (
        <Modal footer={null} open={handleShowModal} onCancel={onCancel}>
            <div className='modal-body-container'>
                <Avatar size={60} src={selectedCard?.image_url ? selectedCard?.image_url : <BsRobot size={60} style={{ color: theme === "light" ? "#000" : "#fff" }} />} />
                <Title className='mt-4' level={5}>{selectedCard?.name}</Title>
                <Typography className='mt-2 mb-2'>By { firstName} {lastName}</Typography>
                <Typography className='mb-2'>{selectedCard?.assistantTypes}</Typography>
                <Typography>{selectedCard?.description}</Typography>
                <div>
                    {
                        selectedCard?.static_questions?.length > 0 &&
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
                {roleOfUser === "superadmin" || enablePersonalize === true?<Button className='mt-4' onClick={async () => {
                    setLoading(true);
                    const responseOfAssistantClone = await personalizeAssistant(selectedCard?.assistant_id);
                    if(responseOfAssistantClone.success){
                        setLoading(false);
                        onCancel();

                    }
                }}
                    style={{ width: "100%" }} type="primary" icon={<LuCopyPlus />} loading={loading}>
                    Personalize Agent
                </Button>:null}
                
            </div>
        </Modal>
    );
};

export default ExploreAssistantModal;