import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Form, message, Space, Switch } from 'antd';
import axios from 'axios';
import { axiosSecureInstance } from '../../api/axios';
import './AuthorizeCompany.css'

const AuthorizeCompany = () => {
    const [form] = Form.useForm();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingKey, setEditingKey] = useState('');
    const [editingCompany, setEditingCompany] = useState(null);

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            const response = await axiosSecureInstance.get('api/company/getall');
            setCompanies(response.data.companies);

        } catch (error) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values) => {
        const { companyName, emailDomain, employeeCount } = values;

        const companyData = {
            name: companyName,
            email: emailDomain,
            employeeCount: employeeCount,
            status: 'inactive',
            is_deleted: false,
        };

        try {
            let response = await axiosSecureInstance.post('api/company/register', companyData);
            message.success(response.data.message);
            form.resetFields();
            fetchCompanies();
        } catch (error) {
            message.error(error.message);
        }
    };

    const handleEdit = (record) => {
        setEditingKey(record._id);
        setEditingCompany({ ...record });
    };

    const handleUpdate = async () => {
        const { name, email, employeeCount } = editingCompany;

        const companyData = {
            name,
            email,
            employeeCount,
        };

        try {
            let response = await axiosSecureInstance.put(`api/company/update/${editingKey}`, companyData);
            message.success(response.data.message);
            setEditingKey('');
            fetchCompanies();
        } catch (error) {
            message.error(error.message);
        }
    };

    const cancelEdit = () => {
        setEditingKey('');
        setEditingCompany(null);
    };

    const onInputChange = (e, field) => {
        setEditingCompany({ ...editingCompany, [field]: e.target.value });
    };

    const handleStatusChange = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            let response = await axiosSecureInstance.put(`api/company/updatestatus/${id}`, { status: newStatus });
            message.success(response.data.message);
            fetchCompanies();
        } catch (error) {
            message.error(error.message);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const columns = [
        {
            title: 'Company Name',
            dataIndex: 'name',
            key: 'name',
            align: 'left',
            render: (_, record) =>
                editingKey === record._id ? (
                    <Input value={editingCompany.name} onChange={(e) => onInputChange(e, 'name')} />
                ) : (
                    record.name
                ),
        },
        {
            title: 'Email Domain',
            dataIndex: 'email',
            key: 'email',
            align: 'left',
            render: (_, record) =>
                editingKey === record._id ? (
                    <Input value={editingCompany.email} onChange={(e) => onInputChange(e, 'email')} />
                ) : (
                    record.email
                ),
        },
        {
            title: 'Employee Count',
            dataIndex: 'employeeCount',
            key: 'employeeCount',
            align: 'left',
            render: (_, record) =>
                editingKey === record._id ? (
                    <Input value={editingCompany.employeeCount} onChange={(e) => onInputChange(e, 'employeeCount')} />
                ) : (
                    record.employeeCount
                ),
        },
        {
            title: 'Company Id',
            dataIndex: '_id',
            key: '_id',
            align: 'left',
            render: (_, record) => {
                const isActive = record.status === 'active';
                return (
                    <span style={{
                        border: '2px solid',
                        color: isActive ? 'green' : 'orange',
                        padding: '4px',
                        borderRadius: '4px',
                        borderColor: isActive ? 'green' : 'orange'
                    }}>
                        {record._id}
                    </span>
                );
            },
        },
        {
            title: 'Status',
            key: 'status',
            align: 'left',
            render: (_, record) => (
                <Switch
                    checked={record.status === 'active'}
                    onChange={(checked) => handleStatusChange(record._id, record.status)}
                />
            ),
        },

        {
            title: 'Actions',
            key: 'actions',
            align: 'left',
            render: (_, record) =>
                editingKey === record._id ? (
                    <Space>
                        <Button type="primary" onClick={handleUpdate}>Update</Button>
                        <Button onClick={cancelEdit}>Cancel</Button>
                    </Space>
                ) : (
                    <Space>
                        <Button type="link" onClick={() => handleEdit(record)}><i className="bi bi-pencil-square"></i></Button>
                    </Space>
                ),
        },
    ];

    return (
        <div style={{ padding: '20px' }}>
            <h3 style={{ marginBottom: '25px' }}>Authorize Company</h3>
            <Form
                form={form}
                layout="inline"
                onFinish={handleSubmit}
                style={{ marginBottom: '20px' }}
                className="custom-flex-gap"
            >
                <Form.Item
                    name="companyName"
                    rules={[{ required: true, message: 'Please input company name!' }]}
                >
                    <Input placeholder="Company Name" />
                </Form.Item>
                <Form.Item
                    name="emailDomain"
                    rules={[
                        { required: true, message: 'Please input email!' },
                        {
                            validator: (_, value) => {
                                if (!value) {
                                    return Promise.reject('');
                                }
                                if (!/^@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+$/.test(value)) {
                                    return Promise.reject('Please enter a valid email domain!');
                                }
                                return Promise.resolve();
                            }
                        }
                    ]}
                >
                    <Input placeholder="Email Domain" />
                </Form.Item>
                <Form.Item
                    name="employeeCount"
                    rules={[{ required: true, message: 'Please input employee count!' }]}
                >
                    <Input placeholder="Employee Count" type="number" min={1} />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>

            <Table
                columns={columns}
                dataSource={companies}
                rowKey="_id"
                loading={loading}
                pagination={{ pageSize: 5 }}
                scroll={{ x: 1000 }}
            />
        </div>
    );
};

export default AuthorizeCompany;