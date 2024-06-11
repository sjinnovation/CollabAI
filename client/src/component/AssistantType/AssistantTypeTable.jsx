import { Button, Table, } from "antd";
import { useState } from "react";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import DebouncedSearchInput from "../../Pages/SuperAdmin/Organizations/DebouncedSearchInput";

const AssistantTypeTable = ({ dataProps }) => {
  const { data, loader, actions } = dataProps;
  const [searchQuery, setSearchQuery] = useState("");

  const columns = [
    {
      title: 'Assistant Types',
      dataIndex: 'name',
      align:'center'
    },
    {
      title: 'Actions',
      key: 'actions',
      align:'center',

      render: (text, record) => (
        <div>
          {/* Edit button */}

          <Button

            type="link"
            onClick={() => {
              actions.setAssistantTypeIdToEdit(record._id);
              actions.fetchAssistantTypeUpdate(record._id);

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
              actions.setAssistantTypeIdToDelete(record._id);
              actions.setConfirmationModalOpen(true);
            }}
          >
            <AiOutlineDelete />
          </Button>
        </div>
      ),
    },
  ]

  const filteredAssistantTypes = data?.filter((assistantType) => {
    return assistantType.name?.toLowerCase().includes(searchQuery.toLowerCase())
  }
  );
  return (
    <div>
      <div className="mb-4">
        <DebouncedSearchInput
          data={{
            search: searchQuery,
            setSearch: setSearchQuery,
            placeholder: "Search Assistant Type",
          }}
        />
      </div>
      <Table
        loading={loader}
        columns={columns}
        dataSource={filteredAssistantTypes}
        pagination={{
          pageSize: 10,
          total: filteredAssistantTypes?.length,
        }}
        scroll={{ x: true, y: '50vh' }}
        bordered
        responsive
      />
    </div>
  );
};

export default AssistantTypeTable;