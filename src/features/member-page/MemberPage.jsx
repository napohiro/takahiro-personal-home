import { useEffect, useState } from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import useMemberAuth from './useMemberAuth'
import useMemberContract from './useMemberContract'
import useMemberApps from './useMemberApps'
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
  const { status: appsStatus, product, hasAccess } = useMemberApps(user?.id)
  const [purchase, setPurchase] = useState({ status: 'idle', message: '' })

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

  const handlePurchase = async () => {
    if (!supabase || !product || purchase.status === 'processing') return

    setPurchase({ status: 'processing', message: '' })

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      if (!accessToken) {
        setPurchase({ status: 'error', message: 'ログインが必要です。再度ログインしてください。' })
        return
      }

      const res = await fetch('/.netlify/functions/app-shop-create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ product_slug: product.slug }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok || !data) {
        setPurchase({
          status: 'error',
          message: '現在購入処理を開始できませんでした。時間をおいて再度お試しください。',
        })
        return
      }

      if (data.status === 'checkout_ready' && data.checkout_url) {
        window.location.href = data.checkout_url
        return
      }

      if (data.status === 'already_owned') {
        // 購入済み表示へ切り替えるため、最新の利用権状態を取り直す。
        window.location.reload()
        return
      }

      if (data.status === 'checkout_pending') {
        setPurchase({
          status: 'error',
          message: '購入処理を確認しています。しばらくしてから再度お試しください。',
        })
        return
      }

      setPurchase({
        status: 'error',
        message: '現在購入処理を開始できませんでした。時間をおいて再度お試しください。',
      })
    } catch {
      setPurchase({
        status: 'error',
        message: '通信に失敗しました。ネットワーク状態をご確認のうえ再度お試しください。',
      })
    }
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
  const purchasePrice = product
    ? contract?.app_shop_member_enabled
      ? product.member_price
      : product.public_price
    : null

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

                  <p className="section-lead">
                    {contract.app_shop_member_enabled ? appShop.memberDescription : appShop.guestDescription}
                  </p>

                  {appsStatus === 'loading' && <p className="member-loading">商品情報を確認しています…</p>}

                  {appsStatus === 'error' && (
                    <p className="member-data-error">APP SHOPの商品情報を確認できませんでした。</p>
                  )}

                  {appsStatus === 'ready' && product && (
                    <div className="member-product-card">
                      <p className="member-product-card__name">{product.name}</p>
                      {product.description && (
                        <p className="member-product-card__desc">{product.description}</p>
                      )}

                      {hasAccess ? (
                        <>
                          <p className="member-product-card__status member-product-card__status--owned">
                            購入済み
                          </p>
                          {product.launch_url ? (
                            <a href={product.launch_url} className="btn btn--primary">
                              {product.name}を開く
                            </a>
                          ) : (
                            <p className="member-product-card__notice">{appShop.launchPendingNotice}</p>
                          )}
                        </>
                      ) : (
                        <>
                          <p className="member-product-card__price member-product-card__price--regular">
                            通常価格：{product.public_price}円
                          </p>
                          {contract.app_shop_member_enabled && (
                            <p className="member-product-card__price member-product-card__price--member">
                              NAPORISE契約者価格：{product.member_price}円
                            </p>
                          )}
                          <button
                            type="button"
                            className="btn btn--primary"
                            onClick={handlePurchase}
                            disabled={purchase.status === 'processing'}
                          >
                            {purchase.status === 'processing' ? '処理中…' : `${purchasePrice}円で購入する`}
                          </button>
                          {purchase.message && <p className="member-data-error">{purchase.message}</p>}
                        </>
                      )}
                    </div>
                  )}

                  <a href={appShop.url} className="btn btn--ghost">
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
