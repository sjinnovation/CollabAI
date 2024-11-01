import React, { useEffect, useState } from "react";

//libraries
import { Space, Table, Tag, Switch, message, Button } from "antd";

//--------api ------//
import { updateAssistantAccessForTeam } from "../../api/assistant";
import { getConfig, getPersonalizeAssistantSetting, updateConfig } from "../../api/settings";
import { FileContext } from "../../contexts/FileContext";
import { useContext } from "react";

const AssistantSettings = ({ data }) => {
  const { loader, teamList, handleFetchTeams } = data;
  const {enablePersonalize,setEnablePersonalize} = useContext(FileContext);


  useEffect(() => {
    getPersonalizeAssistantSetting().then(response =>{
      let isPersonalizeAssistantEnabled= false;
    if(response!== undefined){
      isPersonalizeAssistantEnabled = JSON.parse(response?.personalizeAssistant);
    }
      setEnablePersonalize(isPersonalizeAssistantEnabled);
    });

  }, []);
  //------Api calls------//
  const handleToggleAssistantAccess = async (record) => {
    try {
      const updatedAccessBoolean = !record.hasAssistantCreationAccess;
      const payload = {
        hasAssistantCreationAccess: updatedAccessBoolean,
      };
      const response = await updateAssistantAccessForTeam(record._id, payload);

      if (response) {
        handleFetchTeams();
        message.success(`Team ${record?.teamTitle} updated successfully`);
      }
    } catch (error) {
      message.error(error.response.data.message || error.message);
    }
  };

  //--------Table Columns--------//
  const columns = [
    {
      title: "Team name",
      dataIndex: "teamTitle",
      key: "teamTitle",
      align: "center",
      render: (text) => <span className="text-left">{text}</span>,
    },
    {
      title: "Status",
      dataIndex: "hasAssistantCreationAccess",
      key: "hasAssistantCreationAccess",
      align: "center",
      render: (hasAccess) => (
        <Tag color={hasAccess ? "green" : "red"}>
          {hasAccess ? "Given" : "Not Given"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "center",
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
const handleOnClickPersonalize =async ()=>{
  setEnablePersonalize(!enablePersonalize);
  const responseOfPersonalize = await updateConfig({personalizeAssistant : !enablePersonalize});
  if(responseOfPersonalize){
    message.success(responseOfPersonalize.message);

  }
};
  return (
    <>
      <div className="mb-3">
          Enable Personalized Agent &nbsp;&nbsp;&nbsp;
          <Switch
          onChange={handleOnClickPersonalize}
              checked={enablePersonalize}
            />
         </div>
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
