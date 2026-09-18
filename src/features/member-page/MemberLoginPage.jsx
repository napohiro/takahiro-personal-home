import { useState } from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient'
import './MemberPage.css'

export default function MemberLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!isSupabaseConfigured || !supabase) {
      setError('現在ログイン機能を準備中です。しばらくしてから再度お試しください。')
      return
    }

    setSubmitting(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    setSubmitting(false)

    if (signInError) {
      setError('メールアドレスまたはパスワードが正しくありません。')
      return
    }

    window.location.href = '/member'
  }

  return (
    <>
      <Header />
      <main className="member-page">
        <section className="section member-login">
          <div className="container">
            <div className="member-login-card">
              <a href="/" className="member-back-link">
                ← 公開サイトへ戻る
              </a>
              <span className="eyebrow">NAPORISE</span>
              <h1 className="section-title">MEMBER LOGIN</h1>
              <p className="section-lead">NAPORISEご契約者様専用ページです。</p>

              <form className="member-login-form" onSubmit={handleSubmit}>
                <label className="member-login-field">
                  <span>メールアドレス</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </label>

                <label className="member-login-field">
                  <span>パスワード</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </label>

                {error && <p className="member-login-error">{error}</p>}

                <button type="submit" className="btn btn--primary" disabled={submitting}>
                  {submitting ? 'ログイン中…' : 'ログイン'}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
