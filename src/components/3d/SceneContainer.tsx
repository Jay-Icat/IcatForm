"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette, ChromaticAberration, DepthOfField } from "@react-three/postprocessing";
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
          antialias: false, // Turn off antialias if using postprocessing for better perf
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        dpr={[1, 1.5]} // Cap DPR at 1.5 for performance
      >
        <Suspense fallback={null}>
          <StageLighting />
          <ParticleField stage={stage} />
          <LogoMesh3D stage={stage} />
          <CameraRig stage={stage} questionIndex={currentQuestionIndex} />

          {/* Post Processing Effects for High-End 3D Visuals */}
          <EffectComposer enableNormalPass={false} multisampling={4}>
            <DepthOfField
              focusDistance={0.0}
              focalLength={0.02}
              bokehScale={2}
              height={480}
            />
            <Bloom
              luminanceThreshold={0.5}
              luminanceSmoothing={0.9}
              intensity={1.2}
              mipmapBlur
            />
            <ChromaticAberration
              offset={new THREE.Vector2(0.001, 0.001)}
              radialModulation={true}
              modulationOffset={0.4}
            />
            <Vignette
              eskil={false}
              offset={0.1}
              darkness={stage === "finale" ? 1.5 : 1.1}
            />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
