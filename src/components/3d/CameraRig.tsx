"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ExperienceStage } from "@/types/quiz";
import { useQuiz } from "@/context/QuizContext";

interface CameraRigProps {
  stage: ExperienceStage;
  questionIndex: number;
}

export function CameraRig({ stage, questionIndex }: CameraRigProps) {
  const { introPhase } = useQuiz();
  const { camera, size } = useThree();
  const isMobile = size.width < 768;
  const mobileCamZ = isMobile ? 1.0 : 0.0;

  const targetPos = useRef(new THREE.Vector3(0, 0, 4.8));
  const targetLook = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    if (stage === "intro") {
      if (introPhase === 1) {
        // Act 1: Full Brand Logo Framing
        const camX = Math.sin(time * 0.4) * 0.12;
        const camY = Math.cos(time * 0.4) * 0.08;
        targetPos.current.set(camX, camY, 4.8 + mobileCamZ);
        targetLook.current.set(0, 0, 0);
      } else if (introPhase === 2) {
        // Act 2: 3D Emblem Hero Framing with subtle cinematic orbit
        const camX = Math.sin(time * 0.5) * 0.2;
        const camY = Math.cos(time * 0.4) * 0.1;
        targetPos.current.set(camX, camY, 4.7 + mobileCamZ);
        targetLook.current.set(0, 0, 0);
      } else {
        // Act 3: Framing headline and crowning emblem
        targetPos.current.set(0, 0.1, 4.6 + mobileCamZ);
        targetLook.current.set(0, 0.1, 0);
      }
    } else if (stage === "lead_form") {
      targetPos.current.set(0, 0.3, 4.8 + mobileCamZ);
      targetLook.current.set(0, 0.1, 0);
    } else if (stage === "quiz") {
      const angle = (questionIndex % 4) * 0.22 - 0.33;
      const camX = Math.sin(angle) * (isMobile ? 0.5 : 1.0);
      const camY = 0.25 + (questionIndex % 2 === 0 ? 0.1 : -0.08);
      const camZ = 4.4 + mobileCamZ;
      targetPos.current.set(camX, camY, camZ);
      targetLook.current.set(0, 0.1, 0);
    } else if (stage === "finale") {
      targetPos.current.set(0, 0.6, 5.2 + mobileCamZ);
      targetLook.current.set(0, 0.2, 0);
    }

    // Pointer / touch floating parallax (Desktop only)
    const floatX = !isMobile ? state.pointer.x * 0.2 : 0;
    const floatY = !isMobile ? state.pointer.y * 0.15 : 0;

    const dampSpeed = stage === "intro" ? 4.0 : 3.0;
    camera.position.x = THREE.MathUtils.damp(
      camera.position.x,
      targetPos.current.x + floatX,
      dampSpeed,
      delta
    );
    camera.position.y = THREE.MathUtils.damp(
      camera.position.y,
      targetPos.current.y + floatY,
      dampSpeed,
      delta
    );
    camera.position.z = THREE.MathUtils.damp(
      camera.position.z,
      targetPos.current.z,
      dampSpeed,
      delta
    );

    camera.lookAt(targetLook.current);
  });

  return null;
}
