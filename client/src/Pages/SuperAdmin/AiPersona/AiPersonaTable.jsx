import { Button, Table } from "antd";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { useEffect, useState } from "react";
import DebouncedSearchInput from "../Organizations/DebouncedSearchInput";

// test
import { Input } from 'antd';
const { TextArea } = Input;

const placeholders = [
  "Search by AI persona name - Enter the name of the AI persona you want to find...",
  "Search by persona description - Type keywords to search through persona descriptions...",
  "Find personas by icon name - Enter the icon name to filter personas...",
  "Filter personas by category - Type to search and filter by persona categories..."
];

const AiPersonaTable = ({ propsData }) => {
  const { data, loader, actions } = propsData;
  const [searchQuery, setSearchQuery] = useState("");

  const columns = [
    {
      title: "Instruction Name",
      dataIndex: "personaName",
      key: "personaName",
      width: "20%",
      onHeaderCell: () => ({
        style: { textAlign: "center" }
      }),
      render: (text, record) => <span>{record.personaName}</span>
    },

    {
      title: "Avatar",
      dataIndex: "avatar",
      key: "avatar",
      width: "20%",
      onHeaderCell: () => ({
        style: { textAlign: "center" }
      }),
      render: (text, record) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <img
            src={record.avatar}
            alt={record.personaName}
            style={{
              width: '50px',
              height: '50px',
              objectFit: 'cover',
              borderRadius: '4px'
            }}
          />
        </div>
      )
    },
    {
      title: "Created By",
      dataIndex: "createdByName",
      key: "createdByName",
      width: "15%",
      onHeaderCell: () => ({
        style: { textAlign: "center" }
      }),
      render: (text, record) => (
        <span>
          {record?.createdBy?.fname} {record.createdBy?.lname}
        </span>
      )
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "30%",
      onHeaderCell: () => ({
        style: { textAlign: "center" }
      }),
      render: (text, record) => {
        const words = record.description.split(" ");
        const truncatedDescription = words.length > 10 ? words.slice(0, 16).join(" ") + "..." : record.description;
        return <span>{truncatedDescription}</span>;
      }
    },
    {
      title: "Featured",
      dataIndex: "featured",
      key: "featured",
      width: "10%",
      onHeaderCell: () => ({
        style: { textAlign: "center" }
      }),
      render: (text, record) => (
        <span
          style={{
            color: record.isFeatured ? 'green' : 'red',
            padding: '2px 8px',
            border: '1px solid',
            borderColor: record.isFeatured ? 'green' : 'red',
            borderRadius: '5px',
          }}
        >
          {record.isFeatured ? "Yes" : "No"}
        </span>
      )
    },
    {
      title: "Actions",
      key: "actions",
      width: "10%",
      onHeaderCell: () => ({
        style: { textAlign: "center" }
      }),
      render: (text, record) => (
        <div className="d-flex justify-content-center">
          <Button
            type="link"
            onClick={() => {
              actions.setAiPersonaIdToEdit(record._id);
              actions.fetchAiPersonaToEdit(record._id);
            }}
            style={{ marginRight: 8 }}
          >
            <AiOutlineEdit />
          </Button>
          <Button
            shape="circle"
            danger
            type="link"
            onClick={() => {
              actions.setAiPersonaIdToDelete(record._id);
              actions.setConfirmationModalOpen(true);
            }}
          >
            <AiOutlineDelete />
          </Button>
        </div>
      ),
    },
  ];

    // Updated filtering logic based on your data structure
    const filteredPersonas = data?.personas?.filter((persona) => {
      if (!searchQuery) return true;

      return (
        persona.personaName?.toLowerCase().includes(searchQuery.toLowerCase())
        // persona.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

  return (
    <div>
      <div className="mb-4">
        <DebouncedSearchInput
          data={{
            search: searchQuery,
            setSearch: setSearchQuery,
            placeholder: "Search by persona name, description, or icon",
          }}
        />
      </div>
      <Table
        loading={loader}
        columns={columns}
        dataSource={filteredPersonas || []}
        pagination={{
          pageSize: 10,
          // current: data?.currentPage,
          total: data?.totalCount,
          onChange: (page, pageSize) => {
            // Add your pagination handler here if needed
          },
        }}
        scroll={{ x: 1000, y: "50vh" }}
        bordered
        responsive
      />
    </div>
  );
};

export default AiPersonaTable;