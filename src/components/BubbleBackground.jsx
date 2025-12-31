import React, { useEffect, useRef } from 'react';

const BUBBLE_COUNT = 20;

export default function BubbleBackground() {
  const bgRef = useRef(null);

  useEffect(() => {
    const bg = bgRef.current;
    if (!bg) return;
    bg.innerHTML = '';
    for (let i = 0; i < BUBBLE_COUNT; i += 1) {
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      const size = Math.random() * 90 + 20;
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${Math.random() * 100}vw`;
      bubble.style.setProperty('--d', `${Math.random() * 12 + 8}s`);
      bubble.style.animationDelay = `${Math.random() * 10}s`;
      bg.appendChild(bubble);
    }
  }, []);

  return <div ref={bgRef} className="bubble-bg" aria-hidden="true" />;
}
