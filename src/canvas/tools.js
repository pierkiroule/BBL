import {
  cloneSeeded,
  createSeededRandom,
  pickInRange
} from '../utils/random.js';

/* ---------------- utils ---------------- */

function relevantPoints(points = [], timeLimit) {
  if (typeof timeLimit !== 'number') return points;
  return points.filter(p => p.t <= timeLimit);
}

function velocityAt(points, index) {
  if (index === 0 || index >= points.length) return 0;
  const a = points[index - 1];
  const b = points[index];
  const dist = Math.hypot(b.x - a.x, b.y - a.y);
  const dt = Math.max(1, b.t - a.t);
  return dist / dt;
}

/* ---------------- BASIC STROKE ---------------- */

function drawBasicStroke(
  ctx,
  points,
  {
    color,
    size,
    jitter = 0,
    shadowBlur = 0,
    shadowColor,
    compositeOperation = 'source-over',
    rand
  }
) {
  if (!points.length) return;

  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalCompositeOperation = compositeOperation;
  ctx.shadowBlur = shadowBlur;
  ctx.shadowColor = shadowColor || color;

  let first = true;
  const r = rand || Math.random;

  points.forEach((p, i) => {
    if (jitter && p._jx === undefined) {
      p._jx = (r() - 0.5) * jitter;
      p._jy = (r() - 0.5) * jitter;
    }

    const x = jitter ? p.x + p._jx : p.x;
    const y = jitter ? p.y + p._jy : p.y;

    if (first) {
      ctx.moveTo(x, y);
      first = false;
    } else {
      const prev = points[i - 1];
      const d = Math.hypot(x - prev.x, y - prev.y);
      if (d < size * 8) {
        ctx.quadraticCurveTo(
          prev.x,
          prev.y,
          (prev.x + x) * 0.5,
          (prev.y + y) * 0.5
        );
      } else {
        ctx.moveTo(x, y);
      }
    }
  });

  ctx.stroke();
  ctx.restore();
}

/* ---------------- TOOLS ---------------- */

function renderWatercolor(ctx, stroke, points, env) {
  const rand = createSeededRandom(stroke.seed || 1);
  const jitterRand = cloneSeeded(rand);
  const now = env.timeLimit || 0;
  const alphaBase = 0.06 + rand() * 0.04;
  const jitterAmp = env.resonance.mid * 8 + 2;

  points.forEach((p, idx) => {
    const splats = 6 + Math.floor(rand() * 8);
    for (let i = 0; i < splats; i++) {
      const radius = pickInRange(rand, stroke.size * 0.35, stroke.size * 1.25);
      const angle = rand() * Math.PI * 2;

      const drift =
        Math.sin(now * 0.001 + idx * 0.35 + i * 0.45) *
        (stroke.size * 0.2);

      const ox = Math.cos(angle) * radius * 0.6 + drift;
      const oy = Math.sin(angle) * radius * 0.6 + drift;

      const dx = p.x + ox + (jitterRand() - 0.5) * jitterAmp;
      const dy = p.y + oy + (jitterRand() - 0.5) * jitterAmp;

      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = stroke.color;
      ctx.globalAlpha *= (alphaBase + rand() * 0.05);

      ctx.beginPath();
      ctx.ellipse(
        dx,
        dy,
        radius,
        radius * pickInRange(rand, 0.6, 1.4),
        rand() * Math.PI,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();
    }
  });
}

function renderInk(ctx, stroke, points, env) {
  if (!points.length) return;

  const rand = createSeededRandom(stroke.seed || 2);
  const baseWidth = stroke.size * 1.05;

  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha *= 0.92;
  ctx.strokeStyle = stroke.color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();

  points.forEach((p, i) => {
    const v = velocityAt(points, i);
    const wobble =
      Math.sin((env.timeLimit + i * 30) * 0.002) * 0.08;
    const thickness = baseWidth * (0.9 + wobble + v * 0.3);
    ctx.lineWidth = Math.max(1, thickness);
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });

  ctx.stroke();
  ctx.restore();
}

/* ---------------- STAMPS ---------------- */

function renderEmoji(ctx, stroke, points, env) {
  points.forEach(p => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(
      (stroke.rotation || 0) +
      Math.sin(env.timeLimit * 0.002 + p.t * 0.01) * 0.03
    );
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${Math.max(12, stroke.size * 2.4)}px system-ui, Apple Color Emoji, Noto Color Emoji`;
    ctx.fillText(stroke.emoji || '✨', 0, 0);
    ctx.restore();
  });
}

function renderText(ctx, stroke, points) {
  if (!stroke.text) return;
  const fontSize = Math.max(14, stroke.size * 2.2);

  points.forEach(p => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${fontSize}px 'Inter', 'Helvetica Neue', sans-serif`;
    ctx.fillStyle = stroke.color;
    ctx.fillText(stroke.text, 0, 0);
    ctx.restore();
  });
}

function renderImageStamp(ctx, stroke, points) {
  if (!stroke.image || !stroke.image.complete) return;
  const r = stroke.size * 1.6;

  points.forEach(p => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((stroke.rotation || 0) * 0.2);
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(stroke.image, -r, -r, r * 2, r * 2);
    ctx.restore();
  });
}

/* ---------------- EXPORTS ---------------- */

export const TOOL_RENDERERS = {
  pencil: (ctx, stroke, pts, env) =>
    drawBasicStroke(ctx, pts, {
      color: stroke.color,
      size: stroke.size,
      jitter: 1 + env.resonance.treble * 4,
      rand: createSeededRandom(stroke.seed || 1)
    }),

  brush: (ctx, stroke, pts, env) =>
    drawBasicStroke(ctx, pts, {
      color: stroke.color,
      size: stroke.size + env.resonance.bass * 20,
      jitter: env.resonance.treble * 4,
      shadowBlur: stroke.size / 2 + env.resonance.treble * 25,
      shadowColor: stroke.color,
      rand: createSeededRandom(stroke.seed || 1)
    }),

  watercolor: renderWatercolor,
  ink: renderInk,
  'emoji-stamp': renderEmoji,
  text: renderText,
  'image-stamp': renderImageStamp
};

/* ---------------- HELPERS ---------------- */

export function computeAlpha({ isGhost, presence, opacity }) {
  const live = Math.min(1, 0.2 + presence * 0.9) * opacity;
  const ghost = (0.04 + presence * 0.08) * opacity;
  return isGhost ? ghost : live;
}

export function prepareStrokePoints(stroke, timeLimit) {
  return relevantPoints(stroke.points, timeLimit);
}

export function isStampTool(tool) {
  return tool === 'emoji-stamp' || tool === 'text' || tool === 'image-stamp';
}

export function ensureStrokeSeed(stroke) {
  if (!stroke.seed) {
    stroke.seed = Math.floor(Math.random() * 1_000_000_007);
  }
  return stroke;
}