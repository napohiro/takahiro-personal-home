// 契約者マイページ（/member）の表示内容。
// NAPORISE契約者サイトへ展開する際は、このファイルの値を
// サイトごとに差し替えるだけで内容を切り替えられる想定です。
// Supabase Auth・実DB連携は未実装のため、現時点では静的な値です。

export const memberInfo = {
  name: 'TAKAHIRO',
  honorific: '様',
  serviceName: 'PERSONAL',
  status: '利用中',
  siteName: "TAKAHIRO's PERSONAL HOME",
}

// APP SHOP（契約者特典）。url は後日、NAPORISE共通APP SHOPページへ差し替え予定。
export const appShop = {
  title: 'APP SHOP',
  description: 'NAPORISE契約者様は、APP SHOPの商品を契約者限定価格で購入できます。',
  url: '/#gacha',
  ctaLabel: 'APP SHOPを見る',
  products: [
    {
      id: 'omoide-gacha',
      name: '思い出ガチャ',
      regularPrice: 980,
      memberPrice: 480,
    },
  ],
}

// OWNER ROOM（既存機能）への導線。url は既存の /owner-room をそのまま指す。
export const ownerRoomInfo = {
  statusBadge: 'OWNER ROOM契約中',
  priceLabel: '月額＋500円',
  usageStatus: '利用中',
  description: 'ホームページの一部を自分で管理できる追加オプションです。',
  ctaLabel: 'OWNER ROOMを開く',
  url: '/owner-room',
}

// サポート導線。url は後日、NAPORISE共通相談フォームへ差し替え予定。
export const supportInfo = {
  title: 'NAPORISEサポート',
  description: 'サイトについてのご相談・変更依頼はこちら',
  ctaLabel: '相談する',
  url: '#',
}
