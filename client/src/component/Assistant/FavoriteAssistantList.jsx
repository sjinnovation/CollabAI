import React from "react";
import { getUserID } from "../../Utility/service";
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { BsRobot, BsThreeDotsVertical  } from "react-icons/bs";
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
    Spin,
    Dropdown,
    Menu
} from "antd";
import { RxCross2 } from "react-icons/rx";
import axios from "axios";
import { fetchSingleFavoriteAssistant, deleteFavoriteAssistant } from "../../api/favoriteAssistant";
import { showDeleteFavConfirm } from "../../Utility/showModalHelper";
import { AiOutlineDelete } from "react-icons/ai";
import ProfileHeader from "../Proflie/ProfileHeader";
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
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

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
    const createActionMenu = (record) => {
        return (
          <Menu>
           {<Menu.Item key="chat">
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }} onClick={() => openAssistantNewPage(record?.assistant_id, record?.name)}>
                  <IoChatbubbleEllipsesOutline /> Chat with Agent
              </span>
            </Menu.Item>}
            {<Menu.Item key="delete" danger>
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}
                    onClick={() => showDeleteFavConfirm(record, handleDeleteFavoriteAssistant, favoriteAssistant, setFavoriteAssistant)}
                >
              <AiOutlineDelete /> Delete
              </span>
            </Menu.Item>}
          </Menu>
        );
    };

    const columns = [
        {
            title: "Agent",
            dataIndex: "name",
            key: "name",
            align: "left",
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
                                          <Dropdown overlay={createActionMenu(record)} trigger={['click']}>
                            <a onClick={(e) => e.preventDefault()}>
                                <Space>
                                    <BsThreeDotsVertical />
                                </Space>
                            </a>
                      </Dropdown>
                    {/* <Tooltip title="Chat with Agent">
                        <Button onClick={() => openAssistantNewPage(record?.assistant_id, record?.name)}><IoChatbubbleEllipsesOutline /></Button>
                    </Tooltip> */}

                    {/* <Tooltip title="Delete">
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
                    </Tooltip> */}

                </Space>
            ),
        },

    ];



    return (
        <>
            <ProfileHeader title="Favorite Agents" subHeading="List of favorite agents." />
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
                    columns={columns}
                    dataSource={favoriteAssistant}
                    scroll={{ y: '50vh' }}
                    pagination={{
                      current: currentPage,
                      pageSize: pageSize,
                      showSizeChanger: true,
                      position: ["topRight"],
                      onShowSizeChange: (current, size) => {
                        setPageSize(size);
                        setCurrentPage(1); 
                      },
                      onChange: (page) => setCurrentPage(page),
                      showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                    }}
                />


            
        </>
    );
};

export default FavoriteAssistantList;
