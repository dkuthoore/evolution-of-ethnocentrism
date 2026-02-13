/**
 * Convert canvas mouse event to grid cell index.
 */
export function getGridIndexFromMouse(
  event: { clientX: number; clientY: number },
  canvas: HTMLCanvasElement,
  gridW: number,
  gridH: number
): { x: number; y: number; idx: number } | null {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const canvasX = (event.clientX - rect.left) * scaleX;
  const canvasY = (event.clientY - rect.top) * scaleY;
  const cellW = canvas.width / gridW;
  const cellH = canvas.height / gridH;
  const x = Math.floor(canvasX / cellW);
  const y = Math.floor(canvasY / cellH);
  if (x >= 0 && x < gridW && y >= 0 && y < gridH) {
    return { x, y, idx: y * gridW + x };
  }
  return null;
}
