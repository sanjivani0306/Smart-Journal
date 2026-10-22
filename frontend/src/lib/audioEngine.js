// Web Audio API procedural audio engine for smart journal ambience & music synthesis
// Generates completely real, organic ambient soundscapes and gentle generative music in the browser

class AmbientAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.tracks = {};
    this.chordsInterval = null;
    this.timerInterval = null;
    this.onTimerTick = null;
    this.onTimerComplete = null;
    this.isInitialized = false;

    // Track volume states (0.0 to 1.0)
    this.trackVolumes = {
      rain: 0,
      ocean: 0,
      crackle: 0,
      binaural: 0,
      chords: 0,
      bowl: 0,
      wind: 0,
    };
    this.masterVolumeValue = 0.75;
  }

  init() {
    if (this.isInitialized && this.ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      console.warn('Web Audio API is not supported in this browser.');
      return;
    }

    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.masterVolumeValue, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
    this.isInitialized = true;
  }

  async resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  // --- Track Synthesizers ---

  // 1. Rain Synthesizer (Pink noise with bandpass/lowpass filtering)
  _startRain() {
    if (this.tracks.rain || !this.ctx) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to sound like soft rainfall on a window
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1100, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.trackVolumes.rain, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    whiteNoise.start();

    this.tracks.rain = { source: whiteNoise, filter, gain };
  }

  // 2. Ocean Waves (Modulated bandpass pink noise simulating swelling tides)
  _startOcean() {
    if (this.tracks.ocean || !this.ctx) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.2;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, this.ctx.currentTime);

    // LFO for wave swelling rhythm (10 second cycle)
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.1, this.ctx.currentTime);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(250, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.trackVolumes.ocean, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    lfo.start();

    this.tracks.ocean = { source: noise, lfo, filter, gain };
  }

  // 3. Cozy Vinyl & Fire Crackle
  _startCrackle() {
    if (this.tracks.crackle || !this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Occasional random pop / crackle
      if (Math.random() < 0.0035) {
        data[i] = (Math.random() * 2 - 1) * 0.45;
      } else {
        data[i] = (Math.random() * 2 - 1) * 0.005;
      }
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1400, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.trackVolumes.crackle, this.ctx.currentTime);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start();

    this.tracks.crackle = { source, gain };
  }

  // 4. Binaural Beats & Harmonic Drone (432Hz + 6Hz Theta frequency)
  _startBinaural() {
    if (this.tracks.binaural || !this.ctx) return;
    const baseFreq = 216; // A3 harmonic
    const thetaDelta = 6; // 6Hz Theta wave for introspective reflection

    const oscLeft = this.ctx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

    const oscRight = this.ctx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.setValueAtTime(baseFreq + thetaDelta, this.ctx.currentTime);

    // Warm sub drone
    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(baseFreq / 2, this.ctx.currentTime);

    const merger = this.ctx.createChannelMerger(2);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.trackVolumes.binaural * 0.7, this.ctx.currentTime);

    oscLeft.connect(merger, 0, 0);
    oscRight.connect(merger, 0, 1);
    subOsc.connect(gain);
    merger.connect(gain);
    gain.connect(this.masterGain);

    oscLeft.start();
    oscRight.start();
    subOsc.start();

    this.tracks.binaural = { oscLeft, oscRight, subOsc, gain };
  }

  // 5. Ambient Generative Piano / Rhodes Chords (Evolving Pentatonic Harmonies)
  _startChords() {
    if (this.tracks.chords || !this.ctx) return;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.trackVolumes.chords, this.ctx.currentTime);
    gain.connect(this.masterGain);

    this.tracks.chords = { gain };

    // Gentle chord frequencies (Cmaj9, Am9, Fmaj7, G6)
    const chordProgressions = [
      [261.63, 329.63, 392.00, 493.88, 587.33], // C, E, G, B, D
      [220.00, 261.63, 329.63, 392.00, 440.00], // A, C, E, G, A
      [174.61, 220.00, 261.63, 329.63, 392.00], // F, A, C, E, G
      [196.00, 246.94, 293.66, 392.00, 440.00], // G, B, D, G, A
    ];

    let chordIdx = 0;
    const playChord = () => {
      if (!this.ctx || !this.tracks.chords || this.trackVolumes.chords <= 0) return;
      const notes = chordProgressions[chordIdx % chordProgressions.length];
      chordIdx++;

      const now = this.ctx.currentTime;
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        // Soft attack and slow warm decay
        const delay = i * 0.15;
        noteGain.gain.setValueAtTime(0, now + delay);
        noteGain.gain.linearRampToValueAtTime(0.045, now + delay + 0.8);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 5.5);

        osc.connect(noteGain);
        noteGain.connect(gain);

        osc.start(now + delay);
        osc.stop(now + delay + 6.0);
      });
    };

    playChord();
    this.chordsInterval = setInterval(playChord, 5200);
  }

  // 6. Tibetan Singing Bowl / Chime
  _startBowl() {
    if (this.tracks.bowl || !this.ctx) return;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.trackVolumes.bowl, this.ctx.currentTime);
    gain.connect(this.masterGain);
    this.tracks.bowl = { gain };

    const strikeBowl = () => {
      if (!this.ctx || !this.tracks.bowl || this.trackVolumes.bowl <= 0) return;
      const now = this.ctx.currentTime;
      const fundamentals = [216, 288, 432];
      const base = fundamentals[Math.floor(Math.random() * fundamentals.length)];

      [base, base * 2.76, base * 5.4].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const amp = idx === 0 ? 0.08 : 0.025;
        noteGain.gain.setValueAtTime(amp, now);
        noteGain.gain.exponentialRampToValueAtTime(0.00001, now + 7.0);

        osc.connect(noteGain);
        noteGain.connect(gain);
        osc.start(now);
        osc.stop(now + 7.5);
      });
    };

    strikeBowl();
    this.bowlInterval = setInterval(strikeBowl, 8500);
  }

  // 7. Whispering Wind & Forest Chimes
  _startWind() {
    if (this.tracks.wind || !this.ctx) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.15;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(3.0, this.ctx.currentTime);
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);

    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.18, this.ctx.currentTime);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(250, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.trackVolumes.wind, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    lfo.start();

    this.tracks.wind = { source: noise, lfo, gain };
  }

  // Set track volume dynamically
  setTrackVolume(trackName, volume) {
    const clamped = Math.max(0, Math.min(1, volume));
    this.trackVolumes[trackName] = clamped;

    if (!this.isPlaying) return;

    if (clamped > 0) {
      if (!this.tracks[trackName]) {
        switch (trackName) {
          case 'rain': this._startRain(); break;
          case 'ocean': this._startOcean(); break;
          case 'crackle': this._startCrackle(); break;
          case 'binaural': this._startBinaural(); break;
          case 'chords': this._startChords(); break;
          case 'bowl': this._startBowl(); break;
          case 'wind': this._startWind(); break;
        }
      }
      if (this.tracks[trackName]?.gain && this.ctx) {
        this.tracks[trackName].gain.gain.linearRampToValueAtTime(
          clamped * (trackName === 'binaural' ? 0.7 : 1),
          this.ctx.currentTime + 0.1
        );
      }
    } else {
      if (this.tracks[trackName]?.gain && this.ctx) {
        this.tracks[trackName].gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);
      }
    }
  }

  setMasterVolume(volume) {
    this.masterVolumeValue = Math.max(0, Math.min(1, volume));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(this.masterVolumeValue, this.ctx.currentTime + 0.05);
    }
  }

  async play() {
    await this.resume();
    this.isPlaying = true;

    // Start all tracks that have volume > 0
    Object.keys(this.trackVolumes).forEach(track => {
      if (this.trackVolumes[track] > 0) {
        this.setTrackVolume(track, this.trackVolumes[track]);
      }
    });
  }

  pause() {
    this.isPlaying = false;
    if (this.chordsInterval) clearInterval(this.chordsInterval);
    if (this.bowlInterval) clearInterval(this.bowlInterval);
    this.chordsInterval = null;
    this.bowlInterval = null;

    Object.keys(this.tracks).forEach(trackName => {
      const t = this.tracks[trackName];
      try {
        if (t.source) t.source.stop();
        if (t.lfo) t.lfo.stop();
        if (t.oscLeft) t.oscLeft.stop();
        if (t.oscRight) t.oscRight.stop();
        if (t.subOsc) t.subOsc.stop();
      } catch {
        // already stopped
      }
    });
    this.tracks = {};
  }

  // Play a short completion chime when meditation/journaling timer finishes
  playCompletionBell() {
    if (!this.ctx) this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [528, 792, 1056].forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);

      gain.gain.setValueAtTime(0.12 / (i + 1), now);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + 4.0);

      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 4.5);
    });
  }
}

export const audioEngine = new AmbientAudioEngine();
