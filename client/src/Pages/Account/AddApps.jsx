import { useState, useEffect } from "react"
import AddAppModal from "./AddAppModal"
import { Button } from "antd"
import "./AddApp.css"

const AddApps = ({
  onAddApp,
  isEditMode = false,
  appData = null,
  isModalOpen = false,
  setModalOpen = () => {},
  onCloseModal = () => {},
}) => {
  // Use the props for modal state if provided, otherwise use local state
  const [localModalOpen, setLocalModalOpen] = useState(false)

  // Determine which state to use
  const modalOpen = isModalOpen !== undefined ? isModalOpen : localModalOpen
  const setModalOpenFunc = setModalOpen || setLocalModalOpen


  const handleAddApp = (appName, appIconUrl, fields) => {
    onAddApp(appName, appIconUrl, fields)
  }

  const handleCloseModal = () => {
    if (onCloseModal) {
      onCloseModal()
    } else {
      setLocalModalOpen(false)
    }
  }

  // Effect to open modal when edit mode is activated
  useEffect(() => {
    if (isEditMode && appData) {
      setModalOpenFunc(true)
    }
  }, [isEditMode, appData, setModalOpenFunc])

  return (
    <div>
      <Button type="primary" onClick={() => setModalOpen(true)} style={{ marginBottom: "16px" }}>
        Add Apps
      </Button>

      {modalOpen && (
        <AddAppModal
          onAddApp={handleAddApp}
          onClose={handleCloseModal}
          visible={modalOpen}
          isEditMode={isEditMode}
          appData={appData}
        />
      )}
      {/* <IntegrateApps/> */}
    </div>
  );
};

export default AddApps;