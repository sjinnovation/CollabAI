import { Button, message } from 'antd';
import Title from 'antd/es/typography/Title';
import React, { useEffect, useState } from 'react'
import AiPersonaTable from './AiPersonaTable';
import AiPersonaModal from './AiPersonaModal';
import ConfirmationModal from '../TaskCommands/ConfirmationModal';
import { createAiPersona, deleteAiPersona, getAiPersonaById, getAiPersonas, updateAiPersona } from '../../../api/aiPersona';

const AiPersona = () => {
  //-----------------States-----------------------------
  const [aiPersonas, setAiPersonas] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState();
  const [loader, setLoader] = useState(false);
  const [aiPersonaIdToDelete, setAiPersonaIdToDelete] = useState(null);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(null);
  const limit = 10000;
  const [aiPersonaIdToEdit, setAiPersonaIdToEdit] = useState(null);
  const [aiPersonaToEdit, setAiPersonaToEdit] = useState(null);
  const [aiPersonaModalOpen, setAiPersonaModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');

  //----------------Side Effects-------------------------
  useEffect(() => {
    handleFetchAiPersonas();
  }, [lastPage, currentPage, limit]);

  //----------------API Calls-----------------------------
  const handleFetchAiPersonas = async () => {
    try {
      setLoader(true);
      const { success, data, message } = await getAiPersonas(currentPage, limit);
      if (success) {
        setAiPersonas(data);
        // setLastPage(pageCount);
      } else {
        console.error("Error fetching ai persona:", message);
      }
    } finally {
      setLoader(false);
    }
  };

  const handleCreateAiPersona = async (personaData) => {
    try {
      setLoader(true);
      const dataWithCreatedAs = {
        ...personaData,
        createdAs: "superadmin"
      };
      const { success } = await createAiPersona(dataWithCreatedAs);
      if (success) {
        handleFetchAiPersonas();
        message.success("Persona created successfully");
      } else {
        console.error("Error creating persona:", message);
      }
    } finally {
      setLoader(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoader(true);
      const { success, responseMessage } = await deleteAiPersona(aiPersonaIdToDelete);
      if (success) {
        handleFetchAiPersonas();
        message.success(responseMessage);
      } else {
        console.error("Error deleting ai persona:", responseMessage);
        message.error(responseMessage);
      }
    } finally {
      setLoader(false);
      setConfirmationModalOpen(false);
    }
  };

  const fetchAiPersonaToEdit = async (id) => {
    try {
      setLoader(true);
      const { success, data, responseMessage } = await getAiPersonaById(id);
      if (success) {
        setAiPersonaToEdit(data);
        setModalMode('edit');
        setAiPersonaModalOpen(true);
      } else {
        console.error("Error fetching task command to edit:", responseMessage);
      }
    } finally {
      setLoader(false);
    }
  };

  const handleAiPersonaEdit = async (updatedData) => {
    try {
      setLoader(true);
      const dataWithCreatedAs = {
        ...updatedData,
        createdAs: "superadmin"
      };
      const { success, responseMessage } = await updateAiPersona(aiPersonaIdToEdit, dataWithCreatedAs);
      if (success) {
        message.success(responseMessage);
        handleFetchAiPersonas();
      } else {
        console.error("Error updating task command:", responseMessage);
        message.error(responseMessage);
      }
    } finally {
      setLoader(false);
    }
  };

  //-------------------Local Functions--------------------------

  const showCreateAiPersonaModal = () => {
    setModalMode('create');
    setAiPersonaModalOpen(true);
  };

  const handleCancel = () => {
    setConfirmationModalOpen(false);
  };
  return (
    <>
      <div className="mt-5 px-5">
        <div className="container">
          <div className="d-flex align-items-center justify-content-between">
            <div className="col-8">
              <Title level={2}>Instruction Lists</Title>
            </div>
            <div>
              <Button onClick={showCreateAiPersonaModal}>
                + Instruction
              </Button>
            </div>
          </div>
          <div>
            <div>
              <AiPersonaTable
                propsData={{
                  loader,
                  data: aiPersonas,
                  actions: {
                    setAiPersonaIdToDelete,
                    setConfirmationModalOpen,
                    fetchAiPersonaToEdit,
                    setAiPersonaIdToEdit,
                  },
                }}
              />

              {/* Task Command Modal (Create/Edit) */}
              <AiPersonaModal
                propsData={{
                  open: aiPersonaModalOpen,
                  setOpen: setAiPersonaModalOpen,
                  mode: modalMode,
                  data: aiPersonaToEdit,
                  actions: {
                    handleCreateAiPersona,
                    handleAiPersonaEdit,
                  },
                }}
              />

              {/* Confirmation Modal  */}
              <ConfirmationModal
                open={confirmationModalOpen}
                onConfirm={handleDelete}
                onCancel={handleCancel}
                content="Are you sure! you want to delete this Ai Persona?"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AiPersona;