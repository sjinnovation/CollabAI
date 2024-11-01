import { marked } from "marked";
import { pageTitle } from "../component/layout/Header/Utilities/pageTitleInfo";
/*
@desc: this function is responsible for filtering data per the given date field and returns in fraction of times
*/
export function categorizeThreads(threads, dateField) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const todayPrompts = [];
  const yesterdayPrompts = [];
  const prev7DaysPrompts = [];
  const prev30DaysPrompts = [];
  const monthlyPrompts = {};

  threads.forEach((thread) => {
    const comparableDateField = new Date(thread[dateField]);

    if (comparableDateField.toDateString() === today.toDateString()) {
      todayPrompts.push(thread);
    } else if (
      comparableDateField.toDateString() === yesterday.toDateString()
    ) {
      yesterdayPrompts.push(thread);
    } else if (
      comparableDateField >= sevenDaysAgo &&
      comparableDateField < yesterday
    ) {
      prev7DaysPrompts.push(thread);
    } else if (
      comparableDateField >= thirtyDaysAgo &&
      comparableDateField < sevenDaysAgo
    ) {
      prev30DaysPrompts.push(thread);
    } else {
      const monthYear = comparableDateField.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      });
      if (!monthlyPrompts[monthYear]) {
        monthlyPrompts[monthYear] = [];
      }
      monthlyPrompts[monthYear].push(thread);
    }
  });

  // Sort prompts within each category in reverse chronological order
  const sortFunction = (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt);
  todayPrompts.sort(sortFunction);
  yesterdayPrompts.sort(sortFunction);
  prev7DaysPrompts.sort(sortFunction);
  prev30DaysPrompts.sort(sortFunction);
  for (const key in monthlyPrompts) {
    monthlyPrompts[key].sort(sortFunction);
  }

  return {
    today: todayPrompts,
    yesterday: yesterdayPrompts,
    "previous 7 days": prev7DaysPrompts,
    "prev 30 days": prev30DaysPrompts,
    monthly: monthlyPrompts,
  };
}

// this function is responsible for generating config for fetch api, will include headers, body, method, authorization token etc
export function generateFetchConfig(method, body, token) {
  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}

// this function is responsible for prompts categorization

export function categorizePrompts(prompts) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const todayPrompts = [];
  const yesterdayPrompts = [];
  const prev7DaysPrompts = [];
  const prev30DaysPrompts = [];
  const monthlyPrompts = {};

  prompts.forEach((prompt) => {
    const updatedAtDate = new Date(prompt.updatedAt);

    if (updatedAtDate.toDateString() === today.toDateString()) {
      todayPrompts.push(prompt);
    } else if (updatedAtDate.toDateString() === yesterday.toDateString()) {
      yesterdayPrompts.push(prompt);
    } else if (updatedAtDate >= sevenDaysAgo && updatedAtDate < yesterday) {
      prev7DaysPrompts.push(prompt);
    } else if (updatedAtDate >= thirtyDaysAgo && updatedAtDate < sevenDaysAgo) {
      prev30DaysPrompts.push(prompt);
    } else {
      const monthYear = updatedAtDate.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      });
      if (!monthlyPrompts[monthYear]) {
        monthlyPrompts[monthYear] = [];
      }
      monthlyPrompts[monthYear].push(prompt);
    }
  });

  // Sort prompts within each category in reverse chronological order
  const sortFunction = (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt);
  todayPrompts.sort(sortFunction);
  yesterdayPrompts.sort(sortFunction);
  prev7DaysPrompts.sort(sortFunction);
  prev30DaysPrompts.sort(sortFunction);
  for (const key in monthlyPrompts) {
    monthlyPrompts[key].sort(sortFunction);
  }

  return {
    today: todayPrompts,
    yesterday: yesterdayPrompts,
    "previous 7 days": prev7DaysPrompts,
    "prev 30 days": prev30DaysPrompts,
    monthly: monthlyPrompts,
  };
}

const convertDate = (args) => {
  if (args) {
    const dt = args.split("T")[0];
    const date = new Date(dt).getUTCDate();
    const month = new Date(dt).getUTCMonth() + 1;
    const year = new Date(dt).getUTCFullYear();
    return `${date}-${month}-${year}`;
  } else {
    return "";
  }
};

export const copyToClipboard = async (textToCopy) => {
  const htmlContent = marked(textToCopy);

  const tempElement = document.createElement("div");
  tempElement.innerHTML = htmlContent;

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/plain": new Blob([textToCopy], { type: "text/plain" }),
          "text/html": new Blob([tempElement.innerHTML], { type: "text/html" }),
        }),
      ]);
      return true;
    } catch (err) {
      console.error("Unable to copy to clipboard", err);
      return false;
    }
  } else {
    tempElement.style.position = "fixed";
    tempElement.style.left = "-9999px";
    document.body.appendChild(tempElement);

    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(tempElement);
    selection.removeAllRanges();
    selection.addRange(range);

    try {
      const successful = document.execCommand("copy");
      document.body.removeChild(tempElement);
      return successful;
    } catch (err) {
      console.error("Unable to copy to clipboard", err);
      document.body.removeChild(tempElement);
      return false;
    } finally {
      selection.removeAllRanges();
    }
  }
};

export function getPageTitle(pathname) {
  const chatRegex = /^\/chat(\/.*)?/; 
  const agentsRegex = /^\/agents(\/.*)?/; 

  if (pageTitle[pathname]) {
    return pageTitle[pathname];
  }

  if (chatRegex.test(pathname)) {
    return pageTitle["/chat"];
  }

  if(agentsRegex.test(pathname)) {
    return pageTitle["/agents"];
  }

  return "";
}

export { convertDate };
