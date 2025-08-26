import React, { useEffect, useState } from "react";
import ExploreAgentCard from "../../Card/ExploreAgentCard";
import { Button, Empty, Spin } from "antd";
import { DoubleRightOutlined } from "@ant-design/icons";
import ProfileHeader from "../../Proflie/ProfileHeader";
import { getPublicFeaturedAgents } from "../../../api/publicAssistant";
import {
  deleteFavoriteAssistant,
  fetchFavoriteAssistantByUser,
  fetchSingleFavoriteAssistant,
} from "../../../api/favoriteAssistant";
import toast from "react-hot-toast";
import { TiArrowSortedDown } from "react-icons/ti";

const FavoriteAgents = ({
  chatWithAssistant,
  addFavoriteAssistant,
  userId,
  handleCardClick,
  favoriteAssistant,
  setFavoriteAssistant,
  enablePersonalize = false,
}) => {
  const [loading, setLoading] = useState(false);

  // const handleDeleteFavoriteAssistant = async (assistantId) => {
  //   toast.success("Assistant removed from favorites");
  //   try {
  //     const {success, message} = await deleteFavoriteAssistant(assistantId);
  //     
  //     if (success) {
  //       setFavoriteAssistant((prevState) =>
  //         prevState.filter(
  //           (assistant) => assistant.assistant_id !== assistantId
  //         )
  //       );
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleFetchFavoriteAssistant = async () => {
  //   try {
  //     setLoading(true);
  //     const { success, data } = await fetchFavoriteAssistantByUser(
  //       setFavoriteAssistant,
  //       setIsLoading,
  //       setFavoriteTotalCount,
  //       favoritePage,
  //       favoritePageSize
  //     );
  //     if (success) {
  //       setLoading(false);
  //       setFeaturedAssistants(data?.data);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleLoadMore = () => {
  //   setFavoritePage((prevPage) => prevPage + 1);
  //   handleFetchFavoriteAssistant();
  // };

  // useEffect(() => {
  //   handleFetchFavoriteAssistant();
  // }, [page, pageSize]);

  return (
    <Spin spinning={loading}>
      <ProfileHeader
        title="Favorite Agents"
        subHeading="Explore your favorite agents."
      />

      {favoriteAssistant?.length > 0 ? (
        <div className="assistant-container">
          {favoriteAssistant?.map((assistant) => (
            <>
              <ExploreAgentCard
                agent={assistant}
                chatWithAssistant={chatWithAssistant}
                addFavoriteAssistant={addFavoriteAssistant}
                userId={userId}
                handleCardClick={handleCardClick}
                favoriteAssistantData={favoriteAssistant}
                enablePersonalize={enablePersonalize}
                setFavoriteAssistant={setFavoriteAssistant}
              />
            </>
          ))}
        </div>
      ) : (
        <div className="d-flex justify-content-center align-items-center w-100">
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No data" />
        </div>
      )}

      {/* <div className="load-more-container mt-1">
        {(favoriteAssistant?.length !== favoriteTotalCount &&
        favoriteAssistant?.length > 0) ? (
          <>
            <div className="load-more-button">
              <Button
                size="small"
                icon={<DoubleRightOutlined />}
                onClick={() => handleLoadMore()}
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
      </div> */}
    </Spin>
  );
};

export default FavoriteAgents;