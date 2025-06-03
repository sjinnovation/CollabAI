import React, { useEffect, useRef } from 'react';

const TalkingAvatarVideo = ({ videoSrc, isSpeaking, setIsVideoPlaying }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    console.log('TalkingAvatarVideo - Effect triggered, isSpeaking:', isSpeaking);
    
    const videoElement = videoRef.current;

    if (isSpeaking) {
      console.log('Starting video playback');
      videoElement.play()
        .then(() => {
          console.log('Video playback started successfully');
          setIsVideoPlaying(true);
        })
        .catch(error => {
          console.error('Error playing video:', error);
        });
    } else {
      console.log('Stopping video playback');
      videoElement.pause();
      videoElement.currentTime = 0;
      setIsVideoPlaying(false);
    }

    // Event listener for video ending
    const restartVideo = () => {
      console.log('Video ended - attempting to restart');
      if (isSpeaking && !videoElement.paused) {
        videoElement.play()
          .then(() => console.log('Video restarted successfully'))
          .catch(error => console.error('Error restarting video:', error));
      }
    };

    videoElement.addEventListener('ended', restartVideo);

    return () => {
      console.log('Cleaning up TalkingAvatarVideo effect');
      videoElement.removeEventListener('ended', restartVideo);
      videoElement.pause();
    };
  }, [isSpeaking, videoSrc]);

  return (
    <div className='video-class'>
      <video
        ref={videoRef}
        src={videoSrc}
        width="300"
        height="300"
        style={{ 
          pointerEvents: 'none',
          borderRadius: '50%',
          objectFit: 'cover',
          aspectRatio: '1/1'
        }}
        muted
        loop
        playsInline
        preload="auto"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default TalkingAvatarVideo;