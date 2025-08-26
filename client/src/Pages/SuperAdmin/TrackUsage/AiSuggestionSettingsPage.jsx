import React from 'react';
import TrackUsagePageLayout from '../../../component/layout/CommonStructure/TrackUsagePageLayout';
import AiSuggestionSettings from './AiSuggestionSettings';
import ProfileHeader from '../../../component/Proflie/ProfileHeader';

const AiSuggestionSettingsPage = () => {
  return (
    <TrackUsagePageLayout>
      <div className="ai-suggestion-settings-page-container">
        <ProfileHeader
          title="AI Suggestion Settings"
          subHeading="Configure AI suggestion preferences and parameters."
          breadcrumbs={[
            { label: "Home", url: "/" },
            { label: "Reports", url: "/reports" },
            { label: "AI Suggestion Settings", url: "" },
          ]}
        />
        <AiSuggestionSettings />
      </div>
    </TrackUsagePageLayout>
  );
};

export default AiSuggestionSettingsPage; 