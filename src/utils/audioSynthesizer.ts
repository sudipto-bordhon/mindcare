// Lightweight Web Audio API synthesizer for ambient meditation and calming breath chimes
// Zero external network requests, reliable and privacy-friendly

let audioCtx: AudioContext | null = null;
let currentNoiseNode: AudioNode | null = null;
let currentGainNode: GainNode | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playBreathChime(type: 'inhale' | 'hold' | 'exhale') {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const freq = type === 'inhale' ? 440 : type === 'hold' ? 523.25 : 349.23; // A4, C5, F4
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.01, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 1.3);
  } catch (e) {
    console.warn('Audio chime notice:', e);
  }
}

export function startAmbientSound(type: 'rain' | 'ocean' | 'forest' | 'birds' | 'whitenoise', volume = 0.25) {
  stopAmbientSound();
  try {
    const ctx = getAudioContext();
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Generate soothing pink/brown noise
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      const baseNoise = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      const seconds = i / ctx.sampleRate;
      const birdChirp = type === 'birds'
        ? Math.sin(seconds * 2 * Math.PI * (1750 + 500 * Math.sin(seconds * 1.7))) * Math.max(0, Math.sin(seconds * 0.75)) ** 16 * 0.22
        : 0;
      output[i] = type === 'birds' ? baseNoise * 0.35 + birdChirp : baseNoise;
      b6 = white * 0.115926;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter depending on selected sound
    const filter = ctx.createBiquadFilter();
    if (type === 'rain') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);
    } else if (type === 'ocean') {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);
      filter.Q.setValueAtTime(1.5, ctx.currentTime);
    } else if (type === 'forest') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1500, ctx.currentTime);
    } else if (type === 'birds') {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, ctx.currentTime);
      filter.Q.setValueAtTime(0.7, ctx.currentTime);
    } else {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
    }

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    whiteNoise.start();
    currentNoiseNode = whiteNoise;
    currentGainNode = gainNode;
  } catch (e) {
    console.warn('Ambient sound play warning:', e);
  }
}

export function stopAmbientSound() {
  if (currentNoiseNode) {
    try {
      (currentNoiseNode as AudioBufferSourceNode).stop();
      currentNoiseNode.disconnect();
    } catch {
      // ignore
    }
    currentNoiseNode = null;
  }
  if (currentGainNode) {
    currentGainNode.disconnect();
    currentGainNode = null;
  }
}
