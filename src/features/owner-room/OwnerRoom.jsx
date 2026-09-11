import { useEffect, useState } from 'react'
import siteSettings from '../../data/siteSettings.json'
import './OwnerRoom.css'

const SECTION_LABELS = [
  { key: 'profile', label: 'プロフィール' },
  { key: 'myWorld', label: 'MY WORLD' },
  { key: 'now', label: 'NOW' },
  { key: 'works', label: 'WORKS' },
  { key: 'favorites', label: 'FAVORITES' },
  { key: 'timeline', label: 'TIMELINE' },
  { key: 'gacha', label: '思い出ガチャ' },
  { key: 'family', label: 'FAMILY' },
  { key: 'socialLinks', label: 'SOCIAL LINKS' },
]

const NOTICE_TITLE_MAX = 30
const NOTICE_MESSAGE_MAX = 200
const NEW_PASSWORD_MIN_LENGTH = 12

function cloneSettings(source) {
  return {
    sections: { ...source.sections },
    notice: { ...source.notice },
  }
}

export default function OwnerRoom() {
  const [authState, setAuthState] = useState('checking') // checking | guest | in
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)

  const [settings, setSettings] = useState(() => cloneSettings(siteSettings))
  const [publishState, setPublishState] = useState('idle') // idle | publishing | done | error
  const [publishMessage, setPublishMessage] = useState('')

  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' })
  const [passwordState, setPasswordState] = useState('idle') // idle | submitting | error
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordChanged, setPasswordChanged] = useState(false)

  useEffect(() => {
    document.title = 'OWNER ROOM'
    let meta = document.querySelector('meta[name="robots"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'robots')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', 'noindex, nofollow')
  }, [])

  useEffect(() => {
    let cancelled = false
    fetch('/.netlify/functions/owner-session')
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        setAuthState(data.authenticated ? 'in' : 'guest')
      })
      .catch(() => {
        if (!cancelled) setAuthState('guest')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    setLoggingIn(true)
    try {
      const res = await fetch('/.netlify/functions/owner-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        setAuthState('in')
        setPassword('')
      } else {
        setLoginError(data.error || 'パスワードが違います。')
      }
    } catch {
      setLoginError('通信に失敗しました。ネットワーク状態をご確認ください。')
    } finally {
      setLoggingIn(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/.netlify/functions/owner-logout', { method: 'POST' })
    } catch {
      // ログアウト自体は失敗してもローカル状態は戻す
    }
    setAuthState('guest')
    setSettings(cloneSettings(siteSettings))
    setPublishState('idle')
    setPublishMessage('')
  }

  // 直接 /owner-room を開いた場合でも確実に公開トップへ戻れるよう、
  // history.back()ではなく明示的にトップURLへ遷移する。
  const handleBackToSite = () => {
    window.location.href = '/'
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwordState === 'submitting') return

    setPasswordMessage('')

    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordState('error')
      setPasswordMessage('新しいパスワードと確認用の入力が一致しません。')
      return
    }
    if (passwordForm.next.length < NEW_PASSWORD_MIN_LENGTH) {
      setPasswordState('error')
      setPasswordMessage(`新しいパスワードは${NEW_PASSWORD_MIN_LENGTH}文字以上にしてください。`)
      return
    }
    if (passwordForm.next === passwordForm.current) {
      setPasswordState('error')
      setPasswordMessage('新しいパスワードは現在のパスワードと異なるものにしてください。')
      return
    }

    setPasswordState('submitting')
    try {
      const res = await fetch('/.netlify/functions/owner-change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.current,
          newPassword: passwordForm.next,
          confirmPassword: passwordForm.confirm,
        }),
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        setPasswordChanged(true)
        setPasswordMessage(data.message || 'パスワードを変更しました。新しいパスワードで再度ログインしてください。')
        setPasswordForm({ current: '', next: '', confirm: '' })
        // このブラウザのセッションも失効させ、ログイン画面へ戻す。
        setTimeout(() => {
          setAuthState('guest')
          setSettings(cloneSettings(siteSettings))
        }, 2000)
      } else {
        setPasswordState('error')
        setPasswordMessage(data.error || 'パスワードの変更に失敗しました。')
      }
    } catch {
      setPasswordState('error')
      setPasswordMessage('通信に失敗しました。ネットワーク状態をご確認のうえ再度お試しください。')
    }
  }

  const toggleSection = (key) => {
    setSettings((prev) => ({
      ...prev,
      sections: { ...prev.sections, [key]: !prev.sections[key] },
    }))
  }

  const updateNotice = (patch) => {
    setSettings((prev) => ({
      ...prev,
      notice: { ...prev.notice, ...patch },
    }))
  }

  const handlePublish = async () => {
    if (publishState === 'publishing') return
    setPublishState('publishing')
    setPublishMessage('')
    try {
      const res = await fetch('/.netlify/functions/owner-update-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        setPublishState('done')
        setPublishMessage('変更を受け付けました。数十秒〜数分で公開サイトへ反映されます。')
      } else if (res.status === 401) {
        setPublishState('error')
        setPublishMessage('ログインが切れました。もう一度ログインしてください。')
        setAuthState('guest')
      } else {
        setPublishState('error')
        setPublishMessage(data.error || '公開できませんでした。時間をおいて再度お試しください。')
      }
    } catch {
      setPublishState('error')
      setPublishMessage('通信に失敗しました。ネットワーク状態をご確認のうえ再度お試しください。')
    }
  }

  if (authState === 'checking') {
    return (
      <div className="or-root">
        <p className="or-loading">確認しています…</p>
      </div>
    )
  }

  if (authState === 'guest') {
    return (
      <div className="or-root">
        <div className="or-gate">
          <button type="button" className="or-back-link or-back-link--gate" onClick={handleBackToSite}>
            ← 公開サイトへ戻る
          </button>
          <p className="or-gate-eyebrow">OWNER ROOM</p>
          <h1 className="or-gate-title">自分のホームページの裏側へ。</h1>
          <form className="or-gate-form" onSubmit={handleLogin}>
            <label className="or-field">
              <span>パスワード</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                autoFocus
              />
            </label>
            {loginError && <p className="or-error">{loginError}</p>}
            <button type="submit" className="or-btn or-btn--primary" disabled={loggingIn || !password}>
              {loggingIn ? '確認中…' : '入室する'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="or-root">
      <div className="or-dashboard">
        <header className="or-dashboard-header">
          <button type="button" className="or-back-link" onClick={handleBackToSite}>
            ← 公開サイトへ戻る
          </button>
          <button type="button" className="or-btn or-btn--ghost" onClick={handleLogout}>
            ログアウト
          </button>
        </header>

        <div>
          <p className="or-gate-eyebrow">OWNER ROOM</p>
          <h1 className="or-dashboard-title">サイト表示設定</h1>
        </div>

        <section className="or-panel">
          <h2 className="or-panel-title">セクション表示</h2>
          <ul className="or-toggle-list">
            {SECTION_LABELS.map(({ key, label }) => (
              <li key={key} className="or-toggle-row">
                <span>{label}</span>
                <button
                  type="button"
                  className={`or-switch ${settings.sections[key] ? 'is-on' : ''}`}
                  role="switch"
                  aria-checked={settings.sections[key]}
                  onClick={() => toggleSection(key)}
                >
                  <span className="or-switch-knob" />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="or-panel">
          <h2 className="or-panel-title">緊急お知らせ</h2>

          <div className="or-toggle-row or-toggle-row--standalone">
            <span>表示する</span>
            <button
              type="button"
              className={`or-switch ${settings.notice.enabled ? 'is-on' : ''}`}
              role="switch"
              aria-checked={settings.notice.enabled}
              onClick={() => updateNotice({ enabled: !settings.notice.enabled })}
            >
              <span className="or-switch-knob" />
            </button>
          </div>

          <label className="or-field">
            <span>見出し（{settings.notice.title.length}/{NOTICE_TITLE_MAX}）</span>
            <input
              type="text"
              value={settings.notice.title}
              maxLength={NOTICE_TITLE_MAX}
              onChange={(e) => updateNotice({ title: e.target.value })}
              placeholder="お知らせ"
            />
          </label>

          <label className="or-field">
            <span>本文（{settings.notice.message.length}/{NOTICE_MESSAGE_MAX}）</span>
            <textarea
              value={settings.notice.message}
              maxLength={NOTICE_MESSAGE_MAX}
              onChange={(e) => updateNotice({ message: e.target.value })}
              rows={3}
              placeholder="現在しばらく更新をお休みしています。"
            />
          </label>
        </section>

        <div className="or-publish">
          <button
            type="button"
            className="or-btn or-btn--primary or-btn--wide"
            onClick={handlePublish}
            disabled={publishState === 'publishing'}
          >
            {publishState === 'publishing' ? '公開処理中…' : '変更を公開'}
          </button>
          {publishMessage && (
            <p className={`or-publish-message ${publishState === 'error' ? 'is-error' : ''}`}>
              {publishMessage}
            </p>
          )}
        </div>

        <section className="or-panel or-panel--security">
          <h2 className="or-panel-title">セキュリティ</h2>
          <p className="or-panel-caption">OWNER ROOMパスワード</p>

          {passwordChanged ? (
            <p className="or-publish-message">{passwordMessage}</p>
          ) : (
            <form className="or-password-form" onSubmit={handleChangePassword}>
              <label className="or-field">
                <span>現在のパスワード</span>
                <input
                  type="password"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))}
                  autoComplete="current-password"
                  required
                />
              </label>

              <label className="or-field">
                <span>新しいパスワード（{NEW_PASSWORD_MIN_LENGTH}文字以上）</span>
                <input
                  type="password"
                  value={passwordForm.next}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, next: e.target.value }))}
                  autoComplete="new-password"
                  required
                />
              </label>

              <label className="or-field">
                <span>新しいパスワード（確認）</span>
                <input
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))}
                  autoComplete="new-password"
                  required
                />
              </label>

              {passwordMessage && (
                <p className={`or-publish-message ${passwordState === 'error' ? 'is-error' : ''}`}>
                  {passwordMessage}
                </p>
              )}

              <button
                type="submit"
                className="or-btn or-btn--primary or-btn--wide"
                disabled={passwordState === 'submitting'}
              >
                {passwordState === 'submitting' ? '変更処理中…' : 'パスワードを変更'}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}
