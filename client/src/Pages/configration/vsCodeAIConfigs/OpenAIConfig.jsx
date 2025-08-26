import {
  Input, Select, List, Slider, Switch
} from "antd";
import TextArea from "antd/es/input/TextArea";
const { Option } = Select;

const VsCodeOpenAIConfig = ({ formState, setFormState, isEditing }) => {
  const renderSecretKey = () => {
    if (formState?.vsCodeOpenaikey?.length > 3) {
      const firstThree = formState?.vsCodeOpenaikey?.slice(0, 3);
      const lastThree = formState?.vsCodeOpenaikey?.slice(-3);
      const middlePart = formState?.vsCodeOpenaikey?.slice(3, -3).replace(/./g, "*");
      return firstThree + middlePart + lastThree;
    } else {
      return formState?.openaikey;
    }
  };

  const defaultValues = {
    vsCodeOpenaiTemperature: 0,
    vsCodeOpenaiModel: 'gpt-3.5-turbo',
    vsCodeOpenaiMaxToken: 16384,
    vsCodeOpenaikey: "",
  };


  const data = [
    { title: "API key", description: formState?.vsCodeOpenaikey || "" },
      // { title: "Choose a Model", description: formState?.vsCodeOpenaiModel || "" },
    {
      title: "Temperature (0-2)",
      description: formState?.vsCodeOpenaiTemperature || "",
      sliderValue: formState?.vsCodeOpenaiTemperature,
      defaultValue: defaultValues.vsCodeOpenaiTemperature,
      subtitle: "Higher values, like 0.8, will result in more random output, while lower values, such as 0.2, will yield results that are more focused and deterministic."
    },
    {
      title: "Max Token", description: formState?.vsCodeOpenaiMaxToken || "",
      sliderValue: formState?.vsCodeOpenaiMaxToken,
      defaultValue: defaultValues.vsCodeOpenaiMaxToken,
      subtitle: "This indicates the maximum number of tokens to generate before the process stops."
    }
  ];

  return (
    <div className="config-container">
      <List
        className="custom-list"
        size="small"
        bordered
        dataSource={data}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              title={
                <span className="item-title">
                  {item.title === "Prompt Caching" ? '' : (
                    <>
                      {item.title}
                      {item.sliderValue ? (
                        item.defaultValue === Number(item.sliderValue) ?
                          <>: Default</>
                          : <>: {item.sliderValue}</>
                      ) : null}
                    </>
                  )}
                </span>
              }
              description={
                item.title === "API key" ? (
                  isEditing ? (
                    <Input
                      type="password"
                      value={item?.description}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          vsCodeOpenaikey: e.target.value,
                        })
                      }
                      className="field-width"
                    />
                  ) : (
                    renderSecretKey()
                  )
                )   : item.title === "Temperature (0-2)" ? (
                      <>
                        {/* <ExpandableText text={item.subtitle} maxLines={1} /> */}
                        <div className="text-container">
                          <p>{item.subtitle}</p>
                        </div>
                        <Slider
                          min={0}
                          max={2}
                          step={0.1}
                          value={formState?.vsCodeOpenaiTemperature || 0}
                          onChange={(value) =>
                            setFormState({
                              ...formState,
                              vsCodeOpenaiTemperature: value,
                            })
                          }
                          disabled={!isEditing}
                          className="field-width"
                          marks={{
                            0: { label: <strong className="slider-label-left">Precise</strong> },
                            1: <strong>Neutral</strong>,
                            2: <strong>Creative</strong>
                          }}
                        />
                      </>
                    )        
                    : item.title === "Max Token" ? (
                      <>
                        {/* <ExpandableText text={item.subtitle} maxLines={1} /> */}
                        <div className="text-container">
                          <p>{item.subtitle}</p>
                        </div>
                        <Input
                          type="number"
                          disabled={!isEditing}
                          value={formState?.vsCodeOpenaiMaxToken || 0}
                          onChange={(e) => {
                            const value = Math.min(16384, Math.max(0, Number(e.target.value)));
                            setFormState({
                              ...formState,
                              vsCodeOpenaiMaxToken: value,
                            });
                          }}
                          min={0}
                          max={16384}
                          className="field-width"
                        />
                      </>
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

export default VsCodeOpenAIConfig;