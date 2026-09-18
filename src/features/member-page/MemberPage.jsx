import Header from '../../components/Header'
import Footer from '../../components/Footer'
import useReveal from '../../hooks/useReveal'
import { memberInfo, appShop, ownerRoomInfo, supportInfo } from '../../data/memberSettings'
import './MemberPage.css'

export default function MemberPage() {
  const [heroRef, heroVisible] = useReveal()
  const [benefitsRef, benefitsVisible] = useReveal()
  const [ownerRoomRef, ownerRoomVisible] = useReveal()
  const [supportRef, supportVisible] = useReveal()

  return (
    <>
      <Header />
      <main className="member-page">
        <section className="section member-hero">
          <div className="container">
            <div className={`reveal ${heroVisible ? 'is-visible' : ''}`} ref={heroRef}>
              <a href="/" className="member-back-link">
                ← 公開サイトへ戻る
              </a>
              <span className="eyebrow">NAPORISE MEMBER PAGE</span>
              <h1 className="section-title">
                こんにちは、{memberInfo.name}
                {memberInfo.honorific}
              </h1>

              <dl className="member-info-card">
                <div className="member-info-card__row">
                  <dt>契約サービス</dt>
                  <dd>{memberInfo.serviceName}</dd>
                </div>
                <div className="member-info-card__row">
                  <dt>契約状況</dt>
                  <dd>{memberInfo.status}</dd>
                </div>
                <div className="member-info-card__row">
                  <dt>サイト</dt>
                  <dd>{memberInfo.siteName}</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section id="member-benefits" className="section section--tight">
          <div className="container">
            <div className={`reveal ${benefitsVisible ? 'is-visible' : ''}`} ref={benefitsRef}>
              <span className="eyebrow">NAPORISE MEMBER BENEFITS</span>
              <h2 className="section-title">{appShop.title}</h2>
              <p className="section-lead">{appShop.description}</p>

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

              <a href={appShop.url} className="btn btn--primary">
                {appShop.ctaLabel}
              </a>
            </div>
          </div>
        </section>

        <section id="member-owner-room" className="section section--tight">
          <div className="container">
            <div
              className={`member-owner-room-card reveal ${ownerRoomVisible ? 'is-visible' : ''}`}
              ref={ownerRoomRef}
            >
              <span className="eyebrow">OWNER ROOM</span>
              <p className="member-owner-room-card__badge">{ownerRoomInfo.statusBadge}</p>
              <h2 className="section-title">{ownerRoomInfo.priceLabel}</h2>
              <p className="member-owner-room-card__status">利用状況：{ownerRoomInfo.usageStatus}</p>
              <p className="section-lead">{ownerRoomInfo.description}</p>
              <a href={ownerRoomInfo.url} className="btn btn--ghost">
                {ownerRoomInfo.ctaLabel}
              </a>
            </div>
          </div>
        </section>

        <section id="member-support" className="section section--tight">
          <div className="container">
            <div className={`reveal ${supportVisible ? 'is-visible' : ''}`} ref={supportRef}>
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
