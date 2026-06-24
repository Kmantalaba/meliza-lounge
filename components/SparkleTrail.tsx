'use client';

import { useEffect, useRef } from 'react';

interface Spark {
  x: number;
  y: number;
  size: number;
  rotation: number;
  life: number;
  maxLife: number;
  vy: number;
  color: string;
}

const COLORS = ['#E91E8C', '#FF6BB3', '#FFB6C1', '#C2177A', '#FF69B4', '#FDE8F3'];

export default function SparkleTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(hover: none)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let running = true;
    const sparks: Spark[] = [];
    const mouse = { x: -9999, y: -9999, active: false };
    let frame = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    const drawStar = (x: number, y: number, r: number, rot: number, alpha: number, color: string) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      for (let j = 0; j < 8; j++) {
        const angle = (j * Math.PI) / 4;
        const len = j % 2 === 0 ? r : r * 0.38;
        const px = Math.cos(angle - Math.PI / 2) * len;
        const py = Math.sin(angle - Math.PI / 2) * len;
        if (j === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const tick = () => {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      if (frame % 3 === 0 && mouse.active && sparks.length < 80) {
        sparks.push({
          x: mouse.x + (Math.random() - 0.5) * 18,
          y: mouse.y + (Math.random() - 0.5) * 18,
          size: Math.random() * 7 + 3,
          rotation: Math.random() * Math.PI,
          life: 0,
          maxLife: 38 + Math.random() * 22,
          vy: -(Math.random() * 1.4 + 0.3),
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        });
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life++;
        if (s.life >= s.maxLife) { sparks.splice(i, 1); continue; }
        const t = s.life / s.maxLife;
        const scale = t < 0.25 ? t / 0.25 : 1 - (t - 0.25) / 0.75;
        s.y += s.vy;
        s.rotation += 0.09;
        drawStar(s.x, s.y, s.size * scale, s.rotation, (1 - t) * 0.88, s.color);
      }

      animId = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      running = false;
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none select-none"
      style={{ zIndex: 48 }}
      aria-hidden="true"
    />
  );
}
