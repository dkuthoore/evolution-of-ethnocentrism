/**
 * Lightweight particle system for cooperation lines, +/- numbers, reproduction pop, death puff.
 */

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  text?: string;
  color: string;
  lifetime: number;
  createdAt: number;
  type: 'number' | 'line' | 'pop' | 'puff' | 'flow';
  /** For lines: end coords. For flow: destination. */
  ex?: number;
  ey?: number;
  /** Delay (ms) before particle becomes active. */
  delay?: number;
}

export interface SpawnCooperationOpts {
  numberLifetime?: number;
  numberVy?: number;
  lineLifetime?: number;
  spawnFlow?: boolean;
  /** Vertical offset for number particles (positive = above cell center). */
  numberOffsetY?: number;
  /** Whether to spawn the line between giver and receiver (default true). */
  spawnLine?: boolean;
  /** Delay (ms) before number particles appear (so flow can complete first). */
  numberDelayMs?: number;
  /** Text shown at receiver (default '+3%'). */
  receiverText?: string;
  /** Text shown at giver (default '-1%'). */
  giverText?: string;
  /** If false, only spawn line and flow particles, not the +/- number particles (default true). */
  spawnNumbers?: boolean;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private readonly maxParticles = 200;

  spawn(particle: Omit<Particle, 'createdAt'>): void {
    if (this.particles.length >= this.maxParticles) return;
    this.particles.push({
      ...particle,
      createdAt: performance.now(),
    });
  }

  spawnCooperation(
    giverX: number,
    giverY: number,
    receiverX: number,
    receiverY: number,
    cellW: number,
    cellH: number,
    color: string,
    opts?: SpawnCooperationOpts
  ): void {
    const gx = giverX + cellW / 2;
    const gy = giverY + cellH / 2;
    const rx = receiverX + cellW / 2;
    const ry = receiverY + cellH / 2;

    const lineLifetime = opts?.lineLifetime ?? 400;
    const numberLifetime = opts?.numberLifetime ?? 800;
    const numberVy = opts?.numberVy ?? -0.5;
    const numberOffsetY = opts?.numberOffsetY ?? 0;
    const spawnLine = opts?.spawnLine ?? true;
    const numberDelayMs = opts?.numberDelayMs ?? 0;
    const spawnNumbers = opts?.spawnNumbers !== false;
    const receiverText = opts?.receiverText ?? '+3%';
    const giverText = opts?.giverText ?? '-1%';

    if (spawnLine) {
      this.spawn({
        x: gx,
        y: gy,
        vx: 0,
        vy: 0,
        ex: rx,
        ey: ry,
        color,
        lifetime: lineLifetime,
        type: 'line',
      });
    }
    if (spawnNumbers) {
      this.spawn({
        x: rx,
        y: ry - numberOffsetY,
        vx: 0,
        vy: numberVy,
        text: receiverText,
        color: '#22c55e',
        lifetime: numberLifetime,
        type: 'number',
        delay: numberDelayMs,
      });
      this.spawn({
        x: gx,
        y: gy - numberOffsetY,
        vx: 0,
        vy: numberVy,
        text: giverText,
        color: '#ef4444',
        lifetime: numberLifetime,
        type: 'number',
        delay: numberDelayMs,
      });
    }

    if (opts?.spawnFlow) {
      for (let i = 0; i < 5; i++) {
        this.spawn({
          x: gx,
          y: gy,
          vx: 0,
          vy: 0,
          ex: rx,
          ey: ry,
          color,
          lifetime: 1400,
          type: 'flow',
        });
      }
    }
  }

  spawnReproduction(x: number, y: number, cellW: number, cellH: number, color: string): void {
    const cx = x + cellW / 2;
    const cy = y + cellH / 2;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      this.spawn({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * 2,
        vy: Math.sin(angle) * 2 - 1,
        color,
        lifetime: 300,
        type: 'pop',
      });
    }
  }

  spawnDeath(x: number, y: number, cellW: number, cellH: number): void {
    const cx = x + cellW / 2;
    const cy = y + cellH / 2;
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      this.spawn({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * 0.5,
        vy: Math.sin(angle) * 0.5 - 0.3,
        color: 'rgba(120,120,120,0.8)',
        lifetime: 500,
        type: 'puff',
      });
    }
  }

  update(now: number): void {
    this.particles = this.particles.filter((p) => {
      const age = now - p.createdAt;
      const totalLifetime = p.lifetime + (p.delay ?? 0);
      return age < totalLifetime;
    });
  }

  private getParticlePos(p: Particle, now: number): { x: number; y: number } {
    const age = now - p.createdAt;
    const effectiveAge = Math.max(0, age - (p.delay ?? 0));
    if (p.type === 'flow' && p.ex !== undefined && p.ey !== undefined) {
      const progress = Math.min(1, age / p.lifetime);
      return {
        x: p.x + (p.ex - p.x) * progress,
        y: p.y + (p.ey - p.y) * progress,
      };
    }
    const t = effectiveAge / 16; // Normalize to ~60fps frames
    return {
      x: p.x + p.vx * t,
      y: p.y + p.vy * t,
    };
  }

  render(ctx: CanvasRenderingContext2D, now: number, cellW: number, cellH: number): void {
    const baseAlpha = 0.9;
    for (const p of this.particles) {
      const age = now - p.createdAt;
      const effectiveAge = Math.max(0, age - (p.delay ?? 0));
      if (effectiveAge >= p.lifetime) continue; // Already expired (filter may not have run yet)
      if (p.delay !== undefined && p.delay > 0 && age < p.delay) continue; // Not started yet
      const life = 1 - effectiveAge / p.lifetime;
      const alpha = baseAlpha * life;
      const pos = this.getParticlePos(p, now);

      ctx.save();
      ctx.globalAlpha = alpha;

      switch (p.type) {
        case 'line':
          if (p.ex !== undefined && p.ey !== undefined) {
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 2;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.ex, p.ey);
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
          break;
        case 'number':
          ctx.fillStyle = p.color;
          ctx.font = `bold ${Math.min(cellW, cellH) * 0.35}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          if (p.text) ctx.fillText(p.text, pos.x, pos.y);
          break;
        case 'pop':
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'puff':
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 4 * life, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'flow':
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          break;
        default:
          break;
      }

      ctx.restore();
    }
  }

  clear(): void {
    this.particles = [];
  }
}
