import useReveal from '../hooks/useReveal'
import useExpandable from '../hooks/useExpandable'
import ExpandToggle from './ExpandToggle'
import { works } from '../data/works'

export default function Works() {
  const [ref, visible] = useReveal()
  const more = useExpandable({ total: works.length, desktop: 6, mobile: 3 })

  return (
    <section id="works" className="section">
      <div className="container">
        <div className={`reveal ${visible ? 'is-visible' : ''}`} ref={ref}>
          <span className="eyebrow">Things I've Made</span>
          <h2 className="section-title">作ったもの</h2>
          <p className="section-lead">デジタルも、手仕事も。面白そうなら、まず作ってみる。</p>
        </div>

        <div id={more.controlsId} className="works-grid">
          {works.map((work, i) => {
            const Tag = work.url ? 'a' : 'div'
            const linkProps = work.url ? { href: work.url, target: '_blank', rel: 'noopener noreferrer' } : {}

            return (
              <Tag
                key={work.id}
                {...linkProps}
                hidden={more.isHidden(i)}
                className={`work-card work-card--${work.accent} ${work.url ? '' : 'work-card--static'} ${more.isExtra(i) ? 'more-extra' : ''} reveal reveal-delay-${(i % 3) + 1} ${visible ? 'is-visible' : ''}`}
              >
                <div className="work-card__thumb">
                  {work.image ? (
                    <div className="work-card__frame">
                      <div className="work-card__frame-bar">
                        <span />
                        <span />
                        <span />
                      </div>
                      <img src={work.image} alt={work.title} />
                    </div>
                  ) : (
                    <div className="work-card__fallback">
                      <span>{work.category}</span>
                    </div>
                  )}
                </div>
                <div className="work-card__body">
                  <p className="work-card__cat">{work.category}</p>
                  <h3 className="work-card__title">{work.title}</h3>
                  <p className="work-card__desc">{work.desc}</p>
                  {work.url && <span className="work-card__link">VIEW →</span>}
                </div>
              </Tag>
            )
          })}
        </div>

        {more.hasMore && (
          <ExpandToggle
            expanded={more.expanded}
            onToggle={more.setExpanded}
            controls={more.controlsId}
            label="SHOW ALL"
            count={more.hiddenCount}
          />
        )}

        <p className="works-note">思いついたら、また増やしていきます。</p>
      </div>
    </section>
  )
}
