import React, { useState, useEffect, useRef } from "react";

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const audioContextRef = useRef<AudioContext>(null);
  const mediaStreamRef = useRef<MediaStream>(null);
  const analyserRef = useRef<AnalyserNode>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode>(null);
  const [timeDomainArray, setTimeDomainArray] = useState<Uint8Array>(
    new Uint8Array()
  );
  const [freqDomainArray, setFreqDomainArray] = useState<Uint8Array>(
    new Uint8Array()
  );

  useEffect(() => {
    if (navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        mediaStreamRef.current = stream;
      });
    }
  }, []);

  setTimeout(() => {
    startRecording();
  }, 1000);

  const startRecording = () => {
    console.log("start recording");
    if (mediaStreamRef.current) {
      setIsRecording(true);
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2 << 5;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(
        mediaStreamRef.current
      );
      source.connect(analyser);
      sourceRef.current = source;

      processAudioData();
    }
  };

  const processAudioData = () => {
    if (!isRecording) {
      return;
    }

    const bufferLength = analyserRef.current.frequencyBinCount;
    const timeDomainArray = new Uint8Array(bufferLength);
    const frequencyDomainArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteTimeDomainData(timeDomainArray);
    analyserRef.current?.getByteFrequencyData(frequencyDomainArray);
    setTimeDomainArray(timeDomainArray);
    // setFreqDomainArray(frequencyDomainArray);
    console.log(timeDomainArray.length);
    console.log("time", timeDomainArray.slice(0, 10));
    console.log("freq", frequencyDomainArray.slice(0, 10));
    // Process the dataArray here, which contains amplitude values ranging from 0 to 255

    // requestAnimationFrame(processAudioData);
    setTimeout(processAudioData, 500);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  return (
    <>
      <div>
        <button onClick={startRecording} disabled={isRecording}>
          Start Recording
        </button>
        <button onClick={stopRecording} disabled={!isRecording}>
          Stop Recording
        </button>
      </div>

      <div>
        {/* {timeDomainArray.map((x) => {
          return <div>{x}</div>;
        })} */}
        {timeDomainArray.toString()}
      </div>
      <div>
        
        {freqDomainArray.toString()}
      </div>
    </>
  );
};

export default AudioRecorder;
