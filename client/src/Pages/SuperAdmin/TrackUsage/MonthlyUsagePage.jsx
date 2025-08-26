import React from 'react';
import TrackUsagePageLayout from '../../../component/layout/CommonStructure/TrackUsagePageLayout';
import TrackUsage from './TrackUsage';
import ProfileHeader from '../../../component/Proflie/ProfileHeader';

const MonthlyUsagePage = () => {
  return (
    <TrackUsagePageLayout>
      <div className="monthly-usage-page-container">
        <ProfileHeader
          title="Monthly Report"
          subHeading="Track monthly usage statistics and reports."
          breadcrumbs={[
            { label: "Home", url: "/" },
            { label: "Reports", url: "/reports" },
            { label: "Monthly Report", url: "" },
          ]}
        />
        <TrackUsage />
      </div>
    </TrackUsagePageLayout>
  );
};

export default MonthlyUsagePage; 