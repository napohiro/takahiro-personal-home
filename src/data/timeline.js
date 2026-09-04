// LIFE TIMELINE用データ。
//
// WHO IS TAKAHIRO? が「今のTAKAHIROがどんな人か」を短く要約する場所なのに対し、
// こちらは「どうやって今のTAKAHIROになったのか」を時系列で見せる場所。
// bio（src/data/profile.js）の文章をそのままコピーしないこと。
//
// year: 正確な年が確認できている場合のみ文字列で入れる（例: '1998'、'2020s'）。
//       未確認の間は null にしておくこと。年を推測して入れないこと。
// phase: year が null のときに、カードの年バッジ位置に表示する英語の見出し
//        （例: 'CHILDHOOD'、'AI' など）。
// 表示コンポーネント側では year があれば year を、なければ phase を表示する。
//
// image に画像パス（例: '/images/timeline/xxx.webp'）を設定すると、カードに写真が表示されます。
// 未設定の間は写真なしのカードとして表示されます。

export const lifeTimeline = [
  {
    id: 'childhood',
    year: null,
    phase: 'CHILDHOOD',
    title: '幼少期',
    desc: '幼稚園の頃、知能テストの結果について園長先生から「数百人に1人くらいの高い知能指数だった」と聞かされたことがある。意味はよく分からなかったが、気になるものにはすぐ興味を持つタイプだった。',
    image: null,
  },
  {
    id: 'first-dream',
    year: null,
    phase: 'FIRST DREAM',
    title: '最初の夢は漫画家',
    desc: '小学生の頃は空手、書道、硬筆と習い事三昧。人生で最初になりたかったものは漫画家。絵を描き、頭の中のものを形にすることが好きだった。',
    image: null,
  },
  {
    id: 'action-hero',
    year: null,
    phase: 'ACTION HERO',
    title: 'ジャッキー・チェンに憧れる',
    desc: '次の夢はアクションスター。ジャッキー・チェンに憧れ、体を動かすことや激しいスポーツが好きになる。今でもアートやスポーツが好きなのは、この頃の延長線——最近は、少しゆるめになってきた気もするけれど。',
    image: null,
  },
  {
    id: 'engineer',
    year: null,
    phase: 'ENGINEER',
    title: 'エンジニアとして社会人スタート',
    desc: '最初はエンジニアの道へ。ただ、人と話すこと、伝えること、人と関わることに魅力を感じ、自分から営業職を希望する。',
    image: null,
  },
  {
    id: 'sales',
    year: null,
    phase: 'SALES',
    title: '営業という仕事',
    desc: '営業職を長く経験。人と話し、考え、伝えることを仕事にしてきた時期。',
    image: null,
  },
  {
    id: 'success-philosophy',
    year: null,
    phase: 'SUCCESS PHILOSOPHY',
    title: '成功哲学との出会い',
    desc: '仕事を続ける中で、成功哲学に強く惹かれる。インストラクターも経験し、「人は何を考え、どう生きれば人生をより良くできるのか」を深く考えるように。中でも「思考は現実化する」という考え方に強く影響を受けた。',
    image: null,
  },
  {
    id: 'insurance',
    year: null,
    phase: 'INSURANCE',
    title: '生命保険業で独立',
    desc: '生と死に深く関わる、生命保険の仕事で独立。人の人生や家族、これから先のことに向き合う仕事を経験する。',
    image: null,
  },
  {
    id: 'turning-point',
    year: null,
    phase: 'TURNING POINT',
    title: '親友の死',
    desc: '親友の死に直面し、「人生って何だろう」「一度しかない人生を、どう使うのか」と改めて考えるようになる。その後の生き方を見直す、大きな転機になった出来事。',
    image: null,
  },
  {
    id: 'ai-encounter',
    year: null,
    phase: 'AI',
    title: 'AIとの出会い',
    desc: 'AIの進化に触れ、「専門家じゃなくても、こんなことまで作れるのか」と感じる。そこからアプリ、Web、文章、画像など、いろいろな制作を始めることに。',
    image: null,
  },
  {
    id: 'digital-analog',
    year: null,
    phase: 'DIGITAL × ANALOG',
    title: 'アナログとデジタル',
    desc: 'AIやWebだけでなく、キャンプ、DIY、革細工、竹灯籠、絵画、動画編集、水泳、ものづくりも続ける。デジタルとアナログ、どちらかに寄せるのではなく、両方を行き来するスタイルへ。',
    image: null,
  },
  {
    id: 'naporise',
    year: null,
    phase: 'NAPORISE',
    title: 'NAPORISE',
    desc: 'AIやWeb制作などを活用しながら、個人・事業者向けのサービスづくりを進める。NAPORISE PERSONALでは「SNSだけでは表現しきれない、その人自身の世界を残す個人ホームページ」という考え方を形にしている。',
    image: null,
  },
  {
    id: 'now',
    year: null,
    phase: 'NOW',
    title: '現在',
    desc: 'アプリを作る。Webサイトを作る。文章を書く。画像を作る。LINEスタンプを作る。キャンプに行く。泳ぐ。考える。今も、面白そうなものを試し続けている。',
    image: null,
  },
  {
    id: 'next',
    year: null,
    phase: 'NEXT',
    title: 'これから',
    desc: 'まだ決まっていない。だから面白い。',
    image: null,
  },
]
