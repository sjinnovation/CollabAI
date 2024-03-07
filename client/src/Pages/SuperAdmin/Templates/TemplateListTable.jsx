import { Button, Table, } from "antd";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import DebouncedSearchInput from "../Organizations/DebouncedSearchInput";
import { useState } from "react";

const TemplateListTable = ({ propsData }) => {
    const { data, loader, actions } = propsData;
    const [searchQuery, setSearchQuery] = useState("");
    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (text) => <span>{text.length > 30 ? `${text.slice(0, 30)}...` : text}</span>,
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            render: (text) => <span>{text.length > 70 ? `${text.slice(0, 70)}...` : text}</span>,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text, record) => (
                <div style={{ width: "100px" }}>
                    {/* Edit button */}

                    <Button

                        type="link"
                        onClick={() => {
                            actions.setTemplateIdToEdit(record._id);
                            actions.fetchTemplateToEdit(record._id);

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
                            actions.setTemplateIdToDelete(record._id);
                            actions.setConfirmationModalOpen(true);
                        }}
                    >
                        <AiOutlineDelete />
                    </Button>
                </div>
            ),
        },

    ];

    // filtered templates based on search query
    const filteredTemplates = data?.filter((template) => {
        return template.title.toLowerCase().includes(searchQuery.toLowerCase()) 
        || 
        template.description.toLowerCase().includes(searchQuery.toLowerCase())
      }
      );

    return (
        <div>
            <div className="mb-4">
                <DebouncedSearchInput
                    data={{
                        search: searchQuery,
                        setSearch: setSearchQuery,
                        placeholder: "Search templates",
                    }}
                />
            </div>
            <Table
                loading={loader}
                columns={columns}
                dataSource={filteredTemplates}
                pagination={{
                    pageSize: 10,
                    total: filteredTemplates?.length,
                    onChange: (page, pageSize) => {
                        // fetchUserDetails(page)
                    },
                }}
                scroll={{ x: true, y: '50vh' }}
                bordered
                responsive
            />
        </div>
    )
}

export default TemplateListTable
