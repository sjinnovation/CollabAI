import React from "react";
import {
    Button,
    Modal,
    Form,
    Input,
    Space,
    Alert,
    Row,
    Col,
    InputNumber,
} from "antd";

const CreateOrganizationModal = ({ propsData }) => {
    const { open, setOpen, actions, loading: confirmLoading } = propsData;
    const [form] = Form.useForm();

    const handleCancel = () => {
        setOpen(false);
    };

    const handleOk = () => {
        form.validateFields()
            .then((values) => {
                form.resetFields();
                actions.handleOk(values);
            })
            .catch((info) => {
                console.log("Validate Failed:", info);
            });
    };

    return (
        <Modal
            title="Create Organization"
            open={open}
            confirmLoading={confirmLoading}
            onCancel={handleCancel}
            footer={[
                <Button key="back" onClick={handleCancel}>
                    Cancel
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={confirmLoading}
                    onClick={handleOk}
                >
                    Create
                </Button>,
            ]}
        >
            <Form
                form={form}
                name="trigger"
                style={{
                    maxWidth: 600,
                }}
                layout="vertical"
                autoComplete="off"
            >
                <Row gutter={12}>
                    <Col span={12}>
                        <Form.Item
                            hasFeedback
                            label="First Name"
                            name="firstName"
                            validateDebounce={100}
                            rules={[
                                {
                                    required: true,
                                    max: 15,
                                    min: 2,
                                },
                            ]}
                        >
                            <Input placeholder="John" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            hasFeedback
                            label="Last Name"
                            name="lastName"
                            validateDebounce={100}
                            rules={[
                                {
                                    required: true,
                                    max: 15,
                                    min: 2,
                                },
                            ]}
                        >
                            <Input placeholder="Doe" />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            hasFeedback
                            label="Company Name"
                            name="name"
                            validateDebounce={100}
                            rules={[
                                {
                                    required: true,
                                    max: 40,
                                    min: 2,
                                },
                            ]}
                        >
                            <Input placeholder="SJ Innovation LLC" />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            hasFeedback
                            label="Number of Employees"
                            name="employeeCount"
                            validateDebounce={100}
                            rules={[
                                {
                                    required: true,
                                    min: 1,
                                    type: "number",
                                },
                            ]}
                        >
                            <InputNumber
                                style={{
                                    width: "100%",
                                }}
                                placeholder="200"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            hasFeedback
                            label="Email"
                            name="email"
                            validateDebounce={100}
                            rules={[
                                {
                                    required: true,
                                    max: 3,
                                    type: "email",
                                },
                            ]}
                        >
                            <Input placeholder="Admin Email" />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            hasFeedback
                            label="Password"
                            name="password"
                            validateDebounce={100}
                            rules={[
                                {
                                    required: true,
                                    min: 8,
                                },
                            ]}
                        >
                            <Input.Password placeholder="Admin Password" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default CreateOrganizationModal;
