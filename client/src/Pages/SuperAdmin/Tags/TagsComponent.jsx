import { useEffect, useState } from "react";
import { Button, Typography, message as AntdMessage } from "antd";
import CreateTagModal from "./CreateTagModal";
import TagListTable from "./TagListTable";
import ConfirmationModal from "./ConfirmationModal";
import EditTagModal from "./EditTagModal";
import { createTag, deleteTag, getSingleTagById, getTags, updateTag } from "../../../api/tags-admin";
const { Title } = Typography;

const TagsComponent = () => {
  //-------------States---------------------------------
  const [tags, setTags] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  const [loader, setLoader] = useState(false);
  const [createTagModalOpen, setCreateTagModalOpen] = useState(false);
  const [tagIdToDelete, setTagIdToDelete] = useState(null);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [tagIdToEdit, setTagIdToEdit] = useState(null);
  const [editTagModalOpen, setEditTagModalOpen] = useState(false);
  const [tagToUpdate, setTagToUpdate] = useState(null);

  //----------------Side Effect------------------------------
  useEffect(() => {
    handleFetchTags();
  }, []);



  //---------------API Calls-----------------------------------
  
  const handleFetchTags = async () => {
    try {
      setLoader(true);
      const { success, data, message, count } = await getTags(currentPage, limit);
      if (success) {
        setTags(data);
      } else {
        AntdMessage.error(message);
      }
    } finally {
      setLoader(false);
    }
  };

  const handleCreateTag = async (data) => {
    try {
      setLoader(true);
      const { success, message } = await createTag(data);
      if (success) {
        AntdMessage.success(message);
        handleFetchTags();
      } else {
        AntdMessage.error(message);
      }
    } finally {
      setLoader(false);
    }
  };

  const fetchTagToEdit = async (id) => {
    try {
      setLoader(true);
      const { success, data, message } = await getSingleTagById(id);
      if (success) {
        setTagToUpdate(data);
        setEditTagModalOpen(true);
      } else {
        AntdMessage.error(message);
      }
    } finally {
      setLoader(false);
    }
  };

  const handleTagEdit = async (updatedData) => {
    try {
      setLoader(true);
      const { success, data, message } = await updateTag(tagIdToEdit, updatedData);
      if (success) {
        AntdMessage.success(message);
        handleFetchTags();
      } else {
        AntdMessage.error(message);
      }
    } finally {
      setLoader(false);
    }
  };

  const handleDeleteTag = async () => {
    try {
      setLoader(true);
      const { success, message } = await deleteTag(tagIdToDelete);
      if (success) {
        AntdMessage.success(message);
        handleFetchTags();
      } else {
        AntdMessage.error(message);
      }
    } finally {
      setLoader(false);
      setConfirmationModalOpen(false);
    }
  };


  //---------------Local Functions-----------------

  const showCreateTagModal = () => {
    setCreateTagModalOpen(true)
  }

  const handleCancelDelete = () => {
    setConfirmationModalOpen(false)
  }
  return (
    <>
      <div className="mt-5" >
        <div className="container" >
          <div className="d-flex align-items-center justify-content-between">
            <div className="col-8">
              <Title level={2}>Tag Lists</Title>
            </div>
            <div>
              <Button onClick={showCreateTagModal}> + Tag</Button>
            </div>
          </div>

          {/* table  */}
          <TagListTable
            propsData={{
              loader,
              data: tags,
              actions: {
                setTagIdToDelete,
                setConfirmationModalOpen,
                setTagIdToEdit,
                fetchTagToEdit
              }
            }}
          />


          {/* Create Tag Modal  */}
          <CreateTagModal
            propsData={{
              open: createTagModalOpen,
              setOpen: setCreateTagModalOpen,
              actions: {
                handleCreateTag
              }
            }}
          />

          {/* Edit Tag Modal  */}
          <EditTagModal
            propsData={{
              open: editTagModalOpen,
              setOpen: setEditTagModalOpen,
              data: tagToUpdate,
              actions: {
                handleTagEdit,
              }
            }}
          />

          {/* Confirmation Modal */}
          <ConfirmationModal
            open={confirmationModalOpen}
            onConfirm={handleDeleteTag}
            onCancel={handleCancelDelete}
            content="Are you sure! you want to delete this tag?"
          />
        </div>
      </div>
    </>
  );
};

export default TagsComponent;