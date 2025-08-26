import React, { useEffect, useState } from 'react';
import { Form, Input, Button, InputNumber, message, Radio } from 'antd';
import axios from 'axios';
import { getUserID } from '../../Utility/service';
import { axiosSecureInstance } from '../../api/axios';
import { determineUrlType } from '../../Utility/webCrawlHelper';
import { SUCCESSFULLY_CRAWLED, SUCCESSFULLY_SYNCED } from './webCrawlConstants';
import { WEB_CRAWLED_SLUG } from '../../constants/Api_constants';

const userId = getUserID();
export const WebCrawlForm = ({form,SubmitText,setIsImportWebPages,setIsWebCrawlerSyncing,url,setBaseUrlForSync,setIsLoading,syncingRecordId,setSyncingRecordId}) => {
  const [loading, setLoading] = useState(false);
  const [urlType, setUrlType] = useState('single');
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [label,setLabel] = useState('How many page you want to Import?');
  
  const handleUrlTypeChange = (e) => {
    const value = e.target.value;
    setUrlType(value);
    if (value === 'single') {
      form.setFieldsValue({ maxPageLimit: 1 }); 
    } else {
      form.resetFields(['maxPageLimit']); 
    }
  };
  const handleFinish = (values) => {
    onFinish(values);
    form.resetFields();
  };


  useEffect(() => {
    if(SubmitText === "Sync"){
      setLabel('How many page you want to Sync?');
    }else{
      setLabel('How many page you want to Import?');
    }
    if(loading) return
    form.resetFields();
    setIsFormSubmitted(false); 
  
    if (url) {
      const detectedType = determineUrlType(url);
      if (detectedType === 'Page Link') {
        setUrlType('single');
        form.setFieldsValue({ urlType: 'single', maxPageLimit: undefined });
      } else {
        setUrlType('domain');
        form.setFieldsValue({ urlType: 'domain' });
      }
    } else {
      setUrlType('single');
    }
  }, [SubmitText, url, form]);

  useEffect(()=>{
    form.resetFields(['startingUrl']);

  },[urlType]);
  const onFinish = async (values) => {
    try {
      setLoading(true);
      const webCrawlRequestBody = {
        url: SubmitText === "Sync"? url : values.startingUrl,
        limit: values.maxPageLimit,
        userId: userId,
        sync : SubmitText === "Sync"? true: false,
        key: syncingRecordId,
    }

      const response = await axiosSecureInstance.post(WEB_CRAWLED_SLUG, webCrawlRequestBody);
      if(response.status === 200){
        setIsImportWebPages(false);
        setIsWebCrawlerSyncing(false);
        setBaseUrlForSync('');
        setLoading(false);
        setIsLoading(true);
        form.resetFields();
        setUrlType('single');
        if(SubmitText === "Sync"){
          message.success(SUCCESSFULLY_SYNCED);
        }else{
          message.success(SUCCESSFULLY_CRAWLED);
        }
        
      }
    } catch (error) {
      setIsImportWebPages(false);
      setIsWebCrawlerSyncing(false);
      setBaseUrlForSync('');
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
      style={{ maxWidth: 400, margin: 'auto' }}
      initialValues={{
        startingUrl: SubmitText === "Sync" ? url : '',
        urlType: urlType,
        maxPageLimit: null,
      }}
    >
      {/* Conditionally Render Title */}
      {SubmitText !== "Sync" && (
        <Form.Item label="You can put a domain URL or give a specific page URL" name="urlType">
          <Radio.Group
            onChange={handleUrlTypeChange}
            value={urlType}
            disabled={SubmitText === "Sync"}
          >
            <Radio value="single">Single Page</Radio>
            <Radio value="domain">Domain</Radio>
          </Radio.Group>
        </Form.Item>
      )}

      {/* Starting URL / URL Field */}
      <Form.Item
        label={urlType === 'domain' ? 'Starting URL' : 'Single Page URL'}
        name="startingUrl"
        rules={
          !url ? [
            { required: true, message: 'Please enter the URL' },
            { type: 'url', message: 'Please enter a valid URL' },
          ]:[]
        }
      >
        <Input
          placeholder={url !== '' ? url : "https://example.com"}
          disabled={SubmitText === "Sync"}
        />
      </Form.Item>

      {urlType === 'domain' && (
        <Form.Item
          label={label}
          name="maxPageLimit"
          rules={[
            { required: true, message: 'Please enter the maximum page limit' },
            { type: 'number', min: 1, message: 'The minimum value is 1' },
          ]}
        >
          <InputNumber
            min={1}
            placeholder="Enter max page limit"
            style={{ width: '100%' }}
          />
        </Form.Item>
      )}

      {/* Submit Button */}
      <Form.Item style={{ textAlign: "right" }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          {SubmitText}
        </Button>
      </Form.Item>
    </Form>
  );
};

