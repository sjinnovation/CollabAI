import React from "react";
import { getUserID } from "../../Utility/service";
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import { Checkbox } from 'antd';
import { IoChatbubbleEllipsesOutline, IoGitCompareOutline } from "react-icons/io5";
import { BsRobot } from "react-icons/bs";
import "./Assistant.css";
//libraries
import {
    Button,
    Space,
    Table,
    Tag,
    Modal,
    Tooltip,
    Switch,
    message,
    Spin
} from "antd";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import axios from "axios";
import { fetchPublicAssistant, getFavoriteCount, deleteSinglePublicAssistant, addOrRemoveFeaturedAssistant } from "../../api/publicAssistant";
import { showDeletePublicConfirm, handleCheckboxChange } from "../../Utility/showModalHelper";
import DebouncedSearchInput from "../../Pages/SuperAdmin/Organizations/DebouncedSearchInput";
import { CustomSpinner } from "../common/CustomSpinner";
import { personalizeAssistant } from "../../api/personalizeAssistant";
import { LuCopyPlus } from "react-icons/lu";
import { SyncOutlined } from "@ant-design/icons";
import { axiosSecureInstance } from "../../api/axios";

const { confirm } = Modal;

const PublicAssistantList = ({ data }) => {
    const navigate = useNavigate();
    const {
        adminUserAssistants,
        loader,
        handleDeleteAssistant,
        handleUpdateAssistant,
        showEditModalHandler,
        handleFetchUserCreatedAssistants,
        handlePublicAssistantAdd,
        getFavoriteAssistant,
        handleDeletePublicAssistant,
        publicAssistant, 
        setPublicAssistant, 
        setIsLoading,
        isLoading,
        setLoadMyAssistants,
        updateLoader
    } = data;

    const [totalCount, setTotalCount] = useState();
    const [searchQuery, setSearchQuery] = useState('');
    const [isAssistantSyncing,setIsAssistantSyncing] = useState(false);


useEffect(()=>{
    // Fetch public assistants
    const page = 1;
    const searchQuery = ""
    
    fetchPublicAssistant(publicAssistant, setPublicAssistant, setIsLoading,setTotalCount,page,searchQuery);
},[]);
useEffect(()=>{
    // Fetch public assistants
    const page = 1;
    fetchPublicAssistant(publicAssistant, setPublicAssistant, setIsLoading,setTotalCount,page,searchQuery);
},[searchQuery]);



const query = typeof searchQuery === 'string' ? searchQuery?.toLowerCase() : '';


    // Open selected card in a new page
    const openAssistantNewPage = (assistantId, name) => {
        navigate(`/agents/${assistantId}`);

    };

    const columns = [
        {
            title: "Agent",
            dataIndex: "name",
            key: "name",
            align: "center",
            render: (_, { name, image_url }) => (
                <Space size="middle" className="d-flex align-items-center">
                    <div className="assistantImageDiv">
                        {image_url ? (
                            <img src={image_url} className="customImage" alt="avatar" />
                        ) : (
                            <BsRobot className="customImage" />
                        )}
                    </div>
                    <div className="ms-2 text-start">{name}</div>
                </Space>
            ),
        },
        {
            title: "Created By",
            dataIndex: "Created By",
            key: "created_by",
            align: "center",
            render: (_, record) => <span className="text-left">{record.userInfo}</span>,
        },

        {
            title: "Favorite Count",
            dataIndex: "Count",
            key: "Count",
            align: "center",
            render: (_, record) => <span className="text-left">{record.count}</span>

        },

        {
            title: "Action",
            key: "action",
            align: "center",
            render: (_, record) => (

                <Space size="middle">
                    <Tooltip title="Chat with Agent">
                        <Button onClick={() => openAssistantNewPage(record?.assistant_id, record?.name)}><IoChatbubbleEllipsesOutline /></Button>
                    </Tooltip>

                    <Tooltip title="Delete">
                        <Button

                            onClick={async () => await showDeletePublicConfirm(record, handleDeletePublicAssistant, handleUpdateAssistant, publicAssistant, setPublicAssistant)}
                            danger
                            icon={<AiOutlineDelete />}
                            loading={
                                loader.ASSISTANT_DELETING === record._id
                            }
                            disabled={loader.ASSISTANT_LOADING ||
                                loader.ASSISTANT_DELETING
                            }
                        />
                    </Tooltip>

                    <Tooltip title="Personalize Agent">
                        <Button onClick={async () => 
                            {await personalizeAssistant(record?.assistant_id);
                                setLoadMyAssistants(true);

                            
                            }
                        }><LuCopyPlus /></Button>
                    </Tooltip>
                    <Tooltip title="Add to Feature">
                        <Checkbox
                            checked={record?.is_featured}
                            onChange={(e) => handleCheckboxChange(record, e.target.checked, publicAssistant, setPublicAssistant, handleUpdateAssistant)} />
                    </Tooltip>

                </Space>
            ),
        },

    ];
const handleSyncButton = async ()=>{
    setIsAssistantSyncing(true);
    setIsLoading(true);
    const isSyncSuccess = await axiosSecureInstance.get('api/assistants/public/sync');
    message.success(isSyncSuccess.data.message);
    setIsLoading(false);
    setIsAssistantSyncing(false);
};


    return (
        <>

            <div className="mb-3">
                <DebouncedSearchInput
                    data={{
                        search: searchQuery,
                        setSearch: setSearchQuery,
                        placeholder: "Search Agent",
                    }}
                />
               &nbsp;&nbsp;&nbsp; Sync Public Assistants  <Button icon={isLoading && isAssistantSyncing?<SyncOutlined spin/>:<SyncOutlined  />} onClick={handleSyncButton}></Button>
                

            </div>
                <Table
                loading={isLoading}
                    bordered={true}
                    columns={columns}
                    dataSource={publicAssistant}
                    scroll={{ y: '50vh' }}

                    pagination={{
                        pageSize: 10,
                        total: totalCount,
                        onChange: (page) => {
                            fetchPublicAssistant(publicAssistant, setPublicAssistant, setIsLoading,setTotalCount,page,query);              
                        }
                      }}
                />

        </>
    );
};

export default PublicAssistantList;
