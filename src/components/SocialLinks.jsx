import useReveal from '../hooks/useReveal'
import { socialLinks } from '../data/profile'

export default function SocialLinks() {
  const [ref, visible] = useReveal()
  const visibleLinks = socialLinks.filter((link) => link.show)

  if (visibleLinks.length === 0) {
    return null
  }

  return (
    <section id="outside" className="section">
      <div className="container">
        <div className={`reveal ${visible ? 'is-visible' : ''}`}>
          <span className="eyebrow">Find Me Outside</span>
          <h2 className="section-title">外の世界にも、少しだけ。</h2>
        </div>

        <div ref={ref} className={`social-list reveal ${visible ? 'is-visible' : ''}`}>
          {visibleLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="social-row"
            >
              <span className="social-row__name">{link.name}</span>
              <span className="social-row__meta">
                {link.handle}
                <span className="social-row__arrow">↗</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
