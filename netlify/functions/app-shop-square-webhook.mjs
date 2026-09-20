import crypto from 'node:crypto'
import { createSupabaseServerClient } from './_shared/supabaseServer.js'

const SQUARE_SANDBOX_BASE_URL = 'https://connect.squareupsandbox.com'
const SQUARE_API_VERSION = '2026-09-16'
const SIGNATURE_HEADER = 'x-square-hmacsha256-signature'

function respond(statusCode, payload) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }
}

// 診断用ログ: 固定のstage名と安全な分類(DBエラーコード等)のみを出力する。
// APIキー・トークン・署名・個人情報・決済ID・外部サービスの生メッセージは一切含めない。
function logFailure(stage, reason) {
  console.error(`[app-shop-square-webhook] stage=${stage} reason=${reason || 'unknown'}`)
}

// Square公式方式: HMAC-SHA256(key=署名鍵, message=notification URL + raw body) をbase64化し、
// ヘッダの値とconstant-timeで比較する。
function isValidSquareSignature(notificationUrl, rawBody, signatureHeader, signatureKey) {
  if (!signatureHeader) return false

  const expected = crypto.createHmac('sha256', signatureKey).update(notificationUrl + rawBody).digest('base64')

  const a = Buffer.from(signatureHeader)
  const b = Buffer.from(expected)
  if (a.length !== b.length) {
    // 長さが違うと timingSafeEqual が例外を投げるため、ダミー比較で時間差を減らしてから早期return。
    crypto.timingSafeEqual(b, b)
    return false
  }
  return crypto.timingSafeEqual(a, b)
}

