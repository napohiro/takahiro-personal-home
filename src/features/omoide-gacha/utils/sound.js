/**
 * 効果音ユーティリティ。
 *
 * 外部の音声ファイルを使わず、Web Audio API でその場に生成する。
 * ユーザー操作（pointerdown 等）のハンドラ内から呼ばれるため、
 * ブラウザの自動再生ポリシーにも抵触しない。
 */

let audioCtx = null;

function getContext() {
  if (typeof window === "undefined") return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/** ハンドルが1回転したときの「カチッ」という軽いクリック音 */
export function playTick() {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(1400, now);
  osc.frequency.exponentialRampToValueAtTime(700, now + 0.04);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.18, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.08);
}

/** ラチェットの細かい歯車音（回転中に軽く鳴らす用の極小クリック） */
export function playSoftTick() {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(2200, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.05, now + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.04);
}

/** 2回転達成時の「ガコン！」という重い排出音 */
export function playGachon() {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // 低い衝撃音
  const thud = ctx.createOscillator();
  const thudGain = ctx.createGain();
  thud.type = "triangle";
  thud.frequency.setValueAtTime(160, now);
  thud.frequency.exponentialRampToValueAtTime(45, now + 0.25);
  thudGain.gain.setValueAtTime(0.0001, now);
  thudGain.gain.exponentialRampToValueAtTime(0.5, now + 0.02);
  thudGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
  thud.connect(thudGain).connect(ctx.destination);
  thud.start(now);
  thud.stop(now + 0.4);

  // 機械的なガコン感を出すノイズバースト
  const bufferSize = ctx.sampleRate * 0.15;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "lowpass";
  noiseFilter.frequency.setValueAtTime(900, now);
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.25, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
  noise.connect(noiseFilter).connect(noiseGain).connect(ctx.destination);
  noise.start(now);
  noise.stop(now + 0.15);
}

/** 選ばれたカプセルが本体内部でコロコロと転がる音（0.3〜0.7秒程度で使う） */
export function playInternalRoll() {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const knocks = 6;
  let t = 0;
  for (let i = 0; i < knocks; i++) {
    t += 0.06 + Math.random() * 0.05;
    const start = now + t;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    const freq = 170 + Math.random() * 60;
    osc.frequency.setValueAtTime(freq, start);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.6, start + 0.05);

    const vol = 0.08 + Math.random() * 0.05;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(vol, start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.06);

    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.07);
  }
}

/** カプセルが開く瞬間の柔らかいキラッとした音 */
export function playCapsuleOpen() {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  [660, 880, 1320].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + i * 0.03);
    gain.gain.setValueAtTime(0.0001, now + i * 0.03);
    gain.gain.exponentialRampToValueAtTime(0.12, now + i * 0.03 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.03 + 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now + i * 0.03);
    osc.stop(now + i * 0.03 + 0.45);
  });
}

/** 端末が対応していれば短いバイブレーションを行う */
export function vibrate(pattern) {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    navigator.vibrate(pattern);
  }
}
