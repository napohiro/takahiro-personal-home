import { useEffect, useState } from 'react'
import { socialLinks } from '../data/profile'
import siteSettings from '../data/siteSettings.json'

const hasVisibleSocialLinks = socialLinks.some((link) => link.show)
const { sections } = siteSettings

const ALL_NAV_ITEMS = [
  { href: '#world', label: 'World', sectionKey: 'myWorld' },
  { href: '#now', label: 'Now', sectionKey: 'now' },
  { href: '#works', label: 'Works', sectionKey: 'works' },
  { href: '#favorites', label: 'Favorites', sectionKey: 'favorites' },
  { href: '#timeline', label: 'Timeline', sectionKey: 'timeline' },
  { href: '#gacha', label: 'Gacha', sectionKey: 'gacha' },
  { href: '#family', label: 'Family', sectionKey: 'family' },
  { href: '#outside', label: 'Outside', sectionKey: 'socialLinks' },
]

// OWNER ROOMでOFFにしたセクションは、押しても何も無いリンクを
// ナビゲーションに残さないよう取り除く。
const NAV_ITEMS = ALL_NAV_ITEMS.filter(({ sectionKey }) => {
  if (sectionKey === 'socialLinks') return hasVisibleSocialLinks && sections.socialLinks
  return sections[sectionKey]
})

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNavClick = () => setOpen(false)

  return (
    <header className={`header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container header__inner">
        <a href="#top" className="header__mark">
          TAKAHIRO<span>'s</span>
        </a>

        <nav className="header__nav">
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          className={`header__toggle ${open ? 'is-open' : ''}`}
          aria-label={open ? 'メニューを閉じる' : 'メニューを開く'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={`header__mobile-nav ${open ? 'is-open' : ''}`}>
        <div className="header__mobile-nav-inner">
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a href={item.href} onClick={handleNavClick}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  )
}
