import { useEffect, useRef, useState } from "react";
import { useGachaHandle } from "../hooks/useGachaHandle";
import { playInternalRoll, vibrate } from "../utils/sound";
import Capsule from "./Capsule";

// 実写画像上の座標を計測し、コンテナに対する割合(%)に変換したもの。
// コンテナの aspect-ratio を画像と完全一致させているため、
// このパーセンテージは画面サイズが変わっても常に画像上の同じ点を指す。
// 通常(不透明背景, 1122x1402px)と埋め込み(透明背景, 1145x1374px)は
// 別々に生成された画像で構図が微妙に異なるため、座標を別々に持つ。
const LAYOUT = {
  normal: {
    image: "/images/gacha/gacha-machine-base.png",
    aspectRatio: "1122 / 1402",
    pivotLeftPct: 47.68, // ハンドル回転軸 x
    pivotTopPct: 63.84, // ハンドル回転軸 y
    overlayWidthPct: 42.78, // 切り出したハンドル画像(480px四方)の表示幅
    overlayHeightPct: 34.24, // 同、表示高さ
    trayLeftPct: 49.55,
    trayTopPct: 84,
    domeCenterLeftPct: 48.5,
    domeCenterTopPct: 29.5,
  },
  embed: {
    image: "/images/gacha/memory-gacha-transparent.webp",
    aspectRatio: "1145 / 1374",
    pivotLeftPct: 47.38,
    pivotTopPct: 68.04,
    overlayWidthPct: 41.92,
    overlayHeightPct: 34.93,
    trayLeftPct: 49.55,
    trayTopPct: 85.5,
    domeCenterLeftPct: 48.5,
    domeCenterTopPct: 31.5,
  },
};

// 選ばれたカプセルが「排出口へ向かう」際の、ドーム下部の目標位置
const EXIT_DX_PCT = 0;
const EXIT_DY_PCT = 15;

// ドーム内で軽く揺れる前景カプセル(演出用、実在データとは無関係)
const DOME_FX_CAPSULES = [
  { dxPct: -13, dyPct: -6, size: 30, duration: 3.2 },
  { dxPct: 10, dyPct: -10, size: 24, duration: 2.7 },
  { dxPct: -3, dyPct: 8, size: 26, duration: 3.6 },
  { dxPct: 14, dyPct: 4, size: 22, duration: 2.9 },
  { dxPct: -18, dyPct: 6, size: 20, duration: 3.9 },
  { dxPct: 4, dyPct: -3, size: 18, duration: 3.1 },
  { dxPct: 18, dyPct: -4, size: 21, duration: 3.4 },
];

// 720度到達後の演出タイムライン(ms)
const ENTER_DURATION_MS = 280; // 選ばれたカプセルが本体内部へ消えるまで
const ROLL_DURATION_MS = 550; // 内部でコロコロ転がる時間
const SHAKE_DURATION_MS = 420; // ガコン演出(本体シェイク)の長さ

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}

// ハンドル回転量に応じた3段階の揺れ。ベース秒数×カプセルごとの速度係数で、
// 「回すほど活発になる」×「1個ずつ動きが違う」の両方を満たす。
const AGITATION_TIERS = {
  calm: { name: "og-dome-fx-calm", baseDuration: 4.5 },
  gentle: { name: "og-dome-fx-gentle", baseDuration: 1.9 },
  active: { name: "og-dome-fx-jitter", baseDuration: 0.55 },
};

function getAgitation(rotation) {
  if (rotation < 180) return "calm";
  if (rotation < 360) return "gentle";
  return "active";
}

/**
 * ガチャ本体（共通コア）。
 * PERSONAL固有の文言やデータを持たず、演出とハンドル操作のみを担当する。
 */
