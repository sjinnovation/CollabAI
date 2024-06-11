import React, { useState } from 'react';
import { Table } from 'antd';

const UserTrackUsageTable = ({ dataProps }) => {
  const { data, columns, loading } = dataProps;
  const [pageSize, setPageSize] = useState(10);

  const handlePageSizeChange = (current, size) => {
    setPageSize(size);
  };

  return (
    <div className='mt-2'>
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
  );
};

export default UserTrackUsageTable;
