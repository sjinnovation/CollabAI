import React, { useState } from "react";
import { BsRobot } from "react-icons/bs";
//libraries
import {
  Button,
  Space,
  Table,
  Tag,
  Modal,
  Tooltip,
  Switch,
  Avatar,
  message,
} from "antd";
import { AiOutlineDelete, AiOutlineEdit, AiOutlineArrowUp } from "react-icons/ai";
import DebouncedSearchInput from "../../Pages/SuperAdmin/Organizations/DebouncedSearchInput";
import { SEARCH_ALL_USER_CREATED_ASSISTANTS_SLUG } from "../../constants/Api_constants";
import { axiosSecureInstance } from "../../api/axios";
import { useEffect } from "react";
import { getUserID } from "../../Utility/service";
import { handleSwitchChange, showDeleteConfirm, showRemoveConfirm } from "../../Utility/showModalHelper";
import "./Assistant.css";
import { handleCheckAssistantActive } from "../../Utility/addPublicAssistantHelper";

const { confirm } = Modal;

const AdminAssistantList = ({ data }) => {
  const {
    setAdminUserAssistants,
    adminUserAssistants,
    loader,
    handleDeleteAssistant,
    handleUpdateAssistant,
    showEditModalHandler,
    handleFetchUserCreatedAssistants,
    totalCount,
    updateLoader,
    searchPersonalAssistants,
    personalAssistantSearchQuery,
    setPersonalAssistantSearchQuery,
    handlePublicAssistantAdd
  } = data;

  const [searchQuery, setSearchQuery] = useState("");
  const [isPublic, setIsPublic] = useState(false);


  const redirectToAssistant = (record) => {

    const assistantId = record.assistant_id;
    const url = `/assistants/${assistantId}`;
    window.open(url, "_blank");
  };



  const showDeleteConfirm = (assistantId, assistantName) => {
    confirm({
      title: 'Are you sure delete this Assistant?',
      content: `You are deleting ${assistantName}.`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        handleDeleteAssistant(assistantId);
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  const columns = [
    {
      title: "Assistant",
      dataIndex: "name",
      key: "name",
      align: "center",
      render: (_, { name, image_url }) => (
        <Space size="middle" className="d-flex align-items-center">
          <div className="assistantImageDiv">
            {image_url ? (
              <img src={image_url} className="customImage" alt="avatar" />
            ) : (
              <BsRobot className="customImage" />
            )}
           </div>
          <div className="ms-2 text-start">{name}</div>
        </Space>
      ),
    },
    {
      title: "Status",
      key: "is_active",
      align: "center",
      dataIndex: "is_active",
      width: 100,
      render: (_, { is_active }) => (
        <Tag color={is_active ? "green" : "red"}>
          {is_active ? "active" : "inactive"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Button
            onClick={() => redirectToAssistant(record)}
            icon={<AiOutlineArrowUp />}
          ></Button>

          <Button
            onClick={() => showEditModalHandler(record)}
            icon={<AiOutlineEdit />}

          >

          </Button>
          <Tooltip title="Activate or Deactivate">
            <Switch
              checked={record?.is_active}
              onChange={(checked) =>

                handleSwitchChange(record, checked, handleUpdateAssistant)

              }
              loading={
                loader.ASSISTANT_UPDATING === record._id ?? false
              }

            />
          </Tooltip>
          <Button
            onClick={() => showDeleteConfirm(record?.assistant_id, record?.name,handleDeleteAssistant)}
            danger
            icon={<AiOutlineDelete />}
            loading={
              loader.ASSISTANT_DELETING === record._id
            }

          />
          <Tooltip title="Public or Private">
            <Switch
              checked={record?.is_public}
              onChange={(checked) =>{handleCheckAssistantActive(checked, record, handlePublicAssistantAdd)}
              }
              loading={
                loader.ASSISTANT_UPDATING === record._id ?? false
              }

            />
          </Tooltip>
        </Space>
      ),
    },
  ];



  return (
    <>
      <div className="mb-3">
        <DebouncedSearchInput
          data={{
            search: personalAssistantSearchQuery,
            setSearch: setPersonalAssistantSearchQuery,
            placeholder: "Search assistants",
          }}
        />
      </div>
      <Table
        loading={loader.ASSISTANT_LOADING}
        bordered={true}
        columns={columns}
        dataSource={adminUserAssistants}
        scroll={{ y: '50vh' }}
        pagination={{
          pageSize: 10,
          total: totalCount,
          onChange: (page) => {
            handleFetchUserCreatedAssistants(page)

          }
        }}
      />
    </>
  );
};

export default AdminAssistantList;
