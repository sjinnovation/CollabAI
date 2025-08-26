import React, { useState, useEffect } from "react";
import { Button, Input, Select, Form, notification, Space, Typography, Slider, InputNumber, Switch, Upload } from "antd";
import axios from "axios";
import { UploadOutlined } from "@ant-design/icons";
import "./ModelAdditionForm.css";
import { HfMessages } from "../../constants/huggingfaceConstants";
import { checkModelFieldAvailability } from "../../api/hugginfaceApi";

const { Option } = Select;
const { Paragraph } = Typography;

const ModelAdditionForm = ({ onClose, refreshModels, initialValues, isEditMode = false }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  

  const [sliderValues, setSliderValues] = useState({
    temperature: 0.1,
    topP: 0.1,
    topK: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  });

  const handleSliderChange = (key) => (value) => {
    setSliderValues((prev) => ({ ...prev, [key]: value }));
  };

  // Set default values in useEffect when the form initializes
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        temperature: initialValues.temperature || 0.7,  // Default to 0.7
        maxToken: initialValues.maxToken || 256,  // Default to 256
        topP: initialValues.topP || 0.9,  // Default to 1
        topK: initialValues.topK || 50,  // Default to 40
        frequencyPenalty: initialValues.frequencyPenalty || 0,  // Default to 0
        presencePenalty: initialValues.presencePenalty || 1.2,  // Default to 0
        width: initialValues.width || 512,  // Default to 512
        height: initialValues.height || 512,  // Default to 512
        guidanceScale: initialValues.guidanceScale || 1,  // Default to 1
        seed: initialValues.seed || 42,  // Default to 42
        numInferenceSteps: initialValues.numInferenceSteps || 50,  // Default to 50
        maxSequenceLength: initialValues.maxSequenceLength || 512,  // Default to 512
        randomizeSeed: initialValues.randomizeSeed || false,  // Default to false
      });
      if (initialValues.image_url) {
        setImageUrl(initialValues.image_url);
      }
    }
  }, [form, initialValues]);

  const handleSubmit = async (values) => {
    setLoading(true);

    // Convert values to ensure proper types
    values.topP = parseFloat(values.topP) || 0.9;
    values.topK = parseInt(values.topK, 10) || 50;
    values.frequencyPenalty = parseFloat(values.frequencyPenalty) || 0;
    values.presencePenalty = parseFloat(values.presencePenalty) || 1.2;
    values.width = parseInt(values.width, 10) || 512;
    values.height = parseInt(values.height, 10) || 512;
    values.guidanceScale = parseFloat(values.guidanceScale) || 1;
    values.seed = parseInt(values.seed, 10) || 42;
    values.numInferenceSteps = parseInt(values.numInferenceSteps, 10) || 50;
    values.maxSequenceLength = parseInt(values.maxSequenceLength, 10) || 512;
    values.randomizeSeed = Boolean(values.randomizeSeed);

    const formData = new FormData();
    // Append all form values
    Object.keys(values).forEach((key) => {
      formData.append(key, values[key]);
    });

    // Append the file only if a new one is uploaded
    if (avatarFile) {
      formData.append("image_url", avatarFile);
    }

    try {
      const apiUrl = isEditMode
        ? `${process.env.REACT_APP_BASE_URL}api/models/${initialValues._id}`
        : `${process.env.REACT_APP_BASE_URL}api/models`;

      const response = isEditMode
        ? await axios.put(apiUrl, formData, { headers: { "Content-Type": "multipart/form-data" } })
        : await axios.post(apiUrl, formData, { headers: { "Content-Type": "multipart/form-data" } });

      notification.success({
        message: isEditMode ? HfMessages.HF_MOD_UPDATE : HfMessages.HF_MOD_ADD,
        description: isEditMode ? HfMessages.HF_MOD_UPDATE_SUCC : HfMessages.HF_MOD_ADD_SUCC,
        duration: 2,
      });
      refreshModels();

      if (!isEditMode) {
        form.resetFields();
        setAvatarFile(null);
        setImageUrl(null);
        setSliderValues({
          temperature: 0.1,
          topP: 0.1,
          topK: 1,
          frequencyPenalty: 0,
          presencePenalty: 0,
        });
        onClose();
      } else {
        onClose();
      }
    } catch (err) {
      notification.error({
        message: HfMessages.HF_ERR,
        description: isEditMode ? HfMessages.HF_UPDATE_ERR : HfMessages.HF_ADD_ERR,
      });
    } finally {
      setLoading(false);
    }
  };

  const validateNickname = async (_, value) => {
    if (!value) return Promise.reject(HfMessages.HF_MOD_NICK);

    if (isEditMode && initialValues?.nickname?.toLowerCase() === value.toLowerCase()) {
      return Promise.resolve();
    }

    try {
      const response = await checkModelFieldAvailability("nickname", value);
      if (response?.error) return Promise.reject(response.error);  
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(HfMessages.HF_NICK_CHECK_ERR || "Error checking nickname");
    }
  };
  
  const validateModelName = async (_, value) => {
    if (!value) return Promise.reject(HfMessages.HF_MOD_NAM);

    if (isEditMode && initialValues?.name?.toLowerCase() === value.toLowerCase()) {
      return Promise.resolve();
    }
    
    try {
      const response = await checkModelFieldAvailability("name", value);
      if (response?.error) return Promise.reject(response.error);  
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(HfMessages.HF_NAME_CHECK_ERR || "Error checking model name");
    }
  };  
  

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical">
      <Form.Item
        label="Model Nickname"
        name="nickname"
        rules={[
          { max: 15, message: HfMessages.HF_MOD_NICK_RESTR },
          { validator: validateNickname },
        ]}
        extra={<span className="custom-help-text">Model nickname should not exceed 15 characters.</span>}
      >
        <Input placeholder="Enter model nickname" />
      </Form.Item>
      <Form.Item
        label="Model Name"
        name="name"
        rules={[{ validator: validateModelName },
        ]}
        extra={<span className="custom-help-text">The model name should exactly match the name on the Hugging Face website.</span>}
      >
        <Input placeholder="Enter model name" />
      </Form.Item>

      {/* Upload Image */}
      <Form.Item label="Upload Photo">
        <Upload
          name="image_url"
          listType="picture-card"
          className="avatar-uploader"
          showUploadList={false}
          beforeUpload={(file) => {
            const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
            if (!isJpgOrPng) {
              notification.error({ message: HfMessages.HF_IMAGE_UPLOAD_PATTERN });
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
              notification.error({ message: HfMessages.HF_IMAGE_MAX_SIZE });
            }
            if (isJpgOrPng && isLt2M) {
              setAvatarFile(file);
              setImageUrl(URL.createObjectURL(file));
            }
            return false; // Prevent automatic upload
          }}
        >
          {imageUrl ? (
            <img src={imageUrl} alt="avatar" style={{ width: "100%" }} />
          ) : (
            <div>
              <UploadOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>
          )}
        </Upload>
      </Form.Item>

      <Form.Item label="Model Type" name="type" rules={[{ required: true, message: HfMessages.HF_MOD_TYPE }]}>
        <Select placeholder="Enter Model Type">
          <Option value="multimodal">Multimodal</Option>
          <Option value="computer-vision">Computer Vision</Option>
          <Option value="natural-language-processing">Natural Language Processing</Option>
          <Option value="audio">Audio</Option>
          <Option value="tabular">Tabular</Option>
          <Option value="reinforcement-learning">Reinforcement Learning</Option>
          <Option value="other">Other</Option>
        </Select>
      </Form.Item>

      <Form.Item label="Input – Output Type" name="inputOutputType" rules={[{ required: true, message: HfMessages.HF_MOD_OPER }]}>
        <Select placeholder="Enter Input – Output Type">
          <Option value="text-to-image">Text-To-Image</Option>
          <Option value="image-to-text">Image-To-Text</Option>
          <Option value="text-generation">Text-Generation</Option>
          <Option value="image-classification">Image-Classification</Option>
          <Option value="text-classification">Text-Classification</Option>
        </Select>
      </Form.Item>

