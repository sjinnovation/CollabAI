/**
 * Extracts a date range from a given question string.
 * The function identifies exact dates, relative date ranges, and month/year references within the question.
 * If no specific dates or ranges are found, it defaults to the last 30 days.
 *
 * @param {string} question - The question string containing date information.
 * @returns {Object} An object containing the start date and end date in the format YYYY-MM-DD.
 * @returns {string} return.startDate - The start date of the extracted range.
 * @returns {string} return.endDate - The end date of the extracted range.
 */

export function extractDateRange(question) {
  const today = new Date();
  const questionLower = question.toLowerCase();

  // Helper function to format date as YYYY-MM-DD
  const formatDate = (date) => date.toISOString().split("T")[0];

  // Helper function to parse various date formats
  const parseDate = (dateString) => {
    const formats = [
      /(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
      /(\d{2})-(\d{1,2})-(\d{4})/, // DD-MM-YYYY
      /(\d{1,2})-(\d{1,2})-(\d{4})/, // D-M-YYYY
      /(\d{2})\/(\d{2})\/(\d{4})/, // MM/DD/YYYY
      /(\d{2})\.(\d{2})\.(\d{4})/, // DD.MM.YYYY
      /(\w+)\s(\d{1,2}),?\s(\d{4})/, // Month DD, YYYY
    ];

    for (let format of formats) {
      const match = dateString.match(format);
      if (match) {
        if (format === formats[0])
          return new Date(match[1], match[2] - 1, match[3]);
        if (format === formats[1] || format === formats[2])
          return new Date(match[3], match[2] - 1, match[1]);
        if (format === formats[3])
          return new Date(match[3], match[1] - 1, match[2]);
        if (format === formats[4])
          return new Date(match[3], match[2] - 1, match[1]);
        if (format === formats[5]) {
          const monthIndex = new Date(Date.parse(match[0])).getMonth();
          return new Date(match[3], monthIndex, match[2]);
        }
      }
    }
    return null;
  };

  // Check for relative date ranges
  const relativeDateRegex = /last\s+(\d+)\s+(day|week|month|year)s?/i;
  const relativeMatch = questionLower.match(relativeDateRegex);

  if (relativeMatch) {
    const amount = parseInt(relativeMatch[1]);
    const unit = relativeMatch[2].toLowerCase();
    let startDate = new Date(today);

    switch (unit) {
      case 'day':
        startDate.setDate(startDate.getDate() - amount);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - amount * 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - amount);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - amount);
        break;
    }

    return { startDate: formatDate(startDate), endDate: formatDate(today) };
  }

  // Check for exact dates
  const dateRegex = /\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}/g;
  const potentialDates = question.match(dateRegex);

  if (potentialDates && potentialDates.length >= 2) {
    const startDate = parseDate(potentialDates[0]);
    const endDate = parseDate(potentialDates[1]);
    if (startDate && endDate) {
      return { startDate: formatDate(startDate), endDate: formatDate(endDate) };
    }
  }

  // If no specific dates or relative range found, default to last 30 days
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  return { startDate: formatDate(thirtyDaysAgo), endDate: formatDate(today) };
}