'use client'

import React, { useEffect, useRef, useState, useCallback, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface MatrixRainProps {
  fontSize?: number;
  color?: string;
  characters?: string;
  fadeOpacity?: number;
  speed?: number;
}

const MatrixRain: React.FC<MatrixRainProps> = ({
  fontSize = 20,
  color = '#ffffff',
  characters = '01',
  fadeOpacity = 0.1,
  speed = 1
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const chars = characters.split('');
    const drops: number[] = [];
    const columnCount = Math.floor(canvas.width / fontSize);

    for (let i = 0; i < columnCount; i++) {
      drops[i] = Math.random() * -100;
    }

    const draw = () => {
      ctx.fillStyle = `rgba(0, 0, 0, ${fadeOpacity})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = color;
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += speed;
      }
    };

    const interval = setInterval(draw, 33 / speed);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [fontSize, color, characters, fadeOpacity, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full z-0"
    />
  );
};

interface AnimatedTextCycleProps {
  words: string[];
  interval?: number;
  className?: string;
}

const AnimatedTextCycle: React.FC<AnimatedTextCycleProps> = ({
  words,
  interval = 3000,
  className = "",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [width, setWidth] = useState("auto");
  const measureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (measureRef.current) {
      const elements = measureRef.current.children;
      if (elements.length > currentIndex) {
        const newWidth = elements[currentIndex].getBoundingClientRect().width;
        setWidth(`${newWidth}px`);
      }
    }
  }, [currentIndex]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, interval);

    return () => clearInterval(timer);
  }, [interval, words.length]);

  const containerVariants = {
    hidden: { 
      y: -20,
      opacity: 0,
      filter: "blur(8px)"
    },
    visible: {
      y: 0,
      opacity: 1,
      filter: "blur(0px)"
    },
    exit: { 
      y: 20,
      opacity: 0,
      filter: "blur(8px)"
    },
  };

  return (
    <>
      <div 
        ref={measureRef} 
        aria-hidden="true"
        className="absolute opacity-0 pointer-events-none"
        style={{ visibility: "hidden" }}
      >
        {words.map((word, i) => (
          <span key={i} className={`font-bold ${className}`}>
            {word}
          </span>
        ))}
      </div>

      <motion.span 
        className="relative inline-block"
        animate={{ 
          width,
          transition: { 
            type: "spring",
            stiffness: 150,
            damping: 15,
            mass: 1.2,
          }
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={currentIndex}
            className={`inline-block font-bold ${className}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ whiteSpace: "nowrap" }}
          >
            {words[currentIndex]}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </>
  );
};

interface Dot {
  x: number;
  y: number;
  baseOpacity: number;
  currentOpacity: number;
  opacitySpeed: number;
  baseRadius: number;
  currentRadius: number;
}

