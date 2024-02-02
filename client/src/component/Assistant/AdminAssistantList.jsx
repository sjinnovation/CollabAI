import React from "react";

//libraries
import {
    Button,
    Space,
    Table,
    Tag,
    Modal,
    Tooltip,
    Switch,
} from "antd";
import { AiOutlineDelete,AiOutlineEdit  } from "react-icons/ai";
const { confirm } = Modal;

const AdminAssistantList = ({ data }) => {
    const {
        adminUserAssistants,
        loader,
        handleDeleteAssistant,
        handleUpdateAssistant,
        showEditModalHandler,
        handleFetchUserCreatedAssistants,
    } = data;
  
    // console.log(adminUserAssistants)


    const showDeleteConfirm = (assistantId, assistantName) => {
        confirm({
          title: 'Are you sure delete this Assistant?',
          content: `You are deleting ${assistantName}.`,
          okText: 'Yes',
          okType: 'danger',
          cancelText: 'No',
          onOk() {
            handleDeleteAssistant(assistantId);
          },
          onCancel() {
            console.log('Cancel');
          },
        });
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
              onClick={() => showEditModalHandler(record)}
              icon={<AiOutlineEdit />}
              disabled={
               loader.ASSISTANT_LOADING
              }
            >
              
            </Button>
            <Tooltip title="Activate or Deactivate">
              <Switch
                checked={record?.is_active}
                onChange={(checked) =>
                  handleUpdateAssistant(record._id, {
                    is_active: checked,
                  })
                }
                loading={
                 loader.ASSISTANT_UPDATING === record._id ?? false
                }
                disabled={loader.ASSISTANT_LOADING || 
                  loader.ASSISTANT_UPDATING
                }
              />
            </Tooltip>
            <Button
              onClick={() => showDeleteConfirm(record?.assistant_id,record?.name)}
              danger
              icon={<AiOutlineDelete />}
              loading={
                loader.ASSISTANT_DELETING === record._id
              }
              disabled={loader.ASSISTANT_LOADING ||
                loader.ASSISTANT_DELETING
              }
            />
          </Space>
        ),
      },
    ];

    return (
        <>
            <Table
                loading={loader.ASSISTANT_LOADING}
                bordered={true}
                columns={columns}
                dataSource={adminUserAssistants}
                scroll={{ y: '50vh' }}
                pagination={{
                  pageSize: 10,
                  total: adminUserAssistants?.length,
                  onChange:(page)=>{
                    handleFetchUserCreatedAssistants(page)
                  }
                }}
            />
        </>
    );
};

export default AdminAssistantList;
