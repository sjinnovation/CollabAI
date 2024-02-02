import { Button, Table,} from "antd";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";

const TeamTable = ({dataProps}) => {
    const {data, loader, actions} = dataProps;

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
    );
};

export default TeamTable;