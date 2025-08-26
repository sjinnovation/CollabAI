import React from 'react';
import TrackUsagePageLayout from '../../../component/layout/CommonStructure/TrackUsagePageLayout';
import AiSuggestions from './AiSuggestions';
import ProfileHeader from '../../../component/Proflie/ProfileHeader';

const AiSuggestionsPage = () => {
  return (
    <TrackUsagePageLayout>
      <div className="ai-suggestions-page-container">
        <ProfileHeader
          title="AI Suggestions"
          subHeading="AI-powered insights and recommendations for usage optimization."
          breadcrumbs={[
            { label: "Home", url: "/" },
            { label: "Reports", url: "/reports" },
            { label: "AI Suggestions", url: "" },
          ]}
        />
        <AiSuggestions />
      </div>
    </TrackUsagePageLayout>
  );
};

export default AiSuggestionsPage; 