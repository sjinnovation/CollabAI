import { Form, Space, Table, Tag, Tooltip, message, Modal, Dropdown, Menu } from "antd"
import { useEffect, useState, useContext, useCallback } from "react"
import { TbPlugConnectedX } from "react-icons/tb"
import { FileContext } from "../../contexts/FileContext"
import { AddIntegrateAppsCredsFormData, OauthConnect } from "../IntegrateApplications/apiForm.js"
import { deleteIntegrateAppsCredsFromDB, storeIntegrateAppsCredsToDB } from "../../api/IntegrateApps.js"
import { getAllServices, deleteService, addApiEndpoint, getExistingApis, getService, updateServiceStatus  } from "../../api/api_endpoints"
import { IntegrateAppsModal } from "../common/ApiModal"
import { getConnectionStatus } from "../../api/IntegrateApps.js"
import AddApps from "../../Pages/Account/AddApps"
import { AddApiEndpoints } from "../AddApiEndpoint/AddApiEndpoints.js"
import { useNavigate } from "react-router-dom"
import EndpointForm from "./EndpointForm.js"
import { RxCrossCircled } from "react-icons/rx"
import { CiCircleCheck } from "react-icons/ci"
import { BsThreeDotsVertical } from "react-icons/bs"
import { AiOutlineEye, AiOutlinePlusCircle, AiOutlineDelete, AiOutlineEdit } from "react-icons/ai"
import { axiosSecureInstance } from "../../api/axios.js"
import ConfigurationHeader from "../Configuration/ConfigurationHeader/ConfigurationHeader.jsx"
import {getUserID} from "../../Utility/service.js"
import {getUser} from "../../api/user.js"

