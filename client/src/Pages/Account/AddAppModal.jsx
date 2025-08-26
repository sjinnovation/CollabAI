import { useState, useEffect } from "react";
import { Modal, Input, Button, Form, Select, message, Divider, Card } from "antd";
import "./AddApp.css";
import { axiosSecureInstance } from "../../api/axios";
import { addService, updateService } from "../../api/api_endpoints";
import {deleteIntegrateAppsCredsFromDB, } from "../../api/IntegrateApps"
import {getUserID} from "../../Utility/service";
const { Option } = Select;
const { TextArea } = Input;

// Update the props to include isEditMode and appData
const AddAppModal = ({ onAddApp, onClose, visible, isEditMode = false, appData = null }) => {
  // Update the useState hooks to initialize with appData if in edit mode
  const [appName, setAppName] = useState(isEditMode && appData ? appData.service_name : "");
  const [appSlug, setAppSlug] = useState(isEditMode && appData ? appData.slug : "");
  const [appDescription, setAppDescription] = useState(isEditMode && appData ? appData.description : "");
  const [appIcon, setAppIcon] = useState(null);
  const [customFields, setCustomFields] = useState([{ label: "", name: "" }]);
  const [oauthurl, setOauthurl] = useState(isEditMode && appData ? appData.oauthurl || "" : "");
  const [tokenurl, setTokenurl] = useState(isEditMode && appData ? appData.tokenurl || "" : "");
  const [baseurl, setBaseurl] = useState(isEditMode && appData ? appData.baseurl || "" : "");
  const [headers, setHeaders] = useState(
    isEditMode && appData && appData.headers
      ? appData.headers.map((h) => ({ headerKey: h.keyName || "" }))
      : [{ headerKey: "" }],
  )
  const [authType, setAuthType] = useState(isEditMode && appData ? appData.authType : "OAuth")
  const [googleApp, setGoogleApp] = useState(isEditMode && appData ? (appData.is_google_app ? "Yes" : "No") : "No")
  const [authFields, setAuthFields] = useState(
    isEditMode && appData && appData.authFields
      ? appData.authFields.map((field) => ({ keyName: field.keyName || "" }))
      : [{ keyName: "" }],
  )
  const [baseURL, setBaseURL] = useState("");
  const [oauthFields, setOauthFields] = useState(
    isEditMode && appData && appData.authFields
      ? appData.authFields.map((field) => ({ keyName: field.keyName || "", keyValue: field.keyValue || "" }))
      : [],
  )
  const [oauthenticateFields, setOauthenticateFields] = useState(
    isEditMode && appData && appData.authenticateFields
      ? appData.authenticateFields.map((field) => ({ keyName: field.keyName || "", keyValue: field.keyValue || "" }))
      : [],
  )
  const [type, setType] = useState(isEditMode && appData ? appData.type || "Basic" : "Basic")
  const [contenttype, setContenttype] = useState(
    isEditMode && appData
      ? appData.contentType || "application/x-www-form-urlencoded"
      : "application/x-www-form-urlencoded",
  )
  const userId = getUserID();
  // Add useEffect to update state when appData changes
  useEffect(() => {
    if (isEditMode && appData) {
      getUserID();
      setAppName(appData.service_name || "")
      setAppSlug(appData.slug || "")
      setAppDescription(appData.description || "")
      setOauthurl(appData.oauthurl || "")
      setTokenurl(appData.tokenurl || "")
      setBaseurl(appData.baseurl || "")
      setAuthType(appData.authType || "OAuth")
      setGoogleApp(appData.is_google_app ? "Yes" : "No")
      setType(appData.type || "Basic")
      setContenttype(appData.contentType || "application/x-www-form-urlencoded")

      // Fix for headers - make sure we're using the correct property
      if (appData.headers && appData.headers.length > 0) {
        const mappedHeaders = appData.headers.map((h) => ({
          headerKey: h.headerKey || h.keyName || "",
        }))
        setHeaders(mappedHeaders)
      }

      if (appData.authFields && appData.authFields.length > 0) {
        if (appData.authType === "OAuth") {
          setOauthFields(
            appData.authFields.map((field) => ({
              keyName: field.keyName || "",
              keyValue: field.keyValue || "",
            })),
          )
        } else {
          setAuthFields(appData.authFields.map((field) => ({ keyName: field.keyName || "" })))
        }
      }

      if (appData.authenticateFields && appData.authenticateFields.length > 0) {
        setOauthenticateFields(
          appData.authenticateFields.map((field) => ({
            keyName: field.keyName || "",
            keyValue: field.keyValue || "",
          })),
        )
      }
    }
  }, [isEditMode, appData])

  const handleHeaderChange = (index, value) => {
    const updatedHeaders = [...headers];
    updatedHeaders[index].headerKey = value;
    setHeaders(updatedHeaders);
  };

  const handleAddHeader = () => {
    setHeaders([...headers, { headerKey: "" }]);
  };

  const handleAddField = () => {
    setCustomFields([...customFields, { label: "", name: "" }]);
  };

  const handleFieldChange = (index, value) => {
    const newFields = [...customFields];
    newFields[index].label = value;
    newFields[index].name =
      value.toLowerCase().replace(/\s+/g, "") || `field_${index}`;
    setCustomFields(newFields);
  };

  const handleAuthFieldChange = (index, value) => {
    const updatedAuthFields = [...authFields];
    updatedAuthFields[index].keyName = value;
    setAuthFields(updatedAuthFields);
  };

  const handleAddAuthField = () => {
    setAuthFields([...authFields, { keyName: "" }]);
  };

  // Update the handleAddApp function to handle both add and update
  const handleAddApp = async () => {
    if (appName && appSlug && (appIcon || isEditMode) && appDescription) {
      const formData = new FormData();
      formData.append("name", appName);
      formData.append("slug", appSlug);
      formData.append("description", appDescription);
      formData.append("userId", userId);

      // Only append icon if it's a new file
      if (appIcon) {
        formData.append("service_icon", appIcon)
      }

      formData.append("headers", JSON.stringify(headers));
      formData.append("authType", authType);

      // Add the appropriate authentication fields based on authType
      if (authType === "OAuth") {
        formData.append("authFields", JSON.stringify(oauthFields));
        formData.append(
          "authenticateFields",
          JSON.stringify(oauthenticateFields),
        );
        formData.append("oauthurl", oauthurl);
        formData.append("tokenurl", tokenurl);
        formData.append("baseurl", baseurl);
        formData.append("type", type);
        formData.append("contentType", contenttype);
      } else {
        formData.append("authFields", JSON.stringify(authFields));
      }

      formData.append("is_google_app", googleApp === "Yes");

      try {
        let response;
    
        if (isEditMode && appData) {
            response = await updateService(appData, formData);
            await handleIntegrateAppsDisconnect(appData._id,true);
            message.success("App updated successfully.Please activate the app!");
        } else {
            response = await addService(formData);
            message.success("App added successfully.Please activate the app!"); 
        }
    
        onAddApp({
            ...response.data,
            key: Date.now(), // Ensure unique key
        });
    
        // Reset form fields
        setAppName("");
        setAppSlug("");
        setAppDescription("");
        setAppIcon(null);
        setCustomFields([{ label: "", name: "" }]);
        setHeaders([{ headerKey: "" }]);
        setAuthFields([{ keyName: "" }]);
        setOauthFields([]); // Reset OAuth fields
        setBaseURL(""); // Reset base URL
        onClose();
    } catch (error) {
        console.error("Error saving app:", error.response?.data || error.message);
        message.error("Failed to save app. Please try again.");
    }
    
    } else {
      const missingFields = []
      if (!appName) missingFields.push("App Name")
      if (!appSlug) missingFields.push("Slug")
      if (!appDescription) missingFields.push("Description")
      if (!appIcon && !isEditMode) missingFields.push("Icon")

      message.error(`${missingFields.join(", ")} ${missingFields.length > 1 ? "are" : "is"} missing.`)
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
  
  
  // Handler to update the value of a specific OAuth field
  const handleOAuthFieldChange = (index, key, value) => {
    const updatedFields = [...oauthFields]

    // Trim input value
    const trimmedValue = value.trim();
    if (key === "keyName") {
      updatedFields[index].keyName = trimmedValue;
    } else {
      updatedFields[index].keyValue = trimmedValue;
    }

    setOauthFields(updatedFields);
  };

  // Handler to update the value of a specific OAuth field
  const handleOAuthenticateFieldChange = (index, key, value) => {
    const updatedAuthenticateFields = [...oauthenticateFields];
    // Trim input value
    const trimmedValue = value.trim();
    if (key == "keyName") {
      updatedAuthenticateFields[index].keyName = trimmedValue;
      setOauthenticateFields(updatedAuthenticateFields);
    } else {
      updatedAuthenticateFields[index].keyValue = trimmedValue;
      setOauthenticateFields(updatedAuthenticateFields);
    }
  };

  // Handler to add a new OAuth field
  const handleAddOAuthField = () => {
    setOauthFields([...oauthFields, { keyName: "", keyValue: "" }]); // Default empty key-value pair
  };

  // Handler to add a new OAuth field
  const handleAddOAuthenticateField = () => {
    setOauthenticateFields([
      ...oauthenticateFields,
      { keyName: "", keyValue: "" },
    ]); // Default empty key-value pair
  };

  // Handler to remove an OAuth field
  const handleRemoveOAuthField = (index) => {
    const updatedFields = oauthFields.filter((_, idx) => idx !== index);
    setOauthFields(updatedFields);
  };
  // Handler to remove an OAuth field
  const handleRemoveOAuthenticateField = (index) => {
    const updatedAuthenticateFields = oauthenticateFields.filter((_, idx) => idx !== index)
    setOauthenticateFields(updatedAuthenticateFields)
  };

  // Update the modal title and button text based on mode
  const modalTitle = isEditMode ? "Edit App" : "Add New App"
  const buttonText = isEditMode ? "Update App" : "Add App"

  // In the Modal component, update the title and button text
  return (
    <Modal
      title={modalTitle}
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="add" type="primary" onClick={handleAddApp}>
          {buttonText}
        </Button>,
      ]}
    >
      <Form layout="vertical" onFinish={handleAddApp}>
        {/* App Name */}
        <Card title="Basic Details" bordered={false}>
          <Form.Item
            label="App Name"
            required
            help={
              <span className="modal-helper-text">
                The App Name you want to configure
              </span>
            }
          >
            <Input
              type="text"
              placeholder="Enter app name"
              value={appName}
              onChange={(e) => {
                setAppName(e.target.value);
                setAppSlug(e.target.value.toLowerCase().replace(/\s+/g, "-")); // Auto-generate slug
              }}
            />
          </Form.Item>

          {/* App Slug */}
          <Form.Item
            label="App Slug"
            required
            help={
              <span className="modal-helper-text"> 
                Unique slug to identify your app
              </span>
            }
          >
            <Input
              type="text"
              placeholder="Enter app slug"
              value={appSlug}
              onChange={(e) =>
                setAppSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))
              }
              
            />
          </Form.Item>
          {/* App description */}
          <Form.Item
            label="App Description"
            required
            help={
              <span className="modal-helper-text"> 
                A Brief description of the application
              </span>
            }
          >
            <TextArea
              style={{
                resize: "vertical",
                scrollbarWidth: "thin",
                scrollbarColor: "#888 #41414e",
              }}
              rows={2}
              value={appDescription}
              placeholder="Enter App Description"
              onChange={(e) => {
            setAppDescription(e.target.value); // Auto-generate slug
              }}
            />
          </Form.Item>

          {/* Base URL */}
          {/* <Form.Item
          label="Base URL"
          required
          validateTrigger="onSubmit"
          rules={[
            {
              required: true,
              message: 'Base URL is required.',
            },
          ]}
        >
          <Input
            type="text"
            placeholder="Enter base URL"
            value={baseURL}
            onChange={(e) => setBaseURL(e.target.value)}
          />
        </Form.Item>*/}

          {/* App Icon */}
          <Form.Item
            label="App Icon"
            required
            help={<span className="modal-helper-text">Upload icon image</span>}
          >
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setAppIcon(e.target.files[0]);
                }
              }}
            />
            {appIcon ? (
              <img
                src={URL.createObjectURL(appIcon) || "/placeholder.svg"}
                alt="App Icon Preview"
                style={{ width: "100px", height: "100px", marginTop: "10px" }}
              />
            ) : (
              isEditMode &&
              appData &&
              appData.service_icon && (
                <img
                  src={`${process.env.REACT_APP_BASE_URL}${appData.service_icon}`}
                  alt="Current App Icon"
                  style={{ width: "100px", height: "100px", marginTop: "10px" }}
                />
              )
            )}
          </Form.Item>

          {/* Authentication Type Dropdown */}
          <Form.Item
            label="Authentication Type"
            required
            help={
              <span className="modal-helper-text">
                Select an authentication method
              </span>
            }
          >
            <Select value={authType} onChange={(value) => setAuthType(value)}>
              <Option value="No_Auth">Api Key</Option>
              <Option value="Basic">Basic</Option>
              <Option value="OAuth">OAuth</Option>
              {/* Add more authentication types here if needed */}
            </Select>
          </Form.Item>

          <Form.Item
            label="Google App"
            required
            help={
              <span className="modal-helper-text">
                Wether the API is from Google
              </span>
            }
          >
            <Select value={googleApp} onChange={(value) => setGoogleApp(value)}>
              <Option value="Yes">Yes</Option>
              <Option value="No">No</Option>
              {/* Add more authentication types here if needed */}
            </Select>
          </Form.Item>
        </Card>
        <Divider
          variant="dashed"
          style={{
            borderColor: "#dbd5d5",
          }}
        ></Divider>

        {/* Authentication Fields */}
        {authType === "OAuth" ? (
          <>
            <Card title="Authorization Fields" bordered={false}>
              {oauthFields.map((field, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <Input
                    style={{ flex: 1 }}
                    placeholder="Enter key name"
                    value={field.keyName}
                    onChange={(e) =>
                      handleOAuthFieldChange(index, "keyName", e.target.value)
                    }
                  />
                  <Input
                    style={{ flex: 1 }}
                    placeholder="Enter key value"
                    value={field.keyValue}
                    onChange={(e) =>
                      handleOAuthFieldChange(index, "keyValue", e.target.value)
                    }
                  />

                  <Button
                    type="link"
                    danger
                    onClick={() => handleRemoveOAuthField(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="dashed"
                onClick={handleAddOAuthField}
                style={{ width: "100%" }}
              >
                Add Authorization Field
              </Button>
            </Card>
            <Divider
              variant="dashed"
              style={{
                borderColor: "#dbd5d5",
              }}
            ></Divider>
            <Card title="Authentication Fields" bordered={false}>
              {/* help={<span className="modal-helper-text">Select an authentication method</span>} */}
              <Form.Item
                label="Type"
                required
                help={
                  <span className="modal-helper-text">
                    Select the authentication type required for your API.
                  </span>
                }
              >
                <Select value={type} onChange={(value) => setType(value)}>
                  <Option value="Basic">Basic</Option>
                  <Option value="Base64-Encoded">Base64-Encoded</Option>
                  {/* Add more authentication types here if needed */}
                </Select>
              </Form.Item>
              <Form.Item
                label="Content Type Header"
                required
                help={
                  <span className="modal-helper-text">
                    Choose the content type that matches your API request
                    format.
                  </span>
                }
              >
                <Select
                  value={contenttype}
                  onChange={(value) => setContenttype(value)}
                >
                  <Option value="application/x-www-form-urlencoded">
                    application/x-www-form-urlencoded
                  </Option>
                  <Option value="application/json">application/json</Option>
                  <Option value="multipart/form-data">
                    multipart/form-data
                  </Option>
                </Select>
              </Form.Item>
              {oauthenticateFields.map((field, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <Input
                    style={{ flex: 1 }}
                    placeholder="Enter key name"
                    value={field.keyName}
                    onChange={(e) =>
                      handleOAuthenticateFieldChange(
                        index,
                        "keyName",
                        e.target.value,
                      )
                    }
                  />
                  <Input
                    style={{ flex: 1 }}
                    placeholder="Enter key value"
                    value={field.keyValue}
                    onChange={(e) =>
                      handleOAuthenticateFieldChange(
                        index,
                        "keyValue",
                        e.target.value,
                      )
                    }
                  />

                  <Button
                    type="link"
                    danger
                    onClick={() => handleRemoveOAuthenticateField(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              {/* Authentication Type Dropdown */}

              <Button
                type="dashed"
                onClick={handleAddOAuthenticateField}
                style={{ width: "100%" }}
              >
                Add Authentication Field
              </Button>
            </Card>
            <Divider
              variant="dashed"
              style={{
                borderColor: "#dbd5d5",
              }}
            ></Divider>
            <Card title="URLs" bordered={false}>
              <Form.Item
                label="Authorization URL"
                required
                help={
                  <span className="modal-helper-text">
                    eg: https://accounts.google.com/o/oauth2/auth
                  </span>
                }
              >
                <Input
                  type="text"
                  placeholder="Enter authorization url"
                  value={oauthurl}
                  onChange={(e) => {
                    const value = e.target.value;

                    if (value.includes(" ")) {
                      message.error(
                        "Spaces are not allowed in Authorization URL",
                      );
                      return;
                    }

                    if (value.endsWith("/")) {
                      message.error(
                        "OAuth URL should not end with a forward slash",
                      );
                      return;
                    }

                    setOauthurl(value);
                  }}
                />
              </Form.Item>
              <Form.Item
                label="Token URL"
                required
                help={
                  <span className="modal-helper-text">
                    eg: https://oauth2.googleapis.com/token
                  </span>
                }
              >
                <Input
                  type="text"
                  placeholder="Enter token url"
                  value={tokenurl}
                  onChange={(e) => {
                    const value = e.target.value;

                    if (value.includes(" ")) {
                      message.error("Spaces are not allowed in Token URL");
                      return;
                    }

                    if (value.endsWith("/")) {
                      message.error(
                        "Token URL should not end with a forward slash",
                      );
                      return;
                    }

                    setTokenurl(value);
                  }}
                />
              </Form.Item>
              <Form.Item
                label="Base URL"
                required
                help={
                  <span className="modal-helper-text">
                    eg: https://www.googleapis.com
                  </span>
                }
              >
                <Input
                  type="text"
                  placeholder="Enter base url"
                  value={baseurl}
                  onChange={(e) => {
                    const value = e.target.value;

                    if (value.includes(" ")) {
                      message.error("Spaces are not allowed in Base URL");
                      return;
                    }

                    if (value.endsWith("/")) {
                      message.error(
                        "Base URL should not end with a forward slash",
                      );
                      return;
                    }

                    setBaseurl(value);
                  }}
                />
              </Form.Item>
            </Card>
            <Divider
              variant="dashed"
              style={{
                borderColor: "#dbd5d5",
              }}
            ></Divider>
          </>
        ) : ( 
         authType === 'Basic' ? (
          <>
            <Card title="Authentication Fields" bordered={false}>
              {authFields.map((field, index) => (
                <Form.Item
                  key={index}
                  label={`Auth Field ${index + 1}`}
                  help={<span className="modal-helper-text">eg: apiKey</span>}
                >
                  <Input
                    type="text"
                    placeholder={`Enter key name for auth field ${index + 1}`}
                    value={field.keyName}
                    onChange={(e) =>
                      handleAuthFieldChange(index, e.target.value)
                    }
                  />
                </Form.Item>
              ))}
              <Button
                type="dashed"
                onClick={handleAddAuthField}
                style={{ width: "100%" }}
              >
                Add Authentication Field
              </Button>
            </Card>
            <Divider
              variant="dashed"
              style={{
                borderColor: "#dbd5d5",
              }}
            ></Divider>
          </>
        ) :
      (
          <></>
      )
    )
      }

        {/* Headers */}
        <div style={{ marginTop: "20px" }}>
          <Card title="Add Headers" bordered={false}>
            {headers.map((header, index) => (
              <Form.Item
                key={index}
                label={`Header ${index + 1}`}
                help={
                  <span className="modal-helper-text">{`eg: Authorization, Content-Type, Accept`}</span>
                }
              >
                <Input
                  type="text"
                  placeholder={`Enter header ${index + 1}`}
                  value={header.headerKey}
                  onChange={(e) => handleHeaderChange(index, e.target.value)}
                />
              </Form.Item>
            ))}
            <Button
              type="dashed"
              onClick={handleAddHeader}
              style={{ width: "100%" }}
            >
              Add Header
            </Button>
          </Card>
          <Divider
            variant="dashed"
            style={{
              borderColor: "#dbd5d5",
            }}
          ></Divider>
        </div>
      </Form>
    </Modal>
  );
};

export default AddAppModal;
