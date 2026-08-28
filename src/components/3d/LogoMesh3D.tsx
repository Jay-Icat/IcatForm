"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { ExperienceStage } from "@/types/quiz";

interface LogoMesh3DProps {
  stage: ExperienceStage;
}

export function LogoMesh3D({ stage }: LogoMesh3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  const crystalRef = useRef<THREE.Mesh>(null);
  
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

    if (stage === "intro") {
      targetPosZ = 0;
      targetPosY = 0.5;
      targetScale = 1.2;
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

    // Orbital ring & crystal rotations
    if (ringRef1.current) {
      ringRef1.current.rotation.z += delta * 0.4;
      ringRef1.current.rotation.x += delta * 0.2;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.z -= delta * 0.3;
      ringRef2.current.rotation.y += delta * 0.3;
    }
    if (crystalRef.current) {
        crystalRef.current.rotation.y += delta * 0.1;
        crystalRef.current.rotation.x += delta * 0.15;
    }
  });

  return (
    <Float
      speed={stage === "intro" ? 2.5 : 1.5}
      rotationIntensity={0.5}
      floatIntensity={0.8}
    >
      <group ref={groupRef} position={[0, 0.5, 0]}>
        
        {/* Procedural 3D Crystal / Diamond Symbol */}
        <mesh ref={crystalRef} position={[0, 0, 0]}>
          <icosahedronGeometry args={[1.5, 0]} />
          <meshPhysicalMaterial
            color="#ffffff"
            emissive="#1a1a2e"
            emissiveIntensity={0.2}
            metalness={0.1}
            roughness={0.05}
            transmission={0.95} // Glass-like
            thickness={1.5}
            ior={1.5}
            clearcoat={1}
            clearcoatRoughness={0.1}
            iridescence={1}
            iridescenceIOR={1.3}
            iridescenceThicknessRange={[100, 400]}
          />
        </mesh>

        {/* Inner Glowing Core */}
        <mesh position={[0, 0, 0]}>
           <octahedronGeometry args={[0.7, 0]} />
           <meshBasicMaterial color="#dc2626" wireframe transparent opacity={0.6} />
        </mesh>

        {/* Futuristic Orbital Energy Ring 1 */}
        <mesh ref={ringRef1} position={[0, 0, 0]}>
          <ringGeometry args={[2.2, 2.25, 64]} />
          <meshBasicMaterial
            color="#2563eb"
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Futuristic Orbital Energy Ring 2 */}
        <mesh ref={ringRef2} position={[0, 0, 0]}>
          <ringGeometry args={[2.5, 2.52, 64]} />
          <meshBasicMaterial
            color="#fbbf24"
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </Float>
  );
}
