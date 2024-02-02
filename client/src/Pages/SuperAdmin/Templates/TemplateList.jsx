import { useState, useEffect } from "react";
import { Typography, Button, message } from "antd";
import TemplateListTable from "./TemplateListTable";
import CreateTemplateModal from "./CreateTemplateModal";
import ConfirmationModal from "./ConfirmationModal";
import EditTemplateModal from "./EditTemplateModal";
import { createTemplate, deleteTemplate, editTemplate,  getTemplateToEdit, getTemplates,  } from "../../../api/templates";
import { getSingleCategory } from "../../../api/templatesCategory";
const { Title } = Typography;

const TemplateList = () => {

  //-----------------States-----------------------------
  const [templates, setTemplates] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState();
  const [loader, setLoader] = useState(false);
  const [createTemplateModalOpen, setCreateTemplateModalOpen] = useState(false);
  const [templateIdToDelete, setTemplateIdToDelete] = useState(null);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(null);
  const limit = 10000;
  const [templateIdToEdit, setTemplateIdToEdit] = useState(null);
  const [editTemplateModalOpen, setEditTemplateModalOpen] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState(null);


  //----------------Side Effects-------------------------
  useEffect(() => {
    // fetchTemplates();
    handleFetchTemplates()
  }, [lastPage, currentPage, limit]);


  //----------------API Calls-----------------------------

  const handleFetchTemplates = async () => {
    try {
      setLoader(true);
      const { success, data, pageCount, error } = await getTemplates(currentPage, limit);
      if (success) {
        setTemplates(data);
        setLastPage(pageCount);
      } else {
        console.error("Error fetching templates:", error);
      }
    } finally {
      setLoader(false);
    }
  };



  const handleCreateTemplate = async (reqBody) => {
    try {
      setLoader(true);
      const { success, error } = await createTemplate(reqBody);
      if (success) {
        handleFetchTemplates();
        message.success("Template Successfully Created");
      } else {
        console.error("Error creating template:", error);
        message.error("Something Went Wrong!");
      }
    } finally {
      setLoader(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoader(true);
      const { success, error } = await deleteTemplate(templateIdToDelete);
      if (success) {
        message.success("Template successfully deleted.");
        handleFetchTemplates();
      } else {
        console.error("Error deleting template:", error);
      }
    } finally {
      setLoader(false);
      setConfirmationModalOpen(false);
    }
  };

  

  const fetchTemplateToEdit = async (id) => {
    console.log(id)
    try {
      setLoader(true);
      const { success, data, error } = await getTemplateToEdit(id);
      console.log({ success, data, error })
      if (success) {
        const category = await getSingleCategory(data?.template?.category);
        const dataWithCategory = {category, data}
        setTemplateToEdit(dataWithCategory);
        setEditTemplateModalOpen(true);
      } else {
        console.error("Error fetching template to edit:", error);
      }
    } finally {
      setLoader(false);
    }
  };

  const handleTemplateEdit = async (updatedData) => {
    try {
      setLoader(true);
      const { success, error } = await editTemplate(templateIdToEdit, updatedData);
      if (success) {
        message.success("Template Successfully Updated");
        handleFetchTemplates();
      } else {
        console.error("Error updating template:", error);
        message.error("Something Went Wrong!");
      }
    } finally {
      setLoader(false);
    }
  };

  


  //-------------------Local Functions--------------------------

  const showCreateTemplateModal = () => {
    setCreateTemplateModalOpen(true)
  }

  const handleCancel = () => {
    setConfirmationModalOpen(false)
  }


  return (
    <>
      <div className="mt-5" >
        <div className="container" >
          <div className="d-flex align-items-center justify-content-between">
            <div className="col-8">
              <Title level={2}>Prompt Template Lists</Title>
            </div>
            <div>
              <Button onClick={showCreateTemplateModal}>+ Template</Button>
            </div>
          </div>
          <div>

            <div>
              <TemplateListTable
                propsData={{
                  loader,
                  // categories,
                  data: templates,
                  actions: {
                    setTemplateIdToDelete,
                    setConfirmationModalOpen,
                    fetchTemplateToEdit,
                    setTemplateIdToEdit
                  }
                }}
              />
            
              {/* Create Template Modal  */}
              <CreateTemplateModal
                propsData={{
                  open: createTemplateModalOpen,
                  setOpen: setCreateTemplateModalOpen,
                  actions: {
                    handleCreateTemplate
                  }
                }}
              />

              {/* Edit Template Modal  */}
              <EditTemplateModal
                propsData={{
                  open: editTemplateModalOpen,
                  setOpen: setEditTemplateModalOpen,
                  data: templateToEdit,
                  actions: {
                    handleTemplateEdit
                  }
                }}
              />

              {/* Confirmation Modal  */}
              <ConfirmationModal
                open={confirmationModalOpen}
                onConfirm={handleDelete}
                onCancel={handleCancel}
                content="Are you sure! you want to delete this template?"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TemplateList;
