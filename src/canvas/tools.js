import { cloneSeeded, createSeededRandom, jitterAround, pickInRange } from '../utils/random.js';

function relevantPoints(points = [], timeLimit) {
  if (typeof timeLimit !== 'number') return points;
  return points.filter((p) => p.t <= timeLimit);
}

function velocityAt(points, index) {
  if (index === 0 || index >= points.length) return 0;
  const prev = points[index - 1];
  const curr = points[index];
  const dist = Math.hypot(curr.x - prev.x, curr.y - prev.y);
  const dt = Math.max(1, curr.t - prev.t);
  return dist / dt;
}

function drawBasicStroke(ctx, points, { color, size, jitter = 0, shadowBlur = 0, shadowColor, compositeOperation = 'source-over' }) {
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
  points.forEach((p, i) => {
    const px = jitter ? p.x + (Math.random() - 0.5) * jitter : p.x;
    const py = jitter ? p.y + (Math.random() - 0.5) * jitter : p.y;
    if (first) {
      ctx.moveTo(px, py);
      first = false;
    } else {
      const prev = points[i - 1];
      if (Math.hypot(px - prev.x, py - prev.y) < size * 8) {
        ctx.quadraticCurveTo(prev.x, prev.y, (prev.x + px) / 2, (prev.y + py) / 2);
      } else {
        ctx.moveTo(px, py);
      }
    }
  });
  ctx.stroke();
  ctx.restore();
}

