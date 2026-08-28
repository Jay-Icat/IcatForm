"use client";

import React, { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Float, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { ExperienceStage } from "@/types/quiz";
import { useQuiz } from "@/context/QuizContext";

// Preload textures into GPU VRAM
useTexture.preload("/icat-logo-transparent.png");
useTexture.preload("/icat-emblem.png");

interface IcatEmblem3DProps {
  stage: ExperienceStage;
}

export function IcatEmblem3D({ stage }: IcatEmblem3DProps) {
  const { introPhase } = useQuiz();
  const { size } = useThree();
  const isMobile = size.width < 768;
  const responsiveScale = isMobile ? Math.min(size.width / 480, 0.85) : 1.0;

  const groupRef = useRef<THREE.Group>(null);
  const fullLogoMeshRef = useRef<THREE.Mesh>(null);
  const emblemCenterRef = useRef<THREE.Group>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const satelliteGroupRef = useRef<THREE.Group>(null);

  const fullLogoTexture = useTexture("/icat-logo-transparent.png");
  fullLogoTexture.colorSpace = THREE.SRGBColorSpace;
  fullLogoTexture.minFilter = THREE.LinearMipmapLinearFilter;
  fullLogoTexture.generateMipmaps = true;

  const emblemTexture = useTexture("/icat-emblem.png");
  emblemTexture.colorSpace = THREE.SRGBColorSpace;
  emblemTexture.minFilter = THREE.LinearMipmapLinearFilter;
  emblemTexture.generateMipmaps = true;

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;

    // Interactive mouse / touch parallax
    const targetX = (state.pointer.x * Math.PI) / 16;
    const targetY = (-state.pointer.y * Math.PI) / 18;

    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      targetX,
      3.5,
      delta
    );
    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      targetY,
      3.5,
      delta
    );

    // Synchronized Phase Visibility & Transforms
    let isFullLogoVisible = false;
    let targetFullLogoScale = 0;
    let targetFullLogoOpacity = 0;

    let isEmblemVisible = false;
    let targetEmblemScale = 0;
    let targetEmblemPosY = 0;
    let targetEmblemPosZ = 0;

    if (stage === "intro") {
      if (introPhase === 1) {
        // ACT 1: ONLY Full Brand Logo is visible (Emblem is completely disabled)
        isFullLogoVisible = true;
        targetFullLogoScale = (isMobile ? 0.95 : 1.25) * responsiveScale;
        targetFullLogoOpacity = 1;

        isEmblemVisible = false;
        targetEmblemScale = 0;
      } else if (introPhase === 2) {
        // ACT 2: 3D Emblem Hero Showcase at [0, 0, 0]
        isFullLogoVisible = false;
        targetFullLogoScale = 0;
        targetFullLogoOpacity = 0;

        isEmblemVisible = true;
        targetEmblemScale = (isMobile ? 1.0 : 1.35) * responsiveScale;
        targetEmblemPosY = 0;
        targetEmblemPosZ = 0;
      } else {
        // ACT 3: Floating smoothly in crown position above headline
        isFullLogoVisible = false;
        targetFullLogoScale = 0;
        targetFullLogoOpacity = 0;

        isEmblemVisible = true;
        targetEmblemScale = (isMobile ? 0.75 : 0.95) * responsiveScale;
        targetEmblemPosY = isMobile ? 1.4 : 1.3;
        targetEmblemPosZ = -0.3;
      }
    } else if (stage === "lead_form") {
      isFullLogoVisible = false;
      isEmblemVisible = true;
      targetEmblemScale = (isMobile ? 0.55 : 0.7) * responsiveScale;
      targetEmblemPosY = isMobile ? 1.7 : 1.5;
      targetEmblemPosZ = -1.0;
    } else if (stage === "quiz") {
      isFullLogoVisible = false;
      isEmblemVisible = true;
      targetEmblemScale = (isMobile ? 0.4 : 0.5) * responsiveScale;
      targetEmblemPosY = 2.0;
      targetEmblemPosZ = -2.0;
    } else if (stage === "finale") {
      isFullLogoVisible = false;
      isEmblemVisible = true;
      targetEmblemScale = (isMobile ? 0.8 : 1.05) * responsiveScale;
      targetEmblemPosY = 0.9;
      targetEmblemPosZ = 0.2;
    }

    // Apply Full Logo transforms & visibility
    if (fullLogoMeshRef.current) {
      fullLogoMeshRef.current.visible = isFullLogoVisible;
      if (isFullLogoVisible) {
        fullLogoMeshRef.current.scale.setScalar(
          THREE.MathUtils.damp(fullLogoMeshRef.current.scale.x, targetFullLogoScale, 6, delta)
        );
        const mat = fullLogoMeshRef.current.material as THREE.MeshBasicMaterial;
        if (mat) {
          mat.opacity = THREE.MathUtils.damp(mat.opacity, targetFullLogoOpacity, 7, delta);
        }
      }
    }

    // Apply Emblem Center transforms & visibility
    if (emblemCenterRef.current) {
      emblemCenterRef.current.visible = isEmblemVisible;
      if (isEmblemVisible) {
        emblemCenterRef.current.scale.setScalar(
          THREE.MathUtils.damp(emblemCenterRef.current.scale.x, targetEmblemScale, 5, delta)
        );
        emblemCenterRef.current.position.y = THREE.MathUtils.damp(
          emblemCenterRef.current.position.y,
          targetEmblemPosY,
          4,
          delta
        );
        emblemCenterRef.current.position.z = THREE.MathUtils.damp(
          emblemCenterRef.current.position.z,
          targetEmblemPosZ,
          4,
          delta
        );

        // Emblem gentle floating rotation
        emblemCenterRef.current.rotation.y = Math.sin(time * 0.7) * 0.12;
        emblemCenterRef.current.rotation.x = Math.cos(time * 0.5) * 0.06;
      }
    }

    // Outer cyber rings rotations
    if (ringRef1.current && isEmblemVisible) {
      ringRef1.current.rotation.z += delta * 0.5;
      ringRef1.current.rotation.x = Math.sin(time * 0.5) * 0.2;
    }
    if (ringRef2.current && isEmblemVisible) {
      ringRef2.current.rotation.z -= delta * 0.4;
      ringRef2.current.rotation.y = Math.cos(time * 0.4) * 0.25;
    }

    // Inner glowing energy core
    if (coreRef.current && isEmblemVisible) {
      const pulse = 1 + Math.sin(time * 3) * 0.15;
      coreRef.current.scale.setScalar(pulse);
      coreRef.current.rotation.y += delta * 0.8;
    }

    // Orbiting satellites
    if (satelliteGroupRef.current && isEmblemVisible) {
      satelliteGroupRef.current.rotation.y += delta * 0.6;
      satelliteGroupRef.current.rotation.x = Math.sin(time * 0.7) * 0.3;
    }
  });

  return (
    <Float
      speed={stage === "intro" ? 2.0 : 1.5}
      rotationIntensity={0.2}
      floatIntensity={0.35}
    >
      <group ref={groupRef} position={[0, 0, 0]}>
        
        {/* ACT 1: Full Transparent ICAT Logo (Visible ONLY in Phase 1) */}
        <mesh ref={fullLogoMeshRef} position={[0, 0, 0]} visible={false}>
          <planeGeometry args={[3.8, 2.11]} />
          <meshBasicMaterial
            map={fullLogoTexture}
            transparent
            opacity={0}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* ACT 2 & 3: 3D ICAT Emblem Group (Completely Disabled & Scale 0 in Phase 1) */}
        <group ref={emblemCenterRef} position={[0, 0, 0]} scale={[0, 0, 0]} visible={false}>
          {/* Front Emblem Plane */}
          <mesh position={[0, 0, 0.06]}>
            <planeGeometry args={[2.5, 2.5]} />
            <meshBasicMaterial
              map={emblemTexture}
              transparent
              alphaTest={0.05}
              side={THREE.FrontSide}
            />
          </mesh>

          {/* Back Emblem Plane */}
          <mesh position={[0, 0, -0.06]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[2.5, 2.5]} />
            <meshBasicMaterial
              map={emblemTexture}
              transparent
              alphaTest={0.05}
              side={THREE.FrontSide}
            />
          </mesh>

          {/* 3D Beveled Backing Base Disc */}
          <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[1.35, 1.35, 0.1, 64]} />
            <meshPhysicalMaterial
              color="#0b1120"
              emissive="#1e1b4b"
              emissiveIntensity={0.5}
              metalness={0.8}
              roughness={0.15}
              transmission={0.6}
              thickness={0.5}
              clearcoat={1}
              clearcoatRoughness={0.1}
            />
          </mesh>

          {/* Glowing Neon Golden Bevel Ring */}
          <mesh position={[0, 0, 0.03]}>
            <torusGeometry args={[1.38, 0.03, 32, 100]} />
            <meshStandardMaterial
              color="#f59e0b"
              emissive="#f59e0b"
              emissiveIntensity={2.5}
              toneMapped={false}
            />
          </mesh>

          {/* Glowing Neon Red Bevel Ring */}
          <mesh position={[0, 0, -0.03]}>
            <torusGeometry args={[1.38, 0.03, 32, 100]} />
            <meshStandardMaterial
              color="#dc2626"
              emissive="#dc2626"
              emissiveIntensity={2.0}
              toneMapped={false}
            />
          </mesh>

          {/* Inner Glowing Red Energy Core */}
          <mesh ref={coreRef} position={[0, 0, 0]}>
            <octahedronGeometry args={[0.55, 0]} />
            <meshBasicMaterial
              color="#ef4444"
              wireframe
              transparent
              opacity={0.5}
            />
          </mesh>

          {/* Orbital Energy Ring 1 (Cyber Blue) */}
          <mesh ref={ringRef1} position={[0, 0, 0]}>
            <ringGeometry args={[1.75, 1.82, 64]} />
            <meshBasicMaterial
              color="#3b82f6"
              transparent
              opacity={0.65}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Orbital Energy Ring 2 (Cyber Red / Gold) */}
          <mesh ref={ringRef2} position={[0, 0, 0]}>
            <ringGeometry args={[2.05, 2.1, 64]} />
            <meshBasicMaterial
              color="#f59e0b"
              transparent
              opacity={0.55}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Orbiting Satellite Micro-Crystals */}
          <group ref={satelliteGroupRef}>
            {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => {
              const radius = 1.95;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              const colors = ["#ef4444", "#3b82f6", "#f59e0b", "#a855f7"];
              return (
                <mesh key={i} position={[x, y, 0]}>
                  <octahedronGeometry args={[0.1, 0]} />
                  <meshStandardMaterial
                    color={colors[i]}
                    emissive={colors[i]}
                    emissiveIntensity={2.2}
                    toneMapped={false}
                  />
                </mesh>
              );
            })}
          </group>
        </group>
      </group>
    </Float>
  );
}
