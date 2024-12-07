import React from 'react';
import { FaStar } from "react-icons/fa";
import { Cardss, CardContent } from './Cards';
import { Avatars } from './Avatar';

const ReviewCard = ({ review }) => (
  <Cardss className="review-card">
    <CardContent className="review-content">
      <div className="reviewer-info">
        <Avatars
          src={review.reviewerImage}
          alt={review.reviewer}
          fallback={review.reviewer.slice(0, 2)}
          className="reviewer-avatar"
        />
        <div className="reviewer-details">
          <h4 className="reviewer-name">{review.reviewer}</h4>
          <p className="review-headline">{review.headline}</p>
        </div>
      </div>
      <p className="review-comment">{review.comment}</p>
      <div className="review-rating">
        {[...Array(5)].map((_, index) => (
          <FaStar
            key={index}
            className={`star-icon ${
              index < review.rating ? "filled" : "empty"
            }`}
          />
        ))}
      </div>
    </CardContent>
  </Cardss>
);

export default ReviewCard;
