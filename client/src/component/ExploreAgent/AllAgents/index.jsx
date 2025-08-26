import React from "react";
import { Avatar, Button, Typography, Card, Empty, Spin } from "antd";
import ProfileHeader from "../../Proflie/ProfileHeader";
import { DoubleRightOutlined, ToTopOutlined } from "@ant-design/icons";
import { IoIosMore } from "react-icons/io";
import Meta from "antd/es/card/Meta";
import { BsRobot } from "react-icons/bs";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { MdFavoriteBorder } from "react-icons/md";
import ExploreAgentCard from "../../Card/ExploreAgentCard";
import { BiDownArrow } from "react-icons/bi";
import { TiArrowSortedDown } from "react-icons/ti";
const AllExploreAgents = ({
  assistantsByCategory,
  chatWithAssistant,
  addFavoriteAssistant,
  userId,
  handleLoadMore,
  searchQuery,
  selectAssistantType,
  handleCardClick,
  theme,
  featuredAssistants,
  loading,
  favoriteAssistant,
  setRefresh,
  setFavoriteAssistant,
  HeaderContentChildren,
  enablePersonalize = false,
}) => {
  const { Title } = Typography;
  return (
    <Spin spinning={loading}>
      <ProfileHeader
        title="All Agents"
        subHeading="Explore the featured agents available on our platform."
      />
      {HeaderContentChildren}
      <div className="mt-3">
        {featuredAssistants?.assistants?.length === 0 &&
        assistantsByCategory?.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          !loading && (
            <Title level={5}>
              {featuredAssistants?.assistants?.length
                ? "👑Featured Agents"
                : ""}
            </Title>
          )
        )}
      </div>

      <div className="assistant-container mt-3">
        {featuredAssistants?.assistants?.map((assistant) => (
          <>
            <ExploreAgentCard
              agent={assistant}
              chatWithAssistant={chatWithAssistant}
              addFavoriteAssistant={addFavoriteAssistant}
              userId={userId}
              handleCardClick={handleCardClick}
              favoriteAssistantData={favoriteAssistant}
              setRefresh={setRefresh}
              setFavoriteAssistant={setFavoriteAssistant}
              enablePersonalize={enablePersonalize}
              // favoriteAssistant={true}
            />
          </>
        ))}
      </div>
      <div className="load-more-container">
        {featuredAssistants?.assistants?.length > 0 &&
          featuredAssistants?.assistants?.length !==
            featuredAssistants?.totalAssistantCount && (
            <>
              <div className="load-more-button">
                <Button
                  size="small"
                  icon={<TiArrowSortedDown />}
                  onClick={() => handleLoadMore({ categoryName: "featured" })}
                >
                  Load More{" "}
                </Button>
              </div>
              <hr
                style={{
                  borderColor: "hsl(0, 0%, 80%)",
                  marginTop: "24px",
                }}
              />
            </>
          )}
      </div>
      <div>
        {assistantsByCategory?.assistants?.length > 0 ||
          assistantsByCategory?.map((category, i) => (
            <div key={category}>
              {category?.categoryInfo?.assistants?.length > 0 ? (
                <Title className="my-3" level={5}>
                  {category?.categoryName}
                </Title>
              ) : (
                (searchQuery?.trim() || selectAssistantType?.trim()) && (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )
              )}
              <div className="assistant-container">
                {category?.categoryInfo?.assistants?.length > 0 &&
                  category?.categoryInfo?.assistants?.map((assistant) => (
                    <ExploreAgentCard
                      agent={assistant}
                      chatWithAssistant={chatWithAssistant}
                      addFavoriteAssistant={addFavoriteAssistant}
                      userId={userId}
                      handleCardClick={handleCardClick}
                      favoriteAssistantData={favoriteAssistant}
                      setRefresh={setRefresh}
                      setFavoriteAssistant={setFavoriteAssistant}
                      enablePersonalize={enablePersonalize}
                    />
                  ))}
              </div>
              <div className="load-more-container mt-1">
                {category.categoryInfo.assistants.length > 0 &&
                category.categoryInfo.assistants.length !==
                  category.categoryInfo?.totalAssistantCount ? (
                  <>
                    <div className="load-more-button">
                      <Button
                        size="small"
                        icon={<TiArrowSortedDown />}
                        onClick={() => handleLoadMore(category)}
                      >
                        Load More
                      </Button>
                    </div>
                    <hr
                      style={{
                        borderColor: "hsl(0, 0%, 80%)",
                        marginTop: "24px",
                      }}
                    />
                  </>
                ) : (
                  <></>
                )}
              </div>
            </div>
          ))}
        {assistantsByCategory?.assistants?.length === 0 && (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </div>
    </Spin>
  );
};

export default AllExploreAgents;