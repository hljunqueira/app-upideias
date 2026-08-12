import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Validates HMAC SHA-256 signature from Phyllo-Signatures header against RAW body.
 * Supports comma-separated multiple signatures in header (e.g. durante rotação de chaves).
 */
export function verifyPhylloSignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader || !secret || secret.trim() === '') {
    return false;
  }

  try {
    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody, 'utf8')
      .digest('hex');

    const expectedBuffer = Buffer.from(computedSignature, 'utf8');

    // Split comma-separated multiple signatures in header
    const candidateSignatures = signatureHeader.split(',').map((s) => s.trim());

    for (const rawCandidate of candidateSignatures) {
      // Remove optional prefixes if present (e.g. v1= or sha256=)
      const cleanCandidate = rawCandidate.replace(/^(v\d+=|sha256=)/i, '').trim();
      const headerBuffer = Buffer.from(cleanCandidate, 'utf8');

      if (expectedBuffer.length === headerBuffer.length) {
        if (crypto.timingSafeEqual(expectedBuffer, headerBuffer)) {
          return true;
        }
      }
    }

    return false;
  } catch (err) {
    console.error('[PhylloWebhook] Error computing signature verification:', err);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. FAIL CLOSED: Validate PHYLLO_WEBHOOK_SECRET server configuration
    const webhookSecret = process.env.PHYLLO_WEBHOOK_SECRET;

    if (!webhookSecret || webhookSecret.trim() === '') {
      console.error('[PhylloWebhook] Fail Closed: PHYLLO_WEBHOOK_SECRET não está configurado no servidor.');
      return NextResponse.json(
        { error: 'Erro de configuração no servidor para recepção de webhook.' },
        { status: 500 }
      );
    }

    // 2. Get RAW Request Body for HMAC signature validation
    const rawBody = await request.text();

    const signatureHeader =
      request.headers.get('Phyllo-Signatures') ||
      request.headers.get('phyllo-signatures') ||
      request.headers.get('x-phyllo-signature');

    if (!signatureHeader || signatureHeader.trim() === '') {
      console.warn('[PhylloWebhook] Fail Closed: Cabeçalho de assinatura ausente.');
      return NextResponse.json(
        { error: 'Cabeçalho de assinatura de webhook ausente.' },
        { status: 401 }
      );
    }

    // 3. Validate Signature (HMAC SHA-256 on RAW Body)
    const isValid = verifyPhylloSignature(rawBody, signatureHeader, webhookSecret);
    if (!isValid) {
      console.warn('[PhylloWebhook] Fail Closed: Assinatura de webhook inválida.');
      return NextResponse.json(
        { error: 'Assinatura de webhook inválida.' },
        { status: 401 }
      );
    }

    // 4. Parse JSON Body securely after signature is verified
    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: 'Body da requisição não é um JSON válido.' },
        { status: 400 }
      );
    }

    const eventId = body.event_id || body.id;
    if (!eventId) {
      console.warn('[PhylloWebhook] Payload sem identificador de evento válido (event_id/id).');
      return NextResponse.json(
        { error: 'Identificador de evento (event_id) ausente no payload.' },
        { status: 400 }
      );
    }

    const eventType = (body.event || 'UNKNOWN').toUpperCase();
    const adminClient = createAdminClient();

    // 5. Sequential Idempotency Check: check if eventId already processed
    const { data: existingLog } = await adminClient
      .from('webhook_event_logs')
      .select('id')
      .eq('provider', 'phyllo')
      .eq('provider_event_id', eventId)
      .maybeSingle();

    if (existingLog) {
      console.log(`[PhylloWebhook] Event ${eventId} (${eventType}) já foi processado anteriormente.`);
      return NextResponse.json({ status: 'ok', duplicate: true }, { status: 200 });
    }

    // 6. Record event in audit log (Catch Postgres 23505 unique constraint in concurrent requests)
    try {
      const { error: insertError } = await adminClient.from('webhook_event_logs').insert({
        provider: 'phyllo',
        provider_event_id: eventId,
        event_type: eventType,
        payload: body,
        processed_at: new Date().toISOString(),
      });

      if (insertError) {
        // Code 23505 = unique_violation in PostgreSQL
        if (insertError.code === '23505' || insertError.message?.includes('duplicate key')) {
          console.log(`[PhylloWebhook] Event ${eventId} inserido concorrentemente. Tratado como duplicata.`);
          return NextResponse.json({ status: 'ok', duplicate: true }, { status: 200 });
        }
        throw insertError;
      }
    } catch (insertErr: any) {
      if (insertErr?.code === '23505' || insertErr?.message?.includes('duplicate key')) {
        return NextResponse.json({ status: 'ok', duplicate: true }, { status: 200 });
      }
      throw insertErr;
    }

    // 7. Minimal Fast Account Update
    const phylloUserId = body.user_id || body.data?.user_id;
    const phylloAccountId = body.account_id || body.data?.account_id;

    if (phylloUserId) {
      const { data: providerMapping } = await adminClient
        .from('user_social_providers')
        .select('user_id')
        .eq('phyllo_user_id', phylloUserId)
        .eq('provider', 'phyllo')
        .maybeSingle();

      const supabaseUserId = providerMapping?.user_id;

      if (supabaseUserId && phylloAccountId) {
        if (
          eventType === 'ACCOUNTS.CONNECTED' ||
          eventType === 'ACCOUNTS.STATUS_UPDATED' ||
          eventType === 'PROFILES.ADDED' ||
          eventType === 'PROFILES.UPDATED'
        ) {
          const workPlatformName = (body.work_platform_name || body.work_platform_id || 'instagram').toLowerCase();
          const platform = ['tiktok', 'youtube', 'linkedin', 'x', 'twitter'].includes(workPlatformName)
            ? (workPlatformName === 'twitter' ? 'x' : workPlatformName)
            : 'instagram';

          await adminClient.from('social_accounts').upsert(
            {
              user_id: supabaseUserId,
              platform,
              external_account_id: phylloAccountId,
              status: 'connected',
              connected_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'platform,external_account_id' }
          );
          console.log(`[PhylloWebhook] Account ${phylloAccountId} linked to Supabase user ${supabaseUserId}`);
        } else if (eventType === 'ACCOUNTS.DISCONNECTED') {
          await adminClient
            .from('social_accounts')
            .update({ status: 'disconnected', disconnected_at: new Date().toISOString(), updated_at: new Date().toISOString() })
            .eq('external_account_id', phylloAccountId);
          console.log(`[PhylloWebhook] Account ${phylloAccountId} set to disconnected`);
        }
      }
    }

    // 8. Return fast 200 OK
    return NextResponse.json({ status: 'ok', eventId, eventType }, { status: 200 });
  } catch (err: any) {
    console.error('[PhylloWebhook] Error processing webhook event:', err?.message || err);
    return NextResponse.json({ error: 'Erro interno ao processar webhook' }, { status: 500 });
  }
}
