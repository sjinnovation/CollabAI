import {encode, decode} from 'gpt-3-encoder'; 
import { getMaxTokenOfModels } from '../service/configService.js';

export const extractAllGoogleDriveLinks = (text,ids =[]) => {
  const regex = /(https?:\/\/(?:drive|docs)\.google\.com\/(?:file\/d\/|drive\/folders\/|document\/d\/|spreadsheets\/d\/|presentation\/d\/|forms\/d\/|open\?id=)([\w-]+))/g;
  let matches, links = [];

  while ((matches = regex.exec(text)) !== null) {
    links.push(matches[0]);
    ids.push(matches[2]);
  }

  return links;
}
export const extractWorkBoardIdFromQuestion = (text)=>{
  // const regex = /https:\/\/www\.myworkboard\.com\/wb\/(activity\/mywork\?do=popup&id=\d+|actionitem\?id=\d+)/g;
  const regex = /https:\/\/www\.myworkboard\.com\/wb\/(activity\/mywork\?[^ ]*id=\d+|actionitem\?id=\d+)/g;
  const matches = text?.match(regex);
  let ids = [];

  if (matches) {
    matches.forEach((url) => {
      const urlObj = new URL(url);
      const id = urlObj.searchParams.get("id");
      if (id) {
        ids.push(id);
      }
    });
  }
  
  return ids.length > 0 ? ids : null;
};

export const replaceWorkBoardLinks = (text) => {
  // const linkRegex = /https:\/\/www\.myworkboard\.com\/wb\/(activity\/mywork\?do=popup&id=\d+|actionitem\?id=\d+)/g;
  const regex = /https:\/\/www\.myworkboard\.com\/wb\/(activity\/mywork\?[^ ]*id=\d+|actionitem\?id=\d+)/g;

  let modifiedText = text.replace(linkRegex, (match) => {
    const encodedLink = encodeLink(match);
    return `[ENCODED_LINK:${encodedLink}]`;
  });

  const fileNameRegex = /.*fileName\s*:/;
  modifiedText = modifiedText.replace(fileNameRegex, ''); 

  return modifiedText;
};


export const extractIdFromLink = (url)=>{
  const urlObj = new URL(url);
  const id = urlObj.searchParams.get("id");
  return id ? id : null;
}
export const extractFileOrFolderId = (link) => {
  const fileIdRegex = /\/d\/([\w-]+)|open\?id=([\w-]+)/;
  const match = link.match(fileIdRegex);

  if (match) {
    return match[1] || match[2];
  }
  return null;
}

export const replaceGoogleDriveLinks = (text, replacement = ' given data') => {
  const linkRegex = /['"]?(https?:\/\/(?:drive|docs)\.google\.com\/(?:file\/d\/|drive\/folders\/|document\/d\/|spreadsheets\/d\/|presentation\/d\/|forms\/d\/|open\?id=)[\w-]+(?:\/[^'"]*)?)['"]?/g;
  const modifiedText = text.replace(linkRegex, (match) => {
    const encodedLink = encodeLink(match);
    return `[ENCODED_LINK:${encodedLink}]`;
  });
  return modifiedText;
};


export const encodeLink = (link)=>{
  return Buffer.from(link).toString('base64');  
}

export const replaceGoogleDriveLinksWithEncoded = (text)=>{
  const linkRegex = /['"]?(https?:\/\/(?:drive|docs)\.google\.com\/(?:file\/d\/|drive\/folders\/|document\/d\/|spreadsheets\/d\/|presentation\/d\/|forms\/d\/|open\?id=)[\w-]+(?:\/[^'"]*)?)['"]?/g;

  const modifiedText = text.replace(linkRegex, (match) => {
    const encodedLink = encodeLink(match);
    return `[ENCODED_LINK:${encodedLink}]`;
  });

  return modifiedText;
}
export const longFileContextToUsableFileContext = async (fileDataContext,botProvider)=>{
  const maxTokens = await getMaxTokenOfModels();
  const encodedPrompt = encode(fileDataContext[0]);
  let MAX_PROMPT_TOKENS = 1024; 

  if(botProvider === 'openai' && maxTokens?.openaiMaxToken){
    const token = maxTokens?.openaiMaxToken*0.5
    MAX_PROMPT_TOKENS =  parseInt(token, 10)
  }else if(botProvider === 'gemini'&& maxTokens?.geminiMaxToken ){
    const token = maxTokens?.geminiMaxToken*0.5
    MAX_PROMPT_TOKENS =  parseInt(token, 10);
  }
  else if(botProvider === 'claude' &&maxTokens?.claudeMaxToken ){
    const token = maxTokens?.claudeMaxToken*0.5;
    MAX_PROMPT_TOKENS =  parseInt(token, 10);
  }
  
  let truncatedPrompt = fileDataContext[0];
  if (encodedPrompt.length > MAX_PROMPT_TOKENS) {
    const truncatedEncodedPrompt = encodedPrompt.slice(0, MAX_PROMPT_TOKENS);
    truncatedPrompt = decode(truncatedEncodedPrompt); // Decode back into text
  }

  return truncatedPrompt;

};

export const findAppName = async (text)=> {
  const regex = /(?:WorkBoardUpdateComment\s*:\s*(?<WorkBoardUpdateComment>.*?),\s*)?appName\s*:\s*(?<appName>[^,]+)\s*,\s*fileIdOrUrl\s*:\s*(?<fileIdOrUrl>[^,\s]+)\s*,\s*fileName\s*:\s*(?<fileName>[^,]+?)(?:,|$)/;
  const match = text.match(regex);
  
  if (match) {
    return {
      WorkBoardUpdateComment: match.groups.WorkBoardUpdateComment ? match.groups.WorkBoardUpdateComment.trim() : null,
      appName: match.groups.appName.trim(),
      fileIdOrUrl : match.groups.fileIdOrUrl.trim(),
    };
  } else {
    return {
      WorkBoardUpdateComment: 'null',
      appName: 'null',
      fileIdOrUrl : 'null',
    }
  }
}