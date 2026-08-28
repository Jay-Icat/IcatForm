"use client";

import React, { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let animId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) setIsVisible(true);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX - 4}px, ${mouseY - 4}px, 0)`;
      }

      const target = e.target as HTMLElement | null;
      if (target && (target.closest("button") || target.closest("a") || target.closest("input") || target.closest("select") || target.closest(".hover-target") || target.closest(".option-card"))) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);
    const handleMouseLeave = () => setIsVisible(false);

    // Fast 60fps Lerp for Ring Follower
    const render = () => {
      ringX += (mouseX - ringX) * 0.45; // Ultra-fast follow rate
      ringY += (mouseY - ringY) * 0.45;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX - 16}px, ${ringY - 16}px, 0)`;
      }
      animId = requestAnimationFrame(render);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden hidden md:block select-none">
      {/* Precision Center Dot */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444] transition-opacity duration-150 ${
          isHovered ? "scale-150 bg-amber-400 shadow-[0_0_12px_#f59e0b]" : ""
        }`}
        style={{ willChange: "transform" }}
      />

      {/* Cyber Targeting Ring */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 w-8 h-8 rounded-full border-2 transition-all duration-150 flex items-center justify-center ${
          isHovered
            ? "scale-150 border-amber-400 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
            : isClicked
            ? "scale-75 border-red-400 bg-red-500/20"
            : "border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.3)]"
        }`}
        style={{ willChange: "transform" }}
      >
        {isHovered && (
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
        )}
      </div>
    </div>
  );
}
