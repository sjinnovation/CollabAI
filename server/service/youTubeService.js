// import youtubeDl from "youtube-dl-exec";
import { YoutubeTranscript } from "youtube-transcript";
import fs from 'fs/promises';
const youtubeDl = {};


export const getVideoTitle = async(videoId)=>{
    try {
      const response = await fetch(`https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=${videoId}&format=json`);
      const data = await response.json();
      return data.title;
    } catch (error) {
      console.error('Error fetching video title:', error);
      return null;
    }
}

export const extractVideoId = (url)=>{
    try {
      const urlObj = new URL(url);
      
      // Handle different YouTube URL formats
      if (urlObj.hostname.includes('youtube.com')) {
        // Regular youtube.com/watch?v= format
        if (urlObj.searchParams.has('v')) {
          return urlObj.searchParams.get('v');
        }
        
        // Shortened youtu.be format
        if (urlObj.pathname.length > 1) {
          return urlObj.pathname.slice(1);
        }
      } else if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.slice(1);
      }
      
      return null;
    } catch {
      return null;
    }
  }
  // Sanitize filename
export const sanitizeFileName = (title)=>{
    return title
      .replace(/[^a-z0-9]/gi, '_') // Replace non-alphanumeric chars with underscore
      .replace(/_+/g, '_')         // Replace multiple underscores with single
      .toLowerCase()
      .trim();
}

export const checkTranscriptLanguages = async (videoId)=>{
  try {
    const transcriptList = await YoutubeTranscript.listTranscripts(videoId);
    // Check if English transcript exists
    const hasEnglishTranscript = transcriptList.some(transcript => 
      transcript.language_code === 'en' || 
      transcript.language_code === 'en-US' ||
      transcript.language_code === 'en-GB'
    );
    if(hasEnglishTranscript){
      return true;
    }else{
      return false
    }

  } catch (error) {
    console.error('Error checking transcript languages:', error);
    return false;
  }
}

export const checkVideoHasEnglishCaptions =  async (videoId)=>{
  try {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
    const html = await response.text();
    
    // Check for caption tracks in the video metadata
    const hasCaptions = html.includes('"captions":{"playerCaptionsTracklistRenderer"');
    const hasEnglish = html.includes('"languageCode":"en"') || 
                      html.includes('"languageCode":"en-US"') ||
                      html.includes('"languageCode":"en-GB"');    
    return hasCaptions && hasEnglish;
  } catch (error) {
    console.error('Error checking captions:', error);
    return false;
  }
}

export const cleanVideoTitle = (title)=>{
  const cleanedTitle = title
  .replace(/[.|@#$%^&*()+=\[\]{};:"\\|,<>?~`]/g, ' ')  // Remove special chars
  .replace(/\//g, '-')                                  // Replace forward slashes with hyphens
  .replace(/\s+/g, ' ')                                // Replace multiple spaces with single space
  .trim();

    return cleanedTitle;

}

export const getYoutubeTranscript = async (url)=>{
  try {
    const videoInfo = await youtubeDl(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noCallHome: true
    });
    const vttFilePath = `${videoInfo.id}.en.vtt`;

    await youtubeDl(url, {
      writeAutoSub: true,
      writeSub: true,
      subLang: 'en',
      skipDownload: true,
      output: '%(id)s.%(ext)s'
    });

    const vttContent = await fs.readFile(vttFilePath, 'utf-8');
    let transcript = parseVTTContent(vttContent);
    await fs.unlink(vttFilePath);
    transcript = cleanTranscriptIfNeeded(transcript);
    return {
      transcript: transcript,
      videoTitle: videoInfo.title,
      videoId: videoInfo.id
    };

  } catch (error) {
    if (error.message.includes('No subtitles available')) {
      throw new Error('This video does not have English captions available');
    }
    throw error;
  }
}
export const parseVTTContent = (vttContent)=>{
  // Split by lines
  const lines = vttContent.split('\n');
  
  // Remove WebVTT header
  while (lines.length > 0 && !lines[0].includes('-->')) {
    lines.shift();
  }

  let transcript = '';
  
  // Process remaining lines
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip timestamp lines and empty lines
    if (!line || line.includes('-->')) {
      continue;
    }
    
    // Add line to transcript
    transcript += line + ' ';
  }

  return transcript.trim();
}

export const cleanTranscriptWithTimestamps = (vttContent)=>{
  try {
    console.log("vttContent : ",vttContent);
    const lines = vttContent.split('\n');
    let formattedTranscript = [];
    let currentTimestamp = '';
    let currentText = '';

    for (let line of lines) {
      line = line.trim();
      
      // Skip empty lines and WEBVTT header
      if (!line || line === 'WEBVTT') {
        continue;
      }

      // If it's a timestamp line
      if (line.includes('-->')) {
        // Save previous segment if exists
        if (currentTimestamp && currentText) {
          formattedTranscript.push(`[${currentTimestamp}] ${currentText.trim()}`);
        }
        // Get start time for new segment
        currentTimestamp = line.split('-->')[0].trim();
        currentText = '';
      } 
      // If it's a text line
      else if (!line.includes('-->')) {
        let cleanedLine = line
          .replace(/<[^>]*>/g, '')                 // Remove HTML tags
          .replace(/\d{2}:\d{2}:\d{2}\.\d{3}/g, '') // Remove inline timestamps
          .replace(/\[Music\]/g, '')               // Remove [Music] tags
          .replace(/\[[^\]]*\]/g, '')             // Remove other bracketed content
          .trim();

        if (cleanedLine) {
          currentText += ' ' + cleanedLine;
        }
      }
    }

    // Add the last segment
    if (currentTimestamp && currentText) {
      formattedTranscript.push(`[${currentTimestamp}] ${currentText.trim()}`);
    }
    console.log("formattedTranscript : ",formattedTranscript);

    return formattedTranscript.join('\n');

  } catch (error) {
    console.error('Error cleaning transcript:', error);
    throw error;
  }
}

export const cleanTranscriptIfNeeded = (transcript)=>{
  // Check if transcript contains HTML tags or timestamps
  const hasHtmlTags = /<[^>]*>/g.test(transcript);
  const hasTimestamps = /\d{2}:\d{2}:\d{2}\.\d{3}/g.test(transcript);

  // Only clean if necessary
  if (hasHtmlTags || hasTimestamps) {
    return transcript
      .replace(/<[^>]*>/g, '')                 // Remove HTML tags
      .replace(/\d{2}:\d{2}:\d{2}\.\d{3}/g, '') // Remove timestamps
      .replace(/\[Music\]/g, '')               // Remove [Music] tags
      .replace(/\s+/g, ' ')                    // Replace multiple spaces
      .trim();
  }

  // Return original if no cleaning needed
  return transcript;
}