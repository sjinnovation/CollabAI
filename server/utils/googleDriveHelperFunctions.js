import {encode, decode} from 'gpt-3-encoder'; 
import { getMaxTokenOfModels } from '../service/configService.js';

export const extractAllGoogleDriveLinks = (text) => {
  const regex = /(https?:\/\/(?:drive|docs)\.google\.com\/(?:file\/d\/|drive\/folders\/|document\/d\/|spreadsheets\/d\/|presentation\/d\/|forms\/d\/|open\?id=)([\w-]+))/g;
  let matches, links = [];

  while ((matches = regex.exec(text)) !== null) {
    links.push(matches[0]);
  }

  return links;
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