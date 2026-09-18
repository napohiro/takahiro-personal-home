import { useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient'

// /member と /member/login で共有する、Supabase Authのセッション確認フック。
// セッション自体の保存はSupabase標準の仕組みに任せ、独自トークン保存は行わない。
export default function useMemberAuth() {
  // Supabase未設定であれば結果は最初から確定しているため、
  // 初期値として直接反映し、effect内での同期的なsetStateを避ける。
  const [status, setStatus] = useState(() => (isSupabaseConfigured ? 'checking' : 'guest'))

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return undefined
    }

    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setStatus(data.session ? 'authed' : 'guest')
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      setStatus(session ? 'authed' : 'guest')
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  return status
}
