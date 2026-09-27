import { useRef } from 'react'
import { flushSync } from 'react-dom'

// 段階表示セクション共通の開閉ボタン（VIEW MORE / SHOW ALL / CONTINUE / VIEW DETAILS ⇄ CLOSE）。
// CLOSE時は、折り畳みでボタンが上へ動いた分だけスクロール位置を補正し、
// ボタンが画面上の同じ位置に残るようにする（ページ下部に取り残されないため）。
export default function ExpandToggle({ expanded, onToggle, controls, label, count = 0, variant }) {
  const buttonRef = useRef(null)

  const handleClick = () => {
    const button = buttonRef.current
    if (!expanded || !button) {
      onToggle(!expanded)
      return
    }

    const before = button.getBoundingClientRect().top
    flushSync(() => onToggle(false))
    const delta = button.getBoundingClientRect().top - before
    if (delta) window.scrollBy({ top: delta, behavior: 'instant' })
  }

  return (
    <div className={`more-toggle-wrap ${variant ? `more-toggle-wrap--${variant}` : ''}`}>
      <button
        ref={buttonRef}
        type="button"
        className={`more-toggle ${variant ? `more-toggle--${variant}` : ''}`}
        aria-expanded={expanded}
        aria-controls={controls}
        onClick={handleClick}
      >
        <span>{expanded ? 'CLOSE' : label}</span>
        {!expanded && count > 0 && <span className="more-toggle__count">+{count}</span>}
      </button>
    </div>
  )
}
