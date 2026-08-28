"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { ExperienceStage } from "@/types/quiz";

interface IcatEmblem3DProps {
  stage: ExperienceStage;
}

export function IcatEmblem3D({ stage }: IcatEmblem3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const textMeshRef = useRef<THREE.Mesh>(null);
  const emblemCenterRef = useRef<THREE.Group>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const satelliteGroupRef = useRef<THREE.Group>(null);
  const introStartTime = useRef<number | null>(null);

  // Load transparent textures for Emblem and Text
  const emblemTexture = useTexture("/icat-emblem.png");
  emblemTexture.colorSpace = THREE.SRGBColorSpace;
  emblemTexture.minFilter = THREE.LinearMipmapLinearFilter;
  emblemTexture.generateMipmaps = true;

  const textTexture = useTexture("/icat-text.png");
  textTexture.colorSpace = THREE.SRGBColorSpace;
  textTexture.minFilter = THREE.LinearMipmapLinearFilter;
  textTexture.generateMipmaps = true;

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;
    if (introStartTime.current === null && stage === "intro") {
      introStartTime.current = time;
    }

    const elapsed = time - (introStartTime.current || time);

    // Interactive pointer / touch parallax (always facing user)
    const targetX = (state.pointer.x * Math.PI) / 10;
    const targetY = (-state.pointer.y * Math.PI) / 12;

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

    // Intro Phase Choreography:
    // Phase 1 (0.0s - 2.5s): ICAT Text graphic zooms in, then dissolves
    // Phase 2 (2.5s - 5.5s): ICAT Emblem Logo comes to center stage, rotating with cyber rings
    // Phase 3 (5.5s+): Logo pushes back into depth, making room for screen text
    // Other stages: lead_form, quiz, finale

    let targetEmblemScale = 0;
    let targetEmblemPosY = 0;
    let targetEmblemPosZ = 0;

    let targetTextScale = 0;
    let targetTextOpacity = 0;

    if (stage === "intro") {
      if (elapsed < 2.5) {
        // PHASE 1: Text display
        const textProgress = elapsed / 2.5;
        targetTextScale = textProgress < 0.3 ? THREE.MathUtils.lerp(0.5, 1.4, textProgress / 0.3) : textProgress > 0.8 ? THREE.MathUtils.lerp(1.4, 1.8, (textProgress - 0.8) / 0.2) : 1.4;
        targetTextOpacity = textProgress < 0.2 ? textProgress / 0.2 : textProgress > 0.8 ? 1 - (textProgress - 0.8) / 0.2 : 1;
        targetEmblemScale = 0;
      } else if (elapsed < 5.5) {
        // PHASE 2: Emblem hero display in center 3D space
        const emblemProgress = (elapsed - 2.5) / 3.0;
        targetTextScale = 0;
        targetTextOpacity = 0;

        if (emblemProgress < 0.3) {
          targetEmblemScale = THREE.MathUtils.lerp(0, 1.5, emblemProgress / 0.3);
          targetEmblemPosY = 0;
          targetEmblemPosZ = 0.5;
        } else if (emblemProgress < 0.8) {
          targetEmblemScale = 1.5;
          targetEmblemPosY = 0;
          targetEmblemPosZ = 0.5;
        } else {
          // Pushing back
          const pushProgress = (emblemProgress - 0.8) / 0.2;
          targetEmblemScale = THREE.MathUtils.lerp(1.5, 0.9, pushProgress);
          targetEmblemPosY = THREE.MathUtils.lerp(0, 1.4, pushProgress);
          targetEmblemPosZ = THREE.MathUtils.lerp(0.5, -1.8, pushProgress);
        }
      } else {
        // PHASE 3: Floating in background
        targetTextScale = 0;
        targetTextOpacity = 0;
        targetEmblemScale = 0.85;
        targetEmblemPosY = 1.5;
        targetEmblemPosZ = -2.0;
      }
    } else if (stage === "lead_form") {
      targetEmblemScale = 0.65;
      targetEmblemPosY = 1.8;
      targetEmblemPosZ = -2.2;
      targetTextScale = 0;
    } else if (stage === "quiz") {
      targetEmblemScale = 0.5;
      targetEmblemPosY = 2.4;
      targetEmblemPosZ = -3.8;
      targetTextScale = 0;
    } else if (stage === "finale") {
      targetEmblemScale = 1.1;
      targetEmblemPosY = 1.1;
      targetEmblemPosZ = 0.6;
      targetTextScale = 0;
    }

    // Apply text transforms
    if (textMeshRef.current) {
      textMeshRef.current.scale.setScalar(
        THREE.MathUtils.damp(textMeshRef.current.scale.x, targetTextScale, 6, delta)
      );
      const mat = textMeshRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = THREE.MathUtils.damp(mat.opacity, targetTextOpacity, 8, delta);
      }
    }

    // Apply emblem center transforms
    if (emblemCenterRef.current) {
      emblemCenterRef.current.scale.setScalar(
        THREE.MathUtils.damp(emblemCenterRef.current.scale.x, targetEmblemScale, 4, delta)
      );
      emblemCenterRef.current.position.y = THREE.MathUtils.damp(
        emblemCenterRef.current.position.y,
        targetEmblemPosY,
        3.5,
        delta
      );
      emblemCenterRef.current.position.z = THREE.MathUtils.damp(
        emblemCenterRef.current.position.z,
        targetEmblemPosZ,
        3.5,
        delta
      );

      // Emblem floating rotation
      emblemCenterRef.current.rotation.y = Math.sin(time * 0.7) * 0.15;
      emblemCenterRef.current.rotation.x = Math.cos(time * 0.5) * 0.08;
    }

    // Outer cyber rings rotations
    if (ringRef1.current) {
      ringRef1.current.rotation.z += delta * 0.5;
      ringRef1.current.rotation.x = Math.sin(time * 0.5) * 0.25;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.z -= delta * 0.4;
      ringRef2.current.rotation.y = Math.cos(time * 0.4) * 0.3;
    }

    // Inner glowing energy core
    if (coreRef.current) {
      const pulse = 1 + Math.sin(time * 3) * 0.15;
      coreRef.current.scale.setScalar(pulse);
      coreRef.current.rotation.y += delta * 0.8;
    }

    // Orbiting satellites
    if (satelliteGroupRef.current) {
      satelliteGroupRef.current.rotation.y += delta * 0.6;
      satelliteGroupRef.current.rotation.x = Math.sin(time * 0.7) * 0.3;
    }
  });

  return (
    <Float
      speed={stage === "intro" ? 2.5 : 1.5}
      rotationIntensity={0.3}
      floatIntensity={0.5}
    >
      <group ref={groupRef} position={[0, 0.2, 0]}>
        
        {/* PHASE 1: 3D ICAT Text Graphic */}
        <mesh ref={textMeshRef} position={[0, 0, 0.2]}>
          <planeGeometry args={[4.2, 3.2]} />
          <meshBasicMaterial
            map={textTexture}
            transparent
            opacity={0}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* PHASE 2 & 3: 3D ICAT Emblem Group (Facing Camera +Z) */}
        <group ref={emblemCenterRef}>
          {/* Front Emblem Plane */}
          <mesh position={[0, 0, 0.06]}>
            <planeGeometry args={[3.2, 3.2]} />
            <meshBasicMaterial
              map={emblemTexture}
              transparent
              alphaTest={0.05}
              side={THREE.FrontSide}
            />
          </mesh>

          {/* Back Emblem Plane */}
          <mesh position={[0, 0, -0.06]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[3.2, 3.2]} />
            <meshBasicMaterial
              map={emblemTexture}
              transparent
              alphaTest={0.05}
              side={THREE.FrontSide}
            />
          </mesh>

          {/* 3D Beveled Backing Base Disc */}
          <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[1.72, 1.72, 0.1, 64]} />
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
            <torusGeometry args={[1.74, 0.035, 32, 100]} />
            <meshStandardMaterial
              color="#f59e0b"
              emissive="#f59e0b"
              emissiveIntensity={2.5}
              toneMapped={false}
            />
          </mesh>

          {/* Glowing Neon Red Bevel Ring */}
          <mesh position={[0, 0, -0.03]}>
            <torusGeometry args={[1.74, 0.035, 32, 100]} />
            <meshStandardMaterial
              color="#dc2626"
              emissive="#dc2626"
              emissiveIntensity={2.0}
              toneMapped={false}
            />
          </mesh>

          {/* Inner Glowing Red Energy Core */}
          <mesh ref={coreRef} position={[0, 0, 0]}>
            <octahedronGeometry args={[0.7, 0]} />
            <meshBasicMaterial
              color="#ef4444"
              wireframe
              transparent
              opacity={0.5}
            />
          </mesh>

          {/* Orbital Energy Ring 1 (Cyber Blue) */}
          <mesh ref={ringRef1} position={[0, 0, 0]}>
            <ringGeometry args={[2.15, 2.22, 64]} />
            <meshBasicMaterial
              color="#3b82f6"
              transparent
              opacity={0.65}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Orbital Energy Ring 2 (Cyber Red / Gold) */}
          <mesh ref={ringRef2} position={[0, 0, 0]}>
            <ringGeometry args={[2.5, 2.55, 64]} />
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
              const radius = 2.4;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              const colors = ["#ef4444", "#3b82f6", "#f59e0b", "#a855f7"];
              return (
                <mesh key={i} position={[x, y, 0]}>
                  <octahedronGeometry args={[0.13, 0]} />
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
