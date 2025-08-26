import React, { useEffect, useState } from "react"
import { Table } from "antd"
import './UserTrackUsageTableResponsive.css'

export const UserTrackUsageTable = ({ dataProps }) => {
  const { data, columns, loading, selectionMode, onSelectionChange, selectedRows } = dataProps
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePageSizeChange = (current, size) => {
    setPageSize(size)
  }

  const getRowKey = (record) => {
    return `${record._id.year}-${record._id.month}-${record._id.day}-${record.user_info.email}`;
  };

  const rowSelection = selectionMode
    ? {
        selectedRowKeys: selectedRows.map(getRowKey),
        onChange: (selectedRowKeys, selectedRows) => {
          onSelectionChange(selectedRowKeys, selectedRows);
        },
      }
    : undefined;

  return (
    <div className="mt-2">
      <Table
        loading={loading}
        columns={columns}
        dataSource={data}
        rowKey={getRowKey}
        rowSelection={rowSelection}
        responsive
        scroll={{ x: 1000, y: "50vh" }}
        pagination={{
            current: currentPage,
            pageSize: pageSize,
            showSizeChanger: true,
            position: [isMobile ? "bottomRight" : "topRight"],
            onShowSizeChange: (current, size) => {
              setPageSize(size);
              setCurrentPage(1);
            },
            onChange: (page) => setCurrentPage(page),
            showTotal: (total, range) => (
              <span className="fw-semibold">{`${range[0]}-${range[1]} of ${total} items`}</span>
            ),
          }}
        className="custom-table custom-table-responsive"
      />
    </div>
  )
}

export default UserTrackUsageTable

