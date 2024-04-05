import React from 'react'
import { Table } from 'antd';

const UserTrackUsageTable = ({dataProps}) => {
  const {data, columns ,loading} = dataProps;


  return (
    <div className='mt-2'>
      <Table
        loading={loading}
        columns={columns}
        dataSource={data}
        // pagination={{
        //   pageSize: 10,
        //   total: filteredTeams?.length,
        //   onChange: (page, pageSize) => {
        //     // fetchUserDetails(page)
        //   },
        // }}
        scroll={{ x: true, y: '50vh' }}
        bordered
        responsive
      />
    </div>
  )
}

export default UserTrackUsageTable
