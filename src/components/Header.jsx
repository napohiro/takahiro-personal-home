import { useEffect, useState } from 'react'
import { socialLinks } from '../data/profile'

const hasVisibleSocialLinks = socialLinks.some((link) => link.show)

const NAV_ITEMS = [
  { href: '#world', label: 'World' },
  { href: '#now', label: 'Now' },
  { href: '#works', label: 'Works' },
  { href: '#favorites', label: 'Favorites' },
  { href: '#timeline', label: 'Timeline' },
  ...(hasVisibleSocialLinks ? [{ href: '#outside', label: 'Outside' }] : []),
]

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
