/**
 * PERSONAL版の思い出データ（静的データ方式）。
 *
 * ※このファイルはサンプルです。顧客への納品時には、
 *   このファイルと public/images/memories/ 配下の画像を
 *   その顧客専用の内容に差し替えてください。
 *
 * 各項目の仕様:
 * - id        : 一意なID（文字列。ファイル名などから採番）
 * - imageUrl  : public/images/memories/ 以下の画像パス（WebP推奨）
 * - comment   : コメント（最大40文字）
 * - date      : "YYYY.MM.DD" 形式
 * - tag       : タグ（最大4文字）
 */
export const memories = [
  {
    id: "memory001",
    imageUrl: "/images/memories/memory001.svg",
    comment: "初めて家族みんなで行った沖縄旅行。",
    date: "2018.08.12",
    tag: "家族",
  },
  {
    id: "memory002",
    imageUrl: "/images/memories/memory002.svg",
    comment: "空港で撮った一枚。緊張と期待でいっぱい。",
    date: "2019.03.02",
    tag: "旅行",
  },
  {
    id: "memory003",
    imageUrl: "/images/memories/memory003.svg",
    comment: "誕生日、みんなが隠れて待っててくれた。",
    date: "2020.11.23",
    tag: "記念",
  },
  {
    id: "memory004",
    imageUrl: "/images/memories/memory004.svg",
    comment: "実家に帰ったら、いつもの場所で寝てた。",
    date: "2021.05.04",
    tag: "日常",
  },
  {
    id: "memory005",
    imageUrl: "/images/memories/memory005.svg",
    comment: "初めてのホワイトクリスマス。息が白かった。",
    date: "2017.12.24",
    tag: "冬",
  },
  {
    id: "memory006",
    imageUrl: "/images/memories/memory006.svg",
    comment: "桜が満開だった年。あの下でお弁当を食べた。",
    date: "2019.04.06",
    tag: "春",
  },
  {
    id: "memory007",
    imageUrl: "/images/memories/memory007.svg",
    comment: "友達と行った夏の海。波の音がまだ聞こえる。",
    date: "2016.07.29",
    tag: "友人",
  },
  {
    id: "memory008",
    imageUrl: "/images/memories/memory008.svg",
    comment: "花火大会の帰り道、少し寂しくて幸せだった。",
    date: "2022.08.15",
    tag: "夏",
  },
];
