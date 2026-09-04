import useReveal from '../hooks/useReveal'
import { possibilities } from '../data/possibilities'

export default function PersonalHomePossibility() {
  const [ref, visible] = useReveal()

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

        <div className="possibility-grid">
          {possibilities.map((item, i) => (
            <div
              key={item.label}
              className={`possibility-card possibility-card--${item.accent} reveal reveal-delay-${(i % 3) + 1} ${visible ? 'is-visible' : ''}`}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
