import { useMemo } from "react";

export default function Controls({ options, setOptions, analysis }) {
  const info = useMemo(() => analysis, [analysis]);
  return (
    <div className="panel p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <div className="text-sm text-white/60">Remix Style</div>
        <select
          value={options.style}
          onChange={(e) => setOptions({ ...options, style: e.target.value })}
          className="mt-1 w-full bg-bg border border-white/10 rounded-md p-2"
        >
          <option value="electronic">Electronic</option>
          <option value="chill">Chill</option>
          <option value="upbeat">Upbeat</option>
        </select>
      </div>
      <div>
        <div className="flex justify-between text-sm text-white/60"><span>Tempo</span><span>{Math.round(options.tempoBpm)} BPM</span></div>
        <input type="range" min="60" max="180" value={options.tempoBpm}
          onChange={(e) => setOptions({ ...options, tempoBpm: Number(e.target.value) })}
          className="w-full"
        />
      </div>
      <div>
        <div className="flex justify-between text-sm text-white/60"><span>Intensity</span><span>{Math.round(options.intensity * 100)}%</span></div>
        <input type="range" min="0" max="1" step="0.01" value={options.intensity}
          onChange={(e) => setOptions({ ...options, intensity: Number(e.target.value) })}
          className="w-full"
        />
      </div>
      <div>
        <div className="flex justify-between text-sm text-white/60"><span>Effect Level</span><span>{Math.round(options.effectLevel * 100)}%</span></div>
        <input type="range" min="0" max="1" step="0.01" value={options.effectLevel}
          onChange={(e) => setOptions({ ...options, effectLevel: Number(e.target.value) })}
          className="w-full"
        />
      </div>
      {info && (
        <div className="md:col-span-2 grid grid-cols-3 gap-4 text-sm">
          <div className="panel p-3"><div className="text-white/60">Detected Tempo</div><div className="text-xl font-semibold">{Math.round(info.tempoBpm)} BPM</div></div>
          <div className="panel p-3"><div className="text-white/60">Detected Key</div><div className="text-xl font-semibold">{info.key?.tonic} {info.key?.mode}</div></div>
          <div className="panel p-3"><div className="text-white/60">Beats</div><div className="text-xl font-semibold">{info.beats?.length || 0}</div></div>
        </div>
      )}
    </div>
  );
}
