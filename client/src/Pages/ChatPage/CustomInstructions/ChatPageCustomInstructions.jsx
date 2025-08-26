import { useState, useEffect, useRef } from "react";
import { Button, Card, Carousel, Form, Input, message, Modal } from 'antd';
import "./ChatPageCustomInstructions.css";
import { LeftOutlined, RightOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { axiosSecureInstance } from "../../../api/axios";
import UserAiPersonaModal from "./UserAiPersonaModal";
import { CREATE_NEW_AI_PERSONA_SLUG, EDIT_A_AI_PERSONA_SLUG, DELETE_A_AI_PERSONA_SLUG } from "../../../constants/Api_constants";
import ConfirmationModal from "../../SuperAdmin/TaskCommands/ConfirmationModal";

import { LuFiles } from "react-icons/lu";
const { Meta } = Card;



const ChatPageCustomInstructions = ({propsData}) => {
  const carouselRef = useRef();
  const [selectedPersona, setSelectedPersona] = useState("Default");
  const [showPrompt, setShowPrompt] = useState(false);
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCardLoading, setIsCardLoading] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [isPersonasLoading, setIsPersonasLoading] = useState(true);
  // const [folderData, setFolderData] = useState({});
  const [customInstructionText, setCustomInstructionText] = useState("");
  const [aiPersonaModalOpen, setAiPersonaModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [personaToEdit, setPersonaToEdit] = useState(null);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [personaToDelete, setPersonaToDelete] = useState(null);
  const [selectedPersonaForDescription, setSelectedPersonaForDescription] = useState(null);
  const [isDescriptionModalVisible, setIsDescriptionModalVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const {
    folderId, 
    folderData, 
    fetchFolderData,
    fetchPersonas,
    allPersonasWithPersonalPersonas,
    userId,
    handleFolderClick
  } = propsData;
  
  
  
  
  const itemsPerSlide = 5;
  
  // Sort personas to show selected persona first, then user-created ones
  const sortedPersonas = Array.isArray(allPersonasWithPersonalPersonas) 
    ? [...allPersonasWithPersonalPersonas].sort((currentPersona, nextPersona) => {
        const isCurrentPersonaSelected = String(folderData?.personaId?._id) === String(currentPersona._id);
        const isNextPersonaSelected = String(folderData?.personaId?._id) === String(nextPersona._id);
        const isCurrentPersonaUserCreated = currentPersona.createdBy === userId && currentPersona.createdAs === "user";
        const isNextPersonaUserCreated = nextPersona.createdBy === userId && nextPersona.createdAs === "user";
        
        // First priority: Selected persona
        if (isCurrentPersonaSelected && !isNextPersonaSelected) return -1;
        if (!isCurrentPersonaSelected && isNextPersonaSelected) return 1;

        // Second priority: User-created personas
        if (isCurrentPersonaUserCreated && !isNextPersonaUserCreated) return -1;
        if (!isCurrentPersonaUserCreated && isNextPersonaUserCreated) return 1;

        return 0; // Keep original order
      })
    : [];

  const slides = [];
  for (let i = 0; i < sortedPersonas.length; i += itemsPerSlide) {
    slides.push(sortedPersonas.slice(i, i + itemsPerSlide));
  }

  // Calculate if next/prev slides are available
  const totalSlides = Math.ceil(sortedPersonas.length / itemsPerSlide);
  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide === totalSlides - 1;

  // Handle slide change
  const handleSlideChange = (current) => {
    setCurrentSlide(current);
  };

  // Custom arrow components
  const CustomPrevArrow = (props) => {
    const { onClick } = props;
    return (
      <Button
        icon={<LeftOutlined style={{ fontSize: '16px' }} />}
        onClick={onClick}
        disabled={isFirstSlide}
        className="carousel-arrow prev-arrow"
        style={{
          position: 'absolute',
          left: '-40px',
          zIndex: 2,
          top: '43%',
          transform: 'translateY(-50%)',
          borderRadius: '50%',
          opacity: isFirstSlide ? 0.5 : 1,
          cursor: isFirstSlide ? 'not-allowed' : 'pointer'
        }}
      />
    );
  };

  const CustomNextArrow = (props) => {
    const { onClick } = props;
    return (
      <Button
        icon={<RightOutlined style={{ fontSize: '16px' }} />}
        onClick={onClick}
        disabled={isLastSlide}
        className="carousel-arrow next-arrow"
        style={{
          position: 'absolute',
          right: '-40px',
          zIndex: 2,
          top: '43%',
          transform: 'translateY(-50%)',
          borderRadius: '50%',
          opacity: isLastSlide ? 0.5 : 1,
          cursor: isLastSlide ? 'not-allowed' : 'pointer'
        }}
      />
    );
  };

  // Add effect to track when personas are loaded
  useEffect(() => {
    if (Array.isArray(allPersonasWithPersonalPersonas)) {
      setIsPersonasLoading(false);
    }
  }, [allPersonasWithPersonalPersonas]);

 

  // ======== API Calls ===============


  const handleAddInstruction = async () => {
    const updatedData = {
      instruction: customInstructionText
    };

    try {
      setIsLoading(true)
      await axiosSecureInstance.patch(`api/folder-chats/${folderId}`, updatedData);
      fetchFolderData(folderId)
      setIsLoading(false)
      setShowCustomPrompt(false)
      message.success("Instruction added successfully");
      // onFolderUpdated(); 
      // onClose(); 
    } catch (error) {
        setIsLoading(false)
        setShowCustomPrompt(false)
    }
};


  // ======= local fucntions ============

  const handlePromptClick = () => {
    setShowPrompt(true);
  };

  const handleCardClick = async (persona) => {
    try {
      setIsCardLoading(true);
      const updatedData = {
        personaId: persona._id
      };
      await axiosSecureInstance.patch(`api/folder-chats/${folderId}`, updatedData);
      await fetchFolderData(folderId);
      message.success("Persona updated successfully");
      // Go to first slide after successful update
      if (carouselRef.current) {
        carouselRef.current.goTo(0);
      }
    } catch (error) {
      message.error("Failed to update persona");
    } finally {
      setIsCardLoading(false);
    }
  };

  const canEditPersona = (persona) => {
    return persona.createdBy === userId && persona.createdAs === "user";
  };

  const handleEditPersona = (e, persona) => {
    e.stopPropagation(); // Prevent card click event
    setPersonaToEdit(persona);
    setModalMode('edit');
    setAiPersonaModalOpen(true);
  };

  const handleCreatePersona = () => {
    setModalMode('create');
    setPersonaToEdit(null);
    setAiPersonaModalOpen(true);
  };

  const handleCreateAiPersonaForUser = async (personaData) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('personaName', personaData.personaName);
      formData.append('description', personaData.description);
      formData.append('createdAs', 'user');
      if (personaData.avatar) {
        formData.append('avatar', personaData.avatar);
      }

      const response = await axiosSecureInstance.post(CREATE_NEW_AI_PERSONA_SLUG(), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      fetchPersonas();
      message.success("Persona created successfully");
      setAiPersonaModalOpen(false);
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to create persona");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAiPersonaEditForUser = async (updatedData) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('personaName', updatedData.personaName);
      formData.append('description', updatedData.description);
      formData.append('createdAs', 'user');
      
      if (updatedData.avatar) {
        formData.append('avatar', updatedData.avatar);
      }

      await axiosSecureInstance.patch(EDIT_A_AI_PERSONA_SLUG(personaToEdit._id), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      fetchPersonas();
      message.success("Persona updated successfully");
      setAiPersonaModalOpen(false);
    } catch (error) {
      message.error("Failed to update persona");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePersona = (e, persona) => {
    e.stopPropagation(); // Prevent card click event
    setPersonaToDelete(persona);
    setConfirmationModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsLoading(true);
      await axiosSecureInstance.delete(DELETE_A_AI_PERSONA_SLUG(personaToDelete._id));
      await fetchPersonas();
      message.success("Persona deleted successfully");
      setConfirmationModalOpen(false);
      setPersonaToDelete(null);
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to delete persona");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelDelete = () => {
    if (isLoading) return; // Prevent closing while loading
    setConfirmationModalOpen(false);
    setPersonaToDelete(null);
  };

  const handleSeeMore = (e, persona) => {
    e.stopPropagation(); // Prevent card click event
    setSelectedPersonaForDescription(persona);
    setIsDescriptionModalVisible(true);
  };

  const handleDescriptionModalClose = () => {
    setIsDescriptionModalVisible(false);
    setSelectedPersonaForDescription(null);
  };

  const sortedPersonastest = [];


  return (
    <div className="custom-instructions-container">
      <div className="persona-section">
        <div className="persona-header">
          <div className="ai-persona-buttons">
            <Button onClick={() => handleFolderClick()}>
              <LuFiles />
              {folderData?.fileInfo?.length > 0 ? (
                <>
                  Project Files  {folderData.fileInfo.length}
                  {folderData.fileInfo.length > 2 && "+"}
                </>
              ) : (
                "Add Files"
              )}
            </Button>
            <Button onClick={handleCreatePersona}>
              + Instructions
            </Button>
          </div>
        </div>
        {isPersonasLoading ? (
          <div style={{ 
            height: '200px', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            width: '100%'
          }}>
            <Card loading={true} style={{ width: '100%', height: '170px' }} />
          </div>
        ) : sortedPersonas.length === 0 ? (
          <div style={{ 
            height: '200px', 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center',
            width: '100%',
            background: '#f5f5f5',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '16px', color: '#595959', marginBottom: '8px' }}>
              No Instructions Available
            </div>
            <div style={{ fontSize: '14px', color: '#8c8c8c' }}>
              Click "+ Instructions" to add a new one
            </div>
          </div>
        ) : (
          <Carousel 
            arrows={true}
            dots={false}
            ref={carouselRef}
            beforeChange={(oldIndex, newIndex) => handleSlideChange(newIndex)}
            prevArrow={<CustomPrevArrow />}
            nextArrow={<CustomNextArrow />}
          >
            {slides.map((slideItems, index) => (
              <div key={index}>
                <div style={{ display: 'flex', justifyContent: 'start', gap: "28px", paddingBottom: "30px" }}>
                  {slideItems.map(item => (
                    <div key={item._id} className="persona-card-wrapper">
                      <Card
                        hoverable
                        style={{ width: 130, height: 150}}
                        cover={<img alt={item.personaName} src={item.avatar} style={{ height: '100px', objectFit: 'cover' }} />}
                        loading={isCardLoading}
                        onClick={() => handleCardClick(item)}
                        className={(String(folderData?.personaId?._id) === String(item._id)) ? 'selected-persona' : ''}
                      >
                        <Meta 
                          title={item.personaName} 
                          style={{ 
                            textAlign: 'center',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          className="persona-card-meta"
                        />
                      </Card>
                      <div className="card-hover-actions">
                        <Button
                          type="text"
                          icon={<EyeOutlined/>}
                          onClick={(e) => handleSeeMore(e, item)}
                        />
                        {canEditPersona(item) && (
                          <>
                            <Button
                              type="text"
                              icon={<EditOutlined />}
                              onClick={(e) => handleEditPersona(e, item)}
                            />
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={(e) => handleDeletePersona(e, item)}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Carousel>
        )}

        {/* AI Persona Modal */}
        <UserAiPersonaModal
          propsData={{
            open: aiPersonaModalOpen,
            setOpen: setAiPersonaModalOpen,
            mode: modalMode,
            data: personaToEdit,
            loading: isLoading,
            actions: {
              handleCreateAiPersona: handleCreateAiPersonaForUser,
              handleAiPersonaEdit: handleAiPersonaEditForUser,
            },
          }}
        />

        {/* Confirmation Modal */}
        <ConfirmationModal
          open={confirmationModalOpen}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          content="Are you sure you want to delete this persona?"
          confirmLoading={isLoading}
          maskClosable={!isLoading}
          closable={!isLoading}
          cancelButtonProps={{ disabled: isLoading }}
        />

        {/* Description Modal */}
        <Modal
        centered
          title={selectedPersonaForDescription?.personaName}
          open={isDescriptionModalVisible}
          onCancel={handleDescriptionModalClose}
          footer={[
            <Button key="close" onClick={handleDescriptionModalClose}>
              Close
            </Button>
          ]}
        >
          <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {selectedPersonaForDescription?.description}
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default ChatPageCustomInstructions;