function renderWatercolor(ctx, stroke, points, env) {
  const rand = createSeededRandom(stroke.seed || 1);
  const jitterRand = cloneSeeded(rand);
  const now = env.timeLimit || 0;
  const alphaBase = Math.max(0.05, Math.min(0.15, stroke.opacity || 0.12));
  points.forEach((p, idx) => {
    const splats = 6 + Math.floor(rand() * 8);
    for (let i = 0; i < splats; i += 1) {
      const radius = pickInRange(rand, stroke.size * 0.35, stroke.size * 1.25);
      const angle = rand() * Math.PI * 2;
      const drift = Math.sin(now * 0.001 + idx * 0.35 + i * 0.45) * (stroke.size * 0.2);
      const ox = Math.cos(angle) * radius * 0.6 + drift;
      const oy = Math.sin(angle) * radius * 0.6 + drift;
      const dx = jitterAround(jitterRand, p.x + ox, env.resonance.mid * 8 + 2);
      const dy = jitterAround(jitterRand, p.y + oy, env.resonance.mid * 8 + 2);
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = stroke.color;
      ctx.globalAlpha = (alphaBase + rand() * 0.05) * env.alpha;
      ctx.beginPath();
      ctx.ellipse(dx, dy, radius, radius * pickInRange(rand, 0.6, 1.4), rand() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  });
}

function renderInk(ctx, stroke, points, env) {
  if (!points.length) return;
  const rand = createSeededRandom(stroke.seed || 2);
  const mainWidth = stroke.size * 1.05;
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = env.alpha * 0.92;
  ctx.strokeStyle = stroke.color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  points.forEach((p, i) => {
    const v = velocityAt(points, i);
    const thickness = mainWidth * (0.9 + Math.sin((env.timeLimit + i * 30) * 0.002) * 0.08 + v * 0.3);
    ctx.lineWidth = Math.max(1, thickness);
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.stroke();

  ctx.globalAlpha = env.alpha * 0.55;
  for (let layer = 0; layer < 2; layer += 1) {
    ctx.beginPath();
    points.forEach((p, i) => {
      const speed = velocityAt(points, i) || 0.0001;
      const flow = (rand() - 0.5) * stroke.size * 0.8 + speed * stroke.size * 18 * (layer ? -1 : 1);
      const nx = p.x + flow * 0.4;
      const ny = p.y + flow * 0.1;
      const lw = Math.max(0.8, mainWidth * 0.35 + speed * stroke.size * 3);
      ctx.lineWidth = lw;
      if (i === 0) ctx.moveTo(nx, ny);
      else ctx.lineTo(nx, ny);
    });
    ctx.stroke();
  }
  ctx.restore();
}

function renderParticles(ctx, stroke, env) {
  if (!stroke.closedAt || !stroke.particles?.length) return;
  const now = env.timeLimit;
  if (now < stroke.closedAt) return;
  const localTime = (now - stroke.closedAt) / Math.max(1, env.duration);
  const angleStep = Math.PI * 2;
  ctx.save();
  ctx.beginPath();
  stroke.polygon.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.closePath();
  ctx.clip();

  stroke.particles.forEach((particle, idx) => {
    const phase = particle.phase + localTime * particle.speed * angleStep;
    const breathing = 1 + Math.sin(localTime * 2 * Math.PI + idx * 0.1) * 0.08;
    const px = particle.cx + Math.cos(phase) * particle.orbit * breathing;
    const py = particle.cy + Math.sin(phase * 1.05) * particle.orbit * breathing;
    ctx.beginPath();
    ctx.globalAlpha = env.alpha * particle.alpha;
    ctx.fillStyle = stroke.color;
    ctx.arc(px, py, particle.radius, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function renderEmoji(ctx, stroke, points, env) {
  points.forEach((p) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    const angle = (stroke.rotation || 0) + Math.sin(env.timeLimit * 0.002 + p.t * 0.01) * 0.03;
    ctx.rotate(angle);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${Math.max(12, stroke.size * 2.4)}px system-ui, Apple Color Emoji, Noto Color Emoji, sans-serif`;
    ctx.globalAlpha = env.alpha;
    ctx.fillText(stroke.emoji || '✨', 0, 0);
    ctx.restore();
  });
}

function renderText(ctx, stroke, points, env) {
  if (!stroke.text) return;
  const fontSize = Math.max(14, stroke.size * 2.2);
  points.forEach((p) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${fontSize}px 'Inter', 'Helvetica Neue', sans-serif`;
    ctx.fillStyle = stroke.color;
    ctx.globalAlpha = env.alpha;
    ctx.fillText(stroke.text, 0, 0);
    ctx.restore();
  });
}

function renderImageStamp(ctx, stroke, points, env) {
  if (!stroke.image || !stroke.image.complete) return;
  const r = stroke.size * 1.6;
  points.forEach((p) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((stroke.rotation || 0) * 0.2);
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.globalAlpha = env.alpha;
    ctx.drawImage(stroke.image, -r, -r, r * 2, r * 2);
    ctx.restore();

    if (stroke.outline) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.lineWidth = Math.max(1, stroke.size * 0.2);
      ctx.strokeStyle = stroke.color;
      ctx.globalAlpha = env.alpha * 0.9;
      ctx.stroke();
      ctx.restore();
    }
  });
}

function renderSoftEraser(ctx, stroke, points, env) {
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.lineCap = 'round';
  points.forEach((p) => {
    const passes = 2;
    for (let i = 0; i < passes; i += 1) {
      ctx.beginPath();
      const radius = stroke.size * (1 + i * 0.2);
      ctx.globalAlpha = env.alpha * 0.18;
      ctx.fillStyle = 'rgba(0,0,0,1)';
      ctx.arc(p.x + Math.sin(env.timeLimit * 0.001 + i) * 2, p.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  ctx.restore();
}

function renderEraser(ctx, stroke, points, env) {
  drawBasicStroke(ctx, points, {
    color: 'rgba(0,0,0,1)',
    size: stroke.size,
    compositeOperation: 'destination-out',
    jitter: 0,
  });
}

export const TOOL_RENDERERS = {
  pencil: (ctx, stroke, pts, env) => {
    drawBasicStroke(ctx, pts, {
      color: stroke.color,
      size: stroke.size,
      jitter: 1 + env.resonance.treble * 4,
      compositeOperation: 'source-over',
    });
  },
  brush: (ctx, stroke, pts, env) => {
    drawBasicStroke(ctx, pts, {
      color: stroke.color,
      size: stroke.size + env.resonance.bass * 20,
      jitter: env.resonance.treble * 4,
      shadowBlur: stroke.size / 2 + env.resonance.treble * 25,
      shadowColor: stroke.color,
    });
  },
  watercolor: renderWatercolor,
  ink: renderInk,
  'particle-fill': (ctx, stroke, pts, env) => renderParticles(ctx, stroke, env),
  'emoji-stamp': renderEmoji,
  text: renderText,
  'image-stamp': renderImageStamp,
  eraser: renderEraser,
  'soft-eraser': renderSoftEraser,
};

export function computeAlpha({ isGhost, presence, opacity }) {
  const liveAlpha = Math.min(1, 0.2 + presence * 0.9) * opacity;
  const ghostAlpha = (0.04 + presence * 0.08) * opacity;
  return isGhost ? ghostAlpha : liveAlpha;
}

export function prepareStrokePoints(stroke, timeLimit) {
  const pts = relevantPoints(stroke.points, timeLimit);
  if (stroke.tool === 'particle-fill' && stroke.closedAt && timeLimit >= stroke.closedAt) return stroke.polygon || pts;
  return pts;
}

export function isStampTool(tool) {
  return tool === 'emoji-stamp' || tool === 'text' || tool === 'image-stamp';
}

export function ensureStrokeSeed(stroke) {
  if (!stroke.seed) stroke.seed = Math.floor(Math.random() * 1_000_000_007);
  return stroke;
}

