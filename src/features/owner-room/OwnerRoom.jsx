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
          <div>
            <p className="or-gate-eyebrow">OWNER ROOM</p>
            <h1 className="or-dashboard-title">サイト表示設定</h1>
          </div>
          <button type="button" className="or-btn or-btn--ghost" onClick={handleLogout}>
            ログアウト
          </button>
        </header>

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
      </div>
    </div>
  )
}
