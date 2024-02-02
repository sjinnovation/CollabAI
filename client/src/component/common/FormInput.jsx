import { Form, Input } from 'antd';

const FormInput = ({ name, label, rules, placeholder, type, dependencies, className, disabled }) => (
  <Form.Item
    name={name}
    label={label}
    rules={rules}
    dependencies={dependencies}
    className={className}
    hasFeedback
    disabled
  >
    {type === 'password' ? 
      <Input.Password placeholder={placeholder} /> : 
      <Input disabled={disabled} placeholder={placeholder} />
    }
  </Form.Item>
);

export default FormInput;