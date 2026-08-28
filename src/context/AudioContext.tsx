"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";

interface AudioContextType {
  playHover: () => void;
  playClick: () => void;
  playTransition: () => void;
  initAudio: () => void;
  isReady: boolean;
}

const AudioContext = createContext<AudioContextType>({
  playHover: () => {},
  playClick: () => {},
  playTransition: () => {},
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
    droneMasterGain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 5);
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

  // Temporarily duck the ambient drone
  const duckDrone = (ctx: AudioContext) => {
    if (!droneGainRef.current) return;
    const g = droneGainRef.current;
    g.gain.cancelScheduledValues(ctx.currentTime);
    g.gain.setValueAtTime(g.gain.value, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    g.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 1.5);
  };

  const playHover = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  };

  const playClick = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    duckDrone(ctx);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "square";
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  };

  const playTransition = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    duckDrone(ctx);

    // Deep swoosh
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.5);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 1.5);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
    
    // Add some noise for wind
    const bufferSize = ctx.sampleRate * 1.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.setValueAtTime(500, ctx.currentTime);
    noiseFilter.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.5);
    noiseFilter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 1.5);
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, ctx.currentTime);
    noiseGain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.5);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 1.5);
    noise.start();
  };

  return (
    <AudioContext.Provider value={{ playHover, playClick, playTransition, initAudio, isReady }}>
      {children}
    </AudioContext.Provider>
  );
}

export const useAudio = () => useContext(AudioContext);
