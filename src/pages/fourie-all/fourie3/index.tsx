import React, { useState, useEffect, useRef } from "react";

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const canvasWaveformRef = useRef(null);
  const canvasSpectrumRef = useRef(null);

  useEffect(() => {
    const initMediaStream = async () => {
      if (navigator.mediaDevices) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          mediaStreamRef.current = stream;
          startRecording();
        } catch (err) {
          console.error("Error initializing media stream:", err);
        }
      }
    };

    initMediaStream();
  }, []);

  const startRecording = () => {
    if (mediaStreamRef.current) {
      setIsRecording(true);
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2 << 10;
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
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteTimeDomainData(dataArray);
    drawWaveform(dataArray);

    const freqArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(freqArray);
    drawSpectrum(freqArray);

    requestAnimationFrame(processAudioData);
  };

  const drawWaveform = (dataArray) => {
    const canvas = canvasWaveformRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillRect(0, 0, width, height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000";

    ctx.beginPath();

    const sliceWidth = (width * 1.0) / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i] / 255.0;
      const y = v * height;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  };

  const drawSpectrum = (freqArray) => {
    const canvas = canvasSpectrumRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillRect(0, 0, width, height);

    const barWidth = (width / freqArray.length) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < freqArray.length; i++) {
      barHeight = freqArray[i] / 2;

      ctx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
  };

  return (
    <div>
      <div>
        <h3>Time-domain (Waveform)</h3>
        <canvas ref={canvasWaveformRef} width="800" height="200"></canvas>
      </div>
      <div>
        <h3>Frequency-domain (Spectrum)</h3>
        <canvas ref={canvasSpectrumRef} width="800" height="200"></canvas>
      </div>
    </div>
  );
};

export default AudioRecorder;
