import React, { useEffect, useState } from "react";

//libraries
import { Space, Table, Tag, Switch, message, Button } from "antd";

//--------api ------//
import { updateAssistantAccessForTeam } from "../../api/assistant";
import { getConfig, getPersonalizeAssistantSetting, updateConfig } from "../../api/settings";
import { FileContext } from "../../contexts/FileContext";
import { useContext } from "react";
import { axiosSecureInstance } from "../../api/axios";
import { SyncOutlined } from "@ant-design/icons";
import ConfigurationHeader from "../Configuration/ConfigurationHeader/ConfigurationHeader";

const AssistantSettings = ({ data }) => {
  const { loader, teamList, handleFetchTeams } = data;
  const {enablePersonalize,setEnablePersonalize} = useContext(FileContext);
  const [isAssistantSyncing,setIsAssistantSyncing] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

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

const handleSyncButton = async ()=>{
  setIsAssistantSyncing(true);
  data.updateLoader({ASSISTANT_LOADING:true});
  const isSyncSuccess = await axiosSecureInstance.get('api/assistants/public/sync');
  message.success(isSyncSuccess.data.message);
  data.updateLoader({ASSISTANT_LOADING:false});
  setIsAssistantSyncing(false);
};

  return (
    <>
    <ConfigurationHeader title="AI Model Configuration" subHeading="Configure and personalize your AI assistant. Manage team access and customize assistant behavior to suit your needs." />
    <div style={{display:"flex",alignItems:"center", marginBottom:"10px", gap:"20px"}}>
      <div>
          Enable Personalized Agent &nbsp;&nbsp;&nbsp;
          <Switch
          onChange={handleOnClickPersonalize}
              checked={enablePersonalize}
            />
         </div>
         <div>
          Sync Public Assistants  <Button icon={data.loader.ASSISTANT_LOADING && isAssistantSyncing?<SyncOutlined spin/>:<SyncOutlined  />} onClick={handleSyncButton}></Button>
        </div>
      </div>
      <Table
        loading={loader.TEAM_LOADING}
        columns={columns}
        dataSource={teamList}
        scroll={{ x: 1000, y: "50vh" }}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          showSizeChanger: true,
          position: ["topRight"],
          onShowSizeChange: (current, size) => {
            setPageSize(size);
            setCurrentPage(1);
          },
          onChange: (page) => setCurrentPage(page),
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
        }}
      />
    </>
  );
};

export default AssistantSettings;
