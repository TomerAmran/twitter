import React, { useState, useEffect } from "react";

const AudioRecorder = ({ audioURLSetter }: { audioURLSetter: Function }) => {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState("");

  const handleAudioChunk = (event: BlobEvent) => {
    const audioURL = URL.createObjectURL(event.data);
    setAudioURL(audioURL);
    audioURLSetter(audioURL);
  };

  useEffect(() => {
    if (navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);

        recorder.addEventListener("dataavailable", handleAudioChunk);
      });
    }
  }, []);

  const startRecording = () => {
    if (mediaRecorder) {
      setIsRecording(true);
      mediaRecorder.start();
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
      <h1>{isRecording && "Recording..."}</h1>
      <button onClick={startRecording} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" disabled={isRecording}>
        Start
      </button>
      <button onClick={stopRecording} disabled={!isRecording} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Stop
      </button>
      {/* {audioURL && (
        <audio src={audioURL} controls>
          Your browser does not support the audio element.
        </audio>
      )} */}
    </div>
  );
};

export default AudioRecorder;
