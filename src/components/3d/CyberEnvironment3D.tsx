"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ExperienceStage } from "@/types/quiz";

interface CyberEnvironment3DProps {
  stage: ExperienceStage;
}

export function CyberEnvironment3D({ stage }: CyberEnvironment3DProps) {
  const polyGroupRef = useRef<THREE.Group>(null);
  const gridRef = useRef<THREE.Mesh>(null);
  const speedLinesRef = useRef<THREE.Points>(null);

  // Generate multi-depth floating geometric shapes across the entire 3D space
  const polyhedra = useMemo(() => {
    const items = [];
    const colors = ["#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6", "#06b6d4"];
    
    for (let i = 0; i < 28; i++) {
      const type = i % 3; // 0: octahedron, 1: wireframe torus, 2: icosahedron
      const x = (Math.random() - 0.5) * 26;
      const y = (Math.random() - 0.5) * 16;
      const z = -15 + Math.random() * 18; // Distribute across depth -15 to +3
      const scale = 0.2 + Math.random() * 0.45;
      const color = colors[i % colors.length];
      const rotSpeedX = (Math.random() - 0.5) * 0.8;
      const rotSpeedY = (Math.random() - 0.5) * 0.8;

      items.push({ type, x, y, z, scale, color, rotSpeedX, rotSpeedY });
    }
    return items;
  }, []);

  // Anime Speed Lines / Warp Streaks in 3D Space
  const speedLineCount = 120;
  const [speedPositions, speedColors] = useMemo(() => {
    const pos = new Float32Array(speedLineCount * 6); // 2 vertices per line
    const col = new Float32Array(speedLineCount * 6);
    const colorRed = new THREE.Color("#ef4444");
    const colorBlue = new THREE.Color("#3b82f6");

    for (let i = 0; i < speedLineCount; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 14;
      const z = -10 + Math.random() * 15;
      const len = 1.5 + Math.random() * 3.5;

      // Start point
      pos[i * 6] = x;
      pos[i * 6 + 1] = y;
      pos[i * 6 + 2] = z;

      // End point (streak along Z)
      pos[i * 6 + 3] = x;
      pos[i * 6 + 4] = y;
      pos[i * 6 + 5] = z + len;

      const c = i % 2 === 0 ? colorRed : colorBlue;
      col[i * 6] = c.r;
      col[i * 6 + 1] = c.g;
      col[i * 6 + 2] = c.b;
      col[i * 6 + 3] = c.r * 0.2;
      col[i * 6 + 4] = c.g * 0.2;
      col[i * 6 + 5] = c.b * 0.2;
    }
    return [pos, col];
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // Slowly orbit and rotate floating polyhedra
    if (polyGroupRef.current) {
      polyGroupRef.current.children.forEach((child, idx) => {
        const item = polyhedra[idx];
        if (item) {
          child.rotation.x += delta * item.rotSpeedX;
          child.rotation.y += delta * item.rotSpeedY;
          // Float up and down gently
          child.position.y = item.y + Math.sin(time * 0.8 + idx) * 0.25;
        }
      });
    }

    // Grid floor dynamic pulse
    if (gridRef.current) {
      gridRef.current.position.z = (time * 1.5) % 4 - 2;
    }

    // Anime speed lines movement
    if (speedLinesRef.current) {
      const isWarping = stage === "intro" || stage === "lead_form";
      const speed = isWarping ? 8.0 : 1.5;
      speedLinesRef.current.position.z = (time * speed) % 15 - 5;
    }
  });

  return (
    <group>
      {/* Dynamic Cyber Grid Floor at bottom */}
      <mesh
        ref={gridRef}
        position={[0, -5.5, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[60, 60, 40, 40]} />
        <meshBasicMaterial
          color="#1e1b4b"
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Cyber Grid Ceiling at top */}
      <mesh
        position={[0, 6.5, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[60, 60, 30, 30]} />
        <meshBasicMaterial
          color="#0f172a"
          wireframe
          transparent
          opacity={0.2}
        />
      </mesh>

      {/* Multi-depth Floating Polyhedra Group */}
      <group ref={polyGroupRef}>
        {polyhedra.map((item, idx) => (
          <group key={idx} position={[item.x, item.y, item.z]} scale={item.scale}>
            {item.type === 0 && (
              <mesh>
                <octahedronGeometry args={[1, 0]} />
                <meshStandardMaterial
                  color={item.color}
                  emissive={item.color}
                  emissiveIntensity={0.8}
                  wireframe
                />
              </mesh>
            )}
            {item.type === 1 && (
              <mesh>
                <torusGeometry args={[1, 0.15, 16, 32]} />
                <meshStandardMaterial
                  color={item.color}
                  emissive={item.color}
                  emissiveIntensity={0.6}
                  wireframe
                />
              </mesh>
            )}
            {item.type === 2 && (
              <mesh>
                <icosahedronGeometry args={[0.9, 0]} />
                <meshStandardMaterial
                  color={item.color}
                  emissive={item.color}
                  emissiveIntensity={0.7}
                  metalness={0.8}
                  roughness={0.2}
                  transparent
                  opacity={0.65}
                />
              </mesh>
            )}
          </group>
        ))}
      </group>

      {/* Anime Speed Streaks / Warp Lines */}
      <lineSegments ref={speedLinesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[speedPositions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[speedColors, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={stage === "intro" ? 0.75 : 0.35}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}