<Form.Item
        label={
          <strong>
          Temperature (0-2): {sliderValues.temperature}
          </strong>
          }
        name="temperature"
      >
        <Slider
          min={0.1}
          max={2}
          step={0.1}
          value={sliderValues.temperature}
          onChange={handleSliderChange("temperature")}
        />
      </Form.Item>

<Form.Item label="Max Token" name="maxToken" rules={[{ required: true, message: HfMessages.HF_MOD_MAX_TOKEN }]}>
  <InputNumber min={10} max={2048} step={50} style={{ width: "100%" }} />
</Form.Item>

<Form.Item
        label={
          <strong>
          Top P (0-1): {sliderValues.topP}
          </strong>
          }
        name="topP"
      >
        <Slider
          min={0.1}
          max={1}
          step={0.05}
          value={sliderValues.topP}
          onChange={handleSliderChange("topP")}
        />
      </Form.Item>

      <Form.Item
        label={
          <strong>
          Top K (1-40): {sliderValues.topK}
          </strong>
          }
        name="topK"
      >
        <Slider
          min={1}
          max={40}
          step={1}
          value={sliderValues.topK}
          onChange={handleSliderChange("topK")}
        />
      </Form.Item>

      <Form.Item
        label={
          <strong>
          Frequency Penalty (0-2): {sliderValues.frequencyPenalty}
          </strong>
          }
        name="frequencyPenalty"
      >
        <Slider
          min={0}
          max={2}
          step={0.1}
          value={sliderValues.frequencyPenalty}
          onChange={handleSliderChange("frequencyPenalty")}
        />
      </Form.Item>

      <Form.Item
        label={
          <strong>
          Presence Penalty (0-2): {sliderValues.presencePenalty}
          </strong>
          }
        name="presencePenalty"
      >
        <Slider
          min={0}
          max={2}
          step={0.1}
          value={sliderValues.presencePenalty}
          onChange={handleSliderChange("presencePenalty")}
        />
      </Form.Item>

