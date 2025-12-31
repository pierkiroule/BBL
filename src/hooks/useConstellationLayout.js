import { useEffect, useMemo, useRef, useState } from 'react';

const BASE_DISTANCE = 180;
const REPULSION_RADIUS = 120;
const CENTERING_FORCE = 0.02;
const DAMPING = 0.92;

function buildLinks(items) {
  const links = [];
  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      const tagsA = items[i]?.tags || [];
      const tagsB = items[j]?.tags || [];
      const common = tagsA.filter((tag) => tagsB.includes(tag));
      if (common.length > 0) {
        links.push({
          source: items[i].id,
          target: items[j].id,
          weight: common.length,
        });
      }
    }
  }
  return links;
}

function initNodes(items, width, height) {
  const cx = width / 2;
  const cy = height / 2;
  return items.map((item, index) => ({
    id: item.id,
    title: item.title,
    tags: item.tags,
    data: item,
    x: cx + Math.cos((index / items.length) * Math.PI * 2) * 120 + (Math.random() - 0.5) * 40,
    y: cy + Math.sin((index / items.length) * Math.PI * 2) * 120 + (Math.random() - 0.5) * 40,
    vx: 0,
    vy: 0,
  }));
}

export function useConstellationLayout({ items, width = 720, height = 520 }) {
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const nodesRef = useRef([]);
  const linksRef = useRef([]);
  const sizeRef = useRef({ width, height });

  useEffect(() => {
    sizeRef.current = { width, height };
  }, [width, height]);

  useEffect(() => {
    const preparedNodes = initNodes(items, width, height);
    const preparedLinks = buildLinks(items);
    setNodes(preparedNodes);
    nodesRef.current = preparedNodes;
    setLinks(preparedLinks);
    linksRef.current = preparedLinks;
  }, [items, width, height]);

  useEffect(() => {
    let frame;
    let lastUpdate = performance.now();

    const step = () => {
      const now = performance.now();
      const dt = Math.min(1, (now - lastUpdate) / 16);
      lastUpdate = now;
      const currentNodes = nodesRef.current;
      const currentLinks = linksRef.current;
      const { width: w, height: h } = sizeRef.current;
      const cx = w / 2;
      const cy = h / 2;

      // reset velocities slightly towards center
      currentNodes.forEach((node) => {
        const dxCenter = cx - node.x;
        const dyCenter = cy - node.y;
        node.vx += dxCenter * CENTERING_FORCE * dt;
        node.vy += dyCenter * CENTERING_FORCE * dt;
      });

      // attraction based on shared tags
      currentLinks.forEach((link) => {
        const source = currentNodes.find((n) => n.id === link.source);
        const target = currentNodes.find((n) => n.id === link.target);
        if (!source || !target) return;
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.max(16, Math.hypot(dx, dy));
        const desired = BASE_DISTANCE / Math.max(1, link.weight);
        const strength = 0.0018 * link.weight;
        const force = (dist - desired) * strength * dt;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        source.vx += fx;
        source.vy += fy;
        target.vx -= fx;
        target.vy -= fy;
      });

      // repulsion to avoid overlap
      for (let i = 0; i < currentNodes.length; i += 1) {
        for (let j = i + 1; j < currentNodes.length; j += 1) {
          const a = currentNodes[i];
          const b = currentNodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const distSq = dx * dx + dy * dy;
          if (distSq === 0) continue;
          const dist = Math.sqrt(distSq);
          if (dist < REPULSION_RADIUS) {
            const strength = (1 - dist / REPULSION_RADIUS) * 0.015 * dt;
            const fx = (dx / dist) * strength;
            const fy = (dy / dist) * strength;
            a.vx -= fx;
            a.vy -= fy;
            b.vx += fx;
            b.vy += fy;
          }
        }
      }

      // integrate
      currentNodes.forEach((node) => {
        node.vx *= DAMPING;
        node.vy *= DAMPING;
        node.x += node.vx;
        node.y += node.vy;
        node.x = Math.max(40, Math.min(w - 40, node.x));
        node.y = Math.max(40, Math.min(h - 40, node.y));
      });

      // throttle render
      setNodes([...currentNodes]);
      frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, []);

  return useMemo(
    () => ({
      nodes,
      links,
    }),
    [links, nodes]
  );
}
