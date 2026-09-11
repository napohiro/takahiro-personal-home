import { memories } from "./memories";

/**
 * 思い出データの窓口(ファサード)。
 *
 * PERSONAL版では memories.js（静的データ）をそのまま返すだけの実装。
 * 呼び出し側（App.jsx や、将来NAPORISE PERSONAL側のページ）は
 * ここが静的データなのか、IndexedDBなのか、Supabaseなのかを知らなくてよい。
 * 差し替えが必要になった場合は、この関数の中身だけを変更すればよい想定。
 */
export function getAllMemories() {
  return memories;
}
