import { Button, List, Tooltip } from "antd";
import React from "react";
import { devicesData } from "../../../Pages/Account/utils/deviceData";
import './deviceResponsive.css'

const Device = () => {

  const logoutText = <span>This feature is Coming Soon</span>
  return (
    <List
      header={<strong style={{ fontSize: "15px" }}>Devices</strong>}
      size="medium"
      bordered
      dataSource={devicesData}
      className="profile-info-list"
      renderItem={(item) => (
        <List.Item>
          <List.Item.Meta
            title={item.title}
            description={
              item.title === "Log out of all devices" ? (
                <div
                className="device--logout__container"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <span>{item.description}</span>
                  <Tooltip placement="top" title={logoutText}>
                    <Button
                    size="middle"
                    type="primary"
                    disabled
                    className="custom-disabled-button"
                  >
                    Log out
                  </Button>
                  </Tooltip>

                </div>
              ) : (
                <span>{item.description}</span>
              )
            }
          />
        </List.Item>
      )}
    />
  );
};

export default Device;