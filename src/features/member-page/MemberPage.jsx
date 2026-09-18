import { useEffect } from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import useMemberAuth from './useMemberAuth'
import useMemberContract from './useMemberContract'
import { supabase } from '../../lib/supabaseClient'
import {
  appShop,
  ownerRoomInfo,
  supportInfo,
  serviceCodeLabels,
  contractStatusLabels,
  memberStatusNotices,
} from '../../data/memberSettings'
import './MemberPage.css'

export default function MemberPage() {
  const { status: authStatus, user } = useMemberAuth()
  const { status: dataStatus, member, contracts } = useMemberContract(user?.id)

  useEffect(() => {
    if (authStatus === 'guest') {
      window.location.href = '/member/login'
    }
  }, [authStatus])

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    window.location.href = '/member/login'
  }

  // checking中・未ログイン(リダイレクト待ち)の間は、保護対象の内容を描画しない。
  if (authStatus !== 'authed') {
    return (
      <div className="member-page member-page--loading">
        <p className="member-loading">確認しています…</p>
      </div>
    )
  }

  // 将来複数契約になった場合を見越し配列で受け取るが、今回は
  // 有効な契約を優先しつつ1件だけを表示に使う（複数契約UIは対象外）。
  const contract = contracts.find((c) => c.contract_status === 'active') ?? contracts[0] ?? null
  const memberStatusNotice =
    member && member.member_status !== 'active'
      ? (memberStatusNotices[member.member_status] ?? 'ご利用状況をご確認ください。')
      : null
  const isDataLoading = dataStatus === 'idle' || dataStatus === 'loading'
  const isDataReady = dataStatus === 'ready' && member && contract

  return (
    <>
      <Header />
      <main className="member-page">
        <section className="section member-hero">
          <div className="container">
            <div>
              <div className="member-top-actions">
                <a href="/" className="member-back-link">
                  ← 公開サイトへ戻る
                </a>
                <button type="button" className="member-logout-link" onClick={handleLogout}>
                  ログアウト
                </button>
              </div>
              <span className="eyebrow">NAPORISE MEMBER PAGE</span>

              {isDataLoading && <p className="member-loading">契約者情報を確認しています…</p>}

              {dataStatus === 'error' && (
                <p className="member-data-error">
                  契約情報を確認できませんでした。NAPORISEサポートへお問い合わせください。
                </p>
              )}

              {isDataReady && (
                <>
                  <h1 className="section-title">こんにちは、{member.display_name}様</h1>

                  {memberStatusNotice && <p className="member-status-notice">{memberStatusNotice}</p>}

                  <dl className="member-info-card">
                    <div className="member-info-card__row">
                      <dt>契約サービス</dt>
                      <dd>{serviceCodeLabels[contract.service_code] ?? contract.service_code}</dd>
                    </div>
                    <div className="member-info-card__row">
                      <dt>契約状況</dt>
                      <dd>{contractStatusLabels[contract.contract_status] ?? contract.contract_status}</dd>
                    </div>
                    <div className="member-info-card__row">
                      <dt>サイト</dt>
                      <dd>{contract.site_name}</dd>
                    </div>
                  </dl>

                  {contract.site_url && (
                    <a href={contract.site_url} className="btn btn--ghost member-site-link">
                      ホームページを見る
                    </a>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        {isDataReady && (
          <>
            <section id="member-benefits" className="section section--tight">
              <div className="container">
                <div>
                  <span className="eyebrow">NAPORISE MEMBER BENEFITS</span>
                  <h2 className="section-title">{appShop.title}</h2>

                  {contract.app_shop_member_enabled ? (
                    <>
                      <p className="section-lead">{appShop.memberDescription}</p>
                      <div className="member-products">
                        {appShop.products.map((product) => (
                          <div key={product.id} className="member-product-card">
                            <p className="member-product-card__name">{product.name}</p>
                            <p className="member-product-card__price member-product-card__price--regular">
                              通常価格：{product.regularPrice}円
                            </p>
                            <p className="member-product-card__price member-product-card__price--member">
                              契約者価格：{product.memberPrice}円
                            </p>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="section-lead">{appShop.guestDescription}</p>
                  )}

                  <a href={appShop.url} className="btn btn--primary">
                    {appShop.ctaLabel}
                  </a>
                </div>
              </div>
            </section>

            <section id="member-owner-room" className="section section--tight">
              <div className="container">
                <div className="member-owner-room-card">
                  <span className="eyebrow">OWNER ROOM</span>

                  {contract.owner_room_enabled ? (
                    <>
                      <p className="member-owner-room-card__badge">{ownerRoomInfo.enabledBadge}</p>
                      <h2 className="section-title">{ownerRoomInfo.priceLabel}</h2>
                      <p className="member-owner-room-card__status">利用状況：{ownerRoomInfo.enabledStatusLabel}</p>
                      <p className="section-lead">{ownerRoomInfo.description}</p>
                      <a href={ownerRoomInfo.enabledUrl} className="btn btn--ghost">
                        {ownerRoomInfo.enabledCtaLabel}
                      </a>
                    </>
                  ) : (
                    <>
                      <h2 className="section-title">{ownerRoomInfo.priceLabel}</h2>
                      <p className="section-lead">{ownerRoomInfo.description}</p>
                      <a href={ownerRoomInfo.disabledUrl} className="btn btn--ghost">
                        {ownerRoomInfo.disabledCtaLabel}
                      </a>
                    </>
                  )}
                </div>
              </div>
            </section>
          </>
        )}

        <section id="member-support" className="section section--tight">
          <div className="container">
            <div>
              <span className="eyebrow">{supportInfo.title}</span>
              <p className="section-lead">{supportInfo.description}</p>
              <a href={supportInfo.url} className="btn btn--ghost">
                {supportInfo.ctaLabel}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
