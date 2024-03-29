import React, { useState } from "react";
import { Button, Space, Table, Tag, Modal, Tooltip, Switch } from "antd";
import {
  AiOutlineDelete,
  AiOutlineEdit,
  AiOutlineArrowUp,
} from "react-icons/ai";

const { confirm } = Modal;

const FunctionCallingAssistantTable = ({ data }) => {
  const {
    functionCallingAssistants,
    setFunctionCallingAssistants,
    loader,
    handleDeleteAssistant,
    handleUpdateAssistant,
    showEditModalHandler,
    handleFetchFunctionCallingAssistants,
    updateLoader,
    setActiveKey,
  } = data;

  const showDeleteConfirm = (assistantId, assistantName) => {
    confirm({
      title: "Are you sure delete this Assistant?",
      content: `You are deleting ${assistantName}.`,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        handleDeleteAssistant(assistantId);
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  const redirectToAssistant = (record) => {
    const assistantName = record.name.split(" ").join("-");
    const assistantId = record.assistant_id;
    const url = `/assistants/${assistantName}/${assistantId}`;
    window.open(url, "_blank");
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="text-left">{text}</span>,
    },
    {
      title: "Status",
      key: "is_active",
      dataIndex: "is_active",
      width: 100,
      render: (_, { is_active }) => (
        <Tag color={is_active ? "green" : "red"}>
          {is_active ? "active" : "inactive"}
        </Tag>
      ),
    },

    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            onClick={() => redirectToAssistant(record)}
            icon={<AiOutlineArrowUp />}
          ></Button>

          <Tooltip title="Activate or Deactivate">
            <Switch
              checked={record?.is_active}
              onChange={(checked) =>
                handleUpdateAssistant(record._id, {
                  is_active: checked,
                })
              }
              loading={loader.ASSISTANT_UPDATING === record._id ?? false}
              disabled={
                loader.ALL_ASSISTANT_LOADING || loader.ASSISTANT_UPDATING
              }
            />
          </Tooltip>
          <Button
            onClick={() =>{
              setActiveKey("create-assistant-by-functionCalling");
              showEditModalHandler(record)}
            } 
            icon={<AiOutlineEdit />}
            disabled={loader.ASSISTANT_LOADING}
          ></Button>
          <Button
            onClick={() =>
              showDeleteConfirm(
                record?.assistant_id,
                record?.name,
                handleDeleteAssistant
              )
            }
            danger
            icon={<AiOutlineDelete />}
            loading={loader.ASSISTANT_DELETING === record._id}
            disabled={loader.ASSISTANT_LOADING || loader.ASSISTANT_DELETING}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Table
        loading={loader.ALL_ASSISTANT_LOADING}
        bordered={true}
        columns={columns}
        dataSource={functionCallingAssistants}
        scroll={{ y: "50vh" }}
        pagination={{
          pageSize: 10,
          total: functionCallingAssistants?.length,
          onChange: (page) => {
            handleFetchFunctionCallingAssistants(page);
          },
        }}
      />
    </div>
  );
};

export default FunctionCallingAssistantTable;
