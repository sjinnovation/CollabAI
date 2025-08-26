import { useState, useEffect } from "react"
import { Button, Space, Table, message, Modal } from "antd"
import { deleteApiEndpoint } from "../../api/api_endpoints"
import EndpointForm from "./EndpointForm.js"

export const AddApiEndpoints = ({ serviceId, apiDetails, onClose, fetchApiCounts  }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [listingSource, setListingSource] = useState([])
  const [isFormVisible, setIsFormVisible] = useState(false)
  const { confirm } = Modal
  useEffect(() => {
    setListingSource(apiDetails)
  }, [apiDetails])

  useEffect(() => {
    fetchApiCounts()
  }, [fetchApiCounts])
  const handleDeleteApi = async (apiId) => {
    setIsLoading(true)
    try {
      await deleteApiEndpoint(apiId)
      setListingSource((prevState) => prevState.filter((api) => api._id !== apiId))
      message.success("API deleted successfully")
    } catch (error) {
      console.error("Error deleting API:", error)
      message.error("Failed to delete API")
    } finally {
      setIsLoading(false)
    }
  }
  const handleDeleteClick = (appName, apiId) => {
    confirm({
      title: "Are you sure you want to delete this api?",
      content: `You are deleting ${appName}.`,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await deleteApiEndpoint(apiId)
          setListingSource((prevState) => prevState.filter((api) => api._id !== apiId))
          message.success("API deleted successfully")
          fetchApiCounts() // Add this line to update API counts after deletion
        } catch (error) {
          console.error("Error deleting service:", error)
          message.error("Failed to delete app. Please try again.")
        }
      },
      onCancel() {},
    })
  }
  const handleFormSubmit = async (payload) => {
    setIsFormVisible(false)
  }

  const columns = [
    {
      title: 'API Name',
      dataIndex: 'api_name',
      key: 'api_name',
      align: 'center',
      width: 150,
      ellipsis: true,
      render: (text) => (
        <div style={{ 
          maxWidth: '140px', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap',
          cursor: 'pointer'
        }} title={text}>
          {text}
        </div>
      )
    },
    {
      title: 'API Endpoint',
      dataIndex: 'api_endpoint',
      key: 'api_endpoint',
      align: 'center',
      width: 200,
      ellipsis: true,
      render: (text) => (
        <div style={{ 
          maxWidth: '190px', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap',
          cursor: 'pointer'
        }} title={text}>
          {text}
        </div>
      )
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      align: 'center',
      width: 80,
      render: (text) => (
        <span style={{ 
          padding: '2px 8px', 
          borderRadius: '4px', 
          backgroundColor: text === 'GET' ? '#52c41a' : 
                         text === 'POST' ? '#1890ff' : 
                         text === 'PUT' ? '#faad14' : 
                         text === 'DELETE' ? '#ff4d4f' : '#d9d9d9',
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {text}
        </span>
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      align: 'center',
      width: 200,
      ellipsis: true,
      render: (text) => (
        <div style={{ 
          maxWidth: '190px', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap',
          cursor: 'pointer'
        }} title={text}>
          {text || 'No description'}
        </div>
      )
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      align: "center",
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button 
            size="small"
            danger
            onClick={() => handleDeleteClick(record.api_name, record._id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ]

  useEffect(() => {
    fetchApiCounts()
  }, [listingSource, fetchApiCounts])

  return (
    <div style={{ margin: "20px" }}>
      <div className="large-icon-container add-api-container">
        <span>API Details</span>
        <Button onClick={onClose}>Back</Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        {/* <Button type="primary" onClick={() => setIsFormVisible(true)}>
          Add New API
        </Button> */}
      </div>

      <Table
        loading={isLoading}
        bordered={true}
        columns={columns}
        dataSource={listingSource}
        pagination={{
          pageSize: 10,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          responsive: true,
        }}
        scroll={{ x: 'max-content', y: 400 }}
        size="small"
        style={{ 
          width: '100%',
          overflowX: 'auto'
        }}
      />

      <EndpointForm
        isVisible={isFormVisible}
        onClose={() => setIsFormVisible(false)}
        onSubmit={handleFormSubmit}
        serviceId={serviceId}
      />
    </div>
  )
}

export default AddApiEndpoints

