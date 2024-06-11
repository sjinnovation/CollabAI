import { Form, Input } from 'antd';

const FormInput = ({ name, label, rules, placeholder, type, dependencies, className, disabled, inputFieldClassName = '' }) => (
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
      <Input.Password className={inputFieldClassName} placeholder={placeholder} /> :
      (type === 'number' ?
        <Input type="number" min={0} max={8000} step={10} placeholder={placeholder} /> :
        <Input disabled={disabled} placeholder={placeholder} />)
    }
  </Form.Item>
);

export default FormInput;
