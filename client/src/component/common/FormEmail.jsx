import { Form, Input } from 'antd';

const FormEmail = ({ name, label, rules, placeholder, className }) => (
    <Form.Item
        name={name}
        label={label}
        rules={[...rules, { type: 'email' }]}
        className={className}
        hasFeedback
    >
        <Input placeholder={placeholder} />
    </Form.Item>
);

export default FormEmail;