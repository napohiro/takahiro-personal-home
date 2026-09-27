import useReveal from '../hooks/useReveal'
import useExpandable from '../hooks/useExpandable'
import ExpandToggle from './ExpandToggle'
import { nowItems, nowNote, nowUpdatedAt } from '../data/profile'

export default function Now() {
  const [ref, visible] = useReveal()
  const more = useExpandable({ total: nowItems.length, desktop: 4, mobile: 3 })

  return (
    <section id="now" className="section section--tight now-section">
      <div className="container">
        <div className={`reveal ${visible ? 'is-visible' : ''}`} style={{ textAlign: 'center' }}>
          <span className="eyebrow" style={{ justifyContent: 'center' }}>Now</span>
          <h2 className="section-title">最近やっていること</h2>
        </div>

        <div ref={ref} className={`now-layout reveal ${visible ? 'is-visible' : ''}`}>
          <p className="now-scribble">{nowNote}</p>

          <div className="now-card">
            <p className="now-card__title">TAKAHIRO / NOW LIST</p>
            <ul id={more.controlsId} className="now-card__list">
              {nowItems.map((item, i) => (
                <li
                  key={item}
                  hidden={more.isHidden(i)}
                  className={`now-card__item ${more.isExtra(i) ? 'more-extra' : ''}`}
                >
                  {item}
                </li>
              ))}
            </ul>
            {more.hasMore && (
              <ExpandToggle
                expanded={more.expanded}
                onToggle={more.setExpanded}
                controls={more.controlsId}
                label="VIEW MORE"
                count={more.hiddenCount}
                variant="ink"
              />
            )}
            <p className="now-card__meta">Last updated: {nowUpdatedAt}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
