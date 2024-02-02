import React from "react";
import {
    Button,
    Space,
    Select,
    Table,
    Tag,
    Modal,
    Tooltip,
    Switch,
} from "antd";
import { AiOutlineDelete } from "react-icons/ai";
import moment from "moment";
const { confirm } = Modal;

const OrganizationTable = ({ propsData }) => {
    const { data, pagination, loader, actions } = propsData;

    const showDeleteConfirm = (orgId, orgName) => {
        confirm({
            title: "Are you sure delete this Organization?",
            content: `You are deleting ${orgName}.`,
            okText: "Yes",
            okType: "danger",
            cancelText: "No",
            onOk() {
                actions.handleDeleteOrganization(orgId);
            },
            onCancel() {
                console.log("Cancel");
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
            title: "Email",
            dataIndex: "email",
            key: "email",
            render: (text) => <span className="text-left">{text}</span>,
        },
        {
            title: "Employees",
            dataIndex: "employeeCount",
            key: "email",
            render: (text) => <span className="text-left">{text}</span>,
        },
        {
            title: "Created At",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (dateString) => (
                <span className="text-left">
                    {moment(dateString).format("DD MMM, YYYY")}
                </span>
            ),
        },
        {
            title: "Status",
            key: "status",
            dataIndex: "status",
            width: 100,
            render: (_, { status }) => (
                <Tag color={status === 'active' ? "green" : "red"}>
                    {status}
                </Tag>
            ),
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Activate or Deactivate">
                        <Switch
                            checked={record?.status === "active" ? true : false}
                            onChange={(checked) =>
                                actions.handleUpdateOrganization(record._id, {
                                    status: checked ? "active" : "inactive",
                                })
                            }
                            loading={
                                loader.ORGANIZATION_UPDATING === record._id ??
                                false
                            }
                            disabled={
                                loader.ORGANIZATION_LOADING ||
                                loader.ORGANIZATION_UPDATING
                            }
                        />
                    </Tooltip>
                    <Button
                        onClick={() =>
                            showDeleteConfirm(record?._id, record?.name)
                        }
                        danger
                        icon={<AiOutlineDelete />}
                        disabled={
                            loader.ORGANIZATION_LOADING ||
                            loader.ORGANIZATION_UPDATING
                        }
                        loading={
                            loader.ORGANIZATION_DELETING === record._id ?? false
                        }
                    />
                </Space>
            ),
        },
    ];
    console.log(pagination,"pagination")

    return (
        <>
            <Table
                loading={loader.ORGANIZATION_LOADING}
                bordered={true}
                columns={columns}
                dataSource={data}
                scroll={{ y: "50vh" }}
                pagination={{
                    current: pagination?.page,
                    pageSize: pagination?.pageSize,
                    total: pagination?.totalItems,
                    showTotal: (total) => `Total ${total} items`,
                    showQuickJumper: true,
                    onChange: (page, pageSize) => {
                        actions.fetchOrganizations({ page, limit: pageSize });
                    },
                }}
            />
        </>
    );
};

export default OrganizationTable;
