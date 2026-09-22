import useReveal from '../hooks/useReveal'
import useInView from '../hooks/useInView'
import OmoideGacha from '../features/omoide-gacha/components/OmoideGacha'
import { getAllMemories } from '../features/omoide-gacha/data/memoryRepository'

const memories = getAllMemories()

export default function MemoryGacha() {
  const [ref, visible] = useReveal()
  // 画面外にある間は、ガチャの待機アニメーション(index.cssの .is-offscreen)を止める。
  const omoideRef = useInView()

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

          <div ref={omoideRef} className="memory-gacha__omoide-wrap">
            <OmoideGacha memories={memories} mode="embed" />
          </div>

          <p className="memory-gacha__cta-caption">思い出ガチャはオプション機能の一例です。</p>
        </div>
      </div>
    </section>
  )
}
