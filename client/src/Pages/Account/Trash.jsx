import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  Table,
  message,
  Modal,
  Tooltip,
  Menu,
  Dropdown,
  Space,
} from "antd";
import { AiOutlineDelete } from "react-icons/ai";
import { SidebarContext } from "../../contexts/SidebarContext";
import {
  fetchUserDeletedThreads,
  handleRecovery,
  handlePermanentDelete,
} from "../../api/profile";
import { BsThreeDotsVertical } from "react-icons/bs";
import { PiArrowSquareDownLeftBold } from "react-icons/pi";
import ProfileHeader from "../../component/Proflie/ProfileHeader";
import './Trash.css';

const Trash = () => {
  const { confirm } = Modal;
  const [chatThread, setChatThread] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const {
    triggerNavContent,
    setTriggerNavContent,
    threadRestore,
    setThreadRestore,
  } = useContext(SidebarContext);
  const hasSelected = selectedRowKeys.length > 0;
  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = { selectedRowKeys, onChange: onSelectChange, columnWidth: 40 };
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  const getDeletedThread = () => {
    setLoading(true);
    fetchUserDeletedThreads().then((res) => {
      setChatThread(res);
      setLoading(false);
    });
  };

  useEffect(() => {
    getDeletedThread();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleThreadOperation = (operationType, threadIds) => {
    let apiCall;
    let requestBody = {};

    if (operationType === "recover") {
      apiCall = handleRecovery;
      requestBody = { selectedThreadIds: threadIds };
      setThreadRestore(true);
    } else {
      apiCall = handlePermanentDelete;
      requestBody = { threadIds: threadIds };
    }

    apiCall(requestBody)
      .then((res) => {
        if (res?.success === true) {
          getDeletedThread();
          setSelectedRowKeys([]);
          setTriggerNavContent((state) => state + 1);
          message.success(res.message);
        } else {
          message.error(res.message);
        }
      })
      .catch((error) => {
        message.error(`Failed to ${operationType} threads: ${error.message}`);
      });
  };

  const showConfirm = (callBackFn, title, discription) => {
    confirm({
      title: `Are you sure ${title}?`,
      content: discription,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        callBackFn();
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  const columns = [
    {
      title: "Deleted Threads",
      dataIndex: "description",
      align: "start",
      render: (text) => (
        <span style={{ width: "100%", textAlign: "start" }}>
          {text.length > 70 ? `${text.slice(0, 70)}...` : text}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: "30%",
      align: "center",
      render: (record) => (
        <div>
          <Dropdown overlay={createActionMenu(record)} trigger={["click"]}>
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                <BsThreeDotsVertical />
              </Space>
            </a>
          </Dropdown>
        </div>
      ),
    },
  ];

  const dataWithKeys = chatThread?.map((thread) => {
    return { ...thread, key: thread.threadid };
  });

  const createActionMenu = (record) => {
    return (
      <Menu>
        <Menu.Item success>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "100%",
              color: "green",
            }}
            onClick={() => {
              showConfirm(
                () => handleThreadOperation("recover", [record.threadid]),
                "recover this thread",
                `You are recovering "${record.description}" thread`
              );
            }}
          >
            <PiArrowSquareDownLeftBold /> Recover
          </span>
        </Menu.Item>
        <Menu.Item key="delete" danger>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "100%",
            }}
            onClick={() => {
              showConfirm(
                () => handleThreadOperation("delete", [record.threadid]),
                "permanently delete this thread",
                `You are permanently deleting "${record.description}" thread`
              );
            }}
          >
            <AiOutlineDelete /> Delete
          </span>
        </Menu.Item>
      </Menu>
    );
  };

  return (
    <div>
      <div className="trash-container" style={{position: "relative"}}>
        <ProfileHeader title="Deleted Threads" subHeading="View and manage your deleted threads. You can recover or permanently delete them." />
        <div>
          <div className="trash-btn-container trash-btn-position" style={ dataWithKeys.length > 0 ? {position: "absolute"} : {position: "relative", marginBottom: "10px"}}>
            <Tooltip title="Recover">
              <Button
                type="primary"
                style={{ color:"green", borderColor:"green" }}
                onClick={() => {
                  showConfirm(
                    () => handleThreadOperation("recover", selectedRowKeys),
                    "recover these threads",
                    `You are recovering ${selectedRowKeys?.length} threads`
                  );
                }}
                ghost
                disabled={!hasSelected}
              >Recover
                <PiArrowSquareDownLeftBold />
              </Button>
            </Tooltip>

          <Tooltip title="Delete">
            <Button
              className="ms-3 trash-btn-delete"
              type="primary"
              danger
              onClick={() => {
                showConfirm(
                  () => handleThreadOperation("delete", selectedRowKeys),
                  "permanently delete these threads",
                  `You are permanently deleting ${selectedRowKeys?.length} threads`
                );
              }}
              ghost
              disabled={!hasSelected}
            >Delete
              <AiOutlineDelete />
            </Button>
          </Tooltip>
          <span className="ms-4 fw-semibold">
            {hasSelected ? `Selected ${selectedRowKeys.length} items` : ""}
          </span>
        </div>

          <Table
            className="trash-table-position"
            loading={loading}
            rowSelection={rowSelection}
            columns={columns}
            dataSource={dataWithKeys}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              showSizeChanger: true,
              position: [isMobile ? "bottomRight" : "topRight"],
              onShowSizeChange: (current, size) => {
                setPageSize(size);
                setCurrentPage(1);
              },
              onChange: (page) => setCurrentPage(page),
              showTotal: (total, range) => (
                <span className="fw-semibold">{`${range[0]}-${range[1]} of ${total} items`}</span>
              ),
            }}
            responsive
          />
        </div>
      </div>
    </div>
  );
};

export default Trash;
