// LIFE TIMELINE用データ。
//
// year: 正確な年が確認できている場合のみ文字列で入れる（例: '1998'、'2020s'）。
//       未確認の間は null にしておくこと。年を推測して入れないこと。
// phase: year が null のときに、カードの年バッジ位置に表示する自然なフェーズ表現。
//        （例: 「営業の仕事」「AIとの出会い」など）
// 表示コンポーネント側では year があれば year を、なければ phase を表示する。
//
// image に画像パス（例: '/images/timeline/xxx.webp'）を設定すると、カードに写真が表示されます。
// 未設定の間は写真なしのカードとして表示されます。

export const lifeTimeline = [
  {
    id: 'sales-era',
    year: null,
    phase: '営業の仕事',
    title: '営業の仕事を長く経験',
    desc: '人と話し、考え、伝えることを仕事にしてきた時期。',
    image: null,
  },
  {
    id: 'ai-encounter',
    year: null,
    phase: 'AIとの出会い',
    title: 'AIと出会う',
    desc: '「専門家じゃなくても、こんなことまで作れるのか。」がすべての始まり。',
    image: null,
  },
  {
    id: 'making',
    year: null,
    phase: 'アプリ・Web制作',
    title: 'アプリ・Web・文章をつくり始める',
    desc: 'LINEスタンプ、Webアプリ、noteの文章など、思いついたものを片っ端から形にする日々。',
    image: null,
  },
  {
    id: 'naporise',
    year: null,
    phase: 'NAPORISE',
    title: 'NAPORISEをはじめる',
    desc: '会社にも店舗にも縛られない、自分だけの制作・伴走のかたちを模索し始める。',
    image: null,
  },
  {
    id: 'now',
    year: null,
    phase: '現在',
    title: 'AIと一緒に、日々何かを作っている',
    desc: 'AIBOU、個人ホームページ、アプリ、note……いろいろ同時進行中。',
    image: null,
  },
  {
    id: 'next',
    year: null,
    phase: 'これから',
    title: 'まだ決まっていない。',
    desc: 'だから面白い。',
    image: null,
  },
]
