import useReveal from '../hooks/useReveal'
import useExpandable from '../hooks/useExpandable'
import ExpandToggle from './ExpandToggle'
import { lifeTimeline } from '../data/timeline'

const ACCENTS = ['blue', 'orange', 'yellow']

function TimelineNode({ item, index, extra, hidden }) {
  const [ref, visible] = useReveal(0.35)
  const accent = ACCENTS[index % ACCENTS.length]

  return (
    <li
      ref={ref}
      hidden={hidden}
      className={`life-timeline__item life-timeline__item--${accent} ${extra ? 'more-extra' : ''} ${visible ? 'is-visible' : ''}`}
    >
      <span className="life-timeline__dot" />
      <div className="life-timeline__card">
        <div className="life-timeline__meta">
          <span className="life-timeline__index">{String(index + 1).padStart(2, '0')}</span>
          <span className="life-timeline__year">{item.year || item.phase}</span>
        </div>
        <h3 className="life-timeline__title">{item.title}</h3>
        <p className="life-timeline__desc">{item.desc}</p>
        {item.image && (
          <div className="life-timeline__photo">
            <img src={item.image} alt={item.title} loading="lazy" />
          </div>
        )}
      </div>
    </li>
  )
}

export default function LifeTimeline() {
  const [headRef, headVisible] = useReveal()
  const more = useExpandable({ total: lifeTimeline.length, desktop: 5, mobile: 3 })

  return (
    <section id="timeline" className="section">
      <div className="container">
        <div className={`reveal ${headVisible ? 'is-visible' : ''}`} ref={headRef}>
          <span className="eyebrow">Life Timeline</span>
          <h2 className="section-title">これまでと、これから</h2>
          <p className="section-lead">人生をざっと眺めるための年表。</p>
        </div>

        <ul id={more.controlsId} className="life-timeline">
          {lifeTimeline.map((item, i) => (
            <TimelineNode
              key={item.id}
              item={item}
              index={i}
              extra={more.isExtra(i)}
              hidden={more.isHidden(i)}
            />
          ))}
        </ul>

        {more.hasMore && (
          <ExpandToggle
            expanded={more.expanded}
            onToggle={more.setExpanded}
            controls={more.controlsId}
            label="CONTINUE"
            count={more.hiddenCount}
          />
        )}

        <p className="life-timeline-note">LIFE IS STILL IN BETA.</p>
      </div>
    </section>
  )
}
