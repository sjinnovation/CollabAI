import { Button, Table } from "antd";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import DebouncedSearchInput from "../Organizations/DebouncedSearchInput";
import { useState } from "react";

const TaskCommandListTable = ({ propsData }) => {
  const { data, loader, actions } = propsData;

  const [searchQuery, setSearchQuery] = useState("");

  const columns = [
    {
      title: "Label",
      dataIndex: "label",
      key: "label",
      width: "25%",
      onHeaderCell: () => {
        return {
          style: {
            textAlign: "center",
          },
        };
      },
      render: (label, record) => (
        <span>{record.commands && record.commands.label}</span>
      ),
    },
    {
      title: "Icon Name",
      dataIndex: "icon",
      key: "icon",
      width: "20%",
      onHeaderCell: () => {
        return {
          style: {
            textAlign: "center",
          },
        };
      },
      render: (icon, record) => (
        <span>{record.commands && record.commands.icon}</span>
      ),
    },
    {
      title: "Commands Category Name",
      dataIndex: "commandsCategoryName",
      key: "commandsCategoryName",
      width: "35%",
      onHeaderCell: () => {
        return {
          style: {
            textAlign: "center",
          },
        };
      },
      render: (category) => <span>{category}</span>,
    },
    {
      title: "Actions",
      key: "actions",
      width: "20%",
      onHeaderCell: () => {
        return {
          style: {
            textAlign: "center",
          },
        };
      },
      render: (text, record) => (
        <div className="d-flex justify-content-center">
          {/* Edit button */}
          <Button
            type="link"
            onClick={() => {
              actions.setTaskCommandIdToEdit(record._id);
              actions.fetchTaskCommandToEdit(record._id);
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
              actions.setTaskCommandIdToDelete(record._id);
              actions.setConfirmationModalOpen(true);
            }}
          >
            <AiOutlineDelete />
          </Button>
        </div>
      ),
    },
  ];

  // filtered task commands based on search query
  const filteredTaskCommands = data?.filter((taskCommand) => {
    const labelMatch = taskCommand.commands.label
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const categoryMatch = taskCommand.commandsCategoryName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return labelMatch || categoryMatch;
  });

  return (
    <div>
      <div className="mb-4">
        <DebouncedSearchInput
          data={{
            search: searchQuery,
            setSearch: setSearchQuery,
            placeholder: "Search task commands",
          }}
        />
      </div>
      <Table
        loading={loader}
        columns={columns}
        dataSource={filteredTaskCommands}
        pagination={{
          pageSize: 10,
          total: filteredTaskCommands?.length,
          onChange: (page, pageSize) => {},
        }}
        scroll={{ x: true, y: "50vh" }}
        bordered
        responsive
      />
    </div>
  );
};

export default TaskCommandListTable;
