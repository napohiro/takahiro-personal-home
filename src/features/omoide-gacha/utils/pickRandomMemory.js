/**
 * 直近に表示した思い出(最大 excludeCount 件)を除外してランダムに1件選ぶ。
 *
 * データの出どころ(memories.js / IndexedDB / Supabase 等)に依存しない純粋関数。
 * ガチャ本体(OmoideGacha)はこの関数に配列を渡すだけでよく、
 * データがどこから来たかを知らなくてよい設計にするための切り出し。
 */
export function pickRandomMemory(all, recentIds = [], excludeCount = 3) {
  if (!all || all.length === 0) return null;

  const excluded = new Set(recentIds.slice(-excludeCount));
  let candidates = all.filter((m) => !excluded.has(m.id));

  if (candidates.length === 0 && recentIds.length > 0) {
    const lastId = recentIds[recentIds.length - 1];
    candidates = all.filter((m) => m.id !== lastId);
  }

  if (candidates.length === 0) {
    candidates = all;
  }

  const index = Math.floor(Math.random() * candidates.length);
  return candidates[index];
}
