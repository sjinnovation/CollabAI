import { Avatar, Badge, Button, Card, Tag, Tooltip } from "antd";
import React, { useContext, useState } from "react";
import { BsRobot } from "react-icons/bs";
import "./index.css";
import { IoCopyOutline } from "react-icons/io5";
import {
  MdOutlineDataUsage,
  MdOutlineFavorite,
  MdOutlineFavoriteBorder,
  MdOutlineStarBorder,
} from "react-icons/md";
import { PiEyeBold } from "react-icons/pi";
import { formatNumber } from "../../Pages/ExploreGPTs/utils/formatNumber";
import { getUserRole } from "../../Utility/service";
import { personalizeAssistant } from "../../api/personalizeAssistant";
import { LuUser } from "react-icons/lu";
import { ThemeContext } from "../../contexts/themeConfig";
import toast from "react-hot-toast";
import { deleteFavoriteAssistant } from "../../api/favoriteAssistant";

const ExploreAgentCard = ({
  agent,
  chatWithAssistant,
  addFavoriteAssistant,
  userId,
  handleCardClick,
  favoriteAssistant = false,
  // handleDeleteFavoriteAssistant = () => {},
  favoriteAssistantData = [],
  setRefresh = () => { },
  setFavoriteAssistant = () => { },
  enablePersonalize = false,
}) => {
  const { Meta } = Card;
  const { theme } = useContext(ThemeContext);
  const [loading, setLoading] = useState({
    personalize: false,
    favorite: false,
  });

  const isNewAgent = (data) => {
    if (!data?.createdAt) return false;

    const createdDate = new Date(data.createdAt);
    const currentDate = new Date();

    const diffTime = currentDate - createdDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays <= 7;
  };

  const roleOfUser = getUserRole();

  const handlePersonalizeAssistant = async () => {
    setLoading({ ...loading, personalize: true });
    const responseOfAssistantClone = await personalizeAssistant(agent?.assistant_id);
    if (responseOfAssistantClone.success) {
      setLoading({ ...loading, personalize: false });
    }
  }

  const handleDeleteFavoriteAssistant = async (assistantId) => {
    try {
      setLoading({ ...loading, favorite: true });
      const { success, message } = await deleteFavoriteAssistant(assistantId);
      if (success) {
        setLoading({ ...loading, favorite: false });
        setFavoriteAssistant((prevState) =>
          prevState.filter(
            (assistant) => assistant.assistant_id !== assistantId
          )
        );
      }
    } catch (error) {
      console.log(error);
      setLoading({ ...loading, favorite: false });
    } finally {
      setLoading({ ...loading, favorite: false });
    }
  };

  return (
    <Badge.Ribbon
      text="New"
      color={theme === "light" ? "blue" : "red"}
      style={{ display: isNewAgent(agent) ? "block" : "none" }}
    >
      <Card className="explore-agent-card">
        <Meta
          avatar={
            <Avatar
              size={40}
              src={agent?.image_url ? agent.image_url : <BsRobot size={22} />}
            />
          }
          title={
            <div className="explore-agent-card-title">
              <span>{agent?.name?.length > 55 ? `${agent?.name?.slice(0, 55)}...` : agent?.name ?? ""} </span>
            </div>
          }
          description={
            <span
              style={{
                minHeight: "20px",
                display: "block",
                height: "62px",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {agent?.description?.length > 90
                ? `${agent?.description?.slice(0, 90)} ...`
                : agent?.description ?? ""}
            </span>
          }
        />

        <div className="d-flex align-items-center mt-3 explore-agent-card-stats">
          <div className="explore-agent-card-usage-stats-item">
            <Tag icon={<MdOutlineStarBorder />} color="default" className="d-flex align-items-center">
              <span className="ms-1">Rating {formatNumber(agent?.rating?.averageRating % 1 === 0 ? Math.floor(agent?.rating?.averageRating) : agent?.rating?.averageRating?.toFixed(1) ?? 0)}</span>
            </Tag>
          </div>
          <div className="explore-agent-card-usage-stats-item">
            <Tag icon={<MdOutlineDataUsage />} color="default" className="d-flex align-items-center">
              <span className="ms-1">Usages {formatNumber(agent?.usageStats?.totalUsageCount ?? 0)}</span>
            </Tag>
          </div>
          <div className="explore-agent-card-usage-stats-item">
            <Tag icon={<LuUser className="m-0" />} color="default" className="d-flex align-items-center m-0">
              <span className="ms-1">Users {formatNumber(agent?.usageStats?.uniqueUserCount ?? 0)}</span>
            </Tag>
          </div>
        </div>

        <hr className="explore-agent-card-divider" />

        <div className="explore-agent-card-footer explore-agent-card-footer-wrapper">
          <div className="explore-agent-card-footer-left">
            {(roleOfUser === "superadmin" || enablePersonalize) ? (
              <Tooltip
                mouseLeaveDelay={0}
                title="Personalize assistant">
                <Button
                  type="text"
                  size="small"
                  className="explore-agent-card-action-button"
                  loading={loading.personalize}
                  icon={<IoCopyOutline className="icon" />}
                  onClick={() => handlePersonalizeAssistant(agent?.assistant_id)}
                />
              </Tooltip>
            ) : null}
            {favoriteAssistantData?.some(
              (favAgent) => favAgent.assistant_id === agent?.assistant_id
            ) ? (
              <Tooltip
                mouseLeaveDelay={0}
                title="Remove from favorite">
                <Button
                  type="text"
                  size="small"
                  className="explore-agent-card-action-button"
                  loading={loading.favorite}
                  icon={<MdOutlineFavorite color="red" className="icon" />}
                  disabled={loading.favorite}
                  onClick={() => handleDeleteFavoriteAssistant(agent?.assistant_id)}
                />
              </Tooltip>
            ) : (
              <Tooltip
                mouseLeaveDelay={0}
                title="Add to favorite">
                <Button
                  type="text"
                  size="small"
                  className="explore-agent-card-action-button"
                  loading={loading.favorite}
                  icon={<MdOutlineFavoriteBorder className="icon" />}
                  onClick={() => {
                    setLoading({ ...loading, favorite: true });
                    addFavoriteAssistant(agent?.assistant_id, userId)
                      .then((res) => {
                        if (res) {
                          setLoading({ ...loading, favorite: false });
                          setFavoriteAssistant((prev) => {
                            return [
                              ...prev,
                              {
                                ...agent,
                                _id: res?.data?.responseFromCreateFavorite?._id,
                                user_id:
                                  res?.data?.responseFromCreateFavorite?.user_id,
                              },
                            ];
                          });
                        }

                        setRefresh((prev) => !prev);
                      })
                      .catch((error) => {
                        setLoading({ ...loading, favorite: false });
                        console.log(error);
                      });
                  }}
                />
              </Tooltip>

            )}
            <Tooltip
              mouseLeaveDelay={0}
              title="View Agent">
              <Button
                type="text"
                size="small"
                className="explore-agent-card-action-button"
                onClick={() => handleCardClick(agent)}
              >
                <PiEyeBold className="icon" />
              </Button>
            </Tooltip>
          </div>
          <Button
            size="small"
            type="primary"
            shape="round"
            onClick={() => chatWithAssistant(agent?.assistant_id)}
          >
            Chat Now
          </Button>
        </div>
      </Card>
    </Badge.Ribbon>
  );
};

export default ExploreAgentCard;