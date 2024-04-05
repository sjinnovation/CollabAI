import React from 'react'
import { Tabs, Row, Col } from 'antd';
import TrackUsage from './TrackUsage';
import DailyUsage from './DailyUsage';

const TrackUsageComponent = () => {

    const items = [
        {
          key: '1',
          label: 'Monthly Usage',
          children: <TrackUsage/>,
        },
        {
          key: '2',
          label: 'Daily Usage',
          children: <DailyUsage/>,
        },
       
      ]; 
  return (
    <div>
      <Row className='p-5'>
        <Col span={24}>
          <Tabs 
            defaultActiveKey="1" 
            items={items}
            className=" custom-tab"
            tabBarStyle={{ justifyContent: 'space-around' }}
          />
        </Col>
      </Row>
    </div>
  )
}

export default TrackUsageComponent
