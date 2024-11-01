import React from "react";
import { getUserID } from "../../Utility/service";
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { BsRobot } from "react-icons/bs";
import DebouncedSearchInput from "../../Pages/SuperAdmin/Organizations/DebouncedSearchInput";
import { CustomSpinner } from "../common/CustomSpinner";
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
    Spin
} from "antd";
import { RxCross2 } from "react-icons/rx";
import axios from "axios";
import { fetchSingleFavoriteAssistant, deleteFavoriteAssistant } from "../../api/favoriteAssistant";
import { showDeleteFavConfirm } from "../../Utility/showModalHelper";
const { confirm } = Modal;

const FavoriteAssistantList = ({ data }) => {
    const navigate = useNavigate();
    const {
        loader,
        handleDeleteFavoriteAssistant,
        favoriteAssistant,
        setFavoriteAssistant,
        isLoading, 
        setIsLoading
    } = data;

    const [searchQuery, setSearchQuery] = useState([]);


    const [totalCount,setTotalCount] = useState();

    useEffect(()=>{
            // Fetch all the favorite assistants
            const page  = 1;
            const searchQuery ="";
    fetchSingleFavoriteAssistant(setFavoriteAssistant, setIsLoading,setTotalCount,page,searchQuery);
    },[]);


    useEffect(()=>{
        // Fetch public assistants
        const page = 1;
        fetchSingleFavoriteAssistant(setFavoriteAssistant, setIsLoading,setTotalCount,page,searchQuery);

    },[searchQuery]);

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
                            onClick={() => showDeleteFavConfirm(record, handleDeleteFavoriteAssistant, favoriteAssistant, setFavoriteAssistant)}
                            danger
                            icon={<RxCross2 />}
                            loading={
                                loader.ASSISTANT_DELETING === record._id
                            }
                            disabled={loader.ASSISTANT_LOADING ||
                                loader.ASSISTANT_DELETING
                            }
                        />
                    </Tooltip>

                </Space>
            ),
        },

    ];



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
            </div>

                <Table
                    loading={isLoading}
                    bordered={true}
                    columns={columns}
                    dataSource={favoriteAssistant}
                    scroll={{ y: '50vh' }}
                    pagination={{
                        pageSize: 10,
                        total: totalCount,
                        onChange: (page) => {
                            fetchSingleFavoriteAssistant(setFavoriteAssistant, setIsLoading,setTotalCount,page,searchQuery);
                        }
                      
                    }}
                />


            
        </>
    );
};

export default FavoriteAssistantList;
