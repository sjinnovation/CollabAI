import { useEffect, useState } from "react";
import { Button, Typography, message as AntdMessage } from "antd";
import CreateAssistantTypeModal from "../../component/AssistantType/CreateAssistantTypeModal";
import ConfirmationModal from "../../component/common/ConfirmationModal";
import EditAssistantTypeModal from "../../component/AssistantType/EditAssistantTypeModal";
import AssistantTypeTable from "../../component/AssistantType/AssistantTypeTable";
import { createAssistantType, deleteAssistantType, getAssistantTypeById, updateAssistantType, getAllAssistantType } from "../../api/assistantType";
const { Title } = Typography;

const AssistantTypeList = () => {
  //-------------States-------------
  const [assistantTypeList, setAssistantTypeList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState();
  const [loader, setLoader] = useState(false);
  const [createAssistantTypeModalOpen, setCreateAssistantTypeModalOpen] = useState(false);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [assistantTypeIdToDelete, setAssistantTypeIdToDelete] = useState(null);
  const [assistantTypeUpdate, setAssistantTypeUpdate] = useState(null);
  const [editAssistantTypeModalOpen, setEditAssistantTypeModalOpen] = useState(false);
  const [assistantTypeIdToEdit, setAssistantTypeIdToEdit] = useState(null);

  //-------------Side_Effects-------------
  useEffect(() => {
    handleFetchAssistantTypes();
  }, [lastPage, currentPage]);


  //-----------API_Calls------------------


  const handleFetchAssistantTypes = async () => {
    try {
      setLoader(true)
      const { success, data, message } = await getAllAssistantType(setAssistantTypeList);
      setLoader(false);
      if(success){
        setLoader(false);

      }else{
        setLoader(false);
        AntdMessage.error(message);

      }

    } finally {
      setLoader(false);
    }
  };


  const handleCreateAssistantType = async (assistantType) => {
    try {
      setLoader(true);
      const { success, data, message }  = await createAssistantType(assistantType);
      if (success && data) {
        AntdMessage.success(message);
        setLoader(false);
      await handleFetchAssistantTypes();
      } else {
        setLoader(false);
        AntdMessage.error(message);

      }
    } finally {
      setLoader(false);
    }
  };

  const handleDeleteAssistantType = async () => {
    try {
      setLoader(true);
      const { success, message } = await deleteAssistantType(assistantTypeIdToDelete);
      if (success) {
        AntdMessage.success(message);
        await handleFetchAssistantTypes();
        setConfirmationModalOpen(false);
      } else {
        AntdMessage.error(message);
      }
    } finally {
      setLoader(false);
      setConfirmationModalOpen(false);
    }
  };

  const fetchAssistantTypeUpdate = async (id) => {
    try {
      setLoader(true);
      const { success, data, message } = await getAssistantTypeById(id);
      if (success) {
        setAssistantTypeUpdate(data);
        setEditAssistantTypeModalOpen(true);
      } else {
        AntdMessage.error(message);
      }
    } finally {
      setLoader(false);
    }
  };

  const handleAssistantTypeEdit = async (updatedData) => {
    try {
      setLoader(true);
      const { success, data, message } = await updateAssistantType(assistantTypeIdToEdit, updatedData);
      if (success) {
        AntdMessage.success(message);
        await handleFetchAssistantTypes();
      } else {
        AntdMessage.error(message);
      }
    } finally {
      setLoader(false);
    }
  };



  // -----------------Local Functions--------------
  const showCreateAssistantTypeModal = () => {
    setCreateAssistantTypeModalOpen(true)
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
              <Title level={2}>Agent Types</Title>
            </div>
            <div>
              <Button onClick={showCreateAssistantTypeModal}>+ Agent Type</Button>
            </div>
          </div>
          <div>
          </div>
          <div>

            <AssistantTypeTable
              dataProps={{
                loader,
                data: assistantTypeList,
                actions: {
                  setAssistantTypeIdToDelete,
                  setConfirmationModalOpen,
                  setAssistantTypeIdToEdit,
                  fetchAssistantTypeUpdate
                }
              }}
            />
          </div>

          {/* Create Assistant Type Modal  */}
          <CreateAssistantTypeModal
            dataProps={{
              open: createAssistantTypeModalOpen,
              setOpen: setCreateAssistantTypeModalOpen,

              actions: {
                handleCreateAssistantType
              }
            }}
          />
          {/* Edit Assistant Type Modal  */}
          <EditAssistantTypeModal
            propsData={{
              open: editAssistantTypeModalOpen,
              setOpen: setEditAssistantTypeModalOpen,
              data: assistantTypeUpdate,
              actions: {
                handleAssistantTypeEdit,
              }
            }}
          />

          {/* Confirmation Modal  */}
          <ConfirmationModal
            open={confirmationModalOpen}
            onConfirm={handleDeleteAssistantType}
            onCancel={handleCancel}
            content="Are you sure! you want to delete this agent type?"
          />

        </div>
      </div>
    </>
  );
};

export default AssistantTypeList;