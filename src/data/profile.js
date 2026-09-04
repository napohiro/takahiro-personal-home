// このファイルを書き換えるだけで、プロフィール表示が更新されます。

// HEROの写真エリア。src に画像パス（例: '/photos/takahiro.jpg'）を設定すると
// 自動的に写真が表示されます。未設定の間は「PHOTO COMING SOON」表示になります。
// 本人写真・作品スクリーンショットの類はネットから取得せず、本人提供の画像のみを使うこと。
export const heroPhoto = {
  src: '/images/profile/hero-portrait.webp',
  alt: 'TAKAHIROの自画像',
  caption: 'somewhere outside.',
}

// WHO IS TAKAHIRO のプロフィール文章。
// 「今のTAKAHIROがどんな人なのか」を短く要約する場所。具体的な経歴・出来事は
// src/data/timeline.js（LIFE TIMELINE）側で扱うため、ここでは重複させない。
export const bio = [
  'エンジニアから営業へ進み、成功哲学に惹かれ、生命保険業で独立。',
  '親友の死をきっかけに人生を見直し、今はAIやデジタルを使いながら、仕事も遊びも自分なりに面白くしようとしている。',
  '絵を描くことも、キャンプも、水泳も、ものづくりも好き。アナログもデジタルも、どちらかに決める必要はないと思っている。',
]

// bio の最後に、少し強調して見せる一文。
export const bioHighlight = '面白そうなら、まず試してみる。'

// icon は src/components/icons.jsx の TagIcon が対応しているキーを指定。
export const identityTags = [
  { label: 'AIで遊ぶ', icon: 'ai' },
  { label: 'アプリを作る', icon: 'app' },
  { label: 'キャンプに行く', icon: 'camp' },
  { label: '泳ぐ', icon: 'swim' },
  { label: '書く', icon: 'write' },
  { label: '考える', icon: 'think' },
  { label: '新しいものを試す', icon: 'flask' },
]

// deco は src/components/icons.jsx の WorldDeco が対応しているキーを指定。
export const worldCards = [
  {
    id: 'ai-lab',
    en: 'AI LAB',
    ja: 'ChatGPT・Claude・アプリ制作',
    desc: 'AIを使いながら、アイデア整理・文章・Web制作・アプリ制作を実践中。',
    accent: 'yellow',
    deco: 'grid',
  },
  {
    id: 'create',
    en: 'CREATE',
    ja: 'Webアプリ・サイト制作',
    desc: '思いついたものを、とりあえずWebアプリやサイトとして形にする。',
    accent: 'orange',
    deco: 'code',
  },
  {
    id: 'camp',
    en: 'CAMP',
    ja: 'キャンプ・焚き火・アウトドア',
    desc: '便利さより、外で過ごす時間そのものが好き。',
    accent: 'blue',
    deco: 'mountain',
  },
  {
    id: 'swim',
    en: 'SWIM',
    ja: '水泳・トレーニング',
    desc: '泳ぐことはトレーニングであり、頭をリセットする時間でもある。',
    accent: 'yellow',
    deco: 'wave',
  },
  {
    id: 'write',
    en: 'WRITE',
    ja: 'note・エッセイ・文章',
    desc: 'AI、人生、考え方、日常についてnoteに書く。',
    accent: 'orange',
    deco: 'paper',
  },
  {
    id: 'think',
    en: 'THINK',
    ja: '人生・成幸・価値観',
    desc: '成幸、人生、価値観、言葉、人間について考える。',
    accent: 'blue',
    deco: 'quote',
  },
  {
    id: 'favorites',
    en: 'FAVORITES',
    ja: '映画・本・音楽・ガジェット',
    desc: '好きなものの話を始めると止まらない。',
    accent: 'yellow',
    deco: 'star',
  },
  {
    id: 'random',
    en: 'RANDOM',
    ja: '役に立つかは分からないもの',
    desc: '面白ければ、役に立つかは気にせず試してみる。',
    accent: 'orange',
    deco: 'dots',
  },
]

// 「今、やっていること」。ここを書き換えるだけで NOW セクションが更新されます。
export const nowItems = [
  'AIBOUというAI伴走サービスを育てている',
  '個人ホームページ「AIBOU PERSONAL」の企画',
  'AIを使ったアプリ制作',
  'LINEスタンプ制作',
  'note執筆',
  '水泳とキャンプの計画',
]

export const nowUpdatedAt = '2026年8月'

// NOWカードに添える手書き風の一言。
export const nowNote = 'たぶん来月にはまた変わっています。'

export const randomPhrases = [
  'キャンプに行きたい。',
  '何か作っています。',
  'AIと話しています。',
  '今日もたぶん泳ぎます。',
  '面白いアイデアを探しています。',
  'またアプリを思いつきました。',
  '焚き火が見たい。',
  'とりあえず試してみます。',
  '本を読み始めました。',
  '気になることを調べています。',
  'まだ作りたいものがあります。',
  '人生はまだ制作途中。',
]

// LIFE TIMELINEのデータは src/data/timeline.js に移動しました。

// SNSリンク。show:false の間は画面に表示されません（データとしては残ります）。
// 本人がアカウントを決めたら、url・handle を設定して show を true にしてください。
export const socialLinks = [
  { id: 'x', name: 'X', handle: '', url: null, show: false },
  { id: 'note', name: 'note', handle: '', url: null, show: false },
  { id: 'instagram', name: 'Instagram', handle: '', url: null, show: false },
  { id: 'youtube', name: 'YouTube', handle: '', url: null, show: false },
]
