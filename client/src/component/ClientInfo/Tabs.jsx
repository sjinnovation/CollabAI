import React from 'react';
import '../../Pages/PortfolioManagement/ClientInfo/ClientInfo.scss'

export const Tabs = ({ children }) => (
  <div className="tabs1">{children}</div>
);

export const TabsList = ({ children }) => (
  <div className="tabs-list">{children}</div>
);

export const TabsTrigger = ({ children, isActive, onClick }) => (
  <button1
    className={`tabs-trigger ${isActive ? "active" : ""}`}
    onClick={onClick}
  >
    {children}
  </button1>
);

export const TabsContent = ({ children, isActive }) => (
  <div className={`tabs-content ${isActive ? "active" : ""}`}>{children}</div>
);

