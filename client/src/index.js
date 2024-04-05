import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './main.scss';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NewAuthProvider } from './contexts/NewAuthProvider';
import { ConfigProvider } from 'antd';
import { config } from './contexts/themeConfig';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ConfigProvider mode="dark" theme={config}>
      <BrowserRouter>
        <NewAuthProvider>
            <Routes>
              <Route path="/*" element={<App />} />
            </Routes>
        </NewAuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics . Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
