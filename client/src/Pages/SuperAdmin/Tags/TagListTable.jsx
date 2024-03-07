import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { Button, Table } from "antd";
import DebouncedSearchInput from "../Organizations/DebouncedSearchInput";
import { useState } from "react";


const TagListTable = ({ propsData }) => {
    const { loader, data, actions } = propsData;
    const [searchQuery, setSearchQuery] = useState("");
    const columns = [
        {
            title: 'Tag',
            dataIndex: 'title',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text, record) => (
                <div>
                    {/* Edit button */}

                    <Button
                        type="link"
                        style={{ marginRight: 8 }}
                        onClick={() => {
                            actions.setTagIdToEdit(record._id)
                            actions.fetchTagToEdit(record._id)
                        }}
                    >
                        <AiOutlineEdit />
                    </Button>

                    {/* Delete button */}
                    <Button
                        shape="circle"
                        danger
                        type="link"
                        onClick={() => {
                            actions.setTagIdToDelete(record._id)
                            actions.setConfirmationModalOpen(true);
                        }}
                    >
                        <AiOutlineDelete />
                    </Button>
                </div>
            ),
        },
    ]

    const filteredTags = data?.filter((tag) => {
        return tag.title.toLowerCase().includes(searchQuery.toLowerCase())
    }
    );

    return (
        <div>
            <div className="mb-4">
                <DebouncedSearchInput
                    data={{
                        search: searchQuery,
                        setSearch: setSearchQuery,
                        placeholder: "Search tag",
                    }}
                />
            </div>

            <Table
                loading={loader}
                columns={columns}
                dataSource={filteredTags}
                pagination={{
                    pageSize: 10,
                    total: filteredTags?.length,
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

export default TagListTable
