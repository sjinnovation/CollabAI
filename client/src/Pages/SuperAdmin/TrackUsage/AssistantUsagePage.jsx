import React from 'react';
import TrackUsagePageLayout from '../../../component/layout/CommonStructure/TrackUsagePageLayout';
import AssistantUsage from './AssistantUsage';
import ProfileHeader from '../../../component/Proflie/ProfileHeader';

const AssistantUsagePage = () => {
  return (
    <TrackUsagePageLayout>
      <div className="assistant-usage-page-container">
        <ProfileHeader
          title="Assistant Report"
          subHeading="Track assistant-specific usage statistics and reports."
          breadcrumbs={[
            { label: "Home", url: "/" },
            { label: "Reports", url: "/reports" },
            { label: "Assistant Report", url: "" },
          ]}
        />
        <AssistantUsage />
      </div>
    </TrackUsagePageLayout>
  );
};

export default AssistantUsagePage; 