import { useState, useEffect } from 'react';
import { getConfig, updateConfig } from '../../api/settings';
import { DallEResolutions } from '../../constants/setting_constant';
import { Select, message, List } from 'antd';
const { Option } = Select;

const DalleConfig = () => {
  const [resolutions, setResolutions] = useState([]);
  const [formState, setFormState] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const getConfigData = async () => {
    try {
      const response = await getConfig();
      if (response) {
        setFormState({
          dallEModel: response.dallEModel,
          dallEQuality: response.dallEQuality,
          dallEResolution: response.dallEResolution,
        });
        setResolutions(DallEResolutions[response.dallEModel] || []);
      }
    } catch (error) {
      console.error(error);
    }
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

  const handleModelChange = (value) => {
    setFormState({
      ...formState,
      dallEModel: value,
      dallEResolution: "",
    });
    setResolutions(DallEResolutions[value] || []);
  };

  const data = [
    { title: 'Model', description: formState?.dallEModel || '' },
    { title: 'Quality', description: formState?.dallEQuality || '' },
    { title: 'Resolution', description: formState?.dallEResolution || '' },
  ];

  return (
    <>
      <List
        header={<div>Change Settings</div>}
        size="medium"
        bordered
        dataSource={data}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              title={item.title}
              description={
                isEditing ? (
                  item.title === 'Model' ? (
                    <Select
                      style={{ width: '290px' }}
                      name="dallEModel"
                      value={formState?.dallEModel || ''}
                      onChange={handleModelChange}
                    >
                      <Option value="dall-e-3">DALL·E 3</Option>
                      <Option value="dall-e-2">DALL·E 2</Option>
                    </Select>
                  ) : item.title === 'Quality' ? (
                    <Select
                      style={{ width: '290px' }}
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
                      style={{ width: '290px' }}
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
      <div className="text-end">
        <a
          onClick={handleUpdateClick}
          key="list-loadmore-edit"
          className="btn btn-outline-dark"
        >
          {isEditing ? 'update' : 'edit'}
        </a>
        {isEditing && (
          <a
            onClick={() => setIsEditing(!isEditing)}
            key="list-loadmore-cancel"
            className="btn btn-outline-dark"
          >
            cancel
          </a>
        )}
      </div>
    </>
  );
};

export default DalleConfig;