const GeometricGrid: React.FC = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const dotsRef = useRef<Dot[]>([]);
  const mousePositionRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });

  const DOT_SPACING = 30;
  const BASE_OPACITY_MIN = 0.1;
  const BASE_OPACITY_MAX = 0.3;
  const BASE_RADIUS = 1;
  const INTERACTION_RADIUS = 100;

  const handleMouseMove = useCallback((event: globalThis.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;
    mousePositionRef.current = { x: canvasX, y: canvasY };
  }, []);

  const createDots = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { width, height } = canvas;
    const newDots: Dot[] = [];
    const cols = Math.ceil(width / DOT_SPACING);
    const rows = Math.ceil(height / DOT_SPACING);

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * DOT_SPACING + DOT_SPACING / 2;
        const y = j * DOT_SPACING + DOT_SPACING / 2;
        const baseOpacity = Math.random() * (BASE_OPACITY_MAX - BASE_OPACITY_MIN) + BASE_OPACITY_MIN;
        
        newDots.push({
          x,
          y,
          baseOpacity,
          currentOpacity: baseOpacity,
          opacitySpeed: (Math.random() * 0.005) + 0.002,
          baseRadius: BASE_RADIUS,
          currentRadius: BASE_RADIUS,
        });
      }
    }
    dotsRef.current = newDots;
  }, []);

  const animateDots = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const dots = dotsRef.current;

    if (!ctx || !dots || !canvas) {
      animationFrameId.current = requestAnimationFrame(animateDots);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { x: mouseX, y: mouseY } = mousePositionRef.current;

    dots.forEach((dot) => {
      dot.currentOpacity += dot.opacitySpeed;
      if (dot.currentOpacity >= BASE_OPACITY_MAX || dot.currentOpacity <= BASE_OPACITY_MIN) {
        dot.opacitySpeed = -dot.opacitySpeed;
        dot.currentOpacity = Math.max(BASE_OPACITY_MIN, Math.min(dot.currentOpacity, BASE_OPACITY_MAX));
      }

      let interactionFactor = 0;
      dot.currentRadius = dot.baseRadius;

      if (mouseX !== null && mouseY !== null) {
        const dx = dot.x - mouseX;
        const dy = dot.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < INTERACTION_RADIUS) {
          interactionFactor = Math.max(0, 1 - distance / INTERACTION_RADIUS);
          interactionFactor = interactionFactor * interactionFactor;
        }
      }

      const finalOpacity = Math.min(1, dot.currentOpacity + interactionFactor * 0.7);
      dot.currentRadius = dot.baseRadius + interactionFactor * 3;

      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`;
      ctx.arc(dot.x, dot.y, dot.currentRadius, 0, Math.PI * 2);
      ctx.fill();
    });

    animationFrameId.current = requestAnimationFrame(animateDots);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createDots();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);

    animationFrameId.current = requestAnimationFrame(animateDots);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [createDots, handleMouseMove, animateDots]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-10 pointer-events-none"
    />
  );
});

const PulsingElement: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = memo(({ 
  children, 
  className = "", 
  delay = 0 
}) => {
  return (
    <motion.div
      className={className}
      animate={{
        scale: [1, 1.02, 1],
        opacity: [0.8, 1, 0.8],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
});

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">


      {/* Geometric Grid Overlay */}
      <GeometricGrid />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 z-20" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 z-20" />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 z-20 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Main Content */}
      <div className="relative z-30 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 50 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-center max-w-6xl mx-auto"
        >
          {/* Main Headline */}
          <motion.h1 
            className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 leading-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.8 }}
          >
            <PulsingElement delay={0}>
              <span className="block bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
                DISCOVER
              </span>
            </PulsingElement>
            <PulsingElement delay={0.5}>
              <span className="block bg-gradient-to-r from-gray-300 via-white to-gray-300 bg-clip-text text-transparent">
                ELECTRONIC
              </span>
            </PulsingElement>
            <PulsingElement delay={1}>
              <span className="block bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
                MUSIC
              </span>
            </PulsingElement>
          </motion.h1>

          {/* Animated Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            className="text-xl md:text-2xl lg:text-3xl font-light mb-12 text-gray-300"
          >
            <span>Connect with venues, events, and artists in the </span>
            <AnimatedTextCycle 
              words={["global underground scene", "electronic music world", "music community", "digital sound space"]}
              className="text-white font-bold"
              interval={2500}
            />
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Link href="/explore">
              <motion.button
                className="group relative px-8 py-4 bg-white text-black font-bold text-lg border-2 border-white overflow-hidden uppercase tracking-wider"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-black"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "0%" }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                  START EXPLORING
                </span>
              </motion.button>
            </Link>

            <Link href="/auth/register">
              <motion.button
                className="group relative px-8 py-4 border-2 border-white text-white font-bold text-lg bg-transparent overflow-hidden uppercase tracking-wider"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-white"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "0%" }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10 group-hover:text-black transition-colors duration-300">
                  JOIN COMMUNITY
                </span>
              </motion.button>
            </Link>
          </motion.div>

          {/* Geometric Decorations */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 2.5 }}
            className="mt-16 flex justify-center space-x-8"
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-white"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* Bottom Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 3 }}
          className="absolute bottom-8 left-0 right-0 flex justify-center"
        >
          <div className="flex space-x-8 text-sm font-mono uppercase tracking-wider">
            <Link href="/artists">
              <motion.span 
                className="text-gray-400 hover:text-white transition-colors border-b border-transparent hover:border-white pb-1 cursor-pointer"
                whileHover={{ y: -2 }}
              >
                Artists
              </motion.span>
            </Link>
            <Link href="/events">
              <motion.span 
                className="text-gray-400 hover:text-white transition-colors border-b border-transparent hover:border-white pb-1 cursor-pointer"
                whileHover={{ y: -2 }}
              >
                Events
              </motion.span>
            </Link>
            <Link href="/venues">
              <motion.span 
                className="text-gray-400 hover:text-white transition-colors border-b border-transparent hover:border-white pb-1 cursor-pointer"
                whileHover={{ y: -2 }}
              >
                Venues
              </motion.span>
            </Link>
            <Link href="/explore">
              <motion.span 
                className="text-gray-400 hover:text-white transition-colors border-b border-transparent hover:border-white pb-1 cursor-pointer"
                whileHover={{ y: -2 }}
              >
                Explore
              </motion.span>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Corner Decorations */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 3.5 }}
        className="absolute top-4 left-4 z-30 w-16 h-16 border-l-2 border-t-2 border-white"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 3.7 }}
        className="absolute top-4 right-4 z-30 w-16 h-16 border-r-2 border-t-2 border-white"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 3.9 }}
        className="absolute bottom-4 left-4 z-30 w-16 h-16 border-l-2 border-b-2 border-white"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 4.1 }}
        className="absolute bottom-4 right-4 z-30 w-16 h-16 border-r-2 border-b-2 border-white"
      />
    </div>
  );
}
