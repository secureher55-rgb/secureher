import React, { useState, useRef, useEffect } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";
import "../styles/AudioRecorder.scss";

const AudioRecorder = ({ onRecordingComplete, maxDuration = 10 }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [error, setError] = useState(null);

  const audioChunks = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const setupRecorder = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const recorder = new MediaRecorder(stream);

        recorder.ondataavailable = (event) => {
          audioChunks.current.push(event.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(audioChunks.current, { type: "audio/webm" });
          setAudioBlob(blob);
          if (onRecordingComplete) {
            onRecordingComplete(blob);
          }
        };

        setMediaRecorder(recorder);
      } catch (err) {
        setError("Microphone access denied. Please enable it in browser settings.");
        console.error("Error accessing microphone:", err);
      }
    };

    setupRecorder();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
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
        setRecordingTime((prev) => {
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

  const resetRecording = () => {
    setAudioBlob(null);
    setRecordingTime(0);
  };

  // Optional: Upload to Firebase directly
  const uploadToFirebase = async () => {
    if (!audioBlob) return;
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      setError("You must be logged in to upload recordings.");
      return;
    }

    const storage = getStorage();
    const fileName = `recording_${Date.now()}.webm`;
    const storageRef = ref(storage, `audioRecordings/${user.uid}/${fileName}`);

    await uploadBytes(storageRef, audioBlob);
    const url = await getDownloadURL(storageRef);
    console.log("Uploaded audio URL:", url);
    return url;
  };

  const formatTime = (time) =>
    `00:${time.toString().padStart(2, "0")} / 00:${maxDuration}`;

  return (
    <div className="audio-recorder">
      {error && <p className="error-text">{error}</p>}

      <div className="recorder-controls">
        {!isRecording ? (
          <button className="record-btn" onClick={startRecording} disabled={!!audioBlob}>
            <i className="fas fa-microphone"></i> Start Recording
          </button>
        ) : (
          <button className="stop-btn" onClick={stopRecording}>
            <i className="fas fa-stop"></i> Stop Recording
          </button>
        )}
      </div>

      {isRecording && (
        <div className="recording-indicator">
          <div className="pulse-animation"></div>
          <span>Recording... {formatTime(recordingTime)}</span>
        </div>
      )}

      {audioBlob && !isRecording && (
        <div className="audio-playback">
          <audio controls src={URL.createObjectURL(audioBlob)} />
          <div className="actions">
            <button onClick={resetRecording} className="reset-btn">
              <i className="fas fa-trash"></i> Reset
            </button>
            <button onClick={uploadToFirebase} className="upload-btn">
              <i className="fas fa-cloud-upload-alt"></i> Upload
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
