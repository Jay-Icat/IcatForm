"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ExperienceStage } from "@/types/quiz";

interface CameraRigProps {
  stage: ExperienceStage;
  questionIndex: number;
}

export function CameraRig({ stage, questionIndex }: CameraRigProps) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 0, 6.0));
  const targetLook = useRef(new THREE.Vector3(0, 0, 0));
  const introStartTime = useRef<number | null>(null);

  useEffect(() => {
    if (stage === "intro") {
      introStartTime.current = null;
    }
  }, [stage]);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    if (introStartTime.current === null && stage === "intro") {
      introStartTime.current = time;
    }

    if (stage === "intro") {
      const elapsed = time - (introStartTime.current || time);
      
      // Anime Cinematic Camera Opening Choreography:
      // Starts with wide dynamic arc, zooms closer with speed into the glowing emblem
      if (elapsed < 1.5) {
        // Phase 1: High angle sweeping in
        const progress = elapsed / 1.5;
        const camZ = THREE.MathUtils.lerp(8.0, 5.8, progress);
        const camX = Math.sin(elapsed * 2) * 1.5 * (1 - progress);
        const camY = THREE.MathUtils.lerp(1.2, 0.4, progress);
        targetPos.current.set(camX, camY, camZ);
        targetLook.current.set(0, 0.2, 0);
      } else if (elapsed < 3.5) {
        // Phase 2: Dramatic heroic focus on 3D emblem with slight breathing orbit
        const camX = Math.sin(time * 0.8) * 0.4;
        const camY = 0.3 + Math.cos(time * 0.6) * 0.15;
        targetPos.current.set(camX, camY, 5.2);
        targetLook.current.set(0, 0.2, 0);
      } else {
        // Phase 3: Preparing for warp dive in +Z direction
        targetPos.current.set(0, 0.3, 4.8);
        targetLook.current.set(0, 0.2, 0);
      }
    } else if (stage === "lead_form") {
      // Form view: Camera positioned nicely with emblem floating in background
      targetPos.current.set(0, 0.5, 5.0);
      targetLook.current.set(0, 0.2, 0);
    } else if (stage === "quiz") {
      // Dynamic camera path orbit per question index
      const angle = (questionIndex % 4) * 0.28 - 0.42;
      const camX = Math.sin(angle) * 1.4;
      const camY = 0.35 + (questionIndex % 2 === 0 ? 0.2 : -0.15);
      const camZ = 4.6;
      targetPos.current.set(camX, camY, camZ);
      targetLook.current.set(0, 0.1, 0);
    } else if (stage === "finale") {
      targetPos.current.set(0, 0.9, 6.2);
      targetLook.current.set(0, 0.4, 0);
    }

    // Pointer / touch floating parallax
    const floatX = state.pointer.x * 0.35;
    const floatY = state.pointer.y * 0.25;

    // Smooth dampening towards target coordinates
    const dampSpeed = stage === "intro" ? 4.5 : 3.0;
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
