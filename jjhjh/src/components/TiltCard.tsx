/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useCallback } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'motion/react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  scale?: number;
  glassEffect?: boolean;
  glareEffect?: boolean;
  glareOpacity?: number;
  darkMode?: boolean;
  borderGlow?: 'cyan' | 'blue' | 'rose' | 'amber' | 'emerald' | 'indigo' | 'none';
  id?: string;
  onClick?: () => void;
}

export default function TiltCard({
  children,
  className = '',
  maxTilt = 10,
  scale = 1.02,
  glassEffect = true,
  glareEffect = true,
  glareOpacity = 0.18,
  darkMode = true,
  borderGlow = 'blue',
  id,
  onClick
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse position normalized (-0.5 to +0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Glare position in percentages (0 to 100)
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });

  // Spring physics for smooth tilt
  const springConfig = { damping: 20, stiffness: 220, mass: 0.6 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [maxTilt, -maxTilt]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-maxTilt, maxTilt]), springConfig);
  const cardScale = useSpring(isHovered ? scale : 1, springConfig);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Normalized [-0.5, 0.5]
    const normX = (x / rect.width) - 0.5;
    const normY = (y / rect.height) - 0.5;

    mouseX.set(normX);
    mouseY.set(normY);

    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100
    });
  }, [mouseX, mouseY]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
    setGlarePos({ x: 50, y: 50 });
  };

  // Border glow styles
  const getGlowStyles = () => {
    switch (borderGlow) {
      case 'cyan':
        return isHovered 
          ? 'border-cyan-400/60 shadow-[0_15px_35px_-5px_rgba(6,182,212,0.25)]' 
          : 'border-cyan-500/20 hover:border-cyan-500/40';
      case 'rose':
        return isHovered 
          ? 'border-rose-400/60 shadow-[0_15px_35px_-5px_rgba(244,63,94,0.25)]' 
          : 'border-rose-500/20 hover:border-rose-500/40';
      case 'amber':
        return isHovered 
          ? 'border-amber-400/60 shadow-[0_15px_35px_-5px_rgba(245,158,11,0.25)]' 
          : 'border-amber-500/20 hover:border-amber-500/40';
      case 'emerald':
        return isHovered 
          ? 'border-emerald-400/60 shadow-[0_15px_35px_-5px_rgba(16,185,129,0.25)]' 
          : 'border-emerald-500/20 hover:border-emerald-500/40';
      case 'indigo':
        return isHovered 
          ? 'border-indigo-400/60 shadow-[0_15px_35px_-5px_rgba(99,102,241,0.25)]' 
          : 'border-indigo-500/20 hover:border-indigo-500/40';
      case 'blue':
      default:
        return isHovered 
          ? 'border-blue-400/60 shadow-[0_15px_35px_-5px_rgba(59,130,246,0.25)]' 
          : 'border-blue-500/20 hover:border-blue-500/40';
    }
  };

  const glassBgClass = darkMode
    ? 'bg-slate-900/65 backdrop-blur-xl text-white'
    : 'bg-white/80 backdrop-blur-xl text-slate-900 shadow-xl shadow-slate-200/50';

  return (
    <div
      style={{ perspective: 1200 }}
      className="relative will-change-transform"
      id={id ? `${id}-wrapper` : undefined}
    >
      <motion.div
        ref={cardRef}
        id={id}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          scale: cardScale,
          transformStyle: 'preserve-3d',
        }}
        className={`relative rounded-3xl border transition-[border-color,box-shadow] duration-300 overflow-hidden ${
          glassEffect ? glassBgClass : ''
        } ${getGlowStyles()} ${className}`}
      >
        {/* Subtle dynamic glass specular glare highlight that follows mouse */}
        {glareEffect && isHovered && (
          <div
            className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-300 mix-blend-overlay"
            style={{
              background: `radial-gradient(circle 320px at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, ${glareOpacity}), transparent 75%)`,
            }}
          />
        )}

        {/* Ambient Top Subtle Rim Light */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none z-20" />

        {/* Content with 3D child preservation */}
        <div className="relative z-10 w-full h-full" style={{ transform: 'translateZ(10px)' }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
