import { useState, useEffect } from "react";
import { Typography, Button, message } from "antd";
import TaskCommandListTable from "./TaskCommandListTable";
import TaskCommandModal from "./TaskCommandModal";
import ConfirmationModal from "./ConfirmationModal";
import {
  createTaskCommand,
  deleteTaskCommand,
  editTaskCommand,
  getTaskCommandToEdit,
  getTaskCommands,
} from "../../../api/taskCommands";
const { Title } = Typography;

const TaskCommandList = () => {
  //-----------------States-----------------------------
  const [taskCommands, setTaskCommands] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState();
  const [loader, setLoader] = useState(false);
  const [taskCommandIdToDelete, setTaskCommandIdToDelete] = useState(null);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(null);
  const limit = 10000;
  const [taskCommandIdToEdit, setTaskCommandIdToEdit] = useState(null);
  const [taskCommandToEdit, setTaskCommandToEdit] = useState(null);
  const [taskCommandModalOpen, setTaskCommandModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');

  //----------------Side Effects-------------------------
  useEffect(() => {
    handleFetchTaskCommands();
  }, [lastPage, currentPage, limit]);

  //----------------API Calls-----------------------------
  const handleFetchTaskCommands = async () => {
    try {
      setLoader(true);
      const { success, data, pageCount, error } = await getTaskCommands(currentPage, limit);
      if (success) {
        setTaskCommands(data);
        setLastPage(pageCount);
      } else {
        console.error("Error fetching task commands:", error);
      }
    } finally {
      setLoader(false);
    }
  };

  const handleCreateTaskCommand = async (reqBody) => {
    try {
      setLoader(true);
      const { success, error } = await createTaskCommand(reqBody);
      if (success) {
        handleFetchTaskCommands();
        message.success(success);
      } else {
        console.error("Error creating command:", error);
        message.error(error);
      }
    } finally {
      setLoader(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoader(true);
      const { success, error } = await deleteTaskCommand(taskCommandIdToDelete);
      if (success) {
        message.success(success);
        handleFetchTaskCommands();
      } else {
        console.error("Error deleting task command:", error);
        message.error(error);
      }
    } finally {
      setLoader(false);
      setConfirmationModalOpen(false);
    }
  };

  const fetchTaskCommandToEdit = async (id) => {
    try {
      setLoader(true);
      const { success, data, error } = await getTaskCommandToEdit(id);
      if (success) {
        setTaskCommandToEdit(data?.taskCommand);
        setModalMode('edit');
        setTaskCommandModalOpen(true);
      } else {
        console.error("Error fetching task command to edit:", error);
      }
    } finally {
      setLoader(false);
    }
  };

  const handleTaskCommandEdit = async (updatedData) => {
    try {
      setLoader(true);
      const { success, error } = await editTaskCommand(taskCommandIdToEdit, updatedData);
      if (success) {
        message.success(success);
        handleFetchTaskCommands();
      } else {
        console.error("Error updating task command:", error);
        message.error(error);
      }
    } finally {
      setLoader(false);
    }
  };

  //-------------------Local Functions--------------------------

  const showCreateTaskCommandModal = () => {
    setModalMode('create');
    setTaskCommandModalOpen(true);
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
              <Title level={2}>Task Command Lists</Title>
            </div>
            <div>
              <Button onClick={showCreateTaskCommandModal}>
                + Task Command
              </Button>
            </div>
          </div>
          <div>
            <div>
              <TaskCommandListTable
                propsData={{
                  loader,
                  data: taskCommands,
                  actions: {
                    setTaskCommandIdToDelete,
                    setConfirmationModalOpen,
                    fetchTaskCommandToEdit,
                    setTaskCommandIdToEdit,
                  },
                }}
              />

              {/* Task Command Modal (Create/Edit) */}
              <TaskCommandModal
                propsData={{
                  open: taskCommandModalOpen,
                  setOpen: setTaskCommandModalOpen,
                  mode: modalMode,
                  data: taskCommandToEdit,
                  actions: {
                    handleCreateTaskCommand,
                    handleTaskCommandEdit,
                  },
                }}
              />

              {/* Confirmation Modal  */}
              <ConfirmationModal
                open={confirmationModalOpen}
                onConfirm={handleDelete}
                onCancel={handleCancel}
                content="Are you sure! you want to delete this task command?"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskCommandList;
