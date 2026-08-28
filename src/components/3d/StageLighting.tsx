"use client";

import React from "react";

export function StageLighting() {
  return (
    <>
      <ambientLight intensity={0.8} />
      {/* Key Light */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.4}
        color="#ffffff"
      />
      {/* ICAT Blue Fill Light */}
      <pointLight
        position={[-6, 2, 4]}
        intensity={2.5}
        color="#2563eb"
        distance={20}
      />
      {/* ICAT Red Rim Light */}
      <pointLight
        position={[6, -2, -2]}
        intensity={3.0}
        color="#dc2626"
        distance={20}
      />
      {/* Subtle Gold Center Accent */}
      <pointLight
        position={[0, -4, 2]}
        intensity={1.2}
        color="#f59e0b"
        distance={15}
      />
    </>
  );
}
