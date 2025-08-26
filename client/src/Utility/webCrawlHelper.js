export const determineUrlType = (url) =>{
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname; 
      const pathname = parsedUrl.pathname; 
      
      const parts = hostname.split('.');

      if (pathname === '/' || pathname === '') {
        if (parts.length === 2) {
          return 'Domain'; 
        }
        if (parts.length > 2) {
          return 'Subdomain';
        }
      }

      if (pathname.length > 1) {
        return 'Page Link';
      }
  
      return 'Unknown'; 
    } catch (error) {
      return 'Invalid URL'; 
    }
  }
  