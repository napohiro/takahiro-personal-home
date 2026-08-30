import useReveal from '../hooks/useReveal'
import { bio, identityTags } from '../data/profile'
import { TagIcon } from './icons'

export default function Profile() {
  const [ref, visible] = useReveal()

  return (
    <section id="profile" className="section">
      <div className="container">
        <div className={`profile__head reveal ${visible ? 'is-visible' : ''}`} ref={ref}>
          <span className="eyebrow">Who is TAKAHIRO?</span>
          <h2 className="section-title">
            肩書き1個じゃ、
            <br />
            説明できない人。
          </h2>
          <div className="profile__bio">
            {bio.map((line) => (
              <p key={line}>{line}</p>
            ))}
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

        <p className="profile__note">— それが、今のところのTAKAHIROです。</p>
      </div>
    </section>
  )
}
