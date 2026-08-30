import useReveal from '../hooks/useReveal'
import { worldCards } from '../data/profile'
import { WorldDeco } from './icons'

export default function MyWorld() {
  const [ref, visible] = useReveal()

  return (
    <section id="world" className="section">
      <div className="container">
        <div className={`reveal ${visible ? 'is-visible' : ''}`} ref={ref}>
          <span className="eyebrow">My World</span>
          <h2 className="section-title">わたしの世界</h2>
          <p className="section-lead">
            ジャンルはバラバラ。でも、全部つながって「TAKAHIRO」という一人になる。
          </p>
        </div>

        <div className="world-grid">
          {worldCards.map((card, i) => (
            <article
              key={card.id}
              className={`world-card world-card--${card.accent} ${card.id === 'random' ? 'world-card--playful' : ''} reveal reveal-delay-${(i % 3) + 1} ${visible ? 'is-visible' : ''}`}
            >
              <WorldDeco name={card.deco} className="world-card__deco" />
              <h3 className="world-card__en">{card.en}</h3>
              <p className="world-card__ja">{card.ja}</p>
              <p className="world-card__desc">{card.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
