import { heroPhoto } from '../data/profile'
import { PersonSilhouette } from './icons'

export default function Hero() {
  return (
    <section id="top" className="hero">
      <div className="hero__bg" aria-hidden="true" />
      <div className="hero__grid" aria-hidden="true" />
      <span className="hero__blob hero__blob--1" aria-hidden="true" />
      <span className="hero__blob hero__blob--2" aria-hidden="true" />
      <span className="hero__blob hero__blob--3" aria-hidden="true" />

      <div className="container hero__content">
        <div className="hero__text">
          <p className="hero__kicker">TAKAHIRO's</p>
          <h1 className="hero__title">
            PERSONAL <em>HOME</em>
          </h1>

          <p className="hero__copy">
            AIで遊び、<br />
            アプリを作り、<br />
            キャンプへ行き、<br />
            泳ぎ、<br />
            <strong>ときどき文章を書く。</strong>
          </p>

          <div className="hero__ctas">
            <a href="#profile" className="btn btn--primary">
              ENTER TAKAHIRO'S WORLD
            </a>
            <a href="#world" className="btn btn--ghost">
              のぞいてみる
            </a>
          </div>
        </div>

        <div className="hero__photo-wrap">
          <span className="hero__photo-tag">THIS IS ME.</span>
          <div className="hero__photo">
            {heroPhoto.src ? (
              <img src={heroPhoto.src} alt={heroPhoto.alt} />
            ) : (
              <div className="hero__photo-placeholder">
                <PersonSilhouette className="hero__photo-silhouette" />
                <span>PHOTO COMING SOON</span>
              </div>
            )}
            <p className="hero__photo-caption">{heroPhoto.caption}</p>
          </div>
          <span className="hero__photo-tape" aria-hidden="true" />
        </div>
      </div>

      <a href="#profile" className="hero__scroll">
        <span>SCROLL</span>
        <span className="hero__scroll-line" />
      </a>
    </section>
  )
}
