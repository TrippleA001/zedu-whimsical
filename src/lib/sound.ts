"use client";

/**
 * A tiny Web Audio synth. No samples, no deps — just oscillators with
 * envelopes, so every send / react / join has a personality.
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

let ambientBus: GainNode | null = null;
let ambientFilter: BiquadFilterNode | null = null;
let ambientNoise: GainNode | null = null;
let ambientDelay: DelayNode | null = null;
let ambientWet: GainNode | null = null;
let ambientVerb: GainNode | null = null;
let ambientVerbWet: GainNode | null = null;
let ambientTimer: number | null = null;
let ambientChord = 0;
let lastIntensity = -1;
let ambientOn = false;
let ambientStarted = false;

/* A minor · F major · G major · C major, voiced low enough to sit under copy */
const CHORDS = [
  [110, 164.81, 220, 261.63],
  [87.31, 130.81, 174.61, 220],
  [98, 146.83, 196, 246.94],
  [130.81, 164.81, 196, 261.63],
];

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  master = ctx.createGain();
  master.gain.value = 0.26;
  master.connect(ctx.destination);
  return ctx;
}

function noiseBuffer(c: AudioContext) {
  const length = Math.floor(c.sampleRate * 2);
  const buffer = c.createBuffer(1, length, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function impulseResponse(c: AudioContext, duration: number, decay: number) {
  const length = Math.floor(c.sampleRate * duration);
  const buffer = c.createBuffer(2, length, c.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      const fadeIn = Math.min(1, i / (c.sampleRate * 0.012));
      data[i] =
        (Math.random() * 2 - 1) *
        Math.pow(1 - i / length, decay) *
        fadeIn;
    }
  }
  return buffer;
}

/**
 * A generative room tone: a low drone, a slow four-chord pad, a delay-fed
 * arpeggio and filtered air. It fades in on the first gesture and opens up as
 * the visitor moves deeper into the page.
 */
function padTone(
  freq: number,
  when: number,
  dur: number,
  gain: number,
  pan: number,
  type: OscillatorType,
  send: number,
) {
  const c = audio();
  if (!c || !ambientBus) return;

  const osc = c.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  osc.detune.value = (Math.random() - 0.5) * 7;

  const env = c.createGain();
  env.gain.setValueAtTime(0.0001, when);
  env.gain.linearRampToValueAtTime(gain, when + Math.min(1.8, dur * 0.35));
  env.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  osc.connect(env);

  if (typeof c.createStereoPanner === "function") {
    const panner = c.createStereoPanner();
    panner.pan.value = pan;
    env.connect(panner);
    panner.connect(ambientBus);
  } else {
    env.connect(ambientBus);
  }

  if (ambientDelay && send > 0) {
    const sendGain = c.createGain();
    sendGain.gain.value = send;
    env.connect(sendGain);
    sendGain.connect(ambientDelay);
    if (ambientVerb) sendGain.connect(ambientVerb);
  }

  osc.start(when);
  osc.stop(when + dur + 0.05);
}

function airSwell(when: number, dur: number, gain: number) {
  const c = audio();
  if (!c || !ambientBus) return;

  const source = c.createBufferSource();
  source.buffer = noiseBuffer(c);
  source.loop = true;
  const band = c.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 1180;
  band.Q.value = 1.1;
  const env = c.createGain();
  env.gain.setValueAtTime(0.0001, when);
  env.gain.linearRampToValueAtTime(gain, when + dur * 0.42);
  env.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  source.connect(band);
  band.connect(env);
  env.connect(ambientBus);
  source.start(when);
  source.stop(when + dur + 0.1);
}

/** A short reverse-swell / air pass for section changes. */
function whoosh(dur: number, gain: number, pan: number) {
  const c = audio();
  if (!c || !master) return;

  const now = c.currentTime;
  const source = c.createBufferSource();
  source.buffer = noiseBuffer(c);
  source.loop = true;

  const band = c.createBiquadFilter();
  band.type = "bandpass";
  band.Q.value = 1.3;
  band.frequency.setValueAtTime(260, now);
  band.frequency.exponentialRampToValueAtTime(2600, now + dur * 0.58);
  band.frequency.exponentialRampToValueAtTime(240, now + dur);

  const env = c.createGain();
  env.gain.setValueAtTime(0.0001, now);
  env.gain.linearRampToValueAtTime(gain, now + dur * 0.34);
  env.gain.exponentialRampToValueAtTime(0.0001, now + dur);

  source.connect(band);
  band.connect(env);

  if (typeof c.createStereoPanner === "function") {
    const panner = c.createStereoPanner();
    panner.pan.value = pan;
    env.connect(panner);
    panner.connect(master);
  } else {
    env.connect(master);
  }

  source.start(now);
  source.stop(now + dur + 0.08);
}

function startGenerative() {
  if (ambientTimer !== null) return;

  const play = () => {
    const c = audio();
    if (!c || !ambientOn || !ambientBus) return;

    const chord = CHORDS[ambientChord % CHORDS.length];
    ambientChord += 1;
    const now = c.currentTime + 0.08;

    chord.forEach((freq, index) => {
      const pan = index % 2 === 0 ? -0.5 : 0.5;
      padTone(freq, now + index * 0.05, 8.4, 0.028, pan, "sine", 0.4);
      padTone(
        freq * 2,
        now + 0.2 + index * 0.05,
        6.2,
        0.008,
        -pan,
        "triangle",
        0.55,
      );
    });

    const arp = [0, 2, 1, 3, 2, 1].map((note) => chord[note]);
    arp.forEach((freq, index) => {
      padTone(
        freq * 4,
        now + 2.1 + index * 0.52,
        0.75,
        0.026,
        index % 2 === 0 ? 0.62 : -0.62,
        "triangle",
        0.75,
      );
    });

    airSwell(now + 0.2, 5.5, 0.012);
  };

  play();
  ambientTimer = window.setInterval(play, 9000);
}

export function startAmbience() {
  const c = audio();
  if (!c || !master) return;
  if (c.state === "suspended") void c.resume();
  ambientOn = true;

  if (ambientStarted && ambientBus) {
    ambientBus.gain.setTargetAtTime(0.6, c.currentTime, 0.8);
    startGenerative();
    return;
  }

  const bus = c.createGain();
  bus.gain.value = 0.0001;
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 900;
  filter.Q.value = 0.8;
  bus.connect(filter);
  filter.connect(master);

  /* a small tape-ish delay turns single notes into a moving field */
  const delay = c.createDelay(2);
  delay.delayTime.value = 0.46;
  const feedback = c.createGain();
  feedback.gain.value = 0.32;
  const wet = c.createGain();
  wet.gain.value = 0.45;
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(wet);
  wet.connect(bus);

  /* a synthetic hall for the pads and arpeggios */
  const convolver = c.createConvolver();
  convolver.buffer = impulseResponse(c, 2.6, 2.4);
  const verbWet = c.createGain();
  verbWet.gain.value = 0.3;
  const verbSend = c.createGain();
  verbSend.gain.value = 1;
  verbSend.connect(convolver);
  convolver.connect(verbWet);
  verbWet.connect(bus);

  [55, 82.5, 110, 165].forEach((freq, index) => {
    const osc = c.createOscillator();
    osc.type = index === 1 ? "triangle" : "sine";
    osc.frequency.value = freq;
    osc.detune.value = index === 3 ? 4 : index === 2 ? -5 : 0;
    const gain = c.createGain();
    gain.gain.value = index === 0 ? 0.2 : index === 1 ? 0.1 : index === 2 ? 0.06 : 0.035;
    osc.connect(gain);
    gain.connect(bus);
    osc.start();
  });

  const noise = c.createBufferSource();
  noise.buffer = noiseBuffer(c);
  noise.loop = true;
  const noiseFilter = c.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.value = 850;
  noiseFilter.Q.value = 0.65;
  const noiseGain = c.createGain();
  noiseGain.gain.value = 0.014;
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(bus);
  noise.start();

  ambientBus = bus;
  ambientFilter = filter;
  ambientNoise = noiseGain;
  ambientDelay = delay;
  ambientWet = wet;
  ambientVerb = verbSend;
  ambientVerbWet = verbWet;
  ambientStarted = true;
  bus.gain.setTargetAtTime(0.6, c.currentTime, 1.4);

  /* a soft hello so the first gesture is answered by the room */
  whoosh(1.1, 0.045, -0.2);
  voice({ freq: 98, to: 49, type: "sine", dur: 1.25, gain: 0.14 });
  [523.25, 659.25, 783.99].forEach((freq, index) => {
    padTone(
      freq,
      c.currentTime + 0.12 + index * 0.16,
      1.2,
      0.045,
      index % 2 === 0 ? -0.35 : 0.35,
      "sine",
      0.55,
    );
  });

  startGenerative();
}

export function stopAmbience() {
  ambientOn = false;
  lastIntensity = -1;
  if (ambientTimer !== null) {
    window.clearInterval(ambientTimer);
    ambientTimer = null;
  }
  if (!ctx || !ambientBus) return;
  ambientBus.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.3);
}

