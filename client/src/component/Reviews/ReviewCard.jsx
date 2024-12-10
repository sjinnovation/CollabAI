import { FaStar, FaProjectDiagram } from 'react-icons/fa';
import './reviewcard.scss';

export function ReviewCard({ header, comment, rating, clientName, clientImage, projectName }) {
  return (
    <div className="card1">
      <div className="starContainer">
        {Array.from({ length: 5 }).map((_, index) => (
          <FaStar
            key={index}
            className={`star ${index < rating ? 'starFilled' : 'starEmpty'}`}
          />
        ))}
      </div>
      <h3 className="header">{header}</h3>
      <p className="comment">{comment}</p>
      <div className="projectInfo">
        <FaProjectDiagram className="projectIcon" />
        <span className="projectName">{projectName}</span>
      </div>
      <div className="clientInfo">
        <img
          src={clientImage}
          alt={clientName}
          className="clientImage"
          style={{ width: '40px', height: '40px' }}
        />
        <span className="clientName">{clientName}</span>
      </div>
    </div>
  );
}
