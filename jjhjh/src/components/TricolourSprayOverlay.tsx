/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Sparkles, Zap } from 'lucide-react';

interface TricolourSprayOverlayProps {
  triggerKey: string | number;
  toolName?: string;
}

// Particle interface for modern cyber pulse wave
interface CyberParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  rotation: number;
  vRot: number;
}

const CYBER_PALETTE = ['#38BDF8', '#818CF8', '#34D399', '#60A5FA', '#A78BFA', '#22D3EE'];

export default function TricolourSprayOverlay({ triggerKey, toolName }: TricolourSprayOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [activeToolTitle, setActiveToolTitle] = useState('');

  // Subtle clean harmonic chime sound
  const playChimeAudio = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.32);
    } catch (e) {
      // Audio autoplay restrictions safeguard
    }
  };

  useEffect(() => {
    if (!triggerKey) return;

    setIsActive(true);
    setActiveToolTitle(toolName || 'SafeTour AI');
    playChimeAudio();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const originX = width - 40;
    const originY = 30;

    const particles: CyberParticle[] = [];
    const rand = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

    for (let i = 0; i < 70; i++) {
      const angle = (Math.random() * 90 + 135) * (Math.PI / 180);
      const speed = Math.random() * 14 + 5;

      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 5 + 2,
        color: rand(CYBER_PALETTE),
        alpha: 1,
        decay: Math.random() * 0.03 + 0.02,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.1,
      });
    }

    let animationFrameId: number;
    let startTime = performance.now();

    const render = (time: number) => {
      const elapsed = time - startTime;
      ctx.clearRect(0, 0, width, height);

      let activeCount = 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.alpha <= 0) continue;

        activeCount++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.vx *= 0.98;
        p.alpha -= p.decay;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (activeCount > 0 && elapsed < 800) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        setIsActive(false);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    const timer = setTimeout(() => {
      setIsActive(false);
    }, 700);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timer);
    };
  }, [triggerKey, toolName]);

  return (
    <AnimatePresence>
      {isActive && (
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
          />

          {/* Sleek ambient cyber glow wave */}
          <motion.div
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: [0, 2, 3], opacity: [0.8, 0.4, 0] }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ transformOrigin: 'top right' }}
            className="absolute top-0 right-0 h-64 w-64 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-400 blur-2xl opacity-60"
          />

          {/* Minimalist Top HUD Pill */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: [0, 1, 1, 0], y: [-20, 12, 12, -10], scale: [0.95, 1, 1, 0.98] }}
            transition={{ duration: 0.7, times: [0, 0.2, 0.8, 1] }}
            className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2.5 rounded-2xl bg-slate-950/90 border border-slate-700/80 px-4 py-2 shadow-2xl backdrop-blur-md text-white"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-md">
              <Zap className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400">
                SafeTour Telemetry
              </span>
              <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <span>{activeToolTitle}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
