import useReveal from '../hooks/useReveal'
import { timeline } from '../data/profile'

export default function LifeTimeline() {
  const [ref, visible] = useReveal()

  return (
    <section id="timeline" className="section">
      <div className="container">
        <div className={`reveal ${visible ? 'is-visible' : ''}`}>
          <span className="eyebrow">Life</span>
          <h2 className="section-title">これまでと、これから</h2>
        </div>

        <div className="timeline-layout">
          <div ref={ref} className="timeline">
            {timeline.map((step, i) => (
              <div
                key={step.label}
                className={`timeline-step timeline-step--${i} reveal ${visible ? 'is-visible' : ''}`}
              >
                <p className="timeline-step__label">{step.label}</p>
                <h3 className="timeline-step__title">{step.title}</h3>
                <p className="timeline-step__desc">{step.desc}</p>
              </div>
            ))}
          </div>

          <p className="timeline-note">LIFE IS STILL IN BETA.</p>
        </div>
      </div>
    </section>
  )
}
