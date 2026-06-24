'use client';

import { useEffect, useRef } from 'react';

interface Petal {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  opacity: number;
  color: string;
  phase: number;
  phaseSpeed: number;
}

const COLORS: Array<[number, number, number]> = [
  [233, 30, 140],
  [255, 107, 179],
  [255, 182, 193],
  [253, 168, 212],
  [255, 105, 180],
  [194, 23, 122],
];

export default function PetalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let running = true;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const COUNT = Math.max(18, Math.min(40, Math.floor(window.innerWidth / 30)));
    const petals: Petal[] = [];

    const mkPetal = (initY?: number): Petal => {
      const [r, g, b] = COLORS[Math.floor(Math.random() * COLORS.length)];
      return {
        x: Math.random() * window.innerWidth,
        y: initY ?? -(Math.random() * 150),
        vx: (Math.random() - 0.5) * 0.4,
        vy: Math.random() * 0.9 + 0.35,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.045,
        size: Math.random() * 9 + 5,
        opacity: Math.random() * 0.38 + 0.12,
        color: `rgba(${r},${g},${b},`,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: Math.random() * 0.013 + 0.004,
      };
    };

    for (let i = 0; i < COUNT; i++) {
      petals.push(mkPetal(Math.random() * window.innerHeight));
    }

    const drawPetal = (p: Petal) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;

      const s = p.size;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 0.75, -s * 0.35, s * 0.75, s * 0.5, 0, s);
      ctx.bezierCurveTo(-s * 0.75, s * 0.5, -s * 0.75, -s * 0.35, 0, -s);

      const grad = ctx.createRadialGradient(0, -s * 0.15, 0, 0, 0, s);
      grad.addColorStop(0, `${p.color}1)`);
      grad.addColorStop(1, `${p.color}0.25)`);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    };

    const tick = () => {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        p.phase += p.phaseSpeed;
        p.x += p.vx + Math.sin(p.phase) * 0.65;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        drawPetal(p);
        if (p.y > canvas.height + 24) {
          petals[i] = mkPetal();
        }
      }
      animId = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      running = false;
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none select-none"
      style={{ zIndex: 5 }}
      aria-hidden="true"
    />
  );
}
