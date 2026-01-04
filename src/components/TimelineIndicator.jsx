import { useCallback, useMemo } from 'react';

function clamp01(v) {
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(v, 1));
}

export default function TimelineIndicator({
  progress = 0,
  paused = false,
  speed = 1,
  mode = 'loop',
  onTogglePause,
  onModeChange,
  onSpeedChange,
  onSeek,
}) {
  const p = useMemo(() => clamp01(progress), [progress]);

  const seekFromPointer = useCallback(
    (e) => {
      if (!onSeek) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const clientX = e.touches?.[0]?.clientX ?? e.clientX;
      const ratio = (clientX - rect.left) / rect.width;
      onSeek(clamp01(ratio));
    },
    [onSeek]
  );

  return (
    <div className="timeline">
      <button
        type="button"
        className="timeline-play"
        onClick={onTogglePause}
      >
        {paused ? '▶' : '⏸'}
      </button>

      <div
        className="timeline-track"
        onPointerDown={seekFromPointer}
        onPointerMove={(e) => e.buttons === 1 && seekFromPointer(e)}
      >
        <div
          className="timeline-bar"
          style={{ width: `${p * 100}%` }}
        />
      </div>

      <select
        className="timeline-mode"
        value={mode}
        onChange={(e) => onModeChange?.(e.target.value)}
      >
        <option value="loop">Loop</option>
        <option value="pingpong">Ping-pong</option>
      </select>

      <div className="timeline-speed">
        <input
          type="range"
          min="0.25"
          max="3"
          step="0.05"
          value={speed}
          onChange={(e) => onSpeedChange?.(Number(e.target.value))}
        />
        <span>{speed.toFixed(2)}×</span>
      </div>
    </div>
  );
}