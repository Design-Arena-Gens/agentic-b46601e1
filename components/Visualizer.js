import { useEffect, useRef } from "react";

export default function Visualizer({ analyser }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!analyser) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;
    const data = new Uint8Array(analyser.frequencyBinCount);

    let raf;
    const render = () => {
      analyser.getByteFrequencyData(data);
      ctx.clearRect(0, 0, width, height);
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "#6ee7ff");
      gradient.addColorStop(1, "#a78bfa");
      const barWidth = Math.max(1, Math.floor(width / data.length));
      for (let i = 0; i < data.length; i++) {
        const val = data[i];
        const barHeight = (val / 255) * height;
        ctx.fillStyle = gradient;
        ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight);
      }
      raf = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(raf);
  }, [analyser]);

  return <canvas ref={canvasRef} className="w-full h-40 rounded-md" width={1200} height={200} />;
}
