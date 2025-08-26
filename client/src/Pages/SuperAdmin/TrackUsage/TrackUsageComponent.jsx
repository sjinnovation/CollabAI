import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUserRole } from '../../../Utility/service';

const TrackUsageComponent = () => {
  const role = getUserRole();
  
  // Redirect to monthly usage by default for superadmin
  if (role === 'superadmin') {
    return <Navigate to="/reports/monthly" replace />;
  }
  
  // Redirect to home for non-superadmin users
  return <Navigate to="/" replace />;
};

export default TrackUsageComponent;
