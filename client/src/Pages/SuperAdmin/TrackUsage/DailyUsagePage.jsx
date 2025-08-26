import React from 'react';
import TrackUsagePageLayout from '../../../component/layout/CommonStructure/TrackUsagePageLayout';
import DailyUsage from './DailyUsage';
import ProfileHeader from '../../../component/Proflie/ProfileHeader';

const DailyUsagePage = () => {
  return (
    <TrackUsagePageLayout>
      <div className="daily-usage-page-container">
        <ProfileHeader
          title="Daily Report"
          subHeading="Track daily usage statistics and reports."
          breadcrumbs={[
            { label: "Home", url: "/" },
            { label: "Reports", url: "/reports" },
            { label: "Daily Report", url: "" },
          ]}
        />
        <DailyUsage />
      </div>
    </TrackUsagePageLayout>
  );
};

export default DailyUsagePage; 