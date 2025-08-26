import { Button, Table, Typography } from "antd";

const AssistantUsageTable = ({ dataProps }) => {
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

  const getRowKey = (record) => record.assistantId;

  const columns = [
    {
      title: "Month",
      dataIndex: "monthName",
      width: "10%",
      onHeaderCell: () => ({ style: { textAlign: "center" } }),
    },
    {
      title: "Assistant Name",
      dataIndex: "assistantName",
      width: "30%",
      render: (assistantName) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Typography.Text>{assistantName}</Typography.Text>
        </div>
      ),
      onHeaderCell: () => ({ style: { textAlign: "center" } }),
    },
    {
      title: "Agent Owner",
      dataIndex: "ownerName",
      width: "15%",
      onHeaderCell: () => ({ style: { textAlign: "center" } }),
    },
    {
      title: "Total Users",
      dataIndex: "uniqueUserCount",
      width: "10%",
      onHeaderCell: () => ({ style: { textAlign: "center" } }),
    },
    {
      title: "Total Usage Count",
      dataIndex: "totalUsageCount",
      width: "10%",
      onHeaderCell: () => ({ style: { textAlign: "center" } }),
    },
    {
      title: "Action",
      width: "10%",
      render: (text, record) => (
        <div>
          <Button
            type="link"
            onClick={() =>
              actions.handleFetchAllUsersForAnAssistant(record?.assistantId)
            }
            style={{ marginRight: 8 }}
          >
            <span>
              <i className="bi bi-arrow-up-right-circle"></i>
            </span>
          </Button>
        </div>
      ),
      onHeaderCell: () => ({ style: { textAlign: "center" } }),
    },
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
        className="custom-table assistant-usage-table"
      />
    </div>
  );
};

export default AssistantUsageTable;
