// OWNER ROOM から公開/非公開を切り替えられるセクションの一覧（サイト上の表示順）。
// サイト表示(App)・Header・OWNER ROOM・Netlify Functions がすべてこの一覧を参照する。
//
//   key   : siteSettings.json の sections のキー
//   label : OWNER ROOM での表示名
//   nav   : Header / モバイルメニューのリンク（無いセクションは null）
//
// プロフィール（WHO IS TAKAHIRO?）は常時公開のため、意図的にここへ含めない。
export const TOGGLEABLE_SECTIONS = [
  { key: 'myWorld', label: 'MY WORLD', nav: { href: '#world', label: 'World' } },
  { key: 'now', label: 'NOW', nav: { href: '#now', label: 'Now' } },
  { key: 'works', label: 'WORKS', nav: { href: '#works', label: 'Works' } },
  { key: 'favorites', label: 'FAVORITES', nav: { href: '#favorites', label: 'Favorites' } },
  { key: 'randomTakahiro', label: 'RANDOM TAKAHIRO', nav: null },
  { key: 'timeline', label: 'TIMELINE', nav: { href: '#timeline', label: 'Timeline' } },
  { key: 'gacha', label: '思い出ガチャ', nav: { href: '#gacha', label: 'Gacha' } },
  { key: 'family', label: 'FAMILY', nav: { href: '#family', label: 'Family' } },
  { key: 'possibility', label: 'PERSONAL HOME POSSIBILITY', nav: null },
  { key: 'socialLinks', label: 'SOCIAL LINKS', nav: { href: '#outside', label: 'Outside' } },
]

export const SECTION_KEYS = TOGGLEABLE_SECTIONS.map(({ key }) => key)

// 明示的に false のときだけ非公開。キーが無い古い設定ファイルでもセクションが消えないようにする。
export function isSectionVisible(sections, key) {
  return sections?.[key] !== false
}
