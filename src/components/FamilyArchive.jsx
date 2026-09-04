import useReveal from '../hooks/useReveal'
import { LockIcon } from './icons'

// 現段階では機能紹介のためのモックデータのみ。実在の家族の写真・情報は含めない。
const FAMILY_FEATURES = [
  'パスワード付きアルバム',
  '家族写真',
  '思い出年表',
  '家系図',
  '家族の出来事',
  '動画',
  '記念日',
  '昔の写真',
  '次世代に残したい記録',
]

// 家系図サンプル。実名は使わず、架空の人物として表示する。
const FAMILY_TREE_PARENTS = [
  { id: 'father', role: '父', label: 'FATHER' },
  { id: 'mother', role: '母', label: 'MOTHER' },
]

const FAMILY_TREE_CHILDREN = [
  { id: 'child-a', role: '子', label: 'CHILD A' },
  { id: 'child-b', role: '子', label: 'CHILD B' },
]

export default function FamilyArchive() {
  const [ref, visible] = useReveal()

  return (
    <section id="family" className="section">
      <div className="container">
        <div ref={ref} className={`reveal ${visible ? 'is-visible' : ''}`}>
          <span className="eyebrow">Family Archive</span>
          <h2 className="section-title">家族だけの記録</h2>
          <p className="section-lead">
            家族写真、家系図、思い出、動画、昔の記録などを、一般公開とは別に、家族だけで見られる場所として残すこともできます。
          </p>
        </div>

        <div className="family-archive">
          <div className="family-archive__badge">
            <LockIcon className="family-archive__badge-icon" />
            <span>PASSWORD PROTECTED（サンプル表示）</span>
          </div>

          <div className="family-archive__grid">
            {FAMILY_FEATURES.map((label, i) => (
              <div
                key={label}
                className={`family-archive__card reveal reveal-delay-${(i % 3) + 1} ${visible ? 'is-visible' : ''}`}
              >
                <span className="family-archive__card-index">{String(i + 1).padStart(2, '0')}</span>
                <span className="family-archive__card-label">{label}</span>
              </div>
            ))}
          </div>

          <div className="family-archive__tree">
            <p className="family-archive__tree-label">家系図サンプル（架空の人物です）</p>
            <div className="family-tree">
              <div className="family-tree__row">
                {FAMILY_TREE_PARENTS.map((p) => (
                  <div key={p.id} className="family-tree__node">
                    <span className="family-tree__node-role">{p.role}</span>
                    <span className="family-tree__node-label">{p.label}</span>
                  </div>
                ))}
              </div>
              <div className="family-tree__connector" aria-hidden="true" />
              <div className="family-tree__row">
                {FAMILY_TREE_CHILDREN.map((c) => (
                  <div key={c.id} className="family-tree__node family-tree__node--child">
                    <span className="family-tree__node-role">{c.role}</span>
                    <span className="family-tree__node-label">{c.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="family-archive__note">
            ※これは機能紹介のためのサンプル表示です。実際のパスワード保護は行っていません。本格的に家族限定ページを作る場合は、Supabase
            Authなど適切な認証を使って実装します。
          </p>
        </div>
      </div>
    </section>
  )
}
