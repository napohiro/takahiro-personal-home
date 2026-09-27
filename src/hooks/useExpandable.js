import { useId, useState } from 'react'
import useMediaQuery from './useMediaQuery'

// 初期表示件数を PC / スマホ で切り替えるための境界。
export const DESKTOP_QUERY = '(min-width: 768px)'

// 「最初の数件だけ表示 → VIEW MORE で残りを表示」する段階表示用フック。
// 残りの項目はDOMに残したまま hidden 属性で隠す前提（isHidden を使う）。
export default function useExpandable({ total, desktop, mobile = desktop }) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const [expanded, setExpanded] = useState(false)
  const controlsId = useId()
  const limit = isDesktop ? desktop : mobile

  return {
    expanded,
    setExpanded,
    controlsId,
    hasMore: total > limit,
    hiddenCount: Math.max(total - limit, 0),
    isExtra: (index) => index >= limit,
    isHidden: (index) => !expanded && index >= limit,
  }
}
