// OWNER ROOM から公開/非公開を切り替えられるセクションの一覧（サイト上の表示順）。
// サイト表示(App)・Header・OWNER ROOM・Netlify Functions がすべてこの一覧を参照する。
//
//   key   : siteSettings.json の sections のキー
//   label : OWNER ROOM での表示名
//   nav   : Header / モバイルメニューのリンク（無いセクションは null）
//   description : OWNER ROOM で表示名の下に出す補足（任意）
//
// プロフィール（WHO IS TAKAHIRO?）は常時公開のため、意図的にここへ含めない。
export const TOGGLEABLE_SECTIONS = [
  {
    key: 'myWorld',
    label: 'My World',
    description:
      '『わたしの世界』の8枚のカード（AI LAB・CREATE・CAMPなど）。\nWHO IS TAKAHIRO? 内の『AIで遊ぶ』などのタグは常時表示です。',
    nav: { href: '#world', label: 'World' },
  },
  { key: 'now', label: 'NOW', nav: { href: '#now', label: 'Now' } },
  { key: 'works', label: "Things I've Made", nav: { href: '#works', label: 'Works' } },
  { key: 'favorites', label: 'Favorites / Interests', nav: { href: '#favorites', label: 'Favorites' } },
  { key: 'randomTakahiro', label: 'Random TAKAHIRO', nav: null },
  { key: 'timeline', label: 'Life Timeline', nav: { href: '#timeline', label: 'Timeline' } },
  { key: 'gacha', label: 'Memory Gacha', nav: { href: '#gacha', label: 'Gacha' } },
  { key: 'family', label: 'Family Archive', nav: { href: '#family', label: 'Family' } },
  {
    key: 'possibility',
    label: 'Your Personal Home',
    description: '『個人サイトって、こんなに自由。』のカード一覧。\nフッター内の同名の案内は常時表示です。',
    nav: null,
  },
  {
    key: 'socialLinks',
    label: 'Find Me Outside',
    description: 'SNSリンクの一覧。\n表示するSNSリンクが無い間は、ONでもサイトに出ません。',
    nav: { href: '#outside', label: 'Outside' },
  },
]

export const SECTION_KEYS = TOGGLEABLE_SECTIONS.map(({ key }) => key)

// 明示的に false のときだけ非公開。キーが無い古い設定ファイルでもセクションが消えないようにする。
export function isSectionVisible(sections, key) {
  return sections?.[key] !== false
}
