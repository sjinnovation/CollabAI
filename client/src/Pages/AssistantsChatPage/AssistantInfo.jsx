import { Typography } from 'antd'
import { useEffect } from 'react';
import { getSingleAssistant } from '../../api/assistant-chat-page-api';
import { useState } from 'react';
import AssistantIcon from '../../component/common/AssistantIcon';
import { Avatar } from 'antd';

const { Title } = Typography;

const AssistantInfo = ({dataProps}) => {
    const {assistantAllInfo, assistant_name, assistant_id} = dataProps;
    const [assistantData, setAssistantData] = useState({});

    const fetchAssistantData = async()=>{
        const response = await getSingleAssistant(assistant_id)
        setAssistantData(response?.assistant)
    }

    useEffect(()=>{
        fetchAssistantData()
    },[assistant_id])
   
    return (
        <div style={{ height: "100vh", }}>
            <div className="assistant-info-container-on-chat-page">
                <div className="assistant-img">
                    <div>
                    {
                     assistantData.image_url 
                     ? 
                     <Avatar size={56} src={assistantData.image_url} className='mb-2'/>
                     :
                     <AssistantIcon/>
                    }
                    </div>
                </div>
                <Title level={3}>{assistantData?.name}</Title>

                <p className='assistant-creator'>By {assistantData?.userId?.fname} {assistantData?.userId?.lname}</p>
                <p>
                    {assistantData?.description} 
                </p>
            </div>
        </div>
    )
}

export default AssistantInfo
