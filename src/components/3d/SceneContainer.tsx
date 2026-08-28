"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette, ChromaticAberration, DepthOfField } from "@react-three/postprocessing";
import * as THREE from "three";
import { StageLighting } from "./StageLighting";
import { ParticleField } from "./ParticleField";
import { IcatEmblem3D } from "./IcatEmblem3D";
import { CyberEnvironment3D } from "./CyberEnvironment3D";
import { CameraRig } from "./CameraRig";
import { useQuiz } from "@/context/QuizContext";

export function SceneContainer() {
  const { stage, currentQuestionIndex } = useQuiz();

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
      <Canvas
        camera={{ position: [0, 0, 6.0], fov: 45, near: 0.1, far: 100 }}
        gl={{
          antialias: false, // Turned off for post-processing performance
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.25,
        }}
        dpr={[1, 1.5]} // Cap DPR at 1.5 for smooth 60fps
      >
        <Suspense fallback={null}>
          <StageLighting />
          <CyberEnvironment3D stage={stage} />
          <ParticleField stage={stage} />
          <IcatEmblem3D stage={stage} />
          <CameraRig stage={stage} questionIndex={currentQuestionIndex} />

          {/* Cinematic Post Processing Effects */}
          <EffectComposer enableNormalPass={false} multisampling={4}>
            <DepthOfField
              focusDistance={0.0}
              focalLength={0.02}
              bokehScale={2}
              height={480}
            />
            <Bloom
              luminanceThreshold={0.4}
              luminanceSmoothing={0.9}
              intensity={1.3}
              mipmapBlur
            />
            <ChromaticAberration
              offset={new THREE.Vector2(0.0012, 0.0012)}
              radialModulation={true}
              modulationOffset={0.4}
            />
            <Vignette
              eskil={false}
              offset={0.1}
              darkness={stage === "finale" ? 1.4 : 1.1}
            />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
