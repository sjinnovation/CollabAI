import React, { useState } from "react";

//---------libraries---------------//
import {
  Button,
  Space,
  Table,
  Tag,
  Tooltip,
  Switch,
} from "antd";
import { AiOutlineDelete, AiOutlineTeam, AiOutlineEdit, AiOutlineArrowUp } from "react-icons/ai";

//-----Helper----------//
import { showDeleteConfirm } from "../../Utility/assistant-helper"

//Components 
import AssistantTeamAssignModal from "./AssistantTeamAssignModal";
import DebouncedSearchInput from "../../Pages/SuperAdmin/Organizations/DebouncedSearchInput";
import { useEffect } from "react";
import { axiosSecureInstance } from "../../api/axios";
import { SEARCH_ALL_ORGANIZATIONAL_ASSISTANTS_SLUG } from "../../constants/Api_constants";


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
    setOrgAssistantSearchQuery
  } = data;
  const [selectedAssistant, setSelectedAssistant] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  //Local function 
  const handleViewTeams = (team) => {
    setSelectedAssistant(team);
  };

  const redirectToAssistant = (record) => {

    const assistantName = record.name.split(" ").join("-");
    const assistantId = record.assistant_id;
    const url = `/assistants/${assistantName}/${assistantId}`;
    window.open(url, "_blank");
  };

  //column 
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="text-left">{text}</span>,
    },
    {
      title: "Created by",
      dataIndex: "userId",
      key: "userId",
      render: (user) => <span className="text-left">{user?.fname}</span>,
    },
    {
      title: "Teams",
      key: "teamId",
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
      render: (_, record) => (
        <Space size="middle">
          <Button
            onClick={() => redirectToAssistant(record)}
            icon={<AiOutlineArrowUp />}
          ></Button>

          <Tooltip title="Activate or Deactivate">
            <Switch
              checked={record?.is_active}
              onChange={(checked) =>
                handleUpdateAssistant(record._id, {
                  is_active: checked,
                })
              }
              loading={
                loader.ASSISTANT_UPDATING === record._id ?? false
              }
              disabled={loader.ALL_ASSISTANT_LOADING ||
                loader.ASSISTANT_UPDATING
              }
            />
          </Tooltip>
          <Button
            onClick={() => showEditModalHandler(record)}
            icon={<AiOutlineEdit />}
            disabled={
              loader.ASSISTANT_LOADING
            }
          >

          </Button>
          <Button
            onClick={() => handleViewTeams(record)}
            icon={<AiOutlineTeam />}
            disabled={loader.ALL_ASSISTANT_LOADING ||
              loader.ASSISTANT_UPDATING
            }
          >
          </Button>
          <Button
            onClick={() => showDeleteConfirm(record?.assistant_id, record?.name, handleDeleteAssistant)}
            danger
            icon={<AiOutlineDelete />}
            loading={
              loader.ASSISTANT_DELETING === record._id
            }
            disabled={loader.ASSISTANT_LOADING ||
              loader.ASSISTANT_DELETING
            }
          />
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
