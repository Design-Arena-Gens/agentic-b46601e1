import { useEffect, useMemo, useRef, useState } from "react";
import FileDrop from "../components/FileDrop";
import Waveform from "../components/Waveform";
import Controls from "../components/Controls";
import Visualizer from "../components/Visualizer";
import { analyzeAudioBuffer } from "../lib/audio/analyze";
import { createRemixPlan, renderOffline, renderRealtime } from "../lib/audio/remix";
import { audioBufferToWav } from "../lib/audio/wav";

export default function Home() {
  const [file, setFile] = useState(null);
  const [buffer, setBuffer] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [plan, setPlan] = useState(null);
  const [options, setOptions] = useState({ style: 'electronic', tempoBpm: 120, intensity: 0.6, effectLevel: 0.5 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [analyser, setAnalyser] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [exportUrl, setExportUrl] = useState(null);
  const audioCtxRef = useRef(null);
  const realtimeRef = useRef(null);

  // Decode audio when file selected
  useEffect(() => {
    if (!file) return;
    const ctx = audioCtxRef.current || new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;
    file.arrayBuffer().then((arr) => ctx.decodeAudioData(arr.slice(0))).then((buf) => {
      setBuffer(buf);
      setOptions((o) => ({ ...o, tempoBpm: 120 }));
    });
  }, [file]);

  // Analyze when buffer ready
  useEffect(() => {
    if (!buffer) return;
    let cancelled = false;
    (async () => {
      const res = await analyzeAudioBuffer(buffer);
      if (cancelled) return;
      setAnalysis(res);
      setOptions((o) => ({ ...o, tempoBpm: res.tempoBpm }));
      const p = createRemixPlan(res, { ...options, tempoBpm: res.tempoBpm }, buffer.duration);
      setPlan(p);
    })();
    return () => { cancelled = true; };
  }, [buffer]);

  // Update plan on option change
  useEffect(() => {
    if (!analysis || !buffer) return;
    const p = createRemixPlan(analysis, options, buffer.duration);
    setPlan(p);
  }, [options, analysis, buffer]);

  const beats = useMemo(() => analysis?.beats || [], [analysis]);

  const startPreview = async () => {
    if (!buffer || !plan) return;
    const ctx = audioCtxRef.current || new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;
    const rt = renderRealtime(ctx, buffer, plan, options);
    realtimeRef.current = rt;
    setAnalyser(rt.analyser);
    setIsPlaying(true);
    const start = ctx.currentTime;
    const id = setInterval(() => {
      const t = ctx.currentTime - start;
      setCurrentTime(Math.min(buffer.duration, t));
    }, 100);
    setTimeout(() => { clearInterval(id); setIsPlaying(false); setCurrentTime(0); }, rt.duration * 1000 + 200);
  };

  const stopPreview = () => {
    try { realtimeRef.current?.stop(); } catch {}
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const exportWav = async () => {
    if (!buffer || !plan) return;
    setExporting(true);
    try {
      const rendered = await renderOffline(buffer, plan, options, 44100);
      const blob = audioBufferToWav(rendered);
      const url = URL.createObjectURL(blob);
      setExportUrl(url);
    } finally {
      setExporting(false);
    }
  };

  const shareFile = async () => {
    if (!exportUrl) return;
    const res = await fetch(exportUrl);
    const blob = await res.blob();
    const file = new File([blob], "remix.wav", { type: 'audio/wav' });
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: 'My Remix' }); } catch {}
    } else {
      const a = document.createElement('a');
      a.href = exportUrl; a.download = 'remix.wav'; a.click();
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-10 bg-gradient-to-b from-bg to-[#0b0f14]">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div className="text-2xl font-bold"><span className="text-accent">Auto</span>Remix Studio</div>
          <div className="text-white/60">Upload ? Analyze ? Remix ? Share</div>
        </header>

        {!buffer && (
          <FileDrop onFile={setFile} />
        )}

        {buffer && (
          <div className="space-y-4">
            <div className="panel p-4">
              <Waveform audioBuffer={buffer} beats={beats} currentTime={currentTime} />
              <div className="flex gap-2 mt-4">
                {!isPlaying ? (
                  <button className="btn" onClick={startPreview}>Play Remix Preview</button>
                ) : (
                  <button className="btn" onClick={stopPreview}>Stop</button>
                )}
                <button className="btn" onClick={exportWav} disabled={exporting}>{exporting ? 'Rendering?' : 'Export WAV'}</button>
                {exportUrl && (
                  <>
                    <a className="btn" href={exportUrl} download="remix.wav">Download</a>
                    <button className="btn" onClick={shareFile}>Share</button>
                  </>
                )}
              </div>
            </div>

            <Controls options={options} setOptions={setOptions} analysis={analysis} />

            <div className="panel p-4">
              <div className="text-sm text-white/60 mb-2">Live Visualization</div>
              <Visualizer analyser={analyser} />
            </div>
          </div>
        )}

        <footer className="text-center text-white/40 text-sm pt-6">Built with Web Audio ? No upload leaves your browser</footer>
      </div>
    </div>
  );
}
