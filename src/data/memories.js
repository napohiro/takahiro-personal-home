// MEMORY GACHA（思い出ガチャ）用データ。
//
// 現時点では実在の写真・私的な家族情報は入れず、公開して問題のないサンプルのみで構成しています。
// year: 正確な年が確認できている場合のみ文字列で入れる。未確認の間は null にしておくこと
//       （年を推測して入れないこと）。年バッジはコンポーネント側で year がある時だけ表示する。
// image に画像パス（例: '/images/memories/xxx.webp'）を設定すると写真付きで表示されます。
// 未設定でもカードとして成立するデザインです。
//
// フィールド:
//   id / year / title / description / image / category / private / show
//   private: true の項目は将来「家族限定」等に使う想定で、ガチャの抽選対象から除外されます。
//   show: false の項目は画面に一切表示されません（データとしては残せます）。

export const memories = [
  {
    id: 'first-app',
    year: null,
    title: 'はじめて作ったWebアプリ',
    description: 'AIに教わりながら、生活で使えるアプリをはじめて完成させた日。',
    image: null,
    category: 'アプリ制作',
    private: false,
    show: true,
  },
  {
    id: 'campfire-night',
    year: null,
    title: '焚き火の夜',
    description: '特に理由もなく、ただ焚き火を眺めていた時間。',
    image: null,
    category: 'キャンプ',
    private: false,
    show: true,
  },
  {
    id: 'bamboo-lantern-first',
    year: null,
    title: '竹灯籠、はじめての1個',
    description: '穴の空け方ひとつで、こんなに表情が変わるのかと驚いた日。',
    image: null,
    category: 'ものづくり',
    private: false,
    show: true,
  },
  {
    id: 'line-sticker',
    year: null,
    title: 'LINEスタンプが初めて公開された日',
    description: '自分で作ったものが誰かのトーク画面で使われる、という不思議な感覚。',
    image: null,
    category: 'デジタル制作',
    private: false,
    show: true,
  },
  {
    id: 'swim-reset',
    year: null,
    title: 'プールで頭が空っぽになった日',
    description: '泳いでいる間だけは、何も考えなくていい。',
    image: null,
    category: '水泳',
    private: false,
    show: true,
  },
  {
    id: 'leather-first-cut',
    year: null,
    title: '革に初めてナイフを入れた日',
    description: '失敗した分だけ、次はうまくなる。手仕事はそれが面白い。',
    image: null,
    category: 'ものづくり',
    private: false,
    show: true,
  },
  {
    id: 'ai-first-talk',
    year: null,
    title: 'AIと初めてちゃんと話した日',
    description: '「これ、自分でも作れるんじゃないか？」と思った瞬間。',
    image: null,
    category: 'AI',
    private: false,
    show: true,
  },
  {
    id: 'video-first-edit',
    year: null,
    title: 'キャンプの記録を初めて編集した日',
    description: '撮っただけの写真と動画が、一本の作品になっていく面白さを知る。',
    image: null,
    category: '動画編集',
    private: false,
    show: true,
  },
]
