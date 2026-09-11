import { useEffect, useRef, useState } from "react";
import { playTick } from "../utils/sound";

const READY_DELAY_MS = 400; // 着地後、案内文字が出るまでの間
const SINK_DELAY_MS = 170; // タップ後、沈み込み演出から実際に開き始めるまでの間

export default function Capsule({ stage, onTap }) {
  // phase: falling(落下+バウンド中) -> waiting(着地直後の間) -> ready(タップ可能)
  const [phase, setPhase] = useState("falling");
  const [isSinking, setIsSinking] = useState(false);
  const [prevStage, setPrevStage] = useState(stage);
  const readyTimerRef = useRef(null);
  const sinkTimerRef = useRef(null);

  // stageが新しく'dropped'になった瞬間だけ、演出を最初(落下中)からやり直す。
  // レンダー中にstateを調整する公式パターン(props変化のリセット用)。
  if (stage !== prevStage) {
    setPrevStage(stage);
    if (stage === "dropped") {
      setPhase("falling");
      setIsSinking(false);
    }
  }

  useEffect(() => {
    return () => {
      if (readyTimerRef.current) clearTimeout(readyTimerRef.current);
      if (sinkTimerRef.current) clearTimeout(sinkTimerRef.current);
    };
  }, []);

  if (stage !== "dropped" && stage !== "opening") {
    return <div className="og-capsule-slot-empty" aria-hidden="true" />;
  }

  const isOpening = stage === "opening";

  const handleFallAnimationEnd = () => {
    if (phase !== "falling") return;
    setPhase("waiting");
    readyTimerRef.current = setTimeout(() => setPhase("ready"), READY_DELAY_MS);
  };

  const handleTapCapsule = () => {
    if (isOpening || phase !== "ready" || isSinking) return;
    setIsSinking(true);
    playTick();
    sinkTimerRef.current = setTimeout(() => {
      if (onTap) onTap();
    }, SINK_DELAY_MS);
  };

  const bodyClass = isOpening
    ? "og-capsule-body--opening"
    : phase === "falling"
    ? "og-capsule-body--falling"
    : isSinking
    ? "og-capsule-body--sinking"
    : "og-capsule-body--bobbing";

  return (
    <button
      type="button"
      className="og-capsule"
      onClick={handleTapCapsule}
      disabled={isOpening || phase !== "ready" || isSinking}
      aria-label="カプセルをタップして開ける"
    >
      <span className={`og-capsule-body ${bodyClass}`} onAnimationEnd={handleFallAnimationEnd}>
        <span className="og-capsule-half og-capsule-top" />
        <span className="og-capsule-inner-hint" />
        <span className="og-capsule-half og-capsule-bottom" />
        <span className="og-capsule-shine" />
        {isOpening && <span className="og-capsule-burst" />}
      </span>
      {phase === "ready" && !isOpening && (
        <span className="og-capsule-hint">タップして開ける</span>
      )}
    </button>
  );
}
