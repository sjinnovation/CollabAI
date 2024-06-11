import { Form, Input } from 'antd';

const FormEmail = ({ name, label, rules, placeholder, className, inputFieldClassName = '' }) => (
    <Form.Item
        name={name}
        label={label}
        rules={[...rules, { type: 'email' }]}
        className={className}
        hasFeedback
    >
        <Input className={inputFieldClassName} placeholder={placeholder} />
    </Form.Item>
);

export default FormEmail;
