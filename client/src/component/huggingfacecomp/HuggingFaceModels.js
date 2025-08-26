// HuggingFaceModels.js
import React, { useState, useEffect } from "react";
import { Button, Modal, Space, Table, Tag, Tooltip, notification, List, message } from "antd";
import { ExclamationCircleOutlined, PlusOutlined, EditOutlined, MessageOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import axios from "axios";
import ModelAdditionForm from "./ModelAdditionForm";
import { useNavigate } from "react-router-dom";
import { HfMessages } from "../../constants/huggingfaceConstants";
import './huggingfaceconfig.css'

const HuggingFaceModels = () => {
  const [models, setModels] = useState([]);
  const [isFormVisible, setFormVisible] = useState(false);
  const navigate = useNavigate();
  const [isEditVisible, setEditVisible] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [isParamsModalVisible, setParamsModalVisible] = useState(false); // State for parameters modal
  const [selectedParams, setSelectedParams] = useState(null); // State for selected model's parameters

  const refreshModels = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}api/models`)
      .then((response) => {
        const sortedModels = response.data.data.sort((a, b) => a.id - b.id);
        setModels(sortedModels);
      })
      .catch(() => {
        message.error(HfMessages.HF_FETCH_MODL_FAIL);
      });
  };

  useEffect(() => {
    refreshModels();
  }, []);

  const handleModelDeletion = (model) => {
    Modal.confirm({
      title: "Confirm Deletion",
      icon: <ExclamationCircleOutlined style={{ color: "red" }} />,
      content: `Are you sure you want to delete the model "${model.name}"?`,
      okText: "Yes",
      cancelText: "No",
      onOk: () => {
        axios
          .delete(`${process.env.REACT_APP_BASE_URL}api/models/nickname/${model.nickname}`)
          .then(() => {
            notification.success({
              message: HfMessages.HF_MOD_DEL,
              description: `"${model.name}" has been deleted successfully.`,
              duration: 2,
            });
            refreshModels();
          })
          .catch((error) => {
            notification.error({
              message: HfMessages.HF_MOD_DEL_FAIL,
              description: HfMessages.HF_MOD_DEL_ERR,
            });
          });
      },
    });
  };

  const handleChatInteraction = (model) => {
    const modifiedModel = { ...model, name: `${model.name}-hf` };
    navigate("/chat", { state: { selectedModel: modifiedModel } });
  };

  const handleModelEdit = (model) => {
    setSelectedModel(model);
    setEditVisible(true);
  };

  const handleViewParams = (model) => {
    setSelectedParams(model);
    setParamsModalVisible(true);
  };

  const columns = [
    {
      title: "SL",
      key: "serial",
      align: "center",
      render: (text, record) => models.indexOf(record) + 1,
    },
    {
      title: "Model Nickname",
      dataIndex: "nickname",
      key: "nickname",
      align: "center",
    },
    {
      title: "Model Name",
      dataIndex: "name",
      key: "name",
      align: "center",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Input and Output type",
      dataIndex: "inputOutputType",
      key: "inputOutputType",
      align: "center",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Parameters",
      key: "parameters",
      align: "center",
      render: (_, model) => (
        <Button icon={<EyeOutlined />} onClick={() => handleViewParams(model)}>
          View Parameters
        </Button>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, model) => (
        <Space>
          <Tooltip title={`Interact with ${model.name}`}>
            <Button icon={<MessageOutlined />} onClick={() => handleChatInteraction(model)} />
          </Tooltip>
          <Tooltip title={`Edit ${model.name}`}>
            <Button icon={<EditOutlined />} onClick={() => handleModelEdit(model)} />
          </Tooltip>
          <Tooltip title={`Delete ${model.name}`}>
            <Button icon={<DeleteOutlined />} onClick={() => handleModelDeletion(model)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Define human-readable labels for parameters
  const parameterLabels = {
    temperature: "Temperature",
    maxToken: "Max Token",
    topP: "Top P",
    topK: "Top K",
    frequencyPenalty: "Frequency Penalty",
    presencePenalty: "Presence Penalty",
    width: "Width",
    height: "Height",
    guidanceScale: "Guidance Scale",
    seed: "Seed",
    numInferenceSteps: "Number of Inference Steps",
    maxSequenceLength: "Max Sequence Length",
    randomizeSeed: "Randomize Seed",
  };

  return (
    <div style={{ margin: "20px" }}>
      <div className="text-end" style={{ marginBottom: "20px" }}>
  <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormVisible(true)}>
    Add Model
  </Button>
</div>

      <Table
        columns={columns}
        dataSource={models}
        rowKey={(record) => record.id}
        bordered
        pagination={{ pageSize: 5 }}
        scroll={{ x: 'max-content' }}
        className="models-list"
      />

      <Modal
        title="Add Model"
        open={isFormVisible}
        onCancel={() => setFormVisible(false)}
        footer={null}
      >
        <ModelAdditionForm onClose={() => setFormVisible(false)} refreshModels={refreshModels} />
      </Modal>

      <Modal
        title="Edit Model"
        open={isEditVisible}
        onCancel={() => setEditVisible(false)}
        footer={null}
      >
        <ModelAdditionForm
          onClose={() => setEditVisible(false)}
          refreshModels={refreshModels}
          initialValues={selectedModel}
          isEditMode={true}
        />
      </Modal>

      <Modal
  title="Model Parameters"
  open={isParamsModalVisible}
  onCancel={() => setParamsModalVisible(false)}
  footer={null}
  width={600}
>
  {selectedParams && (
    <>
      <List
        bordered
        dataSource={Object.entries(selectedParams).filter(([key]) => key in parameterLabels)}
        renderItem={([key, value]) => (
          <List.Item>
            <strong>{parameterLabels[key]}:</strong>{" "}
            {value !== null && value !== undefined ? value.toString() : "N/A"}
          </List.Item>
        )}
      />
    </>
  )}
</Modal>
    </div>
  );
};

export default HuggingFaceModels;