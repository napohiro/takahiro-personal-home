import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

const MEMBER_COLUMNS = 'display_name, member_status'
const CONTRACT_COLUMNS =
  'service_code, site_name, site_url, contract_status, owner_room_enabled, app_shop_member_enabled, started_at, ended_at'

// ログイン中ユーザー本人の naporise_members / naporise_contracts を取得する。
// RLS（auth.uid() = user_id）に処理を委ね、service_role等の特別な権限は使わない。
// naporise_contracts は将来複数件になり得るため配列のまま返す。
export default function useMemberContract(userId) {
  const [state, setState] = useState(() => ({
    status: userId ? 'loading' : 'idle',
    member: null,
    contracts: [],
  }))

  useEffect(() => {
    if (!userId || !supabase) {
      return undefined
    }

    let active = true

    async function load() {
      const [memberResult, contractsResult] = await Promise.all([
        supabase.from('naporise_members').select(MEMBER_COLUMNS).eq('user_id', userId).maybeSingle(),
        supabase.from('naporise_contracts').select(CONTRACT_COLUMNS).eq('user_id', userId),
      ])

      if (!active) return

      const member = memberResult.data
      const contracts = contractsResult.data ?? []

      if (memberResult.error || contractsResult.error || !member || contracts.length === 0) {
        setState({ status: 'error', member: null, contracts: [] })
        return
      }

      setState({ status: 'ready', member, contracts })
    }

    load().catch(() => {
      if (active) setState({ status: 'error', member: null, contracts: [] })
    })

    return () => {
      active = false
    }
  }, [userId])

  return state
}
