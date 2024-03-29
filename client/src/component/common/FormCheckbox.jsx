import { Form, Checkbox } from 'antd';

const FormCheckbox = ({ name, label, rules, className }) => (
  <Form.Item
    name={name}
    valuePropName="checked"
    rules={rules}
    className={className}
  >
    <Checkbox> {label} </Checkbox>
  </Form.Item>
);

export default FormCheckbox;