// Web Audio API Sound Synthesizer for NightGuard Pro
// Guaranteed zero-dependency audio that works in all modern browsers

class SoundController {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  private currentSirenInterval: number | null = null;
  private isSirenActive: boolean = false;
  private currentAlarmInterval: number | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Loud high-pitch beep for wake-up alert
  public playWakeUpBeep() {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.15); // E6

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // Start continuous pulse wake-up beeper
  public startWakeUpAlarm() {
    this.stopWakeUpAlarm();
    this.playWakeUpBeep();
    this.currentAlarmInterval = window.setInterval(() => {
      this.playWakeUpBeep();
    }, 600);
  }

  public stopWakeUpAlarm() {
    if (this.currentAlarmInterval) {
      clearInterval(this.currentAlarmInterval);
      this.currentAlarmInterval = null;
    }
  }

  // Loud Emergency Siren (SOS)
  public startSiren() {
    if (this.isSirenActive) return;
    this.isSirenActive = true;

    const runWail = () => {
      if (!this.isSirenActive || this.isMuted) return;
      try {
        const ctx = this.initCtx();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(950, ctx.currentTime + 0.5);
        osc.frequency.linearRampToValueAtTime(450, ctx.currentTime + 1.0);

        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.setValueAtTime(0.4, ctx.currentTime + 0.95);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 1.0);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 1.0);
      } catch {
        // Silently catch
      }
    };

    runWail();
    this.currentSirenInterval = window.setInterval(runWail, 1050);
  }

  public stopSiren() {
    this.isSirenActive = false;
    if (this.currentSirenInterval) {
      clearInterval(this.currentSirenInterval);
      this.currentSirenInterval = null;
    }
  }

  // Success chime for completed checkpoint scan or awake confirmed
  public playSuccessChime() {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      // C5 to G5 pleasant chime
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc2.frequency.setValueAtTime(783.99, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.2);

      osc2.start(ctx.currentTime + 0.12);
      osc2.stop(ctx.currentTime + 0.6);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // Radio squelch / walkie-talkie click
  public playRadioClick() {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      // Burst of noise + blip
      const bufferSize = ctx.sampleRate * 0.08;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1800;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // Vibration simulation
  public triggerVibrate(pattern: number[] = [200, 100, 200, 100, 400]) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Fallback
      }
    }
  }
}

export const sound = new SoundController();
