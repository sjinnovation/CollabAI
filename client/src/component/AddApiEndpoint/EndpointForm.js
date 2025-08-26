import React, { useState } from "react";
import { Modal, Form, Input, Select, Button, Space, Checkbox } from "antd";

const { Option } = Select;

const EndpointForm = ({ isVisible, onClose, onSubmit, serviceId }) => {
    const [form] = Form.useForm();
    const [parameters, setParameters] = useState([]);

    const handleAddParameter = () => {
        setParameters([...parameters, { key: "", type: "string", description: "" }]);
    };

    const handleParameterChange = (index, field, value) => {
        const updatedParameters = [...parameters];
        updatedParameters[index][field] = value;
        setParameters(updatedParameters);
    };

    const handleRemoveParameter = (index) => {
        const updatedParameters = parameters.filter((_, i) => i !== index);
        setParameters(updatedParameters);
    };

    const handleFinish = (values) => {
        // Transform parameters into the desired array format
        const formattedParameters = parameters
            .filter((param) => param.key) // Ensure only valid parameters are included
            .map((param) => ({
                [param.key]: {
                    type: param.type,
                    description: param.description,
                },
            }));

        const payload = {
            service_id: serviceId,
            api_name: values.api_name,
            api_endpoint: values.api_endpoint,
            method: values.method,
            description: values.description,
            parameters: formattedParameters.length > 0 ? formattedParameters : [], // Always an array
        };

        onSubmit(payload);
        form.resetFields();
        setParameters([]); // Reset parameters
    };

    return (
        <Modal
            title="Add API Endpoint"
            open={isVisible}
            onCancel={onClose}
            footer={null}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
            >
                <Form.Item
                    label="API Name"
                    name="api_name"
                    help={<span className="modal-helper-text">"Eg: 'Get User Details'"</span>}
                    rules={[
                        { required: true, message: "Please enter the API name" },
                        { max: 25, message: "Function name must be 25 characters or less" },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="API Endpoint"
                    name="api_endpoint"
                    help={<span className="modal-helper-text">"Eg: '/user/details'"</span>}
                    rules={[
                        { required: true, message: "Please enter the API endpoint" },
                        { pattern: /^\/.*/, message: "API endpoint must start with a forward slash (/)" },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="HTTP Method"
                    name="method"
                    help={<span className="modal-helper-text">"Eg: 'GET, POST, PUT, DELETE'"</span>}
                    rules={[{ required: true, message: "Please select the HTTP method" }]}
                >
                    <Select>
                        <Option value="GET">GET</Option>
                        {/* following options are meant for future scope */}
                         <Option value="POST">POST</Option>
                        <Option value="PUT">PUT</Option>
                       {/* <Option value="DELETE">DELETE</Option> */}
                    </Select>
                </Form.Item>
                <Form.Item
                    label="Description"
                    name="description"
                    help={<span className="modal-helper-text">"Eg; 'Get user details by ID from the API and return the user object in JSON format with status code 200 on success '"</span>}
                    rules={[{ required: true, message: "Please enter the description" }]}
                >
                    <Input.TextArea rows={4} />
                </Form.Item>

                <Form.Item label="Parameters" help={<span className="modal-helper-text">eg: {'user_id: { type: \'string\', description: \'The ID of the user\' }'}</span>}>
                    {parameters.map((param, index) => (
                        <Space key={index} style={{ display: "flex", marginBottom: 8 }} align="start">
                            <Input
                                placeholder="Parameter Name"
                                value={param.key}
                                onChange={(e) => handleParameterChange(index, "key", e.target.value)}
                                
                            />
                            <Select
                                value={param.type}
                                onChange={(value) => handleParameterChange(index, "type", value)}
                                
                            >
                                <Option value="string">String</Option>
                                <Option value="number">Number</Option>
                                <Option value="boolean">Boolean</Option>
                                <Option value="array">Array</Option>
                                <Option value="object">Object</Option>
                            </Select>
                            <Input
                                placeholder="Description"
                                value={param.description}
                                onChange={(e) => handleParameterChange(index, "description", e.target.value)}
                                
                            />
                        
                            <Button type="link" onClick={() => handleRemoveParameter(index)}>
                                Remove
                            </Button>
                        </Space>
                    ))}
                    <Button type="dashed" onClick={handleAddParameter} block>
                        Add Parameter
                    </Button>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EndpointForm;