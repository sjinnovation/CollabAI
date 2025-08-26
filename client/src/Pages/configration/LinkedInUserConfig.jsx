import React, { useState, useEffect } from 'react';
import { List, Input, message, Button } from 'antd';
import { getConfig, updateConfig } from '../../api/settings';
import "./style.css"
import ConfigurationHeader from '../../component/Configuration/ConfigurationHeader/ConfigurationHeader';

const LinkedInUserConfig = () => {
  const [formState, setFormState] = useState({
    linkedinClientId: '',
    linkedinClientSecret: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  const getConfigData = async () => {
    try {
      const response = await getConfig();
      if (response) {
        setFormState({
          linkedinClientId: response.linkedinClientId || '',
          linkedinClientSecret: response.linkedinClientSecret || ''
        });
      }
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleInputChange = (field, value) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    getConfigData();
  }, []);

  const handleUpdateClick = async () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      const response = await updateConfig(formState);
      if (response) {
        message.success(response.message);
        getConfigData();
      } else {
        message.error(response.message);
      }
    }
  };

  const renderSecretValue = (value) => {
    if (value?.length > 3) {
      const firstThree = value?.slice(0, 3);
      const lastThree = value?.slice(-3);
      const middlePart = value?.slice(3, -3).replace(/./g, '*');
      return firstThree + middlePart + lastThree;
    }
    return value;
  };

  const linkedInData = [
    {
      title: 'Client Id',
      description: formState?.linkedinClientId || '',
    },
    {
      title: 'Client Secret',
      description: formState?.linkedinClientSecret || '',
    },
  ];

  return (
    <div className="config-container-w">
      <ConfigurationHeader title="AI Model Configuration" subHeading="Set up your LinkedIn API credentials to enable LinkedIn integration. Enter your Client ID and Client Secret to authenticate and access LinkedIn features." />
      <div className="linkedin-btn-space">
        <Button
          onClick={handleUpdateClick}
          key="list-loadmore-edit"
          className="mr-2"
        >
          {isEditing ? 'Update' : 'Edit'}
        </Button>
        {isEditing && (
          <Button
            onClick={() => setIsEditing(!isEditing)}
            key="list-loadmore-cancel"
            danger
            className="ml-2"
          >
            Cancel
          </Button>
        )}
      </div>
      <List
        header={<div>Change Settings</div>}
        size="medium"
        dataSource={linkedInData}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              title={item.title}
              description={
                item.title === 'Client Secret' ? (
                  isEditing ? (
                    <Input.Password
                      value={formState.linkedinClientSecret}
                      onChange={(e) => handleInputChange('linkedinClientSecret', e.target.value)}
                    />
                  ) : (
                    renderSecretValue(item.description)
                  )
                ) : (
                  isEditing ? (
                    <Input.Password
                      value={formState.linkedinClientId}
                      onChange={(e) => handleInputChange('linkedinClientId', e.target.value)}
                    />
                  ) : (
                    renderSecretValue(item.description)
                  )
                )
              }
            />
          </List.Item>
        )}
      />

    </div>
  );
};

export default LinkedInUserConfig;