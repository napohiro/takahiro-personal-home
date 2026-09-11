import { useCallback, useEffect, useRef, useState } from "react";
import GachaMachine from "./GachaMachine";
import MemoryCard from "./MemoryCard";
import { pickRandomMemory } from "../utils/pickRandomMemory";
import { playCapsuleOpen, playGachon, vibrate } from "../utils/sound";
import "./OmoideGacha.css";

const OPEN_DURATION_MS = 650; // カプセルが開く演出の長さ
const RECENT_EXCLUDE_COUNT = 3;

const DEFAULT_TITLE = "思い出ガチャ";
const DEFAULT_SUBTITLE = "あの日を、もう一度。";

/**
 * 思い出ガチャ 本体コンポーネント（共通コア）。
 *
 * このコンポーネント自身はPERSONAL/BUSINESS/PETいずれの文言・データも
 * 内部に持たない。呼び出し側（親サイト）が title / subtitle / memories を
 * 差し替えることで、同じ演出のまま別用途に転用できる想定。
 *
 * props:
 * - title       : 見出し文言（mode="fullscreen"のときのみ表示。省略時は思い出ガチャ用の既定文言）
 * - subtitle    : サブ見出し文言（同上）
 * - memories    : 表示する思い出の配列 [{ id, imageUrl, comment, date, tag }, ...]
 * - mode        : "fullscreen"（TOY BOX等から開く単独画面） | "embed"（ページ内埋め込み）
 * - onBack      : 戻るボタン押下時のコールバック（未指定なら戻るボタン自体を表示しない）
 * - backLabel   : 戻るボタンのラベル文言（省略時は「戻る」）
 */
export default function OmoideGacha({
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
  memories = [],
  mode = "fullscreen",
  onBack,
  backLabel = "戻る",
}) {
  const isEmbed = mode === "embed";

  const [stage, setStage] = useState("idle");
  const [currentMemory, setCurrentMemory] = useState(null);
  const [resetSignal, setResetSignal] = useState(0);
  const [handleRotation, setHandleRotation] = useState(0);

  const recentIdsRef = useRef([]);
  const timeoutsRef = useRef([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const schedule = useCallback((fn, delay) => {
    const id = setTimeout(fn, delay);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  const handleProgress = useCallback((rotation) => {
    setHandleRotation(rotation);
    setStage((prev) => (prev === "idle" && rotation > 0 ? "turning" : prev));
  }, []);

  const handleComplete = useCallback(() => {
    setStage((prev) => {
      if (prev !== "turning" && prev !== "idle") return prev;
      return "completed";
    });
  }, []);

  // GachaMachine内部の「本体へ消える→転がる→ガコン」演出タイムラインが
  // 完了した瞬間に呼ばれる。実際の抽選はここで一度だけ行う。
  const handleDropped = useCallback(() => {
    playGachon();
    vibrate([25, 40, 60]);

    const memory = pickRandomMemory(memories, recentIdsRef.current, RECENT_EXCLUDE_COUNT);
    setCurrentMemory(memory);
    setStage("capsuleDropped");
  }, [memories]);

  const handleTapCapsule = useCallback(() => {
    setStage((prev) => {
      if (prev !== "capsuleDropped") return prev;
      return "capsuleOpening";
    });
  }, []);

  useEffect(() => {
    if (stage !== "capsuleOpening") return;

    playCapsuleOpen();
    vibrate(15);

    schedule(() => {
      setStage("memoryDisplayed");
      if (currentMemory) {
        const next = [...recentIdsRef.current, currentMemory.id];
        recentIdsRef.current = next.slice(-RECENT_EXCLUDE_COUNT);
      }
    }, OPEN_DURATION_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, schedule]);

  const handleSpinAgain = useCallback(() => {
    setCurrentMemory(null);
    setHandleRotation(0);
    setStage("idle");
    setResetSignal((s) => s + 1);
  }, []);

  const capsuleStage =
    stage === "capsuleDropped" || stage === "capsuleOpening"
      ? stage === "capsuleOpening"
        ? "opening"
        : "dropped"
      : null;

  const instruction = getInstruction(stage, handleRotation);
  const hasMemories = memories.length > 0;

  return (
    <div className={`og-root ${isEmbed ? "og-root--embed" : "og-root--fullscreen"}`}>
      {!isEmbed && <div className="og-backdrop" />}

      {!isEmbed && (
        <header className="og-header">
          <h1 className="og-title">{title}</h1>
          {subtitle && <p className="og-subtitle">{subtitle}</p>}
        </header>
      )}

      {onBack && (
        <button type="button" className="og-back-button" onClick={onBack}>
          ← {backLabel}
        </button>
      )}

      <main className="og-main">
        {!hasMemories ? (
          <div className="og-empty">
            <p className="og-empty-title">思い出がまだ登録されていません</p>
          </div>
        ) : (
          <>
            <GachaMachine
              stage={stage}
              onComplete={handleComplete}
              onProgress={handleProgress}
              onDropped={handleDropped}
              resetSignal={resetSignal}
              capsuleStage={capsuleStage}
              onTapCapsule={handleTapCapsule}
              isEmbed={isEmbed}
            />

            {instruction && (
              <p className={`og-instruction ${stage === "turning" ? "og-instruction--active" : ""}`}>
                {instruction}
              </p>
            )}
          </>
        )}
      </main>

      {stage === "memoryDisplayed" && (
        <MemoryCard memory={currentMemory} onSpinAgain={handleSpinAgain} />
      )}
    </div>
  );
}

function getInstruction(stage, rotation) {
  switch (stage) {
    case "idle":
      return "ハンドルを左に2回まわしてね";
    case "turning":
      return rotation >= 360 ? "あと少し！もう半分まわして" : "その調子、まわし続けて";
    default:
      return null;
  }
}
