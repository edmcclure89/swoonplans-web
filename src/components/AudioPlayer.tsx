import React, { useEffect, useRef } from 'react';

interface AudioPlayerProps {
  isPlaying: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ isPlaying }) => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  useEffect(() => {
    if (isPlaying) {
      try {
        const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
        const ctx = new AudioContext();
        audioCtxRef.current = ctx;

        // Subtle ambient harmonic warm chord (E-flat major 7 soft synth glow)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(155.56, ctx.currentTime); // Eb3

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(233.08, ctx.currentTime); // Bb3

        gain.gain.setValueAtTime(0.015, ctx.currentTime); // Very soft background volume

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start();
        osc2.start();

        oscillatorRef.current = osc1;
      } catch (e) {
        console.log('Web Audio API initialized on user interaction');
      }
    } else {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    }

    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [isPlaying]);

  return null;
};
