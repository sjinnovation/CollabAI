import { Form, Checkbox } from 'antd';

const FormCheckbox = ({ name, label, rules, className, labelClassName = ''  }) => (
  <Form.Item
    name={name}
    valuePropName="checked"
    rules={rules}
    className={className}
  >
    <Checkbox className={labelClassName}>{label}</Checkbox>
  </Form.Item>
);

export default FormCheckbox;
