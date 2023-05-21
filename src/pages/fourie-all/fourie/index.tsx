import React, { useState, useEffect } from "react";

function recordInChuncks(recorder: MediaRecorder, time: number) {
  recorder.start(time);
}

const AudioRecorder = () => {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState("");

  const handleAudioChunk = (event: BlobEvent) => {
    const audioURL = URL.createObjectURL(event.data);
    setAudioURL(audioURL);
  };

  useEffect(() => {
    if (navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);

        recorder.addEventListener("dataavailable", handleAudioChunk);
        setIsRecording(true);
      });
    }
  }, []);

  const startRecording = () => {
    if (mediaRecorder) {
      setIsRecording(true);
      recordInChuncks(mediaRecorder, 1000);
      console.log("Recording started.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      setIsRecording(false);
      mediaRecorder.stop();
      console.log("Recording stopped.");
    }
  };

  return (
    <div>
      <h1>{isRecording ? "Recording" : "Waiting.."}</h1>
      <button onClick={startRecording} disabled={isRecording}>
        Start Recording
      </button>
      <button onClick={stopRecording} disabled={!isRecording}>
        Stop Recording
      </button>
      {audioURL && (
        <audio src={audioURL} controls>
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
};

export default AudioRecorder;
