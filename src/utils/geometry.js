export function isPointNear(a, b, threshold) {
  return Math.hypot(a.x - b.x, a.y - b.y) <= threshold;
}

export function polygonArea(points = []) {
  if (points.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < points.length; i += 1) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y - points[j].y * points[i].x;
  }
  return Math.abs(area / 2);
}

export function isClosedShape(points = [], threshold = 10) {
  if (points.length < 3) return false;
  return isPointNear(points[0], points[points.length - 1], threshold) && polygonArea(points) > 5;
}

export function centroid(points = []) {
  if (!points.length) return { x: 0, y: 0 };
  const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
  return { x: sum.x / points.length, y: sum.y / points.length };
}

