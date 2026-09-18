// 契約者マイページ（/member）の共通UI設定。
// 表示名・契約プラン・契約状況などの顧客固有データはSupabaseの
// naporise_members / naporise_contracts から取得します（useMemberContract参照）。
// ここに残すのは、サイトを問わず共通で使うUI文言・リンク・ラベル変換だけです。

// naporise_contracts.service_code の表示用ラベル。
export const serviceCodeLabels = {
  personal: 'PERSONAL',
  business: 'BUSINESS',
  pet: 'PET',
}

// naporise_contracts.contract_status の表示用ラベル。
export const contractStatusLabels = {
  active: '利用中',
  pending: '準備中',
  paused: '一時停止',
  ended: '終了',
}

// naporise_members.member_status が active 以外の場合の案内文。
export const memberStatusNotices = {
  suspended: '現在ご利用を一時停止しています。',
  ended: '現在の契約は終了しています。',
}

// APP SHOP（契約者特典）。商品名・価格はnaporise_app_productsが正本のため、
// ここには共通UI文言・リンクのみを置く（url は後日、NAPORISE共通APP SHOPページへ差し替え予定）。
export const appShop = {
  title: 'APP SHOP',
  memberDescription: 'NAPORISE契約者様は、APP SHOPの商品を契約者限定価格で購入できます。',
  guestDescription: 'APP SHOPで商品をご購入いただけます。',
  url: '/#gacha',
  ctaLabel: 'APP SHOPを見る',
  purchaseNotice: '現在、購入機能を準備中です。',
  launchPendingNotice: 'アプリ公開準備中です',
}

// OWNER ROOM（既存機能）への導線・説明文。owner_room_enabledの値で出し分ける。
export const ownerRoomInfo = {
  priceLabel: '月額＋500円',
  description: 'ホームページの一部を自分で管理できる追加オプションです。',
  enabledBadge: 'OWNER ROOM契約中',
  enabledStatusLabel: '利用中',
  enabledCtaLabel: 'OWNER ROOMを開く',
  enabledUrl: '/owner-room',
  // 詳細案内の差し替え先は今後NAPORISE共通ページへ変更予定。
  disabledCtaLabel: '詳しく見る',
  disabledUrl: '#',
}

// サポート導線。url は後日、NAPORISE共通相談フォームへ差し替え予定。
export const supportInfo = {
  title: 'NAPORISEサポート',
  description: 'サイトについてのご相談・変更依頼はこちら',
  ctaLabel: '相談する',
  url: '#',
}
