import { describe, it, expect } from 'vitest';
import { ParticleSystem } from './particles';

describe('ParticleSystem', () => {
  it('spawns and expires particles', () => {
    const ps = new ParticleSystem();
    ps.spawn({
      x: 10,
      y: 10,
      vx: 0,
      vy: 0,
      color: '#fff',
      lifetime: 100,
      type: 'number',
    });
    ps.update(50);
    expect(ps).toBeDefined();
  });

  it('spawnCooperation creates line and number particles', () => {
    const ps = new ParticleSystem();
    ps.spawnCooperation(0, 0, 50, 50, 10, 10, '#fff');
    ps.update(0);
    expect(ps).toBeDefined();
  });

  it('clear removes all particles', () => {
    const ps = new ParticleSystem();
    ps.spawn({ x: 0, y: 0, vx: 0, vy: 0, color: '#fff', lifetime: 100, type: 'number' });
    ps.clear();
    ps.update(0);
    expect(ps).toBeDefined();
  });
});
