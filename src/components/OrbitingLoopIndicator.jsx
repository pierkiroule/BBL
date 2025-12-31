import React, { useEffect, useMemo, useRef } from 'react';

const TRAIL_COLORS = ['#fbbf24', '#fb923c', '#facc15'];

function clampSpeed(value) {
  if (Number.isNaN(value)) return 1;
  return Math.min(2, Math.max(0.25, value));
}

export default function OrbitingLoopIndicator({ duration, speed, pingPong, paused }) {
  const indicatorRef = useRef(null);
  const bubbleRef = useRef(null);
  const trailRef = useRef(null);
  const angleRef = useRef(0);
  const radiusRef = useRef(0);
  const rafRef = useRef(null);
  const lastTickRef = useRef(null);

  const orbitPeriod = useMemo(() => {
    const cleanDuration = Math.max(1, duration || 1);
    const cycleFactor = pingPong ? 2 : 1;
    const cleanSpeed = clampSpeed(speed || 1);
    return (cleanDuration * cycleFactor) / cleanSpeed;
  }, [duration, pingPong, speed]);

  useEffect(() => {
    const measure = () => {
      const parent = indicatorRef.current?.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const gap = 14;
      radiusRef.current = Math.min(rect.width, rect.height) / 2 + gap;
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  useEffect(() => {
    const updatePosition = () => {
      if (!bubbleRef.current || !radiusRef.current) return;
      const angle = angleRef.current;
      const x = Math.cos(angle) * radiusRef.current;
      const y = Math.sin(angle) * radiusRef.current;
      bubbleRef.current.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
    };

    const tick = (timestamp) => {
      if (lastTickRef.current == null) lastTickRef.current = timestamp;
      const delta = timestamp - lastTickRef.current;
      lastTickRef.current = timestamp;

      if (!paused && orbitPeriod > 0) {
        const increment = (delta / orbitPeriod) * Math.PI * 2;
        angleRef.current = (angleRef.current + increment) % (Math.PI * 2);
      }

      updatePosition();
      rafRef.current = requestAnimationFrame(tick);
    };

    lastTickRef.current = null;
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [orbitPeriod, paused]);

  useEffect(() => {
    const emitParticles = () => {
      if (!trailRef.current || !radiusRef.current || paused) return;
      const count = 3 + Math.floor(Math.random() * 4);
      const angle = angleRef.current;
      const baseX = Math.cos(angle) * radiusRef.current;
      const baseY = Math.sin(angle) * radiusRef.current;
      for (let i = 0; i < count; i += 1) {
        const particle = document.createElement('span');
        const size = 2 + Math.random() * 3;
        const distance = 10 + Math.random() * 14;
        const lifetime = 450 + Math.random() * 250;
        const color = TRAIL_COLORS[Math.floor(Math.random() * TRAIL_COLORS.length)];
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        particle.className = 'orbit-particle';
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.setProperty('--x', `${baseX}px`);
        particle.style.setProperty('--y', `${baseY}px`);
        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);
        particle.style.setProperty('--life', `${Math.round(lifetime)}ms`);
        particle.style.setProperty('--color', color);
        trailRef.current.appendChild(particle);
        setTimeout(() => particle.remove(), lifetime + 60);
      }
    };

    const interval = setInterval(emitParticles, 140);
    return () => clearInterval(interval);
  }, [paused]);

  return (
    <div className="orbit-indicator" ref={indicatorRef} aria-hidden="true">
      <div className="orbit-trail-layer" ref={trailRef} />
      <div className="orbit-bubble" ref={bubbleRef} />
    </div>
  );
}
