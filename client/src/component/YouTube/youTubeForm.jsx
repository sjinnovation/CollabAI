import React, { useEffect, useState } from 'react';
import { Form, Input, Button, InputNumber, message, Radio } from 'antd';
import axios from 'axios';
import { getUserID } from '../../Utility/service';
import { axiosSecureInstance } from '../../api/axios';
import { GET_YOUTUBE_TRANSCRIPT } from '../../constants/Api_constants';

const userId = getUserID();
export const YouTubeForm = ({form,SubmitText,setIsImportYouTubeTranscript,url,setIsLoading,parentId = null}) => {
  const [loading, setLoading] = useState(false);
  const [urlType, setUrlType] = useState('single');

  const handleFinish = (values) => {
    onFinish(values);
    form.resetFields();
  };

  useEffect(()=>{
    form.resetFields(['youTubeUrl']);

  },[urlType]);
  const onFinish = async (values) => {
    try {
      setLoading(true);
      const youTubeRequestBody = {
        url: values.youTubeUrl,
        userId: userId,
        parentId: parentId
    }

      const response = await axiosSecureInstance.post(GET_YOUTUBE_TRANSCRIPT, youTubeRequestBody);
      if(response.status === 200){
        setIsImportYouTubeTranscript(false);
        setLoading(false);
        setIsLoading(true);
        form.resetFields();
        setUrlType('single');
        message.success(response.data.message);
        
      }
    } catch (error) {
      setIsImportYouTubeTranscript(false);
      setLoading(false);

      form.resetFields();
      message.error(error.response.data.message);

      console.error('Error:', error);
    }
  };
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{
        youTubeUrl:'',
        urlType: urlType,
        maxPageLimit: null,
      }}
    >
      <Form.Item
        label={urlType === 'YouTube Video URL'}
        name="youTubeUrl"
        rules={
          !url ? [
            { required: true, message: 'Please enter the URL' },
            { type: 'url', message: 'Please enter a valid URL' },
          ]:[]
        }
      >
        <Input
          placeholder={url !== '' ? url : "https://www.youtube.com/watch?v=1jCFUv-Xlqo"}
          disabled={SubmitText === "Sync"}
        />
      </Form.Item>

      <Form.Item style={{ textAlign: "right" }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          {SubmitText}
        </Button>
      </Form.Item>
    </Form>
  );
};

