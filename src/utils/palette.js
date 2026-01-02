export const TOOL_COLORS = ['#1e293b', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#facc15'];

export function isPresetColor(value) {
  if (!value) return false;
  return TOOL_COLORS.some((color) => color.toLowerCase() === value.toLowerCase());
}