export default function GachaMachine({
  stage,
  onComplete,
  onProgress,
  onDropped,
  resetSignal,
  capsuleStage,
  onTapCapsule,
  isEmbed = false,
}) {
  const layout = isEmbed ? LAYOUT.embed : LAYOUT.normal;
  const canTurn = stage === "idle" || stage === "turning";
  const { pivotRef, rotation, progress, handlers, reset } =
    useGachaHandle({
      disabled: !canTurn,
      onComplete,
    });

  // fxPhase: 720度到達後の「本体内部へ消える→転がる→ガコン」演出タイムライン。
  // ハンドル操作ロジック(useGachaHandle)とは独立して、見た目専用の状態として管理する。
  const [fxPhase, setFxPhase] = useState("idle");
  const [selectedIndex, setSelectedIndex] = useState(() =>
    Math.floor(Math.random() * DOME_FX_CAPSULES.length)
  );

  const didMount = useRef(false);
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    reset();
    setSelectedIndex(Math.floor(Math.random() * DOME_FX_CAPSULES.length));
  }, [resetSignal, reset]);

  useEffect(() => {
    if (onProgress) onProgress(rotation, progress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rotation]);

  // 720度到達(stage==='completed') → 本体内部へ消える → 転がる → ガコン、の一連の演出
  useEffect(() => {
    if (stage !== "completed") {
      setFxPhase("idle");
      return undefined;
    }

    setFxPhase("entering");
    const t1 = setTimeout(() => setFxPhase("rolling"), ENTER_DURATION_MS);
    const t2 = setTimeout(() => {
      setFxPhase("gachon");
      if (onDropped) onDropped();
    }, ENTER_DURATION_MS + ROLL_DURATION_MS);
    const t3 = setTimeout(
      () => setFxPhase("idle"),
      ENTER_DURATION_MS + ROLL_DURATION_MS + SHAKE_DURATION_MS
    );

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [stage, onDropped]);

  // 転がり演出が始まった瞬間に一度だけ、音とごく軽い振動を鳴らす
  useEffect(() => {
    if (fxPhase !== "rolling") return;
    playInternalRoll();
    vibrate([10, 40, 10, 40, 10]);
  }, [fxPhase]);

  const agitation = getAgitation(rotation);
  const tier = AGITATION_TIERS[fxPhase === "idle" ? agitation : "calm"];

  const machineExtraClass =
    fxPhase === "gachon" ? "og-machine--shaking" : fxPhase === "rolling" ? "og-machine--rolling" : "";

  return (
    <div
      className={`og-machine ${machineExtraClass}`}
      style={{ aspectRatio: layout.aspectRatio }}
    >
      <img
        className="og-machine-img"
        src={layout.image}
        alt="思い出ガチャ本体"
        draggable={false}
      />

      <div className="og-dome-fx">
        {DOME_FX_CAPSULES.map((c, i) => {
          const isSelected = i === selectedIndex;
          const isLeaving = isSelected && fxPhase !== "idle";

          let dx = c.dxPct;
          let dy = c.dyPct;
          if (isSelected && fxPhase === "idle") {
            // 540〜720度: 選ばれたカプセルが少しずつドーム下部へ寄っていく
            const drift = clamp01((rotation - 540) / 180);
            dx = lerp(c.dxPct, EXIT_DX_PCT, drift);
            dy = lerp(c.dyPct, EXIT_DY_PCT, drift);
          }

          // カプセルごとの速度係数(0.8〜1.2倍)で、同じ段階でも1個ずつ動きをずらす
          const speedFactor = c.duration / 3.2;

          return (
            <span
              key={i}
              className={`og-dome-fx-capsule ${isLeaving ? "og-dome-fx-capsule--entering" : ""}`}
              style={{
                left: `calc(${layout.domeCenterLeftPct}% + ${dx}%)`,
                top: `calc(${layout.domeCenterTopPct}% + ${dy}%)`,
                width: c.size,
                height: c.size,
                animationName: isLeaving ? undefined : tier.name,
                animationDuration: isLeaving
                  ? undefined
                  : `${(tier.baseDuration * speedFactor).toFixed(2)}s`,
                animationDelay: isLeaving ? undefined : `${i * 0.18}s`,
              }}
            />
          );
        })}
        <div className="og-dome-fx-glint" />
      </div>

      {/* 元画像に焼き込まれた静止ハンドルを隠すための、ぼかした土台レイヤー(回転しない) */}
      <div
        className="og-handle-blocker"
        style={{
          left: `${layout.pivotLeftPct}%`,
          top: `${layout.pivotTopPct}%`,
          width: `${layout.overlayWidthPct}%`,
          height: `${layout.overlayHeightPct}%`,
        }}
      />

      {/* 実写から切り出したハンドル(腕+ノブ)。中心軸を基準に回転する */}
      <div
        className="og-handle-rotor"
        style={{
          left: `${layout.pivotLeftPct}%`,
          top: `${layout.pivotTopPct}%`,
          width: `${layout.overlayWidthPct}%`,
          height: `${layout.overlayHeightPct}%`,
          transform: `translate(-50%, -50%) rotate(${-rotation}deg)`,
        }}
      />

      {/* 見た目より大きい透明タッチ判定領域。指がずれても操作できるようにする */}
      <button
        type="button"
        className="og-handle-touch-zone"
        ref={pivotRef}
        {...handlers}
        disabled={!canTurn}
        style={{
          left: `${layout.pivotLeftPct}%`,
          top: `${layout.pivotTopPct}%`,
          pointerEvents: canTurn ? "auto" : "none",
        }}
        aria-label="ガチャハンドル、左に2回まわしてください"
      />

      <div
        className="og-output-slot"
        style={{ left: `${layout.trayLeftPct}%`, top: `${layout.trayTopPct}%` }}
      >
        <Capsule stage={capsuleStage} onTap={onTapCapsule} />
      </div>
    </div>
  );
}
