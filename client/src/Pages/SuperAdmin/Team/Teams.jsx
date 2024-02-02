import { useEffect, useState } from "react";
import { Button, Typography, message as AntdMessage } from "antd";
import CreateTeamModal from "./CreateTeamModal";
import ConfirmationModal from "./ConfirmationModal";
import EditTeamModal from "./EditTeamModal";
import TeamTable from "./TeamTable";
import { createTeam, deleteTeam, getTeamById, getTeams, updateTeam } from "../../../api/team-admin";
const { Title } = Typography;

const TeamList = () => {
 //-------------States-------------
  const [teamList, setTeamList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState();
  const [loader, setLoader] = useState(false);
  const [createTeamModalOpen, setCreateTeamModalOpen] = useState(false);
  const [confirmationModalOpen, setConfirmationModalOpen]= useState(false);
  const [teamIdToDelete, setTeamIdToDelete] = useState(null);
  const [teamToUpdate, setTeamToUpdate] = useState(null);
  const [editTeamModalOpen,setEditTeamModalOpen]= useState(false);
  const [teamIdToEdit, setTeamIdToEdit]= useState(null);
  const limit = 10;

//-------------Side_Effects-------------
  useEffect(() => {
    handleFetchTeams();
  },[lastPage, currentPage, limit]);


//-----------API_Calls------------------

const handleFetchTeams = async () => {
  try {
    setLoader(true)
    const { success, data, pageCount, message } = await getTeams(currentPage, limit);
    if (success) {
      setTeamList(data);
      setLastPage(pageCount);
      setLoader(false);
    } else {
      setLoader(false);
      AntdMessage.error(message);
    }
  } finally {
    setLoader(false);
  }
};

const handleCreateTeam = async (title) => {
  try {
    setLoader(true);
    const { success, data, message, error } = await createTeam(title);
    if (success) {
      AntdMessage.success(message);
      setLoader(false);
      handleFetchTeams();
    } else {
      setLoader(false);
      console.error("Error creating team:", error);
      AntdMessage.error(message);
    }
  } finally {
    setLoader(false);
  }
};

const handleDeleteTeam = async () => {
  try {
    setLoader(true);
    const { success, message } = await deleteTeam(teamIdToDelete);
    if (success) {
      AntdMessage.success(message);
      handleFetchTeams();
      setConfirmationModalOpen(false);
    } else {
      AntdMessage.error(message);
    }
  } finally {
    setLoader(false);
    setConfirmationModalOpen(false);
  }
};

const fetchTeamToUpdate = async (id) => {
  try {
    setLoader(true);
    const { success, data, message } = await getTeamById(id);
    if (success) {
      setTeamToUpdate(data);
      setEditTeamModalOpen(true);
    } else {
      AntdMessage.error(message);
    }
  } finally {
    setLoader(false);
  }
};

const handleTeamEdit = async (updatedData) => {
  try {
    setLoader(true);
    const { success, data,  message } = await updateTeam(teamIdToEdit, updatedData);
    if (success) {
      AntdMessage.success(message);
      handleFetchTeams();
    } else {
      AntdMessage.error(message);
    }
  } finally {
    setLoader(false);
  }
};



// -----------------Local Functions--------------
  const showCreateTeamModal = ()=>{
    setCreateTeamModalOpen(true)
  }

  const handleCancel = () => {
    setConfirmationModalOpen(false);
  };

  return (
    <>
      <div className="mt-5" >
        <div className="container" >
          <div className="d-flex align-items-center justify-content-between">
            <div className="col-8">
              <Title level={2}>Team Lists</Title>
            </div>
            <div>
              <Button onClick={showCreateTeamModal}>+ Team</Button>
            </div>
          </div>
          <div>
          </div>
          <div>

            <TeamTable
            dataProps = {{
              loader,
              data: teamList,
              actions: {
                setTeamIdToDelete,
                setConfirmationModalOpen,
                setTeamIdToEdit,
                fetchTeamToUpdate
              }
            }}
            />
          </div>

          {/* Create Team Modal  */}
          <CreateTeamModal
           dataProps = {{
            open: createTeamModalOpen,
            setOpen: setCreateTeamModalOpen,
            
            actions: {
              handleCreateTeam
            }
           }}
          />
          {/* Edit Team Modal  */}
          <EditTeamModal
          propsData= {{
          open: editTeamModalOpen,
          setOpen: setEditTeamModalOpen,
          data: teamToUpdate,
          actions: {
            handleTeamEdit,
          }
          }}
          />

          {/* Confirmation Modal  */}
          <ConfirmationModal
          open={confirmationModalOpen}
          onConfirm={handleDeleteTeam}
          onCancel={handleCancel}
          content= "Are you sure! you want to delete this team?"
          />
          
        </div>
      </div>
    </>
  );
};

export default TeamList;