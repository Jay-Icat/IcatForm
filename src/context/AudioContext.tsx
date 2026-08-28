"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { sound } from "@/lib/sound";

interface AudioContextType {
  playHover: () => void;
  playClick: () => void;
  playSelect: () => void;
  playTransition: () => void;
  playAnimeRiser: () => void;
  playWarpDrive: () => void;
  playPortalUnlock: () => void;
  playSuccess: () => void;
  initAudio: () => void;
  isReady: boolean;
}

const AudioContext = createContext<AudioContextType>({
  playHover: () => {},
  playClick: () => {},
  playSelect: () => {},
  playTransition: () => {},
  playAnimeRiser: () => {},
  playWarpDrive: () => {},
  playPortalUnlock: () => {},
  playSuccess: () => {},
  initAudio: () => {},
  isReady: false,
});

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const droneGainRef = useRef<GainNode | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Initialize audio context on first user interaction
  const initAudio = () => {
    if (audioCtxRef.current) return;
    
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    audioCtxRef.current = ctx;

    // Create Ambient Drone
    const createDroneOscillator = (freq: number, type: OscillatorType, pan: number) => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      const panner = ctx.createStereoPanner();
      panner.pan.value = pan;
      
      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(0.1, ctx.currentTime);
      
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 10;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      
      osc.connect(panner);
      lfo.start();
      osc.start();
      return panner;
    };

    const droneMasterGain = ctx.createGain();
    droneMasterGain.gain.setValueAtTime(0, ctx.currentTime); // Start quiet, fade in
    droneMasterGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 4);
    droneMasterGain.connect(ctx.destination);
    droneGainRef.current = droneMasterGain;

    const drone1 = createDroneOscillator(55, "sine", -0.5); // Low A
    const drone2 = createDroneOscillator(55.5, "sine", 0.5); // Beating effect
    const drone3 = createDroneOscillator(110, "triangle", 0); // Octave up
    
    drone1.connect(droneMasterGain);
    drone2.connect(droneMasterGain);
    drone3.connect(droneMasterGain);

    setIsReady(true);
  };

  const playHover = () => {
    initAudio();
    sound.playHover();
  };

  const playClick = () => {
    initAudio();
    sound.playClick();
  };

  const playSelect = () => {
    initAudio();
    sound.playSelect();
  };

  const playTransition = () => {
    initAudio();
    sound.playTransition();
  };

  const playAnimeRiser = () => {
    initAudio();
    sound.playAnimeRiser();
  };

  const playWarpDrive = () => {
    initAudio();
    sound.playWarpDrive();
  };

  const playPortalUnlock = () => {
    initAudio();
    sound.playPortalUnlock();
  };

  const playSuccess = () => {
    initAudio();
    sound.playSuccess();
  };

  return (
    <AudioContext.Provider
      value={{
        playHover,
        playClick,
        playSelect,
        playTransition,
        playAnimeRiser,
        playWarpDrive,
        playPortalUnlock,
        playSuccess,
        initAudio,
        isReady,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export const useAudio = () => useContext(AudioContext);
