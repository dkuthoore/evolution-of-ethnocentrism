import { useRef, useEffect, useCallback } from 'react';
import type { RefObject } from 'react';
import { useReducedMotion } from 'framer-motion';
import { STRATEGY_COLORS } from '../lib/constants';

const PIP_COLORS: string[] = [
  STRATEGY_COLORS.altruist,
  STRATEGY_COLORS.ethnocentric,
  STRATEGY_COLORS.egoist,
  STRATEGY_COLORS.traitor,
];

const PIP_RADIUS = 12;
const MOUSE_RADIUS = 140;
const MOUSE_STRENGTH = 0.85;
const MAX_SPEED = 2.2;
const BOUNCE_DAMP = 0.98;
const OBSTACLE_PADDING = 4;

interface Pip {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

function drawPipBlob(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.9, r * 1.05, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath();
  ctx.ellipse(x - r * 0.2, y - r * 0.3, r * 0.35, r * 0.25, -0.3, 0, Math.PI * 2);
  ctx.fill();
}

type ObstacleRect = { left: number; top: number; right: number; bottom: number };

function resolveObstacle(
  p: Pip,
  rect: ObstacleRect
): void {
  const left = rect.left;
  const right = rect.right;
  const top = rect.top;
  const bottom = rect.bottom;
  const cx = Math.max(left, Math.min(right, p.x));
  const cy = Math.max(top, Math.min(bottom, p.y));
  const dx = p.x - cx;
  const dy = p.y - cy;
  const distSq = dx * dx + dy * dy;
  const r = PIP_RADIUS;
  if (distSq < r * r) {
    if (distSq > 0) {
      const dist = Math.sqrt(distSq);
      const nx = dx / dist;
      const ny = dy / dist;
      p.x = cx + nx * r;
      p.y = cy + ny * r;
      const dot = p.vx * nx + p.vy * ny;
      p.vx = (p.vx - 2 * dot * nx) * BOUNCE_DAMP;
      p.vy = (p.vy - 2 * dot * ny) * BOUNCE_DAMP;
    } else {
      const toLeft = p.x - left;
      const toRight = right - p.x;
      const toTop = p.y - top;
      const toBottom = bottom - p.y;
      const minHoriz = Math.min(toLeft, toRight);
      const minVert = Math.min(toTop, toBottom);
      if (minHoriz < minVert) {
        p.x = toLeft < toRight ? left - r : right + r;
        p.vx = -p.vx * BOUNCE_DAMP;
      } else {
        p.y = toTop < toBottom ? top - r : bottom + r;
        p.vy = -p.vy * BOUNCE_DAMP;
      }
    }
  }
}

export function PipBackground({ obstacleRefs }: { obstacleRefs?: RefObject<HTMLElement | null>[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pipsRef = useRef<Pip[]>([]);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number>(0);
  const reducedMotion = useReducedMotion();

  const initPips = useCallback((width: number, height: number): Pip[] => {
    const count = 64;
    const pips: Pip[] = [];
    for (let i = 0; i < count; i++) {
      pips.push({
        x: PIP_RADIUS + Math.random() * (width - 2 * PIP_RADIUS),
        y: PIP_RADIUS + Math.random() * (height - 2 * PIP_RADIUS),
        vx: (Math.random() - 0.5) * 1.4,
        vy: (Math.random() - 0.5) * 1.4,
        color: PIP_COLORS[i % PIP_COLORS.length]!,
      });
    }
    return pips;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reducedMotion) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setSize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      if (pipsRef.current.length === 0) {
        pipsRef.current = initPips(w, h);
      } else {
        pipsRef.current = pipsRef.current.map((p) => ({
          ...p,
          x: Math.max(PIP_RADIUS, Math.min(w - PIP_RADIUS, p.x)),
          y: Math.max(PIP_RADIUS, Math.min(h - PIP_RADIUS, p.y)),
        }));
      }
    };

    setSize();
    window.addEventListener('resize', setSize);

    const loop = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const mouse = mouseRef.current;
      const pips = pipsRef.current;
      const obstacleRects: ObstacleRect[] = [];
      if (obstacleRefs) {
        for (const ref of obstacleRefs) {
          const el = ref?.current;
          if (el) {
            const r = el.getBoundingClientRect();
            obstacleRects.push({
              left: r.left - OBSTACLE_PADDING,
              top: r.top - OBSTACLE_PADDING,
              right: r.right + OBSTACLE_PADDING,
              bottom: r.bottom + OBSTACLE_PADDING,
            });
          }
        }
      }

      for (let i = 0; i < pips.length; i++) {
        const p = pips[i]!;
        let { vx, vy } = p;

        if (mouse) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < MOUSE_RADIUS && dist > 0) {
            const f = (1 - dist / MOUSE_RADIUS) * MOUSE_STRENGTH;
            vx += (dx / dist) * f;
            vy += (dy / dist) * f;
          }
        }

        const speed = Math.hypot(vx, vy);
        if (speed > MAX_SPEED) {
          const s = MAX_SPEED / speed;
          vx *= s;
          vy *= s;
        }

        p.vx = vx;
        p.vy = vy;
        p.x += vx;
        p.y += vy;

        if (p.x <= PIP_RADIUS) {
          p.x = PIP_RADIUS;
          p.vx = Math.abs(p.vx) * BOUNCE_DAMP;
        }
        if (p.x >= w - PIP_RADIUS) {
          p.x = w - PIP_RADIUS;
          p.vx = -Math.abs(p.vx) * BOUNCE_DAMP;
        }
        if (p.y <= PIP_RADIUS) {
          p.y = PIP_RADIUS;
          p.vy = Math.abs(p.vy) * BOUNCE_DAMP;
        }
        if (p.y >= h - PIP_RADIUS) {
          p.y = h - PIP_RADIUS;
          p.vy = -Math.abs(p.vy) * BOUNCE_DAMP;
        }

        for (const rect of obstacleRects) {
          resolveObstacle(p, rect);
        }

        drawPipBlob(ctx, p.x, p.y, PIP_RADIUS, p.color);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', setSize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [reducedMotion, initPips, obstacleRefs]);

  useEffect(() => {
    if (reducedMotion) return;
    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onLeave = () => {
      mouseRef.current = null;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden
    />
  );
}
