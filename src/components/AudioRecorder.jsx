import React, { useState, useRef, useEffect } from "react";
import "../styles/AudioRecorder.scss";

const AudioRecorder = ({ onRecordingComplete, maxDuration = 10 }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const audioChunks = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    const setupRecorder = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        
        recorder.ondataavailable = (event) => {
          audioChunks.current.push(event.data);
        };
        
        recorder.onstop = () => {
          const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
          setAudioBlob(blob);
          if (onRecordingComplete) {
            onRecordingComplete(blob);
          }
          
          stream.getTracks().forEach(track => track.stop());
        };
        
        setMediaRecorder(recorder);
      } catch (error) {
        console.error("Error accessing microphone:", error);
      }
    };
    
    setupRecorder();
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [onRecordingComplete]);

  const startRecording = () => {
    if (mediaRecorder) {
      audioChunks.current = [];
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return maxDuration;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  return (
    <div className="audio-recorder">
      <div className="recorder-controls">
        {!isRecording ? (
          <button className="record-btn" onClick={startRecording}>
            <i className="fas fa-microphone"></i>
            Start Recording
          </button>
        ) : (
          <button className="stop-btn" onClick={stopRecording}>
            <i className="fas fa-stop"></i>
            Stop Recording ({maxDuration - recordingTime}s left)
          </button>
        )}
      </div>
      
      {isRecording && (
        <div className="recording-indicator">
          <div className="pulse-animation"></div>
          <span>Recording...</span>
        </div>
      )}
      
      {audioBlob && !isRecording && (
        <div className="audio-playback">
          <audio controls src={URL.createObjectURL(audioBlob)} />
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;