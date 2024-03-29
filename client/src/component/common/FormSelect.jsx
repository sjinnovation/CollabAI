import { Form, Select } from 'antd';

const FormSelect = ({ name, label, options }) => (
  <Form.Item name={name} label={label}>
    <Select placeholder={`Select your ${label.toLowerCase()}`}>
      {options.map(option => (
        <Select.Option key={option.value} value={option.value}>
          {option.label}
        </Select.Option>
      ))}
    </Select>
  </Form.Item>
);

export default FormSelect;