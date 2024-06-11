import React, { useState } from 'react'
import { Button, Table } from 'antd';

const AssistantUsageTable = ({ dataProps }) => {
  const { data, loading, actions } = dataProps;
  const [pageSize, setPageSize] = useState(10);

  const handlePageSizeChange = (current, size) => {
    setPageSize(size);
  };

  const columns = [
    {
      title: "Assistant Name",
      dataIndex: "assistantName",
      width: '20%',
      onHeaderCell: () => {
        return {
          style: {
            textAlign: 'center',
          }
        };
      },
    },
  
    {
      title: "Total Users",
      dataIndex: "uniqueUserCount",
      width: '20%',
      onHeaderCell: () => {
        return {
          style: {
            textAlign: 'center',
          }
        };
      },
    },
    {
      title: "Total Usage Count",
      dataIndex: "totalUsageCount",
      width: '20%',
      onHeaderCell: () => {
        return {
          style: {
            textAlign: 'center',
          }
        };
      },
    },
    {
      title: "Action",
      width: '20%',
      render: (text, record) => (
        <div>
          {/* Edit button */}

          <Button
            type="link"
            onClick={() => {
             actions.handleFetchAllUsersForAnAssistant(record?.assistantId)

            }}
            style={{ marginRight: 8 }}
          >
           <span>
              <i className="bi bi-arrow-up-right-circle "></i>
            </span>
          </Button>
        </div>
      ),
      onHeaderCell: () => {
        return {
          style: {
            textAlign: 'center',
          }
        };
      },
    },
  ];

  return (
    <div>
      <Table
        loading={loading}
        columns={columns}
        dataSource={data}
        scroll={{ x: true, y: '50vh' }}
        bordered
        responsive
        pagination={{
          pageSize: pageSize,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '30', '40', '50'],
          onShowSizeChange: handlePageSizeChange,
        }}
      />
    </div>
  )
}

export default AssistantUsageTable
