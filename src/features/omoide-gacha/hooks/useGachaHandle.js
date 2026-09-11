import { useCallback, useEffect, useRef, useState } from "react";
import { playSoftTick, playTick } from "../utils/sound";
import { vibrate } from "../utils/sound";

const REQUIRED_DEGREES = 720; // 2回転
const ONE_TURN_DEGREES = 360;
const MIN_DRAG_RADIUS = 18; // 中心付近の不安定なポインタを無視する半径(px)
const SOFT_TICK_STEP = 45; // ラチェット感を出す細かいクリックの間隔(deg)

/** -180〜180 の範囲での最短角度差を返す */
function shortestAngleDiff(next, prev) {
  let diff = (next - prev) % 360;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff;
}

/**
 * ガチャのハンドルを「実際に指/マウスで左に2回転させる」ための操作フック。
 *
 * - pivotRef を付けた要素の中心を回転軸として、ポインタの角度から
 *   左回転(反時計回り)の移動量だけを積算していく（ラチェット式）。
 * - 右へ戻す操作は積算量に加算されない（=ハンドルは逆走しない）。
 * - 積算量が 720度 に達すると onComplete を1回だけ呼び出す。
 */
export function useGachaHandle({ disabled = false, onComplete } = {}) {
  const pivotRef = useRef(null);
  const [rotation, setRotation] = useState(0); // 0〜720+ の積算角度
  const [isDragging, setIsDragging] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const lastPointerAngleRef = useRef(null);
  const rotationRef = useRef(0);
  const completedRef = useRef(false);
  const passedOneTurnRef = useRef(false);
  const lastSoftTickStepRef = useRef(0);
  const pointerIdRef = useRef(null);

  const reset = useCallback(() => {
    rotationRef.current = 0;
    completedRef.current = false;
    passedOneTurnRef.current = false;
    lastSoftTickStepRef.current = 0;
    lastPointerAngleRef.current = null;
    setRotation(0);
    setIsLocked(false);
    setIsDragging(false);
  }, []);

  const angleFromPointer = useCallback((clientX, clientY) => {
    const el = pivotRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const radius = Math.hypot(dx, dy);
    if (radius < MIN_DRAG_RADIUS) return null;
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  }, []);

  const handlePointerMove = useCallback(
    (clientX, clientY) => {
      if (disabled || isLocked || completedRef.current) return;
      const angle = angleFromPointer(clientX, clientY);
      if (angle === null) return;

      if (lastPointerAngleRef.current === null) {
        lastPointerAngleRef.current = angle;
        return;
      }

      const delta = shortestAngleDiff(angle, lastPointerAngleRef.current);
      lastPointerAngleRef.current = angle;

      // 左回転(反時計回り)のときだけ積算する。右へ戻す動きは無視(ラチェット)。
      if (delta < 0) {
        const next = Math.min(rotationRef.current + -delta, REQUIRED_DEGREES);
        rotationRef.current = next;
        setRotation(next);

        if (next - lastSoftTickStepRef.current >= SOFT_TICK_STEP) {
          lastSoftTickStepRef.current = next;
          playSoftTick();
        }

        if (!passedOneTurnRef.current && next >= ONE_TURN_DEGREES) {
          passedOneTurnRef.current = true;
          playTick();
          vibrate(15);
        }

        if (!completedRef.current && next >= REQUIRED_DEGREES) {
          completedRef.current = true;
          setIsLocked(true);
          setIsDragging(false);
          if (onComplete) onComplete();
        }
      }
    },
    [angleFromPointer, disabled, isLocked, onComplete]
  );

  const endDrag = useCallback(() => {
    setIsDragging(false);
    lastPointerAngleRef.current = null;
    pointerIdRef.current = null;
  }, []);

  useEffect(() => {
    if (!isDragging) return undefined;

    const onMove = (e) => {
      if (pointerIdRef.current !== null && e.pointerId !== pointerIdRef.current) return;
      handlePointerMove(e.clientX, e.clientY);
    };
    const onUp = (e) => {
      if (pointerIdRef.current !== null && e.pointerId !== pointerIdRef.current) return;
      endDrag();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [isDragging, handlePointerMove, endDrag]);

  const onPointerDown = useCallback(
    (e) => {
      if (disabled || isLocked || completedRef.current) return;
      e.preventDefault();
      pointerIdRef.current = e.pointerId;
      lastPointerAngleRef.current = angleFromPointer(e.clientX, e.clientY);
      setIsDragging(true);
    },
    [angleFromPointer, disabled, isLocked]
  );

  const progress = Math.min(rotation / REQUIRED_DEGREES, 1);

  return {
    pivotRef,
    rotation,
    progress,
    isDragging,
    isLocked,
    handlers: { onPointerDown },
    reset,
  };
}
