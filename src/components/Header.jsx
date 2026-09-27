import { useEffect, useState } from 'react'
import { socialLinks } from '../data/profile'
import siteSettings from '../data/siteSettings.json'
import { TOGGLEABLE_SECTIONS, isSectionVisible } from '../data/sections'

const hasVisibleSocialLinks = socialLinks.some((link) => link.show)

// OWNER ROOMでOFFにしたセクションは、押しても何も無いリンクを
// ナビゲーションに残さないよう取り除く。
const NAV_ITEMS = TOGGLEABLE_SECTIONS.filter(({ key, nav }) => {
  if (!nav || !isSectionVisible(siteSettings.sections, key)) return false
  // SOCIAL LINKS は表示するリンクが1件も無いとセクション自体が出ないため、リンクも出さない。
  if (key === 'socialLinks') return hasVisibleSocialLinks
  return true
}).map(({ nav }) => nav)

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
    <>
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

      {/* メニュー外側のタップで閉じるための透明な受け皿。
          .header はbackdrop-filterによりfixed子孫の基準になるため、兄弟として置く。 */}
      {open && <div className="header__backdrop" onClick={() => setOpen(false)} aria-hidden="true" />}
    </>
  )
}
