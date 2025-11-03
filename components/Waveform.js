import { useEffect, useRef } from "react";

export default function Waveform({ audioBuffer, beats = [], currentTime = 0 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!audioBuffer) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = "#0f1721";
    ctx.fillRect(0, 0, width, height);

    // Waveform
    const data = audioBuffer.getChannelData(0);
    const step = Math.ceil(data.length / width);
    ctx.strokeStyle = "rgba(110,231,255,0.8)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const datum = data[i * step + j] || 0;
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      const y1 = (1 + min) * 0.5 * height;
      const y2 = (1 + max) * 0.5 * height;
      ctx.moveTo(i, y1);
      ctx.lineTo(i, y2);
    }
    ctx.stroke();

    // Beat markers
    ctx.strokeStyle = "rgba(167,139,250,0.8)";
    ctx.lineWidth = 1;
    beats.forEach((t, idx) => {
      const x = (t / audioBuffer.duration) * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      // Bar highlight every 4 beats
      if (idx % 4 === 0) {
        ctx.fillStyle = "rgba(167,139,250,0.1)";
        ctx.fillRect(x, 0, 2, height);
      }
    });

    // Playhead
    const playX = (currentTime / audioBuffer.duration) * width;
    ctx.fillStyle = "#fff";
    ctx.fillRect(playX - 1, 0, 2, height);
  }, [audioBuffer, beats, currentTime]);

  return (
    <canvas ref={canvasRef} className="w-full h-32 rounded-md" width={1200} height={160} />
  );
}
