import { Button, Table, Typography } from "antd";

const DevUsageTable = ({ dataProps }) => {
  const {
    data,
    loading,
    actions,
    totalDataCount,
    pageSize,
    currentPage,
    handlePageChange,
    handlePageSizeChange,
    selectionMode,
    onSelectionChange,
    selectedRowKeys,
  } = dataProps;

  const getRowKey = (record) => record.user_id;

  const columns = [
    {
      title: "Month",
      dataIndex: "monthName",
      width: "15%",
      onHeaderCell: () => ({ style: { textAlign: "center" } }),
    },
    {
      title: "Email",
      dataIndex: "email",
      width: "30%",
      render: (email) => (
        <div style={{ display: "flex", alignItems: "center",justifyContent: "center" }}>
          <Typography.Text>{email}</Typography.Text>
        </div>
      ),
      onHeaderCell: () => ({ style: { textAlign: "center" } }),
    },
    {
      title: "Total Prompts",
      dataIndex: "totalPromptCount",
      width: "15%",
      onHeaderCell: () => ({ style: { textAlign: "center" } }),
    },
    {
      title: "Total Tokens",
      dataIndex: "totalTokenCount",
      width: "15%",
      onHeaderCell: () => ({ style: { textAlign: "center" } }),
    },
    {
      title: "OpenAI Tokens",
      dataIndex: "totalOpenAICount",
      width: "15%",
      onHeaderCell: () => ({ style: { textAlign: "center" } }),
    },

    {
      title: "Claude Tokens",
      dataIndex: "totalClaudeCount",
      width: "15%",
      onHeaderCell: () => ({ style: { textAlign: "center" } }),
    }
    //**Could be used for future scope **//
    // {
    //   title: "Action",
    //   width: "15%",
    //   render: (text, record) => (
    //     <div>
    //       <Button
    //         type="link"
    //         onClick={() => actions.handleFetchUserDetails(record.user_id)}
    //         style={{ marginRight: 8 }}
    //       >
    //         <span>
    //           <i className="bi bi-arrow-up-right-circle"></i>
    //         </span>
    //       </Button>
    //     </div>
    //   ),
    //   onHeaderCell: () => ({ style: { textAlign: "center" } }),
    // },
  ];

  return (
    <div className="mt-2">
      <Table
        loading={loading}
        columns={columns}
        dataSource={data}
        rowKey={getRowKey}
        rowSelection={
          selectionMode
            ? {
                selectedRowKeys,
                onChange: onSelectionChange,
                preserveSelectedRowKeys: true,
              }
            : undefined
        }
        scroll={{ x: "max-content" }}
        bordered
        pagination={{
          current: currentPage,
          pageSize,
          total: totalDataCount,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "30", "40", "50"],
          position: ["topRight"],
          onChange: handlePageChange,
          onShowSizeChange: handlePageSizeChange,
          showTotal: (total, range) => (
            <span className="fw-semibold">{`${range[0]}-${range[1]} of ${total} items`}</span>
          ),
        }}
        className="custom-table dev-usage-table"
      />
    </div>
  );
};

export default DevUsageTable;