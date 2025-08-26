import React from 'react';
import TrackUsagePageLayout from '../../../component/layout/CommonStructure/TrackUsagePageLayout';
import DevUsage from './DevUsage';
import ProfileHeader from '../../../component/Proflie/ProfileHeader';

const DeveloperUsagePage = () => {
  return (
    <TrackUsagePageLayout>
      <div className="developer-usage-page-container">
        <ProfileHeader
          title="Developer Report"
          subHeading="Track developer-specific usage statistics and reports."
          breadcrumbs={[
            { label: "Home", url: "/" },
            { label: "Reports", url: "/reports" },
            { label: "Developer Report", url: "" },
          ]}
        />
        <DevUsage />
      </div>
    </TrackUsagePageLayout>
  );
};

export default DeveloperUsagePage; 