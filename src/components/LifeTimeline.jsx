import useReveal from '../hooks/useReveal'
import { lifeTimeline } from '../data/timeline'

const ACCENTS = ['blue', 'orange', 'yellow']

function TimelineNode({ item, index }) {
  const [ref, visible] = useReveal(0.35)
  const accent = ACCENTS[index % ACCENTS.length]

  return (
    <li
      ref={ref}
      className={`life-timeline__item life-timeline__item--${accent} ${visible ? 'is-visible' : ''}`}
    >
      <span className="life-timeline__dot" />
      <div className="life-timeline__card">
        <p className="life-timeline__year">{item.year || item.phase}</p>
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

  return (
    <section id="timeline" className="section">
      <div className="container">
        <div className={`reveal ${headVisible ? 'is-visible' : ''}`} ref={headRef}>
          <span className="eyebrow">Life Timeline</span>
          <h2 className="section-title">これまでと、これから</h2>
          <p className="section-lead">人生をざっと眺めるための年表。</p>
        </div>

        <ul className="life-timeline">
          {lifeTimeline.map((item, i) => (
            <TimelineNode key={item.id} item={item} index={i} />
          ))}
        </ul>

        <p className="life-timeline-note">LIFE IS STILL IN BETA.</p>
      </div>
    </section>
  )
}
