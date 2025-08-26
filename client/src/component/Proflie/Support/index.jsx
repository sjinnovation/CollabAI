import React from 'react'
import { supportData } from '../../../Pages/Account/utils/supportData'
import { Button, List, Tooltip } from 'antd'
import './supportResponsive.css'

const Support = () => {

  const deleteText =<span>This feature is Coming Soon </span>
  return (
    <List
    header={<strong style={{fontSize: "15px"}}>Deactivate Account</strong>}
    size="medium"
    bordered
    dataSource={supportData}
    className="profile-info-list"
    renderItem={(item) => (
      <List.Item>
        <List.Item.Meta
          title={
            item.title === "Delete my account" ? (
              <div>
                <span style={{ color: "red", cursor: "pointer" }}>
                  {item.title}
                </span>
              </div>
            ) : (
              <span>{item.title}</span>
            )
          }
          description={
            item.title === "Delete my account" ? (
              <div>
                <span className="delete--account__container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{item.description}</span>
                  <Tooltip placement="top" title={deleteText}>
                  <Button size="middle" type='primary' disabled className='custom-disabled-button'>Delete</Button>
                  </Tooltip>
                </span>
              </div>
            ) : (
              <span>{item.description}</span>
            )
          }
        />
      </List.Item>
    )}
  />
  )
}

export default Support