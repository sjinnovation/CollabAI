import React, { useState } from "react";

//---------libraries---------------//
import {
  Button,
  Space,
  Table,
  Tag,
  Tooltip,
  Switch,
  message
} from "antd";
import { AiOutlineDelete, AiOutlineTeam, AiOutlineEdit, AiOutlineArrowUp } from "react-icons/ai";
import { BsRobot } from "react-icons/bs";
import "./Assistant.css";
//-----Helper----------//
import { showDeleteConfirm , redirectToAssistant } from "../../Utility/assistant-helper"

//Components 
import AssistantTeamAssignModal from "./AssistantTeamAssignModal";
import DebouncedSearchInput from "../../Pages/SuperAdmin/Organizations/DebouncedSearchInput";
import { handleSwitchChange, showRemoveConfirm } from "../../Utility/showModalHelper";
import { AssistantNeedToActiveFirst } from "../../constants/PublicAndPrivateAssistantMessages";
import { handleCheckAssistantActive } from "../../Utility/addPublicAssistantHelper";



const AssistantTable = ({ data }) => {
  const {
    assistants,
    setAssistants,
    loader,
    teamList,
    handleAssignTeamToAssistant,
    handleDeleteAssistant,
    handleUpdateAssistant,
    showEditModalHandler,
    handleFetchAllAssistants,
    updateLoader,
    searchOrganizationalAssistants,
    orgAssistantSearchQuery,
    setOrgAssistantSearchQuery,
    handlePublicAssistantAdd
  } = data;
  const [selectedAssistant, setSelectedAssistant] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  // const [fromOrganizationalPage,setFromOrganizationalPage] = useState(true);

  //Local function 
  const handleViewTeams = (team) => {
    setSelectedAssistant(team);
  };

  const redirectToAssistant = (record) => {
    const assistantId = record.assistant_id;
    const url = `/assistants/${assistantId}`;
    window.open(url, "_blank");
  };

  //column 
  const columns = [
    {
      title: "Assistant",
      dataIndex: "name",
      key: "name",
      align: "center",
      render: (_, { name, image_url }) => (
        <Space size="middle" className="d-flex align-items-center">
          <div className="assistantImageDiv">
              {image_url ? (
                  <img src={image_url} className="customImage" alt="avatar" />
              ) : (
                  <BsRobot className="customImage" />
              )}
          </div>
          <div className="ms-2 text-start">{name}</div>
        </Space>
      ),
    },
    {
      title: "Created by",
      dataIndex: "userId",
      key: "userId",
      align: "center",
      render: (user) => <span className="text-left">{user?.fname}</span>,
    },
    {
      title: "Teams",
      key: "teamId",
      align: "center",
      dataIndex: "teamId",
      render: (_, { teamId: teams }) => (
        <div className="d-flex align-items-center flex-wrap gap-1">
          {(teams || [])?.map((team) => {
            return (
              <Tag color="geekblue" key={team._id}>
                {team.teamTitle.toUpperCase()}
              </Tag>
            );
          })}
        </div>
      ),
    },
    {
      title: "Status",
      key: "is_active",
      align: "center",
      dataIndex: "is_active",
      width: 100,
      render: (_, { is_active }) => (
        <Tag color={is_active ? "green" : "red"}>
          {is_active ? "active" : "inactive"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      width: 400,

      render: (_, record) => (
        <Space size="middle">
          <Button
            onClick={() => redirectToAssistant(record)}
            icon={<AiOutlineArrowUp />}
          ></Button>

          <Tooltip title="Activate or Deactivate">
            <Switch
              checked={record?.is_active}
              onChange={(checked) =>{
                let fromOrganizationalPage = true
                handleSwitchChange(record, checked, handleUpdateAssistant,fromOrganizationalPage)
                fromOrganizationalPage = false

              }}
              loading={
                loader.ASSISTANT_UPDATING === record._id ?? false
              }

            />
          </Tooltip>
          <Button
            onClick={() => showEditModalHandler(record)}
            icon={<AiOutlineEdit />}

          >

          </Button>
          <Button
            onClick={() => handleViewTeams(record)}
            icon={<AiOutlineTeam />}

          >
          </Button>
          <Button
            onClick={() => showDeleteConfirm(record?.assistant_id, record?.name, handleDeleteAssistant)}
            danger
            icon={<AiOutlineDelete />}
            loading={
              loader.ASSISTANT_DELETING === record._id
            }

          />
          <Tooltip title="Public or Private">
            <Switch
              checked={record?.is_public}
              onChange={(checked) =>{handleCheckAssistantActive(checked, record, handlePublicAssistantAdd)}
              }
              loading={
                loader.ASSISTANT_UPDATING === record._id ?? false
              }

            />
          </Tooltip>
        </Space>
        
      ),
    },
  ];

return (
    <>
      <>
        {
          <AssistantTeamAssignModal
            data={{
              selectedAssistant,
              setSelectedAssistant,
              teamList,
              handleAssignTeamToAssistant,
              isTeamAssigning: loader.ASSISTANT_UPDATING,
            }}
          />
        }
      </>
      <div className="mb-3">
        <DebouncedSearchInput
          data={{
            search: orgAssistantSearchQuery,
            setSearch: setOrgAssistantSearchQuery,
            placeholder: "Search Organizational Assistants",
          }}
        />
      </div>
      <Table
        loading={loader.ALL_ASSISTANT_LOADING}
        bordered={true}
        columns={columns}
        dataSource={assistants.assistants}
        scroll={{ y: '50vh' }}
        pagination={{
          pageSize: 10,
          total: assistants?.meta?.total,
          onChange: (page) => {
            handleFetchAllAssistants(page)
          }
        }}
      />
    </>
  );
};

export default AssistantTable;
