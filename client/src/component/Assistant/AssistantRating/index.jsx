import React, { useEffect, useState } from "react";
import Rating from "../../common/Rating";
import { createRating, fetchRatingByUser } from "../../../api/ratingsApi";
import { getUserID } from "../../../Utility/service";
import { LuUser } from "react-icons/lu";
import './assistantRatingResponsive.css'

const AssistantRating = ({ assistantId }) => {
  const [rating, setRating] = useState(0);
  const [overallRating, setOverallRating] = useState(0);

  const handleRating = async (value) => {
    try {
      const payload = {
        rating: value,
        user_id: getUserID(),
      };

      const response = await createRating(assistantId, payload);
      if (response) {
        setRating(value);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getRatingByUser = async () => {
    try {
      const response = await fetchRatingByUser(assistantId);
      setRating(response?.ratings?.userRating ?? 0);
      setOverallRating(response?.ratings?.overallRating?.averageRating ?? 0);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getRatingByUser();
  }, [assistantId, rating]);

  return (
    <div className="d-flex align-items-center gap-2 flex-row responsive-rating">
      <span className="fw-bold d-flex align-items-center gap-1 w-100 text-nowrap rating-text">
        Would you like to rate me?
      </span>
      <div className="w-100">
        <Rating value={rating} allowHalf={true} handleRating={handleRating} />
      </div>
    </div>
  );
};

export default AssistantRating;