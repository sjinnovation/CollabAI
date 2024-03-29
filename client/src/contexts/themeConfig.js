import { theme } from 'antd';

export const config = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#1890ff',
  },
  components: {
    Button: {
      // colorPrimary: '#00b96b',
      algorithm: true, // Enable algorithm
    },
    Input: {
      colorPrimary: '#2c2a2a',
      // algorithm: true, // Enable algorithm

      colorBorder: '#2c2a2a',
    },
    Form: {
      colorPrimary: '#eb2f96',
      backgroundColor: '#ff0000',
      // algorithm: true, // Enable algorithm
      border: '1px solid rgb(44, 48, 53)',
    },
    message: {
      top: '20px',
      right: '20px',
      position: 'fixed',
    },
  },
};
