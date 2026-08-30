// 制作物データ。個々のアプリ実績一覧ではなく、
// 「こんなものを色々作ってきた人」として見せるためのカテゴリ単位でまとめています。
//
// url は将来的なリンク先（例: AIBOUのアプリ一覧ページ）用に null で保持。
// image に画像パス（例: '/images/works/app-creation.webp'。WebP想定）を設定すると、
// ブラウザ風フレームで画像が表示されます。
// 未設定の間はグラデーション＋タイポグラフィのフォールバック表示になります。
// ネットからの画像取得やダミー画像の使用はしないこと。

export const works = [
  {
    id: 'app-creation',
    category: 'APP CREATION',
    title: 'アプリ制作',
    desc: 'AIを使いながら、生活や趣味を便利にするWebアプリを制作。歌練習、筋トレ記録、キャンプ、バス時刻表など、実際に使えるものをいろいろ形にしている。',
    url: null,
    image: '/images/works/app-creation.webp',
    accent: 'yellow',
  },
  {
    id: 'digital-creation',
    category: 'DIGITAL CREATION',
    title: 'デジタル制作',
    desc: 'LINEスタンプや画像制作、Webデザイン、記事などのコンテンツ制作まで。AIも活用しながら、見せるもの・伝えるものをデジタル上で形にしている。',
    url: null,
    image: '/images/works/digital-creation.webp',
    accent: 'blue',
  },
  {
    id: 'bamboo-lantern',
    category: 'BAMBOO LANTERN',
    title: '竹灯籠制作',
    desc: '竹を加工し、灯りと影の揺らぎを楽しむ竹灯籠を制作。穴の空け方ひとつで表情が変わる、手仕事ならではの面白さがある。',
    url: null,
    image: '/images/works/bamboo-lantern.webp',
    accent: 'orange',
  },
  {
    id: 'leather-craft',
    category: 'LEATHER CRAFT',
    title: '革製品制作',
    desc: '革を使ったナイフケースやマグカバーなどの小物を制作。使うほど色や質感が変わっていく経年変化も楽しみのひとつ。',
    url: null,
    image: '/images/works/leather-craft.webp',
    accent: 'blue',
  },
  {
    id: 'camp-gear',
    category: 'CAMP GEAR',
    title: 'キャンプギア制作',
    desc: '市販品をそのまま使うだけでなく、「こうだったら便利」を自分なりに形にしてみる。焚き火まわりの道具づくりが特に好き。',
    url: null,
    image: '/images/works/camp-gear.webp',
    accent: 'yellow',
  },
  {
    id: 'diy',
    category: 'DIY',
    title: 'DIY',
    desc: '生活の中で、作れそうなものは自分で作ってみる。棚や収納、ちょっとした家具の改造など。',
    url: null,
    image: '/images/works/diy.webp',
    accent: 'orange',
  },
  {
    id: 'drawing',
    category: 'DRAWING',
    title: 'デッサン',
    desc: '鉛筆やペンで、人物や風景などを描く。見たものを自分なりに捉えて、形にする時間。',
    url: null,
    image: '/images/works/drawing.webp',
    accent: 'blue',
  },
  {
    id: 'video-editing',
    category: 'VIDEO EDITING',
    title: '動画編集',
    desc: '撮った写真や動画を、音楽や構成を考えながら一本の作品にまとめていく。キャンプの記録を編集することが多い。',
    url: null,
    image: '/images/works/video-editing.webp',
    accent: 'yellow',
  },
]
