import React, { useEffect, useRef } from "react";

const MouseSpark = ({
  width = typeof window !== "undefined" ? window.innerWidth : 1920,
  height = typeof window !== "undefined" ? window.innerHeight : 1080,
  theme = "dark",
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Theme colors
    const backgroundColor = theme === "dark" ? "#0a0a0a" : "#f5f5f5";
    const colors = theme === "dark"
      ? ["#F48F68", "#8BDFDD", "#FFE394"]
      : ["#F48F68", "#8BDFDD", "#FFE394"];

    // Particles
    let particles = [];

    const spawnParticles = (x, y) => {
      for (let i = 0; i < 1; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1 + 0.5;
        const color = colors[Math.floor(Math.random() * colors.length)];
        particles.push({
          x,
          y,
          dx: Math.cos(angle) * speed,
          dy: Math.sin(angle) * speed,
          color,
        });
      }
    };

    // Mouse move event
    const handleMouseMove = (e) => {
      spawnParticles(e.clientX, e.clientY);
    };

    let animationId = null;

    const animate = () => {
      if (!ctx) return;

      // Use clearRect with transparency instead of filling with background color
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.dx;
        p.y += p.dy;
        p.dx *= 0.92;
        p.dy *= 0.92;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Remove slow particles
        if (Math.abs(p.dx) < 0.05 && Math.abs(p.dy) < 0.05) {
          particles.splice(i, 1);
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [width, height, theme]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: "block",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 9998,
      }}
    />
  );
};

export default MouseSpark;
