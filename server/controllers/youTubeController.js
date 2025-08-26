import { YoutubeTranscript } from 'youtube-transcript';
// import { YoutubeTranscript } from 'youtube-transcript-api';
import { CommonMessages, WorkBoardMessages, YouTubeMessages } from '../constants/enums.js';
import { StatusCodes } from 'http-status-codes';
import { checkTranscriptLanguages, checkVideoHasEnglishCaptions, cleanVideoTitle, extractVideoId, getVideoTitle, getYoutubeTranscript, sanitizeFileName } from '../service/youTubeService.js';
import { uploadToS3Bucket } from '../lib/s3.js';
import { createSingleKnowledgeBaseService, replaceCharacters } from '../service/knowledgeBase.js';


/**
 * @async
 * @function createYouTubeTranscriptKnowledgeBase
 * @description Extracts the English transcript from a YouTube video URL, cleans and uploads it as a text file to S3,
 *              then creates a knowledge base entry linked to the user.
 * @param {Object} req - Request object containing:
 *   - url {string} - YouTube video URL.
 *   - userId {string} - ID of the user importing the transcript.
 *   - parentId {string|null} - Optional parent knowledge base ID.
 * @param {Object} res - Response object returning status and JSON message.
 * @returns {Response} 
 *   - 200 with success message and transcript if captions exist.
 *   - 200 with failure message if captions not available.
 *   - 500 on internal error.
 */

export const createYouTubeTranscriptKnowledgeBase = async (req, res) => {
    const { url, userId, parentId = null } = req.body;
    try {
        const videoIdCheck = extractVideoId(url);

        if(checkVideoHasEnglishCaptions(videoIdCheck)){
            // const youTubeTransCript = await YoutubeTranscript.fetchTranscript(url);
            const { transcript, videoTitle, videoId } = await getYoutubeTranscript(url);

            // const fullYouTubeTranscript = youTubeTransCript
            //     .map(item => item.text)
            //     .join(' ');
            const titleOfTheVideo = await getVideoTitle(videoId);
            const nameWithoutForwardSlash = cleanVideoTitle(titleOfTheVideo);
            let fileName = '';
            let spaceIndexes = [];
            if (titleOfTheVideo) {
                const { resultFileName, replacedIndices } = replaceCharacters(nameWithoutForwardSlash);
                fileName = resultFileName + '.txt';
                spaceIndexes = replacedIndices;
            }
            const fileBuffer = Buffer.from(transcript, 'utf8');
            const ContentType = 'text/plain';
            // Upload to S3
            const uploadResult = await uploadToS3Bucket(fileName, fileBuffer, ContentType, userId);
            const s3_link = "knowledgeBase/" + fileName;
            const data = await createSingleKnowledgeBaseService(fileName, 0, s3_link, userId, spaceIndexes, url, parentId);
            return res.status(StatusCodes.OK).json({
                transcript, message: YouTubeMessages.YOUTUBE_TRANSCRIPT_IMPORTED_SUCCESSFULLY
            });
        }else{
            return res.status(StatusCodes.OK).json({
                message: YouTubeMessages.YOUTUBE_TRANSCRIPT_IMPORT_FAILED
            });
        }


    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: CommonMessages.INTERNAL_SERVER_ERROR,
        });
    }
};