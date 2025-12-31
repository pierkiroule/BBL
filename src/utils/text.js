export function sanitizeText(input) {
  if (typeof input !== 'string') return '';
  return input.replace(/[\r\n\t]+/g, ' ').trim().slice(0, 120);
}

