/**
 * Formats a number into a readable string with K, M, or B suffix
 * @param {number} num - The number to format
 * @returns {string} Formatted number string (e.g., 1K, 1.5M, 2B)
 */
export const formatNumber = (num) => {
    if (!num) return '0';
    
    const absNum = Math.abs(num);
    
    if (absNum >= 1000000000) {
      return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
    }
    
    if (absNum >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    
    if (absNum >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    
    return num.toString();
  }; 