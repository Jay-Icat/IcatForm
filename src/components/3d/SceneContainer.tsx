"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from "@react-three/postprocessing";
import * as THREE from "three";
import { StageLighting } from "./StageLighting";
import { ParticleField } from "./ParticleField";
import { LogoMesh3D } from "./LogoMesh3D";
import { CameraRig } from "./CameraRig";
import { useQuiz } from "@/context/QuizContext";

export function SceneContainer() {
  const { stage, currentQuestionIndex } = useQuiz();

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45, near: 0.1, far: 100 }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <StageLighting />
          <ParticleField stage={stage} />
          <LogoMesh3D stage={stage} />
          <CameraRig stage={stage} questionIndex={currentQuestionIndex} />

          {/* Post Processing Effects for High-End 3D Visuals */}
          <EffectComposer enableNormalPass={false}>
            <Bloom
              luminanceThreshold={0.65}
              luminanceSmoothing={0.9}
              intensity={0.7}
              mipmapBlur
            />
            <ChromaticAberration
              offset={new THREE.Vector2(0.0008, 0.0008)}
              radialModulation={true}
              modulationOffset={0.5}
            />
            <Vignette
              eskil={false}
              offset={0.15}
              darkness={stage === "finale" ? 1.4 : 0.95}
            />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
