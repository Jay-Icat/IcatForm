"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ExperienceStage } from "@/types/quiz";

interface CameraRigProps {
  stage: ExperienceStage;
  questionIndex: number;
}

export function CameraRig({ stage, questionIndex }: CameraRigProps) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 0, 5.5));
  const targetLook = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state, delta) => {
    // Determine 3D Camera target coordinates based on experience stage
    if (stage === "intro") {
      targetPos.current.set(0, 0, 5.5);
      targetLook.current.set(0, 0.2, 0);
    } else if (stage === "lead_form") {
      targetPos.current.set(0, 0.4, 5.2);
      targetLook.current.set(0, 0.1, 0);
    } else if (stage === "quiz") {
      // Dynamic camera path orbit per question index
      const angle = (questionIndex % 4) * 0.25 - 0.35;
      const camX = Math.sin(angle) * 1.2;
      const camY = 0.3 + (questionIndex % 2 === 0 ? 0.15 : -0.1);
      targetPos.current.set(camX, camY, 4.8);
      targetLook.current.set(0, 0, 0);
    } else if (stage === "finale") {
      targetPos.current.set(0, 0.8, 6.2);
      targetLook.current.set(0, 0.4, 0);
    }

    // Add subtle pointer floating
    const floatX = (state.pointer.x * 0.3);
    const floatY = (state.pointer.y * 0.2);

    camera.position.x = THREE.MathUtils.damp(
      camera.position.x,
      targetPos.current.x + floatX,
      3,
      delta
    );
    camera.position.y = THREE.MathUtils.damp(
      camera.position.y,
      targetPos.current.y + floatY,
      3,
      delta
    );
    camera.position.z = THREE.MathUtils.damp(
      camera.position.z,
      targetPos.current.z,
      3,
      delta
    );

    camera.lookAt(targetLook.current);
  });

  return null;
}
