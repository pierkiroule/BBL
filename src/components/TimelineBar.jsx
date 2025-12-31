import React from 'react';

export default function TimelineBar({ progress }) {
  const width = Math.min(Math.max(progress, 0), 1) * 100;
  return (
    <div className="timeline-container">
      <div className="timeline-bar" style={{ width: `${width}%` }} />
    </div>
  );
}
