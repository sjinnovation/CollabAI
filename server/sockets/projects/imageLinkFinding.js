export const checkImageLinks = (prompt) => {
    if (!prompt) {
      return { links: [], isImage: false };
    }
  
    // Regex to match image URLs ending with jpg, jpeg, png, gif, or webp
    const pattern = /https?:\/\/[^\s]+?\.(jpg|jpeg|png|gif|webp)/gi;
    const matches = prompt.match(pattern);
  
    if (matches && matches.length) {
      return { links: matches, isImage: true };
    } else {
      return { links: [], isImage: false };
    }
  }