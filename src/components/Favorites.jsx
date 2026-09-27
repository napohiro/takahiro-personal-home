import { useCallback, useEffect, useRef, useState } from 'react'
import useReveal from '../hooks/useReveal'
import useExpandable from '../hooks/useExpandable'
import ExpandToggle from './ExpandToggle'
import { favorites } from '../data/favorites'

const NOTE_HALF_WIDTH = 100
const EDGE_MARGIN = 12

export default function Favorites() {
  const [ref, visible] = useReveal()
  const [openId, setOpenId] = useState(null)
  const [shifts, setShifts] = useState({})
  const cloudRef = useRef(null)
  const more = useExpandable({ total: favorites.length, desktop: 10, mobile: 8 })

  const recalcShifts = useCallback(() => {
    const cloud = cloudRef.current
    if (!cloud) return

    const next = {}
    cloud.querySelectorAll('.favorite-chip').forEach((chip) => {
      const rect = chip.getBoundingClientRect()
      const center = rect.left + rect.width / 2
      let shift = 0

      if (center - NOTE_HALF_WIDTH < EDGE_MARGIN) {
        shift = EDGE_MARGIN - (center - NOTE_HALF_WIDTH)
      } else if (center + NOTE_HALF_WIDTH > window.innerWidth - EDGE_MARGIN) {
        shift = window.innerWidth - EDGE_MARGIN - (center + NOTE_HALF_WIDTH)
      }

      next[chip.dataset.favId] = shift
    })

    setShifts(next)
  }, [])

  useEffect(() => {
    recalcShifts()
    window.addEventListener('resize', recalcShifts)
    return () => window.removeEventListener('resize', recalcShifts)
  }, [recalcShifts])

  // 開閉で表示されるチップが変わると位置も変わるため、吹き出しのはみ出し補正を測り直す。
  useEffect(() => {
    recalcShifts()
  }, [more.expanded, more.hiddenCount, recalcShifts])

  useEffect(() => {
    if (openId === null) return undefined

    const handleOutsideClick = (event) => {
      if (!cloudRef.current?.contains(event.target)) {
        setOpenId(null)
      }
    }

    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [openId])

  return (
    <section id="favorites" className="section">
      <div className="container">
        <div className={`reveal ${visible ? 'is-visible' : ''}`} ref={ref}>
          <span className="eyebrow">Favorites / Interests</span>
          <h2 className="section-title">好きなもの・興味あるもの</h2>
          <p className="section-lead">この話をさせたら止まらない、というものたち。（タップ／ホバーで一言）</p>
        </div>

        <div id={more.controlsId} className="favorites-cloud" ref={cloudRef}>
          {favorites.map((fav, i) => {
            const isOpen = openId === fav.id

            return (
              <button
                type="button"
                key={fav.id}
                data-fav-id={fav.id}
                hidden={more.isHidden(i)}
                style={{ '--note-shift': `${shifts[fav.id] || 0}px` }}
                className={`favorite-chip favorite-chip--${fav.size} ${isOpen ? 'is-open' : ''} ${more.isExtra(i) ? 'more-extra' : ''} reveal reveal-delay-${(i % 3) + 1} ${visible ? 'is-visible' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  setOpenId(isOpen ? null : fav.id)
                }}
              >
                <span className="favorite-chip__label">{fav.label}</span>
                <span className="favorite-chip__note">{fav.note}</span>
              </button>
            )
          })}
        </div>

        {more.hasMore && (
          <ExpandToggle
            expanded={more.expanded}
            onToggle={more.setExpanded}
            controls={more.controlsId}
            label="VIEW MORE"
            count={more.hiddenCount}
          />
        )}
      </div>
    </section>
  )
}