// 既にentitlementがある場合はそれで成功扱い、無ければ新規付与する。
// naporise_app_entitlementsのuser_id+product_id一意制約により、
// 同時実行や再送があっても重複行は作られない(競合時はエラーコード23505で検知)。
async function ensureEntitlement(supabaseAdmin, purchase) {
  const { data: existing, error: existingError } = await supabaseAdmin
    .from('naporise_app_entitlements')
    .select('id, access_status')
    .eq('user_id', purchase.user_id)
    .eq('product_id', purchase.product_id)
    .maybeSingle()

  if (existingError) {
    logFailure('entitlement_existing_check', existingError.code)
    return false
  }
  if (existing) return true // 既存行がある場合、状態変更(再有効化等)は今回の対象外。

  const { error: insertError } = await supabaseAdmin.from('naporise_app_entitlements').insert({
    user_id: purchase.user_id,
    product_id: purchase.product_id,
    purchase_id: purchase.id,
    access_status: 'active',
    granted_at: new Date().toISOString(),
  })

  if (insertError && insertError.code !== '23505') {
    logFailure('entitlement_insert', insertError.code)
    return false
  }
  return true
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const squareAccessToken = process.env.SQUARE_ACCESS_TOKEN
  const squareEnvironment = process.env.SQUARE_ENVIRONMENT
  const webhookSignatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY
  const webhookUrl = process.env.SQUARE_WEBHOOK_URL

  if (
    !supabaseUrl ||
    !supabaseServiceRoleKey ||
    !squareAccessToken ||
    !squareEnvironment ||
    !webhookSignatureKey ||
    !webhookUrl
  ) {
    return respond(500, { ok: false })
  }

  // 本番Square決済への誤接続を防ぐ安全策。sandbox以外は一律拒否する。
  if (squareEnvironment !== 'sandbox') {
    return respond(500, { ok: false })
  }

  const supabaseAdmin = createSupabaseServerClient()
  if (!supabaseAdmin) {
    return respond(500, { ok: false })
  }

  // --- 署名検証(JSON parseより前に、rawなbodyで行う) --------------------------
  const rawBody = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString('utf8') : event.body || ''
  const signatureHeader = event.headers?.[SIGNATURE_HEADER] || event.headers?.['X-Square-Hmacsha256-Signature']

  if (!isValidSquareSignature(webhookUrl, rawBody, signatureHeader, webhookSignatureKey)) {
    return respond(403, { ok: false })
  }

  let payload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return respond(400, { ok: false })
  }

  // --- イベント種別の確認 ---------------------------------------------------
  if (payload?.type !== 'payment.updated') {
    // 対象外イベントはSquareに再送させないよう200で安全に無視する。
    return respond(200, { ok: true, ignored: true })
  }

  const payment = payload?.data?.object?.payment
  if (!payment?.id || !payment?.order_id) {
    return respond(200, { ok: true, ignored: true })
  }

  if (payment.status !== 'COMPLETED') {
    // まだ完了していない状態変化。続報のpayment.updatedを待つ。
    return respond(200, { ok: true, ignored: true })
  }

  try {
    // --- purchase特定 -------------------------------------------------
    const { data: purchase, error: purchaseError } = await supabaseAdmin
      .from('naporise_app_purchases')
      .select('id, user_id, product_id, amount, currency, payment_status, provider_order_id')
      .eq('provider_order_id', payment.order_id)
      .eq('payment_provider', 'square')
      .maybeSingle()

    if (purchaseError) {
      logFailure('purchase_lookup', purchaseError.code)
      return respond(502, { ok: false })
    }

    if (!purchase) {
      // 対応するpurchaseが無い注文。他ユーザー・他商品への誤付与を避けるため、
      // 新規purchaseは作らず安全に無視する(監査目的でステージ名だけ記録)。
      console.log('[app-shop-square-webhook] stage=purchase_lookup result=not_found order_id=' + payment.order_id)
      return respond(200, { ok: true, ignored: true })
    }

    if (purchase.payment_status === 'paid') {
      // Webhookは重複配信される前提。既にpaid済みなら、entitlementの
      // 存在だけ再確認(無ければ補完)して冪等に終える。
      const ok = await ensureEntitlement(supabaseAdmin, purchase)
      return ok ? respond(200, { ok: true }) : respond(502, { ok: false })
    }

    if (purchase.payment_status !== 'pending') {
      // cancelled/failed等、pending以外からの遷移は今回対象外。誤って
      // paid化しないよう安全に無視する。
      console.log('[app-shop-square-webhook] stage=purchase_status_check status=' + purchase.payment_status)
      return respond(200, { ok: true, ignored: true })
    }

    // --- Square Payments APIでの再確認(Webhook payloadだけを信用しない) -------
    let paymentRes
    try {
      paymentRes = await fetch(`${SQUARE_SANDBOX_BASE_URL}/v2/payments/${encodeURIComponent(payment.id)}`, {
        headers: {
          Authorization: `Bearer ${squareAccessToken}`,
          'Square-Version': SQUARE_API_VERSION,
        },
      })
    } catch {
      paymentRes = null
    }

    let paymentData = null
    if (paymentRes) {
      try {
        paymentData = await paymentRes.json()
      } catch {
        paymentData = null
      }
    }

    const verifiedPayment = paymentData?.payment
    if (!paymentRes || !paymentRes.ok || !verifiedPayment) {
      const reason = !paymentRes ? 'fetch_failed' : !paymentRes.ok ? `http_${paymentRes.status}` : 'invalid_response'
      logFailure('square_payment_verify', reason)
      return respond(502, { ok: false })
    }

    const amountMatches = verifiedPayment.amount_money?.amount === purchase.amount
    const currencyMatches = verifiedPayment.amount_money?.currency === purchase.currency
    const orderMatches = verifiedPayment.order_id === purchase.provider_order_id

    if (verifiedPayment.status !== 'COMPLETED' || !amountMatches || !currencyMatches || !orderMatches) {
      // Webhook payloadとPayment APIの実データが一致しない、あるいは
      // 未完了。再送されても結果は変わらないと考えられるため200で終える。
      console.log('[app-shop-square-webhook] stage=payment_verify result=mismatch payment_id=' + payment.id)
      return respond(200, { ok: true, ignored: true })
    }

    // --- purchaseをpaidへ更新(pendingの場合のみ。競合時は次回冪等分岐で吸収) -----
    const nowIso = new Date().toISOString()
    const { data: updatedPurchase, error: updateError } = await supabaseAdmin
      .from('naporise_app_purchases')
      .update({
        payment_status: 'paid',
        provider_payment_id: verifiedPayment.id,
        purchased_at: nowIso,
        updated_at: nowIso,
      })
      .eq('id', purchase.id)
      .eq('payment_status', 'pending')
      .select('id')
      .maybeSingle()

    if (updateError) {
      logFailure('purchase_update', updateError.code)
      return respond(502, { ok: false })
    }

    if (!updatedPurchase) {
      // 同時実行で既に別のWebhook配信がpaid化していた。entitlementだけ確認して終える。
      const ok = await ensureEntitlement(supabaseAdmin, purchase)
      return ok ? respond(200, { ok: true }) : respond(502, { ok: false })
    }

    // --- entitlement付与 ---------------------------------------------
    const granted = await ensureEntitlement(supabaseAdmin, purchase)
    if (!granted) {
      // purchaseはpaid済みだがentitlement付与に失敗。Squareの自動再送により、
      // 次回配信時は上の「既にpaid」分岐でentitlementの補完が再試行される。
      return respond(502, { ok: false })
    }

    return respond(200, { ok: true })
  } catch (err) {
    logFailure('unexpected_exception', err?.name)
    return respond(502, { ok: false })
  }
}