<Form.Item label="Width" name="width">
  <InputNumber min={64} max={1024} step={64} style={{ width: "100%" }} />
</Form.Item>

<Form.Item label="Height" name="height">
  <InputNumber min={64} max={1024} step={64} style={{ width: "100%" }} />
</Form.Item>

<Form.Item label="Guidance Scale" name="guidanceScale">
  <InputNumber min={1} max={20} step={0.5} style={{ width: "100%" }} />
</Form.Item>

<Form.Item label="Seed" name="seed">
  <InputNumber min={0} step={1} style={{ width: "100%" }} />
</Form.Item>

<Form.Item label="Number of Inference Steps" name="numInferenceSteps">
  <InputNumber min={1} max={200} step={5} style={{ width: "100%" }} />
</Form.Item>

<Form.Item label="Max Sequence Length" name="maxSequenceLength">
  <InputNumber min={10} max={4096} step={50} style={{ width: "100%" }} />
</Form.Item>

<Form.Item label="Randomize Seed" name="randomizeSeed" valuePropName="checked">
  <Switch />
</Form.Item>


      <Form.Item>
        <Paragraph>
          <strong>Note:</strong>
          <ul>
            <li>Ensure that the model has an inference provider and is deployed to the Hugging Face Inference API.</li>
            <li>API endpoints can only be hit a limited number of times per month. To access more, upgrade to the Pro version.</li>
            <li>Models must be under 10GB in size to be added.</li>
          </ul>
        </Paragraph>
      </Form.Item>

      <Form.Item style={{ textAlign: "right" }}>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEditMode ? "Edit Model" : "Add Model"}
          </Button>
          <Button onClick={onClose} type="default">
            Cancel
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default ModelAdditionForm;