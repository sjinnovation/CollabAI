import React, { useState } from 'react'
import { Button, Table } from 'antd';

const AssistantUsageTable = ({ dataProps }) => {
  const { data, loading, actions, totalDataCount } = dataProps;
  const [pageSize, setPageSize] = useState(10);

  const columns = [
    {
      title: "Month",
      dataIndex: "monthName",
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
          total: totalDataCount,
          onChange: (page) => {
            actions.handleFetchAssistantMonthlyReport(page)
          }
        }}
      />
    </div>
  )
}

export default AssistantUsageTable