export function isAmbienceEnabled() {
  return ambientOn && ambientStarted;
}

export function setAmbienceIntensity(value: number) {
  if (!ctx || !ambientStarted) return;
  const v = Math.min(1, Math.max(0, value));
  if (Math.abs(v - lastIntensity) < 0.012) return;
  lastIntensity = v;
  ambientFilter?.frequency.setTargetAtTime(
    700 + v * 1500,
    ctx.currentTime,
    0.45,
  );
  ambientNoise?.gain.setTargetAtTime(0.01 + v * 0.03, ctx.currentTime, 0.45);
  ambientWet?.gain.setTargetAtTime(0.42 + v * 0.35, ctx.currentTime, 0.6);
  ambientVerbWet?.gain.setTargetAtTime(0.28 + v * 0.26, ctx.currentTime, 0.6);
}

export function unlockAudio() {
  const c = audio();
  if (c && c.state === "suspended") void c.resume();
}

type Voice = {
  freq: number;
  to?: number;
  type?: OscillatorType;
  dur?: number;
  gain?: number;
  delay?: number;
};

function voice({ freq, to, type = "sine", dur = 0.3, gain = 0.5, delay = 0 }: Voice) {
  const c = audio();
  if (!c || !master) return;
  const start = c.currentTime + delay;
  const osc = c.createOscillator();
  const env = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, start + dur);
  env.gain.setValueAtTime(0.0001, start);
  env.gain.exponentialRampToValueAtTime(gain, start + 0.012);
  env.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(env);
  env.connect(master);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

