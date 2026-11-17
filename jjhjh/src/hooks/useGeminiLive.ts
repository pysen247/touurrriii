/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Custom hook for real-time voice conversations via Gemini Live API (model: gemini-3.1-flash-live-preview)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { floatTo16BitPCM, arrayBufferToBase64, GeminiLiveAudioPlayer } from '../utils/geminiLiveAudio';

export interface LiveTranscriptItem {
  id: string;
  role: 'user' | 'model';
  text: string;
  time: string;
}

export type VoiceName = 'Zephyr' | 'Puck' | 'Charon' | 'Kore' | 'Fenrir';

export function useGeminiLive(initialVoice: VoiceName = 'Zephyr') {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>(initialVoice);
  const [transcripts, setTranscripts] = useState<LiveTranscriptItem[]>([]);
  const [inputVolume, setInputVolume] = useState(0);
  const [outputVolume, setOutputVolume] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // References to preserve state across stream processing cycles
  const wsRef = useRef<WebSocket | null>(null);
  const playerRef = useRef<GeminiLiveAudioPlayer>(new GeminiLiveAudioPlayer());
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const isMutedRef = useRef(false);
  const animFrameRef = useRef<number | null>(null);

  // Keep isMutedRef in sync
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Audio level polling loop for visualizer
  const updateVolumes = useCallback(() => {
    // 1. Output volume from player
    if (playerRef.current) {
      setOutputVolume(playerRef.current.getVolumeLevel());
    }

    // 2. Input volume from mic
    if (micAnalyserRef.current && !isMutedRef.current) {
      const data = new Uint8Array(micAnalyserRef.current.frequencyBinCount);
      micAnalyserRef.current.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i];
      const avg = Math.min(100, Math.round((sum / (data.length * 255)) * 100));
      setInputVolume(avg);
    } else {
      setInputVolume(0);
    }

    animFrameRef.current = requestAnimationFrame(updateVolumes);
  }, []);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(updateVolumes);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [updateVolumes]);

  // Clean up all audio nodes & microphone
  const cleanupAudio = useCallback(() => {
    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch {}
      processorRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (inputAudioCtxRef.current && inputAudioCtxRef.current.state !== 'closed') {
      try {
        inputAudioCtxRef.current.close();
      } catch {}
      inputAudioCtxRef.current = null;
    }
    if (playerRef.current) {
      playerRef.current.stopAll(() => setIsModelSpeaking(false));
    }
  }, []);

  // Disconnect session
  const disconnectSession = useCallback(() => {
    cleanupAudio();
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
    setIsModelSpeaking(false);
  }, [cleanupAudio]);

  // Connect to Live API WebSocket
  const connectSession = useCallback(async (voice?: VoiceName) => {
    disconnectSession();
    setIsConnecting(true);
    setErrorMessage(null);

    const activeVoice = voice || selectedVoice;

    try {
      // 1. Initialize Microphone (16kHz PCM little-endian stream)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioCtx({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputCtx;

      const micSource = inputCtx.createMediaStreamSource(stream);
      const analyser = inputCtx.createAnalyser();
      analyser.fftSize = 64;
      micAnalyserRef.current = analyser;
      micSource.connect(analyser);

      // ScriptProcessor buffer (4096 frames = ~256ms of 16kHz audio)
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      micSource.connect(processor);
      processor.connect(inputCtx.destination);

      // 2. Setup WebSocket protocol (ws or wss)
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        // Send initial config with selected voice
        ws.send(JSON.stringify({ config: { voiceName: activeVoice } }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.error) {
            setErrorMessage(msg.error);
            return;
          }

          // Spoken Audio chunk (PCM 24kHz)
          if (msg.audio) {
            playerRef.current.playChunk(msg.audio, (speaking) => {
              setIsModelSpeaking(speaking);
            });
          }

          // User Speech Transcription
          if (msg.userTranscript) {
            setTranscripts((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.role === 'user' && Date.now() - parseInt(last.id) < 4000) {
                return [...prev.slice(0, -1), { ...last, text: `${last.text} ${msg.userTranscript}`.trim() }];
              }
              return [
                ...prev,
                {
                  id: String(Date.now()),
                  role: 'user',
                  text: msg.userTranscript,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ];
            });
          }

          // Model Text Transcription
          if (msg.text) {
            setTranscripts((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.role === 'model' && Date.now() - parseInt(last.id) < 5000) {
                return [...prev.slice(0, -1), { ...last, text: `${last.text} ${msg.text}`.trim() }];
              }
              return [
                ...prev,
                {
                  id: String(Date.now()),
                  role: 'model',
                  text: msg.text,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ];
            });
          }

          // Interruption event (user started speaking while model was playing)
          if (msg.interrupted) {
            playerRef.current.stopAll(() => setIsModelSpeaking(false));
          }

          if (msg.turnComplete) {
            // Model finished turn
          }
        } catch (e) {
          console.error('Error parsing live WS message:', e);
        }
      };

      ws.onerror = (e) => {
        console.error('Live API WebSocket Error:', e);
        setErrorMessage('Connection to Live API service interrupted.');
        setIsConnecting(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
      };

      // 3. Pipe mic buffer to WebSocket
      processor.onaudioprocess = (e) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || isMutedRef.current) {
          return;
        }
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmBuffer = floatTo16BitPCM(inputData);
        const base64 = arrayBufferToBase64(pcmBuffer);
        wsRef.current.send(JSON.stringify({ audio: base64 }));
      };
    } catch (err: any) {
      console.error('Failed to start Live Voice session:', err);
      setErrorMessage(err.message || 'Microphone access denied or Live API unavailable.');
      setIsConnecting(false);
      cleanupAudio();
    }
  }, [selectedVoice, disconnectSession, cleanupAudio]);

  // Send text directly to Live session
  const sendTextMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ text }));
      setTranscripts((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          role: 'user',
          text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, []);

  // Change Voice
  const setVoice = useCallback((voice: VoiceName) => {
    setSelectedVoice(voice);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ config: { voiceName: voice } }));
    }
  }, []);

  // Clear Transcripts
  const clearTranscripts = useCallback(() => {
    setTranscripts([]);
  }, []);

  // Toggle Mute
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectSession();
    };
  }, [disconnectSession]);

  return {
    isConnected,
    isConnecting,
    isMuted,
    isModelSpeaking,
    selectedVoice,
    transcripts,
    inputVolume,
    outputVolume,
    errorMessage,
    connectSession,
    disconnectSession,
    sendTextMessage,
    setVoice,
    toggleMute,
    clearTranscripts,
  };
}
