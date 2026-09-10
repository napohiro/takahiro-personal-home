import useReveal from '../hooks/useReveal'

export default function MemoryGacha() {
  const [ref, visible] = useReveal()

  return (
    <section id="gacha" className="section section--tight">
      <div className="container">
        <div ref={ref} className={`reveal ${visible ? 'is-visible' : ''}`}>
          <span className="eyebrow">Memory Gacha</span>
          <h2 className="section-title">思い出ガチャ</h2>
        </div>

        <div className="memory-gacha__cta">
          <span className="memory-gacha__cta-badge">Optional Feature</span>
          <p className="memory-gacha__cta-note">
            PERSONALでは、写真や思い出をただ並べるだけでなく、こんな「遊べる仕掛け」を追加することもできます。
          </p>

          <div className="memory-gacha__visual">
            <img
              src="/images/gacha/memory-gacha-transparent.webp"
              alt="思い出ガチャ"
              loading="lazy"
              className="memory-gacha__visual-img"
            />
          </div>

          <a
            href="https://omoide-gacha.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="memory-gacha__cta-link"
          >
            大きな画面で思い出ガチャを開く
            <span className="memory-gacha__cta-arrow">↗</span>
          </a>
          <p className="memory-gacha__cta-caption">思い出ガチャはオプション機能の一例です。</p>
        </div>
      </div>
    </section>
  )
}
