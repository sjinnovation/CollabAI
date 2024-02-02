import React from "react";

//libraries
import { Space, Table, Tag, Switch, message } from "antd";

//--------api ------//
import Assistant from "../../api/assistant";
const { toggleAssistantAccess } = Assistant();

const AssistantSettings = ({ data }) => {
  const { loader, teamList, handleFetchTeams } = data;


  //------Api calls------//
  const handleToggleAssistantAccess = async (record) => {
    try {
      const updatedValue = !record.hasAssistantCreationAccess;
      await toggleAssistantAccess(record._id, updatedValue, (updatedTeam) => {
        handleFetchTeams();
        message.success(`Team ${updatedTeam.teamTitle} updated successfully`);
      });
    } catch (error) {
      message.error("Something went wrong");
    }
  };

  //--------Table Columns--------//
  const columns = [
    {
      title: "Team name",
      dataIndex: "teamTitle",
      key: "teamTitle",
      render: (text) => <span className="text-left">{text}</span>,
    },
    {
      title: "Status",
      dataIndex: "hasAssistantCreationAccess",
      key: "hasAssistantCreationAccess",
      render: (hasAccess) => (
        <Tag color={hasAccess ? "green" : "red"}>
          {hasAccess ? "Given" : "Not Given"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Switch
            checked={record.hasAssistantCreationAccess}
            onChange={() => handleToggleAssistantAccess(record)}
            loading={loader.TEAM_LOADING}
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table
        loading={loader.TEAM_LOADING}
        bordered={true}
        columns={columns}
        dataSource={teamList}
        scroll={{ y: "50vh" }}
      />
    </>
  );
};

export default AssistantSettings;
