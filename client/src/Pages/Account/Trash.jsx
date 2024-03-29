import React, { useContext, useEffect, useState } from 'react';
import { Button, Table, message, Modal } from 'antd';
import { AiOutlineDelete } from "react-icons/ai";
import { SidebarContext } from '../../contexts/SidebarContext';
import { fetchUserDeletedThreads, handleRecovery, handlePermanentDelete } from '../../api/profile';

const Trash = () => {
  const { confirm } = Modal;
  const [chatThread, setChatThread] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const { triggerNavContent, setTriggerNavContent } = useContext(SidebarContext);
  const hasSelected = selectedRowKeys.length > 0;
  const onSelectChange = (newSelectedRowKeys) => {setSelectedRowKeys(newSelectedRowKeys)};
  const rowSelection = { selectedRowKeys, onChange: onSelectChange };

  const getDeletedThread = () => {
    setLoading(true);
    fetchUserDeletedThreads().then((res) => {
      setChatThread(res);
      setLoading(false);
    });
  }

  useEffect(() => { getDeletedThread()}, []);

  const handleThreadOperation = (operationType, threadIds) => {
    let apiCall;
    let requestBody = {};

    if (operationType === 'recover') {
      apiCall = handleRecovery;
      requestBody = { selectedThreadIds: threadIds };
    } else {
      apiCall = handlePermanentDelete;
      requestBody = { threadIds: threadIds };
    }

    apiCall(requestBody).then((res) => {
      if (res?.success === true) {
        getDeletedThread();
        setSelectedRowKeys([]);
        setTriggerNavContent((state) => state + 1);
        message.success(res.message);
      } else {
        message.error(res.message);
      }
    }).catch((error) => {
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
      title: 'Deleted Threads',
      dataIndex: 'description',
      render: (text) => <span>{text.length > 70 ? `${text.slice(0, 70)}...` : text}</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <div>
          <Button
            shape="circle"
            danger
            type="link"
            onClick={() => {
              showConfirm(() => handleThreadOperation('recover', [record.threadid]), 'recover this thread', `You are recovering "${record.description}" thread` )
            }}
          >
            Recover
          </Button>
          <Button
            shape="circle"
            danger
            type="link"
            onClick={() => {
              showConfirm(() => handleThreadOperation('delete', [record.threadid]), 'permanently delete this thread', `You are permanently deleting "${record.description}" thread`)
            }}
          >
            <AiOutlineDelete />
          </Button>

        </div>
      ),
    },
  ];

  const dataWithKeys = chatThread?.map(thread => {
    return { ...thread, key: thread.threadid }
  });

  return (
    <div>
        <div>
          <div className='mb-4' >
            <Button 
              type="primary" 
              onClick={() => {
                showConfirm(() => handleThreadOperation('recover', selectedRowKeys), 'recover these threads', `You are recovering ${selectedRowKeys.length} threads`)
              }}
              disabled={!hasSelected}
            >
              Recover
            </Button>
            <Button 
              className='ms-4'
              type="primary" 
              danger 
              ghost 
              onClick={() => {
                showConfirm(() =>handleThreadOperation('delete', selectedRowKeys), 'permanently delete these threads', `You are permanently deleting ${selectedRowKeys.length} threads`)
              }}
              disabled={!hasSelected}
            >
              <AiOutlineDelete />
            </Button>
            <span className='ms-4'>
              {hasSelected ? `Selected ${selectedRowKeys.length} items` : ''}
            </span>
          </div>

          <Table
            loading={loading}
            rowSelection={rowSelection}
            columns={columns}
            dataSource={dataWithKeys}
            pagination={{
              pageSize: 10,
              total: chatThread?.length,
              showSizeChanger: false
            }}
            scroll={{ x: true, y: '50vh' }}
            bordered
            responsive
          />
        </div>
    </div>
  );
};

export default Trash;