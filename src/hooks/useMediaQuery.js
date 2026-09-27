import { useCallback, useSyncExternalStore } from 'react'

// CSSメディアクエリの一致状態を返す軽量フック。
// matchMedia の change イベントだけを購読するので、resize のたびに再描画は起きない。
export default function useMediaQuery(query) {
  const subscribe = useCallback(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    [query],
  )

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
}
