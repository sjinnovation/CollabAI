import React from 'react'
import { Table } from 'antd';

const TableComponent = ({ dataProps}) => {
    const {usageReport} = dataProps;
    return (
        <Table
        loading={loader}
        columns={columns}
        dataSource={usageReport}
        pagination={{
          pageSize: 10,
          total: filteredTeams?.length,
          onChange: (page, pageSize) => {
            // fetchUserDetails(page)
          },
        }}
        scroll={{ x: true, y: '50vh' }}
        bordered
        responsive
      />
      );
}

export default TableComponent
