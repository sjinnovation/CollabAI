import { useState, useEffect } from 'react';
import { getConfig, updateConfig } from '../../api/settings';
import { DallEResolutions } from '../../constants/setting_constant';

import { Select, message, List, Input, InputNumber, Slider, Tooltip, Button } from 'antd';
import ConfigurationHeader from '../../component/Configuration/ConfigurationHeader/ConfigurationHeader';
const { Option } = Select;

const FluxConfig = () => {
  const [resolutions, setResolutions] = useState([]);
  const [formState, setFormState] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const getConfigData = async () => {
    try {
      const response = await getConfig();
      if (response) {
        setFormState({
          fluxModel: response.fluxModel,
          togetheraiKey : response?.togetheraiKey,
          fluxImageWidth : response?.fluxImageWidth,
          fluxImageHeight: response?.fluxImageHeight,
          fluxImageSeed : response?.fluxImageSeed,
          fluxSteps : response?.fluxSteps,
          fluxStatus : response?.fluxStatus,
          // fluxPreviews : response?.fluxPreviews

        });
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
      fluxModel: value,
    });
  };
  const handleStatusChange = (value) => {
    setFormState({
      ...formState,
      fluxStatus: value,
    });
  };

  const data = [
    { title: "TogetherAI API key", description: formState?.togetheraiKey || "" },
    { title: 'Model', description: formState?.fluxModel || 'black-forest-labs/FLUX.1-schnell' },
    { title: 'Width', description: formState?.fluxImageWidth || 900 },
    { title: 'Height', description: formState?.fluxImageHeight || 900 },
    { title: 'Seed', description: formState?.fluxImageSeed || 123 },
    { title: 'Steps', description: formState?.fluxSteps || 3 },
    { title: 'Status', description: formState?.fluxStatus || 'Private' },

    // { title: 'Previews', description: formState?.fluxPreviews || 1 },

  ];
  const renderSecretKey = () => {
    if (formState?.togetheraiKey?.length > 3) {
      const firstThree = formState?.togetheraiKey?.slice(0, 3);
      const lastThree = formState?.togetheraiKey?.slice(-3);
      const middlePart = formState?.togetheraiKey?.slice(3, -3).replace(/./g, "*");
      return firstThree + middlePart + lastThree;
    } else {
      return formState?.togetheraiKey;
    }
  };
  return (
    <div className="config-container-w">
      <ConfigurationHeader title="AI Model Configuration" subHeading="Configure parameters for the Flux AI model, including API key, image dimensions, seed, and steps to customize image generation." />
      <div className="text-end">
        <Button
          onClick={handleUpdateClick}
          key="list-loadmore-edit"
        >
          {isEditing ? 'update' : 'edit'}
        </Button>
        {isEditing && (
          <Button
            onClick={() => setIsEditing(!isEditing)}
            key="list-loadmore-cancel"
            danger
            className="ms-2"
          >
            cancel
          </Button>
        )}
      </div>
      <List
        header={<div>Change Settings</div>}
        size="medium"
        dataSource={data}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              title={
                item.title === "TogetherAI API key" ? (
                  <Tooltip title='TogetherAI API key will be here '>
                  {item.title}
                </Tooltip>

                ): item.title === 'Model' ?(
                  <Tooltip title='Select any flux model from the below list'>
                  {item.title}
                </Tooltip>
                ) : item.title === 'Seed' ?(
                  <Tooltip title='Seed is any random number.By specifying a fixed seed, later generated images more closely resemble earlier ones.'>
                  {item.title}
                </Tooltip>
                ):item.title === 'Width' ? (
                  <Tooltip title='Width of the flux image.Mostly 1024'>
                  {item.title}
                </Tooltip>
                ):item.title === 'Height' ? (
                <Tooltip title='Height of the flux image.Mostly 1024'>
                {item.title}
              </Tooltip>
                ):item.title === 'Steps' ? (
                  <Tooltip title='The more steps you use, the higher quality the generated image will be, but the longer it will take to generate.'>
                  {item.title}
                </Tooltip>
                ):item.title === 'Previews' ? (
                  <Tooltip title='The Number of images you want to generate with same prompt'>
                  {item.title}
                </Tooltip>
                ):item.title === 'Status' ? (
                  <Tooltip title='Make Flux available for all users by making Public or keep it Private'>
                  {item.title}
                </Tooltip>
                ):item.title

}

              description={
                isEditing ? (
                    item.title === "TogetherAI API key" ? (
                        isEditing ? (
                          <Input
                            type="password"
                            value={item.description}
                            onChange={(e) =>
                              setFormState({
                                ...formState,
                                togetheraiKey: e.target.value,
                              })
                            }
                          />
                        ) : (
                          renderSecretKey()
                        )
                      ) :item.title === 'Model' ? (
                    <Select
                      style={{ width: '290px' }}
                      name="fluxModel"
                      value={formState?.fluxModel || ''}
                      onChange={handleModelChange}
                    >
                      <Option value="black-forest-labs/FLUX.1-schnell">Flux.1 Schnell</Option>
                      <Option value="black-forest-labs/FLUX.1-dev">Flux.1 Dev</Option>
                      <Option value="black-forest-labs/FLUX.1.1-pro">Flux.1 Pro</Option>
                    </Select>
                  ) :item.title === 'Status' ? (
                    <Select
                      style={{ width: '290px' }}
                      name="fluxStatus"
                      value={formState?.fluxStatus || ''}
                      onChange={handleStatusChange}
                    >
                      <Option value="Public">Public</Option>
                      <Option value="Private">Private</Option>
                    </Select>
                  ): item.title === 'Seed' ? (

                                  <InputNumber min={1} defaultValue={123}
                                      value={formState?.fluxImageSeed || ''}
                                      onChange={(e) =>
                                          setFormState({
                                              ...formState,
                                              fluxImageSeed: e,
                                          })
                                      } />


                  ) : item.title === 'Width' ? (

                    <Slider
                    min={100}
                    max={1024}
                    step={2}
                    value={formState?.fluxImageWidth || 0}
                    onChange={(value) =>
                      setFormState({
                        ...formState,
                        fluxImageWidth: value,
                      })
                    }
                    disabled={!isEditing}
                    style={{ width: '500px' }}
                  />
                  ) :item.title === 'Height' ? (

                    <Slider
                    min={768}
                    max={1024}
                    step={2}
                    value={formState?.fluxImageHeight || 0}
                    onChange={(value) =>
                      setFormState({
                        ...formState,
                        fluxImageHeight: value,
                      })
                    }
                    disabled={!isEditing}
                    style={{ width: '500px' }}
                  />
                  ) :item.title === 'Steps' ? (
                    <Slider
                    min={1}
                    max={40}
                    step={1}
                    value={formState?.fluxSteps || 0}
                    onChange={(value) =>
                      setFormState({
                        ...formState,
                        fluxSteps: value,
                      })
                    }
                    disabled={!isEditing}
                    style={{ width: '500px' }}
                  />
                  ): item.title === 'Previews' ? (
                    <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={formState?.fluxPreviews || 0}
                    onChange={(value) =>
                      setFormState({
                        ...formState,
                        fluxPreviews: value,
                      })
                    }
                    disabled={!isEditing}
                    style={{ width: '500px' }}
                  />
                  ):null
                ) : (
                  item.title === "TogetherAI API key" ? (
                      renderSecretKey()
                  ):
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

export default FluxConfig;
