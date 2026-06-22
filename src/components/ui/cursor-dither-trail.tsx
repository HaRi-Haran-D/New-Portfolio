import React, { useEffect, useRef } from "react";

interface CursorDitherTrailProps {
  trailColor?: string;
  dotSize?: number;
  fadeDuration?: number;
  className?: string;
}

export function CursorDitherTrail({
  trailColor = "#D0FBB6",
  dotSize = 4,
  fadeDuration = 600,
  className = "w-full h-full",
}: CursorDitherTrailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.clientWidth;
    let height = canvas.clientHeight;
    canvas.width = width;
    canvas.height = height;

    const onResize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", onResize);

    const int = parseInt(trailColor.replace("#", ""), 16);
    const r = (int >> 16) & 255;
    const g = (int >> 8) & 255;
    const b = int & 255;

    const bayer = [0, 2, 3, 1];

    const paintDot = (x: number, y: number) => {
      const threshold = bayer[(x / dotSize + y / dotSize) % 4] / 4;
      const alpha = Math.random() > threshold ? 1 : 0;
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.fillRect(x, y, dotSize, dotSize);
    };

    let lastTime = performance.now();
    const fadeStep = () => {
      const now = performance.now();
      const delta = now - lastTime;
      lastTime = now;
      const fadeAlpha = delta / fadeDuration;
      ctx.fillStyle = `rgba(0,0,0,${fadeAlpha})`;
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";
      requestAnimationFrame(fadeStep);
    };
    requestAnimationFrame(fadeStep);

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / dotSize) * dotSize;
      const y = Math.floor((e.clientY - rect.top) / dotSize) * dotSize;
      paintDot(x, y);
    };
    window.addEventListener("mousemove", onMove);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
    };
  }, [trailColor, dotSize, fadeDuration]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        cursor: "none",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
}

export default CursorDitherTrail;

export const controls = {
  trailColor: { type: "color", label: "Dot colour", default: "#B6FF8E" },
  dotSize: { type: "number", label: "Dot size", min: 1, max: 4, step: 1, default: 2 },
  fadeDuration: {
    type: "number",
    label: "Fade (ms)",
    min: 200,
    max: 2000,
    step: 100,
    default: 600,
  },
};
