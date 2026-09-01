"use client";

import React, { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette, ChromaticAberration, SMAA } from "@react-three/postprocessing";
import * as THREE from "three";
import { StageLighting } from "./StageLighting";
import { ParticleField } from "./ParticleField";
import { IcatEmblem3D } from "./IcatEmblem3D";
import { CyberEnvironment3D } from "./CyberEnvironment3D";
import { CameraRig } from "./CameraRig";
import { useQuiz } from "@/context/QuizContext";

export function SceneContainer() {
  const { stage, currentQuestionIndex } = useQuiz();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    
    const timer = setTimeout(() => setIsLoaded(true), 150);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      className={`absolute inset-0 w-full h-full pointer-events-none z-0 transition-opacity duration-700 ease-out ${
        isLoaded ? "opacity-100" : "opacity-0"
      }`}
    >
      <Canvas
        camera={{ position: [0, 0, 6.0], fov: 45, near: 0.1, far: 100 }}
        gl={{
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          antialias: false, // Must be false when using EffectComposer multisampling to prevent flickering on PC/Laptops
        }}
        // Aggressive DPR cap on mobile for performance, higher on desktop
        dpr={isMobile ? [1, 1.15] : [1, 2]} 
      >
        <Suspense fallback={null}>
          <StageLighting />
          <CyberEnvironment3D stage={stage} />
          <ParticleField stage={stage} />
          <IcatEmblem3D stage={stage} />
          <CameraRig stage={stage} questionIndex={currentQuestionIndex} />

          {/* Conditional Post Processing - Separated to prevent EffectComposer graph crashes */}
          {isMobile ? (
            <EffectComposer enableNormalPass={false} multisampling={0}>
              <Bloom
                luminanceThreshold={0.45}
                luminanceSmoothing={0.85}
                intensity={0.8}
                mipmapBlur={false}
                resolutionScale={0.5}
              />
              <Vignette
                eskil={false}
                offset={0.1}
                darkness={stage === "finale" ? 1.4 : 1.1}
              />
            </EffectComposer>
          ) : (
            <EffectComposer enableNormalPass={false} multisampling={4}>
              <Bloom
                luminanceThreshold={0.45}
                luminanceSmoothing={0.85}
                intensity={1.2}
                mipmapBlur={true}
                resolutionScale={1.0}
              />
              <ChromaticAberration
                offset={new THREE.Vector2(0.001, 0.001)}
                radialModulation={true}
                modulationOffset={0.4}
              />
              <Vignette
                eskil={false}
                offset={0.1}
                darkness={stage === "finale" ? 1.4 : 1.1}
              />
              <SMAA />
            </EffectComposer>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
