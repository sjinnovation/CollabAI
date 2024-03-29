import React from "react";
  import { Alert } from 'antd';

const Error = ({ message }) => {
  return (
    <Alert message={message} type="error" showIcon />
  );
};

export default Error;