export type CueName = "hover" | "click" | "chapter" | "faq";

/**
 * Landing-page cues share the same master bus as the studio one-shots, but
 * only speak while the ambience is armed, so muting one switch silences all.
 */
export function playCue(name: CueName) {
  if (!ambientOn) return;
  try {
    switch (name) {
      case "hover": {
        const notes = [1046.5, 1174.66, 1318.51, 1567.98];
        const freq = notes[Math.floor(Math.random() * notes.length)];
        voice({ freq, to: freq * 1.06, type: "sine", dur: 0.09, gain: 0.03 });
        break;
      }
      case "click": {
        const roots = [392, 440, 523.25];
        const root = roots[Math.floor(Math.random() * roots.length)];
        voice({ freq: root, to: root * 1.18, type: "triangle", dur: 0.16, gain: 0.11 });
        voice({ freq: root * 2, type: "sine", dur: 0.12, gain: 0.035, delay: 0.02 });
        break;
      }
      case "chapter":
        whoosh(0.85, 0.06, ambientChord % 2 === 0 ? -0.35 : 0.35);
        voice({ freq: 110, to: 55, type: "sine", dur: 0.95, gain: 0.18 });
        voice({ freq: 659.25, to: 987.77, type: "sine", dur: 0.7, gain: 0.055, delay: 0.08 });
        voice({ freq: 329.63, type: "triangle", dur: 0.55, gain: 0.04, delay: 0.16 });
        break;
      case "faq":
        voice({ freq: 880, to: 1174.66, type: "triangle", dur: 0.14, gain: 0.07 });
        voice({ freq: 1760, type: "sine", dur: 0.1, gain: 0.02, delay: 0.03 });
        break;
    }
  } catch {
    /* silence is an acceptable fallback */
  }
}

export type SoundName =
  | "send"
  | "receive"
  | "react"
  | "join"
  | "leave"
  | "open"
  | "error";

export function playSound(name: SoundName, enabled: boolean) {
  if (!enabled) return;
  try {
    switch (name) {
      case "send":
        voice({ freq: 520, to: 880, type: "sine", dur: 0.18, gain: 0.32 });
        voice({ freq: 1040, to: 1320, type: "triangle", dur: 0.12, gain: 0.12, delay: 0.02 });
        break;
      case "receive":
        voice({ freq: 660, to: 990, type: "sine", dur: 0.26, gain: 0.22 });
        voice({ freq: 990, to: 1320, type: "sine", dur: 0.3, gain: 0.1, delay: 0.06 });
        break;
      case "react":
        voice({ freq: 880, to: 1480, type: "triangle", dur: 0.12, gain: 0.24 });
        break;
      case "join":
        [392, 523, 659, 784].forEach((f, i) =>
          voice({ freq: f, type: "sine", dur: 0.5, gain: 0.18, delay: i * 0.06 }),
        );
        break;
      case "leave":
        [784, 587, 392].forEach((f, i) =>
          voice({ freq: f, type: "sine", dur: 0.35, gain: 0.16, delay: i * 0.07 }),
        );
        break;
      case "open":
        voice({ freq: 300, to: 620, type: "sine", dur: 0.2, gain: 0.14 });
        break;
      case "error":
        voice({ freq: 220, to: 160, type: "sawtooth", dur: 0.18, gain: 0.12 });
        break;
    }
  } catch {
    /* audio is a garnish, never a requirement */
  }
}
