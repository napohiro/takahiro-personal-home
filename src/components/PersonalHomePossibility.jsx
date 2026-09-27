import useReveal from '../hooks/useReveal'
import useExpandable from '../hooks/useExpandable'
import ExpandToggle from './ExpandToggle'
import { possibilities } from '../data/possibilities'

export default function PersonalHomePossibility() {
  const [ref, visible] = useReveal()
  const more = useExpandable({ total: possibilities.length, desktop: 8, mobile: 6 })

  return (
    <section id="possibility" className="section">
      <div className="container">
        <div ref={ref} className={`reveal ${visible ? 'is-visible' : ''}`}>
          <span className="eyebrow">Your Personal Home</span>
          <h2 className="section-title">個人サイトって、こんなに自由。</h2>
          <p className="section-lead">
            このサイト自体、ぜんぶ個人ホームページの機能です。自分なら、何を載せますか？
          </p>
        </div>

        <div id={more.controlsId} className="possibility-grid">
          {possibilities.map((item, i) => (
            <div
              key={item.label}
              hidden={more.isHidden(i)}
              className={`possibility-card possibility-card--${item.accent} ${more.isExtra(i) ? 'more-extra' : ''} reveal reveal-delay-${(i % 3) + 1} ${visible ? 'is-visible' : ''}`}
            >
              {item.label}
            </div>
          ))}
        </div>

        {more.hasMore && (
          <ExpandToggle
            expanded={more.expanded}
            onToggle={more.setExpanded}
            controls={more.controlsId}
            label="SHOW ALL"
            count={more.hiddenCount}
          />
        )}
      </div>
    </section>
  )
}
