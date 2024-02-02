import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { Button, Table } from "antd";


const TagListTable = ({ propsData }) => {
    const { loader, data, actions } = propsData;
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
    return (
        <div>
            <Table
                loading={loader}
                columns={columns}
                dataSource={data}
                pagination={{
                    pageSize: 10,
                    total: data?.length,
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
