"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ExperienceStage } from "@/types/quiz";

interface ParticleFieldProps {
  stage: ExperienceStage;
}

export function ParticleField({ stage }: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 1200;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const color1 = new THREE.Color("#dc2626"); // ICAT Red
    const color2 = new THREE.Color("#2563eb"); // ICAT Blue
    const color3 = new THREE.Color("#fbbf24"); // ICAT Gold
    const color4 = new THREE.Color("#a855f7"); // Purple accent

    for (let i = 0; i < count; i++) {
      // Spread across a spherical / atmospheric cloud
      const r = THREE.MathUtils.randFloat(2, 14);
      const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
      const phi = THREE.MathUtils.randFloat(0, Math.PI);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const mixed = i % 4 === 0 ? color1 : i % 4 === 1 ? color2 : i % 4 === 2 ? color3 : color4;
      col[i * 3] = mixed.r;
      col[i * 3 + 1] = mixed.g;
      col[i * 3 + 2] = mixed.b;
    }

    return [pos, col];
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    // Rotate the particle galaxy
    const speed = stage === "quiz" ? 0.08 : stage === "finale" ? 0.03 : 0.05;
    pointsRef.current.rotation.y += delta * speed;
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;

    // Pulse scale slightly based on audio/time
    const s = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.03;
    pointsRef.current.scale.set(s, s, s);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        vertexColors
        transparent
        opacity={stage === "finale" ? 0.85 : 0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
