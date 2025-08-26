import { Button, message, Table, Tag, Tooltip, } from "antd";
import { useState } from "react";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";

import { SyncOutlined } from '@ant-design/icons';
import { useEffect } from "react";
import { axiosSecureInstance } from "../../api/axios";
import { WORKBOARD_WORK_STREAM_ACTION_ITEM_SYNC_SLUG, WORKBOARD_WORK_STREAM_LIST_SLUG } from "../../constants/Api_constants";
import { getUserID } from "../../Utility/service";
import DebouncedSearchInput from "../SuperAdmin/Organizations/DebouncedSearchInput";
import Title from "antd/es/typography/Title";
import "./workBoard.css";
const WorkBoardSync = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [syncingId, setSyncingId] = useState(null)
    const [data, setData] = useState([]);
    const [pageSize, setPageSize] = useState(10); // default page size
    const getWorkStreams = async () => {
        return await axiosSecureInstance.get(WORKBOARD_WORK_STREAM_LIST_SLUG(getUserID()));
    }
    const fetchWorkStreams = async () => {
        setLoading(true);
        try {
            const response = await getWorkStreams();
            setData(response.data.data);
        } catch (error) {
            // Optionally handle error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkStreams();
    }, []);


    const syncWorkBoardAI = async (wsId, wsTitle) => {
        return await axiosSecureInstance.post(WORKBOARD_WORK_STREAM_ACTION_ITEM_SYNC_SLUG(getUserID()), {
            wsId: parseInt(wsId),
            wsTitle
        })
    }
    const columns = [
        {
            title: 'Team Name',
            dataIndex: 'ws_team_name',
            align: "left",
            sorter: (a, b) => a.ws_team_name.localeCompare(b.ws_team_name),

        },
        {
            title: 'Work Stream',
            dataIndex: 'ws_name',
            align: "left",
            sorter: (a, b) => a.ws_name.localeCompare(b.ws_name),
        },
        {
            title: "Status",
            dataIndex: "isSynced",
            key: "isSynced",
            align: "center",
            width: "10%",
            sorter: (a, b) => {
            // true > false, so Synced (true) comes after Not Synced (false)
            if (a.isSynced === b.isSynced) return 0;
            return a.isSynced ? 1 : -1;
        },
            // sortOrder: sortedInfo?.columnKey === "is_active" && sortedInfo?.order,
            render: (_, { isSynced }) => (
                <Tag color={isSynced ? "green" : "red"}>
                    {isSynced ? "Synced" : "Not Synced"}
                </Tag>
            ),
        },{
            title: 'Last Synced',
            dataIndex: 'lastSynced',
            key: 'lastSynced',
            align: "center",
            render: (text) => {
                return text ? new Date(text).toLocaleString() : "Never Synced";
            },
            sorter: (a, b) => new Date(a.lastSynced) - new Date(b.lastSynced),
        }
        ,
        {
            title: 'Actions',
            key: 'actions',
            align: "center",
            render: (text, record) => (
                <div>
                    <Tooltip title='Sync work board stream Action Items'>

                        <Button

                            type="primary"
                            onClick={async () => {
                                setSyncingId(record.ws_id);
                                try {
                                    const wsSyncingResponse = await syncWorkBoardAI(record.ws_id, record.ws_name);
                                    message.success(wsSyncingResponse.data.message);
                                    await fetchWorkStreams(); // Refresh data after sync
                                } catch (error) {
                                    // Optionally show error message
                                } finally {
                                    setSyncingId(null);
                                }
                            }}
                            style={{ marginRight: 8 }}
                        >
                            <SyncOutlined spin={syncingId === record.ws_id} />
                        </Button>
                    </Tooltip>
                </div>
            ),
        },
    ]
    const filteredWorkStreams = data?.filter((ws) => {
        return ws.ws_name.toLowerCase().includes(searchQuery?.toLowerCase() || '')
    }
    );
    return (
        <>
            <div className="mt-2" style={{overflowY:"auto", height:"80vh"}}
 >
                <div className="container" >
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="col-8">
                            <Title level={2}>Work Stream List</Title>
                        </div>

                    </div>
                    <div>
                        <div className="mb-4">
                            <DebouncedSearchInput
                                data={{
                                    search: searchQuery,
                                    setSearch: setSearchQuery,
                                    placeholder: "Search Work Stream",
                                }}
                            />
                        </div>

                        <Table
                            className="custom-table"
                            loading={loading}
                            columns={columns}
                            dataSource={filteredWorkStreams}
                            pagination={{
                                pageSize: pageSize,
                                pageSizeOptions: ['10', '20', '50', '100'],
                                showSizeChanger: true,
                                total: filteredWorkStreams?.length,
                                onShowSizeChange: (current, size) => {
                                    setPageSize(size);
                                },
                                onChange: (page, pageSize) => {
                                    setPageSize(pageSize); // Also update pageSize if changed from page navigation
                                },
                            }}
                            // scroll={{ x: 1000, y: '50vh' }} // Uncomment if needed
                            bordered
                        // responsive
                        />
                    </div>

                </div>
            </div>
        </>
    );

};

export default WorkBoardSync;