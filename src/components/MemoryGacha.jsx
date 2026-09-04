import { useState } from 'react'
import useReveal from '../hooks/useReveal'
import { memories } from '../data/memories'

const eligible = memories.filter((m) => m.show && !m.private)

export default function MemoryGacha() {
  const [ref, visible] = useReveal()
  const [current, setCurrent] = useState(null)
  const [count, setCount] = useState(0)

  const draw = () => {
    if (eligible.length === 0) return

    setCurrent((prev) => {
      let next = Math.floor(Math.random() * eligible.length)
      if (eligible.length > 1 && prev && eligible[next].id === prev.id) {
        next = (next + 1) % eligible.length
      }
      return eligible[next]
    })
    setCount((c) => c + 1)
  }

  return (
    <section id="gacha" className="section section--tight">
      <div className="container">
        <div ref={ref} className={`reveal ${visible ? 'is-visible' : ''}`}>
          <span className="eyebrow">Memory Gacha</span>
          <h2 className="section-title">思い出ガチャ</h2>
          <p className="section-lead">
            ボタンを押すと、過去の出来事や作品が1件ランダムで出てきます。当たり外れはありません。
          </p>
        </div>

        <div className="memory-gacha">
          {current ? (
            <div key={current.id} className="memory-gacha__card">
              <div className="memory-gacha__media">
                {current.image ? (
                  <img src={current.image} alt={current.title} loading="lazy" />
                ) : (
                  <div className="memory-gacha__media-fallback">
                    <span>{current.category}</span>
                  </div>
                )}
              </div>
              <div className="memory-gacha__body">
                <div className="memory-gacha__meta">
                  <span className="memory-gacha__category">{current.category}</span>
                  {current.year && <span className="memory-gacha__year">{current.year}</span>}
                </div>
                <h3 className="memory-gacha__title">{current.title}</h3>
                <p className="memory-gacha__desc">{current.description}</p>
              </div>
            </div>
          ) : (
            <div className="memory-gacha__empty">
              <p>ボタンを押すと、思い出が1枚めくれます。</p>
            </div>
          )}

          <button type="button" className="btn btn--primary" onClick={draw}>
            {current ? 'もう1回引く' : '思い出ガチャを回す'}
          </button>

          {count > 0 && <p className="memory-gacha__count">{count}回、めくった。</p>}
        </div>
      </div>
    </section>
  )
}
