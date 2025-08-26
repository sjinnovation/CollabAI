import { useState, useEffect } from 'react';
import { getConfig, updateConfig } from '../../api/settings';
import { DallEResolutions } from '../../constants/setting_constant';
import "./style.css"
import { Select, message, List, Button } from 'antd';
const { Option } = Select;

const DalleConfig = ({ isEditing, formState, setFormState, handleModelChange, resolutions }) => {
  const data = [
    { title: 'Choose a Model', description: formState?.dallEModel || '' },
    { title: 'Quality', description: formState?.dallEQuality || '' },
    { title: 'Resolution', description: formState?.dallEResolution || '' },
  ];

  return (
    <div className="config-container-w">
      <List
        size="medium"
        className="custom-list"
        bordered
        dataSource={data}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              title={item.title}
              description={
                isEditing ? (
                  item.title === 'Choose a Model' ? (
                    <Select
                      className="select-field"
                      name="dallEModel"
                      value={formState?.dallEModel || ''}
                      onChange={handleModelChange}
                    >
                      <Option value="dall-e-3">DALL·E 3</Option>
                      <Option value="dall-e-2">DALL·E 2</Option>
                    </Select>
                  ) : item.title === 'Quality' ? (
                    <Select
                      className="select-field"
                      name="dallEQuality"
                      value={formState?.dallEQuality || ''}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          dallEQuality: e,
                        })
                      }
                    >
                      <Option value="Standard">Standard</Option>
                      <Option value="HD">HD</Option>
                    </Select>
                  ) : item.title === 'Resolution' ? (
                    <Select
                      className="select-field"
                      name="dallEResolution"
                      value={formState?.dallEResolution || ''}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          dallEResolution: e,
                        })
                      }
                    >
                      {resolutions.map((res) => (
                        <Option key={res} value={res}>
                          {res}
                        </Option>
                      ))}
                    </Select>
                  ) : null
                ) : (
                  item.description
                )
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default DalleConfig;