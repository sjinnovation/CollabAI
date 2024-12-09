import React from 'react';
import { Cardss, CardContent } from './Cards';
import Badge from './Badge';

const MilestoneCard = ({ milestone }) => (
  <Cardss className="milestone-card">
    <CardContent className="milestone-content">
      <h4 className="milestone-title">{milestone.title}</h4>
      <p className="milestone-description">{milestone.description}</p>
      <div className="milestone-status">
        <Badge className={milestone.status[0].completed ? "status-completed" : "status-pending"}>
          {milestone.status[0].title}
        </Badge>
        <span className="milestone-owner">Owner: {milestone.status[0].owner}</span>
      </div>
    </CardContent>
  </Cardss>
);

export default MilestoneCard;
