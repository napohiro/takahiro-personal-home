import { useState } from 'react'
import useReveal from '../hooks/useReveal'
import { randomPhrases } from '../data/profile'

const ACCENTS = ['yellow', 'orange', 'blue']

export default function RandomTakahiro() {
  const [ref, visible] = useReveal()
  const [index, setIndex] = useState(null)
  const [percent, setPercent] = useState(null)
  const [accent, setAccent] = useState(null)
  const [count, setCount] = useState(0)

  const handleClick = () => {
    setIndex((prev) => {
      let next = Math.floor(Math.random() * randomPhrases.length)
      if (randomPhrases.length > 1 && next === prev) {
        next = (next + 1) % randomPhrases.length
      }
      return next
    })
    setPercent(Math.floor(Math.random() * 101))
    setAccent(ACCENTS[Math.floor(Math.random() * ACCENTS.length)])
    setCount((c) => c + 1)
  }

  return (
    <section className="section section--tight">
      <div className="container">
        <div
          ref={ref}
          className={`random-box ${accent ? `random-box--${accent}` : ''} reveal ${visible ? 'is-visible' : ''}`}
        >
          <div>
            <span className="eyebrow">Random TAKAHIRO</span>
            <h2 className="section-title" style={{ fontSize: 'clamp(1.6rem, 5vw, 2.4rem)' }}>
              今日のTAKAHIRO
            </h2>
            <p className="random-box__lead">
              ボタンを押すたび、その日のTAKAHIROっぽい一言がランダムで出ます。
              性格診断でも統計でもAI分析でもない、完全な遊びです。
            </p>
          </div>

          {index === null ? (
            <p className="random-box__display" aria-live="polite">
              <span>ボタンを押すと、今日のTAKAHIROが分かります。</span>
            </p>
          ) : (
            <div key={index} className="random-box__result">
              <p className="random-box__display" aria-live="polite">
                <span>{randomPhrases[index]}</span>
              </p>
              <p className="random-box__percent">
                TODAY'S TAKAHIRO <strong>{percent}%</strong>
              </p>
              <p className="random-box__disclaimer">※数字はランダムです。意味はありません。</p>
              <p className="random-box__afterword">今日はこんな感じらしい。</p>
            </div>
          )}

          <button type="button" className="btn btn--primary" onClick={handleClick}>
            {index === null ? 'RANDOM TAKAHIRO を見る' : 'もう一度見る'}
          </button>

          {count > 0 && (
            <p className="random-box__count">{count}回、今日のTAKAHIROを見た。</p>
          )}
        </div>
      </div>
    </section>
  )
}
