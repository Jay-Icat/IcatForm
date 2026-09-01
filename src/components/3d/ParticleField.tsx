"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ExperienceStage } from "@/types/quiz";

interface ParticleFieldProps {
  stage: ExperienceStage;
}

const vertexShader = `
  uniform float uTime;
  uniform float uSpeed;
  attribute float aScale;
  attribute vec3 aRandomness;
  varying vec3 vColor;
  
  void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    
    // Procedural noise / fluid movement
    float noiseFreq = 0.5;
    float noiseAmp = 0.4;
    vec3 noisePos = vec3(modelPosition.x * noiseFreq + uTime * uSpeed, modelPosition.y * noiseFreq + uTime * uSpeed, modelPosition.z * noiseFreq);
    
    modelPosition.x += sin(noisePos.y) * noiseAmp * aRandomness.x;
    modelPosition.y += cos(noisePos.z) * noiseAmp * aRandomness.y;
    modelPosition.z += sin(noisePos.x) * noiseAmp * aRandomness.z;
    
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    
    gl_Position = projectedPosition;
    
    // Size attenuation
    gl_PointSize = aScale * (10.0 / -viewPosition.z);
    
    vColor = color;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  void main() {
    // Soft circular particle
    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
    float strength = 0.05 / distanceToCenter - 0.1;
    
    if (strength < 0.0) discard;
    
    gl_FragColor = vec4(vColor, strength);
  }
`;

export function ParticleField({ stage }: ParticleFieldProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Use roughly 1500 particles for mobile (huge fill-rate savings), 6000 for desktop
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const count = isMobile ? 1500 : 6000;

  const [positions, colors, scales, randomness] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const sc = new Float32Array(count);
    const rand = new Float32Array(count * 3);

    const color1 = new THREE.Color("#dc2626"); // ICAT Red
    const color2 = new THREE.Color("#2563eb"); // ICAT Blue
    const color3 = new THREE.Color("#fbbf24"); // ICAT Gold
    const color4 = new THREE.Color("#8b5cf6"); // Purple accent

    for (let i = 0; i < count; i++) {
      const r = THREE.MathUtils.randFloat(2, 20);
      const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
      const phi = THREE.MathUtils.randFloat(0, Math.PI);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const mixed = i % 4 === 0 ? color1 : i % 4 === 1 ? color2 : i % 4 === 2 ? color3 : color4;
      col[i * 3] = mixed.r;
      col[i * 3 + 1] = mixed.g;
      col[i * 3 + 2] = mixed.b;
      
      sc[i] = (Math.random() * 2.0 + 0.5) * (isMobile ? 1.5 : 1.0);
      
      rand[i * 3] = Math.random() - 0.5;
      rand[i * 3 + 1] = Math.random() - 0.5;
      rand[i * 3 + 2] = Math.random() - 0.5;
    }

    return [pos, col, sc, rand];
  }, [count]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uSpeed: { value: 0.1 }
  }), []);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      const speed = stage === "quiz" ? 0.3 : stage === "finale" ? 0.05 : 0.15;
      materialRef.current.uniforms.uSpeed.value = THREE.MathUtils.lerp(
          materialRef.current.uniforms.uSpeed.value, 
          speed, 
          delta * 2
      );
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
        <bufferAttribute attach="attributes-aRandomness" args={[randomness, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        vertexColors
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