export const AdminDefinedApps = () => {
  const [form] = Form.useForm()
  const { isConnected, setIsConnected, token, setToken, isIntegrateAppsConnected, setIsIntegrateAppsConnected } =
    useContext(FileContext)
  useContext(FileContext)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [apiResponse, setApiResponse] = useState([])
  const [formitems, setFormitems] = useState([])
  const [apiCounts, setApiCounts] = useState([])
  const [app, setApp] = useState([])
  const [applicationsData, setApplicationsData] = useState([])
  const [isIntegrateAppsModalOpen, setIsIntegrateAppsModalOpen] = useState(false)
  const [serviceid, setServiceId] = useState("")
  const [datasource, setDatasource] = useState([])
  const [showAddApi, setShowAddApi] = useState(false)
  const [viewApiServiceId, setViewApiServiceId] = useState(null)
  const navigate = useNavigate()
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false)
  const [selectedServiceId, setSelectedServiceId] = useState(null)
  const [listingSource, setListingSource] = useState([{}])
  const [selectedApp, setSelectedApp] = useState({ name: "", id: null })
  const [isListing, setIsListing] = useState(false)

  const [isEndpointFormVisible, setIsEndpointFormVisible] = useState(false)
  const [showApiDetails, setShowApiDetails] = useState(false)
  const [apiDetails, setApiDetails] = useState([])

  // Add a new state for edit mode and selected app data
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedAppData, setSelectedAppData] = useState(null)
  const [isAddAppModalVisible, setIsAddAppModalVisible] = useState(false)

  const allServices = useCallback(async () => {
    try {
      const services = await getAllServices();

      const serviceData = Array.isArray(services.data.data) 
          ? services.data.data 
          : [services.data.data];


      const updatedServices = await Promise.all(
          serviceData.map(async (service) => {
              if (service.userId) {
                  try {
                      const userResponse = await getUser(service.userId);
                      return {
                          ...service,
                          userDetails: userResponse.data
                      };
                  } catch (userError) {
                      console.error(`Error fetching user data for service ${service._id}:`, userError);
                      return {
                          ...service,
                          userDetails: null 
                      };
                  }
              }
              return service;
          })
      );
      setApiResponse(updatedServices);
  } catch (error) {
      console.error('Error fetching services:', error);
      setApiResponse([]);
  }
}, []);

  const { confirm } = Modal


  const fetchApiCounts = useCallback(async () => {
    try {
      // Get the latest services data if needed
      const services = await getAllServices()
      const servicesData = services.data.data

      const countsPromises = servicesData.map(async (service) => {
        try {
          const response = await getExistingApis(service._id)
          return {
            serviceId: service?._id,
            count: response.data.data ? response.data.data.length : 0,
          }
        } catch (error) {
          console.error(`Error fetching API count for ${service.service_name}:`, error)
          return { serviceId: service._id, count: 0 }
        }
      })

      const results = await Promise.all(countsPromises)

      // Convert array of results to an object with serviceId as keys
      const countsObject = results.reduce((acc, item) => {
        acc[item.serviceId] = item.count
        return acc
      }, {})

      setApiCounts(countsObject)
    } catch (error) {
      console.error("Error fetching API counts:", error)
    }
  }, [])

  useEffect(() => {
    if (apiResponse.length > 0) {
      fetchApiCounts()
    }
  }, [apiResponse, fetchApiCounts])

  useEffect(() => {
    allServices()
  }, [allServices])

  useEffect(() => {
    const fetchConnectionStatuses = async () => {
      if (apiResponse.length === 0) return

      const appsWithConnection = await Promise.all(
        apiResponse.map(async (record) => {
          const isConnected = await checkServiceConnection(record._id)
          return {
            name: record.service_name,
            isConnected,
            connect: (
              service_id,
              authType,
              authFields,
              authenticateFields,
              oauthurl,
              tokenurl,
              baseurl,
              type,
              contentType,
            ) =>
              handleIntegrateAppsConnect(
                service_id,
                authType,
                authFields,
                authenticateFields,
                oauthurl,
                tokenurl,
                baseurl,
                type,
                contentType,
              ),
            disconnect: (service_id, authType) => handleIntegrateAppsDisconnect(service_id, authType),
          };
        }),
      );

      setApp(appsWithConnection)
    };

    fetchConnectionStatuses()
  }, [apiResponse]);

  const handleAddApp = useCallback(
    (appName, appIconUrl, fields) => {
      allServices()
    },
    [allServices],
  )

  const handleIntegrateAppsConnect = async (
    service_id,
    authType,
    authFields,
    authenticateFields,
    oauthurl,
    tokenurl,
    baseurl,
    type,
    contentType,
  ) => {
    setServiceId(service_id)
    if (authType == "OAuth") {
      const response = await OauthConnect(
        service_id,
        authFields,
        authenticateFields,
        oauthurl,
        tokenurl,
        baseurl,
        type,
        contentType,
      )
      const { authorizationUrl } = response;
      window.location.href = authorizationUrl;
    } else {
      const items = await AddIntegrateAppsCredsFormData(service_id)
      setFormitems(items);
      setIsIntegrateAppsModalOpen(true);
    }
  }

  // Update the fetchServiceDetails function to open the modal with the data
  const fetchServiceDetails = async (service_id) => {
    try {
      setIsLoading(true)
      const response = await getService(service_id)
      if (response.status === 200) {
        setSelectedAppData(response.data.data)
        setIsEditMode(true)
        setIsAddAppModalVisible(true)
      } else {
        message.error("Failed to fetch service details.")
      }
    } catch (error) {
      console.error("Error fetching service details:", error)
      message.error("Error fetching service details.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleIntegrateAppsDisconnect = async (service_id, deleteAll = false) => {
    const responseOfIntegratedappsCredsDelete = await deleteIntegrateAppsCredsFromDB(service_id, deleteAll);

    if (responseOfIntegratedappsCredsDelete?.status === 200) {
      message.success(responseOfIntegratedappsCredsDelete?.data?.message);
    } else {
      message.error(responseOfIntegratedappsCredsDelete?.data?.message);
    }

    return responseOfIntegratedappsCredsDelete;
  };


  const handleListApis = async (serviceId) => {
    try {
      const response = await getExistingApis(serviceId)
      await fetchApiCounts() // Ensure counts are up to date
      setApiDetails(response.data.data)
      setShowApiDetails(true)
      setSelectedServiceId(serviceId)
    } catch (error) {
      console.error("Error fetching API details:", error)
      message.error("Failed to fetch API details")
    }
  }

  const handleAddApis = (serviceId) => {
    fetchApiCounts()
    setSelectedServiceId(serviceId)
    setIsEndpointFormVisible(true)
  }

  const handleEndpointFormSubmit = async (payload) => {
    try {
      const response = await addApiEndpoint(payload)

      message.success("API endpoint added successfully")
      setIsEndpointFormVisible(false)

      // Fetch updated API counts immediately after adding
      await fetchApiCounts()

      // After successful creation, show the API details for this service
      handleListApis(payload.service_id)
    } catch (error) {
      console.error("Error adding API endpoint:", error)
      message.error("Failed to add API endpoint")
    }
  }

  const closeAddApi = () => {
    setShowAddApi(false);
  };

  const checkServiceConnection = async (service_id) => {
    const status = await getConnectionStatus(service_id);
    return status;
  };

  const handleDeleteClick = (serviceId, appName) => {
    confirm({
      title: "Are you sure you want to delete this App?",
      content: `You are deleting ${appName}.`,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await deleteService(serviceId)
          await allServices()
          message.success(`${appName} deleted successfully!`)
          fetchApiCounts()
        } catch (error) {
          console.error("Error deleting service:", error)
          message.error("Failed to delete app. Please try again.")
        }
      },
      onCancel() {},
    })
  }

  const updatedApplicationData = apiResponse.map((record) => ({
    key: record._id,
    name: record.service_name,
    service_id: record._id,
    icon: (
      <img
        src={`${process.env.REACT_APP_BASE_URL || "/placeholder.svg"}${record.service_icon}`}
        alt={`${record.service_name} Icon`}
        style={{
          width: 25,
          height: 25,
          marginRight: 9,
          marginLeft: 0,
          alignItems: 'left',
        }}
      />
    ),
    authType: record.authType,
    authFields: record.authFields,
    authenticateFields: record.authenticateFields,
    oauthurl: record.oauthurl ?? '',
    tokenurl: record.tokenurl ?? '',
    baseurl: record.baseurl ?? '',
    type: record.type ?? '',
    contentType: record.contentType ?? '',
    is_active: record.is_active,
    description: record.description ?? "No description available",
    createdAt: record.createdAt && !isNaN(Date.parse(record.createdAt))
        ? new Date(record.createdAt).toLocaleString()
        : new Date().toLocaleString(),
    apiCount: apiCounts[record._id] || 0, // Add the API count here
    addedBy: record.userDetails?.user
    ? `${record.userDetails.user.fname || ''} ${record.userDetails.user.lname || ''}`.trim()
    : "Unknown",
}));

  const handleToggleActive = async (record) => {
    const newIsActive = !record.is_active
    try {
      const response = await updateServiceStatus(record.service_id, newIsActive)

      if (response.status === 200) {
        setApiResponse((prevResponse) =>
          prevResponse.map((item) => (item._id === record.service_id ? { ...item, is_active: newIsActive } : item)),
        )

        // Show success message based on activation status
        if (newIsActive) {
          message.success(`${record.name} successfully activated`)
        } else {
          message.success(`${record.name} successfully deactivated`)
          // Call disconnect function when app is deactivated
          await handleIntegrateAppsDisconnect(record.service_id,true)
        }
      } else {
        message.error("Failed to update app status. Please try again.")
      }
    } catch (error) {
      console.error("Error updating service status:", error);
      message.error("Failed to update app status. Please try again.")
    }
  }

  const handleIntegrateAppsInstertCreds = async (formItems) => {
    form
      .validateFields()
      .then(async (values) => {
        const groupedValues = {
          authFields: {},
          headers: {},
          otherFields: {},
        };

        formItems.forEach((item) => {
          if (item.group === "authFields") {
            groupedValues.authFields[item.name] = values[item.name];
          } else if (item.group === "headers") {
            groupedValues.headers[item.name] = values[item.name];
          } else {
            groupedValues.otherFields[item.name] = values[item.name];
          }
        })

        try {
          const responseOfKeyStore = await storeIntegrateAppsCredsToDB(groupedValues, serviceid);

          setIsIntegrateAppsConnected(true);
          setIsIntegrateAppsModalOpen(false);
          message.success(responseOfKeyStore.data.message);
          form.resetFields();
        } catch (error) {
          console.error("Error storing credentials:", error);
          message.error("Failed to store credentials. Please try again.")
        }
      })
      .catch((errorInfo) => {
        message.error("Validation failed. Please check the input fields.")
      })
  }

  const columns = [
    {
      title: "Application Name",
      dataIndex: "name",
      key: "name",
      align: "start",
      width: 220,
      render: (text, record) => (
        <Tooltip title={text}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: "16px",
              maxHeight: "80px", // Max height before scrolling
              overflowY: "auto", // Enable vertical scrolling
            }}
          >
            {record.icon}
            <b style={{ marginLeft: 8 }}>{text}</b>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      align: "start",
      width: 350,
      render: (text) => (
        <Tooltip title={text}>
          <div
            style={{
              maxHeight: "100px", // Limit height before scrolling
              overflowY: "auto", // Enable vertical scrolling
            }}
          >
            {text || "No description available"}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Added By",
      dataIndex: "addedBy",
      key: "addedBy",
      align: "center",
      width: 150,
      render: (text) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      width: 150,
      render: (date) => {
        if (!date || isNaN(Date.parse(date))) {
          return new Date().toISOString().split("T")[0]; // Return today's date
        }
        return new Date(date).toISOString().split("T")[0]; // Return formatted date
      },
    },

    {
      title: "API",
      dataIndex: "apiCount",
      key: "apiCount",
      align: "center",
      width: 80,
      render: (apiCount) => <Tag color="blue">{apiCount}</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      width: 100,
      render: (_, record) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="activate" onClick={() => handleToggleActive(record)}>
                <Space>
                  {record.is_active ? <RxCrossCircled /> : <CiCircleCheck />}
                  {record.is_active ? "Deactivate" : "Activate"}
                </Space>
              </Menu.Item>
              <Menu.Item key="editapps" onClick={() => fetchServiceDetails(record.service_id)}>
                <Space>
                  <AiOutlineEdit />
                  Edit App Details
                </Space>
              </Menu.Item>
              <Menu.Item key="viewApis" onClick={() => handleListApis(record.service_id)}>
                <Space>
                  <AiOutlineEye />
                  View APIs
                </Space>
              </Menu.Item>
              <Menu.Item key="addApis" onClick={() => handleAddApis(record.service_id)}>
                <Space>
                  <AiOutlinePlusCircle />
                  Add APIs
                </Space>
              </Menu.Item>
              <Menu.Item key="delete" danger onClick={() => handleDeleteClick(record.service_id, record.name)}>
                <Space>
                  <AiOutlineDelete />
                  Delete
                </Space>
              </Menu.Item>
            </Menu>
          }
          trigger={["click"]}
        >
          <a onClick={(e) => e.preventDefault()}>
            <Space>
              <BsThreeDotsVertical />
            </Space>
          </a>
        </Dropdown>
      ),
    },
  ]

  const handleInputModalClose = () => {
    setIsIntegrateAppsModalOpen(false)
  }

  return (
    <div style={{ margin: "20px" }}>
      <ConfigurationHeader title="Application Integration & API Management" subHeading="Manage and integrate external applications, configure API endpoints, and control access to various services for your AI model."/>
      {showApiDetails ? (
        <AddApiEndpoints
          serviceId={selectedServiceId}
          apiDetails={apiDetails}
          onClose={() => setShowApiDetails(false)}
          fetchApiCounts={fetchApiCounts}
        />
      ) : (
        <>
          <div className="connect-apps-container">
            <div className="large-icon-container connect-app-container">
              <TbPlugConnectedX className="large-icon lg" />
              <span>Integrate Apps</span>
            </div>
            <AddApps
              onAddApp={handleAddApp}
              isEditMode={isEditMode}
              appData={selectedAppData}
              isModalOpen={isAddAppModalVisible}
              setModalOpen={setIsAddAppModalVisible}
              onCloseModal={() => {
                setIsAddAppModalVisible(false)
                setIsEditMode(false)
                setSelectedAppData(null)
              }}
            />
          </div>

          <Table
            loading={isLoading}
            bordered={true}
            columns={columns}
            dataSource={updatedApplicationData}
            pagination={false}
            scroll={{ x: "max-content", y: 500 }} // Enables table scrolling
            style={{ wordBreak: "break-word" }} // Ensures word wrapping
          />

          <IntegrateAppsModal
            propsData={{
              title: "Required Fields to Connect the Service",
              data: null,
              placeholder: "",
              open: isIntegrateAppsModalOpen,
              onCancel: handleInputModalClose,
              onOk: handleIntegrateAppsInstertCreds,
              okText: "Add",
              formItems: Array.isArray(formitems) ? formitems : [],
              form: form,
            }}
          />

          <EndpointForm
            isVisible={isEndpointFormVisible}
            onClose={() => setIsEndpointFormVisible(false)}
            onSubmit={handleEndpointFormSubmit}
            serviceId={selectedServiceId}
          />
        </>
      )}
    </div>
  );
};

export default AdminDefinedApps

