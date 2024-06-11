import React from "react";
import { getUserID } from "../../Utility/service";
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import { Checkbox } from 'antd';
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
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
        handleDeletePublicAssistant
    } = data;

    const [publicAssistant, setPublicAssistant] = useState([]);
    const [totalCount, setTotalCount] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        // Fetch favorite cards from the API
        fetchPublicAssistant(publicAssistant, setPublicAssistant, setIsLoading);
    }, []);


    // Filter the data based on the search query
    const filteredData = publicAssistant.filter(item => {
        const itemName = item.name.toLowerCase();
        const query = typeof searchQuery === 'string' ? searchQuery.toLowerCase() : '';
        return itemName.includes(query);
    });

    // Open selected card in a new page
    const openAssistantNewPage = (assistantId, name) => {
        navigate(`/assistants/${assistantId}`);

    };

    const columns = [
        {
            title: "Assistant",
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
                    <Tooltip title="Chat with Assistant">
                        <Button onClick={() => openAssistantNewPage(record?.assistant_id, record?.name)}><IoChatbubbleEllipsesOutline /></Button>
                    </Tooltip>

                    <Tooltip title="Delete">
                        <Button

                            onClick={() => showDeletePublicConfirm(record, handleDeletePublicAssistant, handleUpdateAssistant, publicAssistant, setPublicAssistant)}
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
                    <Tooltip title="Add to Feature">
                        <Checkbox
                            checked={record?.is_featured}
                            onChange={(e) => handleCheckboxChange(record, e.target.checked, publicAssistant, setPublicAssistant, handleUpdateAssistant)} />
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
                        placeholder: "Search Assistant",
                    }}
                />
            </div>
                <Table
                loading={isLoading}
                    bordered={true}
                    columns={columns}
                    dataSource={filteredData}
                    scroll={{ y: '50vh' }}
                    pagination={{
                        pageSize: 10,
                        total: filteredData?.length,
                      }}
                />

        </>
    );
};

export default PublicAssistantList;
