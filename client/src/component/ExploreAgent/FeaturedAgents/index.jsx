import React, { useEffect, useState } from "react";
import { Button, Empty, Spin } from "antd";
import { DoubleRightOutlined } from "@ant-design/icons";
import ProfileHeader from "../../Proflie/ProfileHeader";
import { getPublicFeaturedAgents } from "../../../api/publicAssistant";
import ExploreAgentCard from "../../Card/ExploreAgentCard";
import { TiArrowSortedDown } from "react-icons/ti";

const FeaturedAgents = ({
  chatWithAssistant,
  addFavoriteAssistant,
  userId,
  handleCardClick,
  favoriteAssistant,
  setRefresh,
  setFavoriteAssistant,
  enablePersonalize = false,
}) => {
  const [featuredAssistants, setFeaturedAssistants] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    handleFetchFeaturedAgents();
  }, [page, pageSize]);

  const handleFetchFeaturedAgents = async () => {
    setLoading(true);
    try {
      const { success, data } = await getPublicFeaturedAgents(page, pageSize);
      if (success) {
        setFeaturedAssistants(data?.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    setPage(page + 1);
    handleFetchFeaturedAgents();
  };
  return (
    <Spin spinning={loading}>
      <ProfileHeader
        title="Featured Agents"
        subHeading="Explore the most popular agents available on our platform."
      />

      {featuredAssistants?.agents?.length > 0 ? (
        <div className="assistant-container">
          {featuredAssistants?.agents?.map((assistant) => (
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
              />
            </>
          ))}
        </div>
      ) : (
        <div className="d-flex justify-content-center align-items-center w-100">
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      )}
      <div className="load-more-container">
        {featuredAssistants?.agents?.length !==
          featuredAssistants?.totalCount && (
          <>
            <div className="load-more-button">
              <Button
                size="small"
                icon={<TiArrowSortedDown />}
                onClick={() => handleLoadMore({ categoryName: "featured" })}
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
        )}
        {featuredAssistants?.agents?.length !==
          featuredAssistants?.totalCount && (
          <hr
            style={{
              borderColor: "hsl(0, 0%, 80%)",
              marginTop: "24px",
            }}
          />
        )}
      </div>
    </Spin>
  );
};

export default FeaturedAgents;