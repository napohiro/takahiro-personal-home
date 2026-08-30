import useReveal from '../hooks/useReveal'
import { nowItems, nowNote, nowUpdatedAt } from '../data/profile'

export default function Now() {
  const [ref, visible] = useReveal()

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
            <ul className="now-card__list">
              {nowItems.map((item) => (
                <li key={item} className="now-card__item">
                  {item}
                </li>
              ))}
            </ul>
            <p className="now-card__meta">Last updated: {nowUpdatedAt}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
