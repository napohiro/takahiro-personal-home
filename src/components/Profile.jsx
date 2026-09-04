import useReveal from '../hooks/useReveal'
import { bio, bioHighlight, identityTags } from '../data/profile'
import { TagIcon } from './icons'

export default function Profile() {
  const [ref, visible] = useReveal()

  return (
    <section id="profile" className="section">
      <div className="container">
        <div className={`profile__head reveal ${visible ? 'is-visible' : ''}`} ref={ref}>
          <span className="eyebrow">Who is TAKAHIRO?</span>
          <h2 className="section-title">
            肩書きひとつでは、
            <br />
            たぶん説明できない。
          </h2>
          <div className="profile__bio">
            {bio.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <p className="profile__bio-highlight">{bioHighlight}</p>
          </div>
        </div>

        <ul className="profile__tags">
          {identityTags.map((tag, i) => (
            <li key={tag.label} className={`profile__tag reveal reveal-delay-${(i % 3) + 1} ${visible ? 'is-visible' : ''}`}>
              <span className="profile__tag-icon">
                <TagIcon name={tag.icon} />
              </span>
              <span className="profile__tag-index">{String(i + 1).padStart(2, '0')}</span>
              <span className="profile__tag-label">{tag.label}</span>
            </li>
          ))}
        </ul>

        <p className="profile__note">— たぶん、それが今のTAKAHIROです。</p>

        <a href="#timeline" className="profile__timeline-link">
          どうやって今の自分になったのか
          <span className="profile__timeline-link-arrow">→</span>
          LIFE TIMELINE
        </a>
      </div>
    </section>
  )
}
