export const isYoutubeUrl = (url)=>{
    try {
      const urlObj = new URL(url);
      // List of valid YouTube domain
      const youtubeRegex = /^((?:www\.|m\.)?youtube\.com|youtu\.be)$/;
      // Check if hostname is a YouTube domain
      if (!youtubeRegex.test(urlObj.hostname)) {
        return false;
      }
      // For youtube.com domain
      if (urlObj.hostname.includes('youtube.com')) {
        // Must have /watch path and v parameter for standard URLs
        if (urlObj.pathname === '/watch' && urlObj.searchParams.has('v')) {
          return true;
        }
        // Handle shortened URLs in youtube.com/v/VIDEO_ID format
        if (urlObj.pathname.startsWith('/v/')) {
          return true;
        }
      }
      // For youtu.be domain
      if (urlObj.hostname === 'youtu.be') {
        // Must have a path (video ID)
        return urlObj.pathname.length > 1;
      }
  
      return false;
    } catch {
      return false;
    }
  }