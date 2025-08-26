import React, { useContext, useState } from 'react';
import { Avatar, Button, Typography, Modal, message, Tag } from 'antd';
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { IoGitCompareOutline } from 'react-icons/io5';
import { LuCopyPlus } from "react-icons/lu";
import { BsRobot } from "react-icons/bs";
import { FileContext } from '../../contexts/FileContext';
import { getUserRole } from '../../Utility/service';
import { Md18UpRating, MdOutlineDataUsage } from 'react-icons/md';
import { MdOutlineStarBorder } from "react-icons/md";
import { UserOutlined } from '@ant-design/icons';
import { PiArrowsCounterClockwise } from 'react-icons/pi';
import { IoMdStar } from 'react-icons/io';
import { formatNumber } from './utils/formatNumber';
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
                <div className='agent-details-container'>
                    <Avatar size={70} src={selectedCard?.image_url ? selectedCard?.image_url : <BsRobot size={60} />} />
                    <Title className='mt-2 mb-0 fw-bold agent-name' level={4}>{selectedCard?.name}</Title>
                    <Typography className='my-1 fw-bold' style={{fontSize: "12px", color: "gray"}}>By { firstName} {lastName}</Typography>
                    <Typography className='agent-description'>{selectedCard?.description}</Typography>
                    <Typography className='my-2'><Tag color="volcano">{selectedCard?.assistantTypes}</Tag></Typography>
                </div>
                <div className="agent-info-wrapper">
                    <div className="agent-info-item">
                        <h4 className='agent-info-item-title'><IoMdStar color='Coral' /> {formatNumber(selectedCard?.rating?.averageRating % 1 === 0 ? Math.floor(selectedCard?.rating?.averageRating) : selectedCard?.rating?.averageRating?.toFixed(1) ?? 0) ?? 0}</h4>
                        <p className='agent-info-item-description'>Rating ({selectedCard?.rating?.totalRatings ?? 0})</p>
                    </div>
                    <div className="agent-info-item">
                        <h4 className='agent-info-item-title'><UserOutlined /> {selectedCard?.usageStats?.uniqueUserCount ?? 0}</h4>
                        <p className='agent-info-item-description'>Total Users</p>
                    </div>
                    <div className="agent-info-item">
                        <h4 className='agent-info-item-title'><MdOutlineDataUsage size={20} /> {selectedCard?.usageStats?.totalUsageCount ?? 0}</h4>
                        <p className='agent-info-item-description'>Total Usages</p>
                    </div>
                </div>
                <div>
                    {
                        selectedCard?.static_questions?.length > 0 &&
                        <div className='mt-3'>
                            <Title level={5} className='conversation-starter-title'>Conversation Starters:</Title>
                            <div className='conversation-starter-container-on-modal' >
                                {
                                    selectedCard?.static_questions?.map(question => <div>
                                        <p className='conversation-starter-content' key={question}>{question?.length > 60 ? `${question?.slice(0, 60)} ...` : question} </p>
                                    </div>)
                                }
                            </div>
                        </div>
                    }
                </div>
                <Button size='large' shape='round' className='mt-4' onClick={() => onChat(selectedCard?.assistant_id)} style={{ width: "100%" }} type="primary" icon={<IoChatboxEllipsesOutline />}>
                    Start Chat
                </Button>
                {/* {roleOfUser === "superadmin" || enablePersonalize === true?<Button className='mt-4' onClick={async () => {
                    setLoading(true);
                    const responseOfAssistantClone = await personalizeAssistant(selectedCard?.assistant_id);
                    if(responseOfAssistantClone.success){
                        setLoading(false);
                        onCancel();

                    }
                }}
                    style={{ width: "100%" }} type="primary" icon={<LuCopyPlus />} loading={loading}>
                    Personalize Agent
                </Button>:null} */}
                
            </div>
        </Modal>
    );
};

export default ExploreAssistantModal;