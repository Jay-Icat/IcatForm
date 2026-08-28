"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture, Float } from "@react-three/drei";
import * as THREE from "three";
import { ExperienceStage } from "@/types/quiz";

interface LogoMesh3DProps {
  stage: ExperienceStage;
}

export function LogoMesh3D({ stage }: LogoMesh3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  
  // Load logo texture
  const texture = useTexture("/icat-logo.png");
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Subtle pointer-following parallax
    const targetX = (state.pointer.x * Math.PI) / 10;
    const targetY = (-state.pointer.y * Math.PI) / 12;

    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      targetX,
      4,
      delta
    );
    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      targetY,
      4,
      delta
    );

    // Target positions & scales per stage
    let targetPosZ = 0;
    let targetPosY = 0;
    let targetScale = 1;
    let targetOpacity = 1;

    if (stage === "intro") {
      targetPosZ = 0;
      targetPosY = 0.5;
      targetScale = 1.1;
    } else if (stage === "lead_form") {
      targetPosZ = -2;
      targetPosY = 1.8;
      targetScale = 0.65;
    } else if (stage === "quiz") {
      targetPosZ = -3.5;
      targetPosY = 2.4;
      targetScale = 0.45;
    } else if (stage === "finale") {
      targetPosZ = 0.5;
      targetPosY = 1.2;
      targetScale = 0.9;
    }

    groupRef.current.position.y = THREE.MathUtils.damp(
      groupRef.current.position.y,
      targetPosY,
      3,
      delta
    );
    groupRef.current.position.z = THREE.MathUtils.damp(
      groupRef.current.position.z,
      targetPosZ,
      3,
      delta
    );
    groupRef.current.scale.setScalar(
      THREE.MathUtils.damp(groupRef.current.scale.x, targetScale, 3, delta)
    );

    // Orbital ring rotations
    if (ringRef1.current) {
      ringRef1.current.rotation.z += delta * 0.4;
      ringRef1.current.rotation.x += delta * 0.2;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.z -= delta * 0.3;
      ringRef2.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <Float
      speed={stage === "intro" ? 2.5 : 1.5}
      rotationIntensity={0.3}
      floatIntensity={0.4}
    >
      <group ref={groupRef} position={[0, 0.5, 0]}>
        {/* Main Logo Card Badge */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[4.2, 2.2]} />
          <meshBasicMaterial
            map={texture}
            transparent
            opacity={1}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* 3D Glassmorphic Backing Plate with Beveled Rim */}
        <mesh position={[0, 0, -0.05]}>
          <boxGeometry args={[4.4, 2.4, 0.08]} />
          <meshPhysicalMaterial
            color="#0f172a"
            metalness={0.9}
            roughness={0.2}
            transmission={0.6}
            thickness={0.5}
            transparent
            opacity={0.85}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>

        {/* Emissive Glowing Border Line */}
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[4.46, 2.46]} />
          <meshBasicMaterial
            color="#dc2626"
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Futuristic Orbital Energy Ring 1 */}
        <mesh ref={ringRef1} position={[0, 0, -0.1]}>
          <ringGeometry args={[2.5, 2.55, 64]} />
          <meshBasicMaterial
            color="#2563eb"
            transparent
            opacity={0.35}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Futuristic Orbital Energy Ring 2 */}
        <mesh ref={ringRef2} position={[0, 0, -0.1]}>
          <ringGeometry args={[2.8, 2.84, 64]} />
          <meshBasicMaterial
            color="#fbbf24"
            transparent
            opacity={0.25}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </Float>
  );
}
