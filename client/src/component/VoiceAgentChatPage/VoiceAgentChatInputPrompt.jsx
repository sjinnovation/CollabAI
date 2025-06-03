import React, { useContext, useRef, useEffect, useState } from "react";
import { ThemeContext } from "../../contexts/themeConfig";
import { MdDeleteOutline } from "react-icons/md";
import { FaMicrophone } from "react-icons/fa6";
import { IoMdMicOff } from "react-icons/io";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import ProcessingDots from './ProcessingDots'; 
import ListeningIndicator from './ListeningIndicator';
import './voiceAgent.css';

// Simple ripple component since we can't easily replace this with CSS
const RippleEffect = ({ style }) => (
  <span className="ripple-effect" style={style} />
);

// Simple speaking bar component for animation
const SpeakingBar = ({ delay }) => (
  <motion.div
    className="speaking-bar"
    animate={{
      height: [8, 16, 8],
    }}
    transition={{
      duration: 0.6,
      repeat: Infinity,
      delay: delay,
      ease: "easeInOut",
    }}
  />
);

const VoiceAgentChatInputPrompt = ({ states, actions }) => {
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [reading, setReading] = useState(false);
  const [silenceTimer, setSilenceTimer] = useState(null);
  const [processingTimer, setProcessingTimer] = useState(null);
  const [rippleStyle, setRippleStyle] = useState({});
  const [currentTranscript, setCurrentTranscript] = useState('');
  const lastTranscriptRef = useRef('');
  const { theme } = useContext(ThemeContext);
  const [isStarted, setIsStarted] = useState(false);
  
  const {
    selectedFiles,
    isMessageFetching,
    isGeneratingResponse,
    isUploadingFile,
    hasFileAttachmentAccess,
    inputPrompt,
    isVideoPlaying,
    isSubmitted,
    isSubmittingInterview,
    isInterview
  } = states;

  const {
    onSubmit,
    handleKeyDown,
    setSelectedFiles,
    handleFileChange,
    handleFileRemove,
    onInputPromptChange,
    onHandleFinishInterview
  } = actions;

  let { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const location = useLocation(); 

  // Update the silence detection effect
  useEffect(() => {
    if (listening) {
      if (transcript) {
        setCurrentTranscript(transcript);
        
        if (transcript !== lastTranscriptRef.current) {
          // Reset silence timer when new speech is detected
          if (silenceTimer) clearTimeout(silenceTimer);
          lastTranscriptRef.current = transcript;
          
          const timer = setTimeout(() => {
            if (transcript) { 
              // Update the input prompt with the transcript
              const updatedPrompt = transcript.trim();
              onInputPromptChange(updatedPrompt);
              
              // Stop listening and start processing
              setListening(false);
              setProcessing(true);
              
              const formEvent = {
                preventDefault: () => {},
                target: {
                  elements: {
                    inputPrompt: {
                      value: updatedPrompt
                    }
                  }
                }
              };
              
              // Call onSubmit with the proper event object
              onSubmit(formEvent);
            }
          }, 3000);
          
          setSilenceTimer(timer);
        }
      }
    }

    return () => {
      if (silenceTimer) clearTimeout(silenceTimer);
    };
  }, [transcript, listening]);

  // Handle processing timeout
  useEffect(() => {
    let timer;
    
    if (processing && !reading && !isVideoPlaying) { 
      timer = setTimeout(() => { 
        setProcessing(false);
        startListening();
      }, 10000);

      setProcessingTimer(timer);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [processing, reading, isVideoPlaying]);

  // Update the video playing effect
  useEffect(() => {     
    if (isVideoPlaying) {
      setReading(true);
      setProcessing(false);
      setListening(false);
      setCurrentTranscript('');
    } else if (reading) {
      setReading(false);
      // Add a small delay before starting to listen again
      const timer = setTimeout(() => {
        startListening();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isVideoPlaying]);

  const startListening = () => {
    if (!isVideoPlaying && !isSubmitted) {
      
      // If not started yet, just set started state and return
      if (!isStarted) {
        setIsStarted(true);
        return;
      }
      
      setListening(true);
      setProcessing(false);
      setReading(false);
      setCurrentTranscript('');
      resetTranscript();
      lastTranscriptRef.current = '';
      
      try {
        SpeechRecognition.startListening({ 
          continuous: true, 
          language: 'en-IN',
          interimResults: true 
        });
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    } else {
      console.log('Cannot start listening - isVideoPlaying:', isVideoPlaying, 'isSubmitted:', isSubmitted);
    }
  };

  // Start listening when component mounts
  useEffect(() => {
    if (isStarted) {
      const initialTimer = setTimeout(() => {
        startListening();
      }, 1000);
  
      return () => clearTimeout(initialTimer);
    }
  }, [isStarted]); 

  const handleRipple = (e) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    setRippleStyle({
      width: size,
      height: size,
      left: x,
      top: y
    });
  };

  const getMicButtonClasses = () => {
    let classes = ['mic-button'];
    if (listening) classes.push('listening');
    if (isVideoPlaying) classes.push('speaking');
    return classes.join(' ');
  };

  const getStatusIndicatorClasses = () => {
    let classes = ['status-indicator'];
    if (processing) classes.push('processing');
    else if (reading) classes.push('reading');
    else if (listening) classes.push('listening');
    else classes.push('normal');
    return classes.join(' ');
  };

  return (
    <div className="voice-agent-wrapper">
      {location.pathname.includes("/voice_agents/") && isInterview && (
        <div className="finish-button-container">
          <button
            onClick={onHandleFinishInterview}
            disabled={isSubmittingInterview || isGeneratingResponse || isMessageFetching}
            className={`finish-button ${isSubmittingInterview ? 'submitting' : 'normal'}`}
          >
            {isSubmittingInterview && (
              <div className="finish-button-spinner"></div>
            )}
            {isSubmittingInterview ? 'Submitting...' : 'Finish Interview'}
          </button>
        </div>
      )}
      <form onSubmit={onSubmit}>
        {selectedFiles.length > 0 && (
          <div className="file-container">
            {selectedFiles.map((file, index) => (
              <div key={index} className="file-item">
                <small className="text-truncate">{file.name}</small>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFileRemove(file);
                  }}
                  disabled={isUploadingFile}
                >
                  <MdDeleteOutline />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="input-wrapper">
          <input 
            type="text" 
            name="inputPrompt" 
            value={inputPrompt}
            onChange={(e) => onInputPromptChange(e.target.value)}
            className="hidden-input"
          />

          <div className="button-container">
            <div className={`transcript-display ${listening && !isVideoPlaying ? 'visible' : 'hidden'}`}>
              {currentTranscript || (
                <div className="transcript-listening">
                  Listening...
                </div>
              )}
            </div>
            
            <motion.button
              className={getMicButtonClasses()}
              animate={{
                scale: listening ? [1, 1.1, 1] : 1,
                backgroundColor: isVideoPlaying ? '#2196f3' : (listening ? '#ff4444' : '#4CAF50')
              }}
              transition={{
                duration: 1.5,
                repeat: (listening || isVideoPlaying) ? Infinity : 0,
                ease: "easeInOut"
              }}
              onMouseDown={handleRipple}
              onClick={startListening}
            >
              <div className="icon-wrapper">
                {isVideoPlaying ? (
                  <div className="speaking-bars-animation">
                    {[...Array(5)].map((_, i) => (
                      <SpeakingBar key={i} delay={i * 0.2} />
                    ))}
                  </div>
                ) : (
                  listening ? <IoMdMicOff /> : <FaMicrophone />
                )}
              </div>
              {Object.keys(rippleStyle).length > 0 && (
                <RippleEffect style={rippleStyle} />
              )}
            </motion.button> 
            <div className="status-container">
              {(processing ) && <ProcessingDots />}
              {(listening ) && <ListeningIndicator />}
              <div className={getStatusIndicatorClasses()}>
                {!isStarted ? 'Press the button to start': ''}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default VoiceAgentChatInputPrompt; 