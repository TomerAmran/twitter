import React, { useEffect, useRef, useState } from "react";

type Refs = {
  audioContext: AudioContext;
  mediaStream: MediaStream;
  analyzer: AnalyserNode;
  source: MediaStreamAudioSourceNode;
};

const W = 800;
const H = 200;

const CounterWithRef = () => {
  const refs = useRef<Refs>({});
  const timeCanvasRef = useRef();
  const freqCanvasRef = useRef();
  const [a, setA] = useState(0);
  const c = refs.current;
  const bedRefs = {};

  useEffect(() => {
    if (navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        c.mediaStream = stream;
        setUpAudioStreaming();
      });
    }
  }, []);

  function setUpAudioStreaming() {
    if (c.mediaStream) {
      c.audioContext = new AudioContext();
      c.analyzer = c.audioContext.createAnalyser();
      c.analyzer.fftSize = 2 << 8;
      c.source = c.audioContext.createMediaStreamSource(c.mediaStream);
      c.source.connect(c.analyzer);
      processAudioStream();
    }
  }

  function processAudioStream() {
    const timeData = new Uint8Array(c.analyzer.frequencyBinCount);
    c.analyzer.getByteTimeDomainData(timeData);
    drawTimeData(timeData);
    drawTimeData(computeDFT(timeData), freqCanvasRef);
    requestAnimationFrame(processAudioStream);
  }

  function drawTimeData(
    timeData: Uint8Array | Float32Array,
    canvasRef = timeCanvasRef
  ) {
    const ctx = canvasRef.current.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000";
    ctx.beginPath();
    const sliceWidth = (W * 1.0) / timeData.length;
    let x = 0;
    // console.log(Math.max(...timeData));
    timeData.forEach((v, i) => {
      const y = H - H * (v / 255.0);
      // console.log(y);
      // console.log(x, y, H, v);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    });

    ctx.lineTo(W, H / 2);
    ctx.moveTo(0, H / 2);
    ctx.lineTo(W, H / 2);
    ctx.stroke();
  }

  return (
    <div>
      <div>
        <h3>Time-domain (Waveform)</h3>
        <canvas ref={timeCanvasRef} width="800" height="200"></canvas>
        <canvas ref={freqCanvasRef} width="800" height="200"></canvas>
      </div>
    </div>
  );
};

export default CounterWithRef;

function computeDFT(input: Uint8Array | Float32Array) {
  const N = input.length;
  const X = [];

  for (let k = 0; k < N; k++) {
    let real = 0;
    let imag = 0;
    const x = k * (1 / N);
    const tau = 2 * Math.PI;
    for (let freq = 0; freq < N; freq++) {
      const angle = -tau * freq * x;
      real += input[freq] * Math.cos(angle);
      imag += input[freq] * Math.sin(angle);
    }

    X[k] = { real, imag, mag: Math.sqrt(real * real + imag * imag) };
  }
  let res = X.map((_) => _.mag);
  const max = Math.max(...res);
  console.log(res);
  return res;
}
