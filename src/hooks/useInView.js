import { useEffect, useRef } from 'react'

// 要素が画面(+rootMargin)から外れている間だけ、その要素に offscreenClass を付ける軽量フック。
// useReveal(一度表示されたら監視を終える)と違い、画面への出入りを継続して監視する。
// クラスはDOMへ直接付け外しするので、出入りのたびにReactの再描画は起きない。
// IntersectionObserverが使えない環境ではクラスを付けない(=何も止めず、表示を妨げない)。
export default function useInView(offscreenClass = 'is-offscreen', rootMargin = '200px 0px') {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1]
        node.classList.toggle(offscreenClass, !entry.isIntersecting)
      },
      { rootMargin },
    )

    observer.observe(node)
    return () => {
      observer.disconnect()
      node.classList.remove(offscreenClass)
    }
  }, [offscreenClass, rootMargin])

  return ref
}
