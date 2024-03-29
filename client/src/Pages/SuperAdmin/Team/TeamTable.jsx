import { Button, Table, } from "antd";
import { useState } from "react";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import DebouncedSearchInput from "../Organizations/DebouncedSearchInput";

const TeamTable = ({ dataProps }) => {
  const { data, loader, actions } = dataProps;
  const [searchQuery, setSearchQuery] = useState("");

  const columns = [
    {
      title: 'Team',
      dataIndex: 'teamTitle',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <div>
          {/* Edit button */}

          <Button

            type="link"
            onClick={() => {
              actions.setTeamIdToEdit(record._id);
              actions.fetchTeamToUpdate(record._id);

            }}
            style={{ marginRight: 8 }}
          >
            <AiOutlineEdit />
          </Button>

          {/* Delete button */}
          <Button
            shape="circle"
            danger
            type="link"

            onClick={() => {
              actions.setTeamIdToDelete(record._id);
              actions.setConfirmationModalOpen(true);
            }}
          >
            <AiOutlineDelete />
          </Button>
        </div>
      ),
    },
  ]

  const filteredTeams = data?.filter((team) => {
    return team.teamTitle.toLowerCase().includes(searchQuery.toLowerCase())
  }
  );
  return (
    <div>
      <div className="mb-4">
        <DebouncedSearchInput
          data={{
            search: searchQuery,
            setSearch: setSearchQuery,
            placeholder: "Search team",
          }}
        />
      </div>
      <Table
        loading={loader}
        columns={columns}
        dataSource={filteredTeams}
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
    </div>
  );
};

export default TeamTable;