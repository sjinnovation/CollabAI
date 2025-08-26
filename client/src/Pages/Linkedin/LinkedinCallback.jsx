import { useEffect } from 'react';

const LinkedInCallback = () => {
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
      // Send message immediately and close window
      window.opener.postMessage({
        type: 'LINKEDIN_CALLBACK',
        code: code,
        timestamp: Date.now() // Add timestamp to ensure code freshness
      }, '*');
      window.close();
    }
  }, []);

  return (
    <div className="text-center">
      <h3>Processing LinkedIn Authorization...</h3>
    </div>
  );
};

export default LinkedInCallback;