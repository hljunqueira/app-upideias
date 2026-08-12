import assert from 'assert';
import crypto from 'crypto';
import { PhylloClient, verifyPhylloSignature } from '../client';
import { PhylloSocialProvider } from '../../providers/PhylloSocialProvider';
import { PhylloAccountData, PhylloProfileData } from '../types';

export async function runPhylloTests() {
  console.log('[Tests] Iniciando suíte de testes de Hardening da Integração Phyllo...');

  // Test 1: Header Basic Authorization
  {
    const client = new PhylloClient({
      baseUrl: 'https://api.staging.getphyllo.com',
      clientId: 'test_client_id',
      clientSecret: 'test_client_secret',
    });

    const expectedAuth = 'Basic ' + Buffer.from('test_client_id:test_client_secret').toString('base64');
    assert.strictEqual((client as any).getAuthHeader(), expectedAuth, 'Header Basic Auth incorreto');
    console.log('✓ Test 1: Header Basic Auth verificado');
  }

  // Test 2: Idempotência na Busca/Reutilização do Usuário Phyllo
  {
    const originalFetch = global.fetch;
    const client = new PhylloClient({
      baseUrl: 'https://api.staging.getphyllo.com',
      clientId: 'test_client_id',
      clientSecret: 'test_client_secret',
    });

    global.fetch = (async (url: string) => {
      if (url.includes('/v1/users?external_id=')) {
        return {
          ok: true,
          status: 200,
          headers: new Headers(),
          json: async () => ({
            data: [
              {
                id: 'usr_existing_123',
                name: 'Test User',
                external_id: 'upideias:user_supabase_abc',
              },
            ],
          }),
        } as Response;
      }
      throw new Error(`URL inesperada: ${url}`);
    }) as typeof fetch;

    try {
      const phylloUserId = await client.getOrCreateUser('user_supabase_abc', 'Test User');
      assert.strictEqual(phylloUserId, 'usr_existing_123', 'Deveria reutilizar usuário existente na Phyllo');
      console.log('✓ Test 2: Idempotência de busca por external_id verificada');
    } finally {
      global.fetch = originalFetch;
    }
  }

  // Test 3: Criação de Usuário se Não Existir
  {
    const originalFetch = global.fetch;
    const client = new PhylloClient({
      baseUrl: 'https://api.staging.getphyllo.com',
      clientId: 'test_client_id',
      clientSecret: 'test_client_secret',
    });

    let callCount = 0;
    global.fetch = (async (url: string, options?: RequestInit) => {
      callCount++;
      if (options?.method === 'GET' && url.includes('/v1/users?external_id=')) {
        return {
          ok: true,
          status: 200,
          headers: new Headers(),
          json: async () => ({ data: [] }),
        } as Response;
      }
      if (options?.method === 'POST' && url.endsWith('/v1/users')) {
        return {
          ok: true,
          status: 201,
          headers: new Headers(),
          json: async () => ({
            id: 'usr_new_999',
            name: 'New User',
            external_id: 'upideias:user_supabase_xyz',
          }),
        } as Response;
      }
      throw new Error(`URL ou Método Inesperado: ${options?.method} ${url}`);
    }) as typeof fetch;

    try {
      const phylloUserId = await client.getOrCreateUser('user_supabase_xyz', 'New User');
      assert.strictEqual(phylloUserId, 'usr_new_999', 'Deveria retornar o ID do novo usuário Phyllo criado');
      assert.strictEqual(callCount, 2, 'Deveria executar GET search depois POST create');
      console.log('✓ Test 3: Criação de usuário novo verificada');
    } finally {
      global.fetch = originalFetch;
    }
  }

  // Test 4: Mapper DTO Phyllo (snake_case) -> Domínio UP Analytics (camelCase)
  {
    const provider = new PhylloSocialProvider();

    const rawAccount: PhylloAccountData = {
      id: 'acc_123',
      user_id: 'usr_456',
      work_platform_id: 'instagram',
      work_platform_name: 'Instagram',
      platform_username: 'creator_up',
      status: 'CONNECTED',
      created_at: '2026-08-12T00:00:00.000Z',
      updated_at: '2026-08-12T00:00:00.000Z',
    };

    const rawProfile: PhylloProfileData = {
      id: 'prf_123',
      account_id: 'acc_123',
      user_id: 'usr_456',
      work_platform_id: 'instagram',
      username: 'creator_up',
      full_name: 'Creator UP Ideias',
      profile_picture_url: 'https://cdn.example.com/avatar.jpg',
      reputation: {
        follower_count: 15400,
        following_count: 350,
      },
    };

    const domainAccount = provider.mapAccountToDomain(rawAccount, rawProfile, 'user_supabase_id');

    assert.strictEqual(domainAccount.id, 'acc_123');
    assert.strictEqual(domainAccount.user_id, 'user_supabase_id');
    assert.strictEqual(domainAccount.platform, 'instagram');
    assert.strictEqual(domainAccount.externalAccountId, 'acc_123');
    assert.strictEqual(domainAccount.username, 'creator_up');
    assert.strictEqual(domainAccount.name, 'Creator UP Ideias');
    assert.strictEqual(domainAccount.followers_count, 15400);
    assert.strictEqual(domainAccount.status, 'connected');
    console.log('✓ Test 4: Mapper DTO snake_case -> camelCase verificado');
  }

  // Test 5: Validação de Assinatura HMAC SHA-256 do Webhook (RAW Body + timingSafeEqual)
  {
    const secret = 'webhook_secret_test_123';
    const payload = JSON.stringify({ event: 'ACCOUNTS.CONNECTED', event_id: 'evt_100', user_id: 'usr_1' });

    const validSignature = crypto.createHmac('sha256', secret).update(payload, 'utf8').digest('hex');

    // Validação de assinatura válida
    assert.strictEqual(verifyPhylloSignature(payload, validSignature, secret), true, 'Assinatura válida deveria ser aceita');

    // Validação com payload alterado
    const alteredPayload = payload + ' ';
    assert.strictEqual(verifyPhylloSignature(alteredPayload, validSignature, secret), false, 'Payload alterado deveria invalidar assinatura');

    // Validação com secret ausente ou inválido
    assert.strictEqual(verifyPhylloSignature(payload, validSignature, ''), false, 'Secret vazio deveria rejeitar requisição');
    assert.strictEqual(verifyPhylloSignature(payload, null, secret), false, 'Header ausente deveria rejeitar requisição');

    console.log('✓ Test 5: Validação HMAC SHA-256 no RAW Body verificada');
  }

  // Test 6: Múltiplas Assinaturas no Cabeçalho Phyllo-Signatures
  {
    const secret = 'webhook_secret_multi_test';
    const payload = JSON.stringify({ event: 'PROFILES.UPDATED', event_id: 'evt_200' });
    const validSignature = crypto.createHmac('sha256', secret).update(payload, 'utf8').digest('hex');

    // Múltiplas assinaturas com vírgula (ex: rotação de chaves)
    const multiHeader1 = `invalid_sig_abc123, ${validSignature}`;
    assert.strictEqual(verifyPhylloSignature(payload, multiHeader1, secret), true, 'Deveria aceitar se pelo menos uma assinatura na lista for válida');

    const multiHeader2 = `v1=${validSignature}, sha256=invalid_hash_xyz`;
    assert.strictEqual(verifyPhylloSignature(payload, multiHeader2, secret), true, 'Deveria aceitar assinaturas com prefixo v1= ou sha256=');

    const allInvalidHeader = 'invalid_hash_1, invalid_hash_2';
    assert.strictEqual(verifyPhylloSignature(payload, allInvalidHeader, secret), false, 'Deveria rejeitar se nenhuma assinatura for válida');

    console.log('✓ Test 6: Suporte a múltiplas assinaturas no Phyllo-Signatures verificado');
  }

  // Test 7: Rate Limit 429 e Leitura do Header Retry-After
  {
    const originalFetch = global.fetch;
    const client = new PhylloClient({
      baseUrl: 'https://api.staging.getphyllo.com',
      clientId: 'test_client_id',
      clientSecret: 'test_client_secret',
    });

    global.fetch = (async () => {
      const headers = new Headers();
      headers.set('Retry-After', '10');
      return {
        ok: false,
        status: 429,
        headers,
        text: async () => 'Rate limit exceeded',
      } as Response;
    }) as typeof fetch;

    try {
      await assert.rejects(
        async () => {
          await client.getAccount('acc_rate_limit');
        },
        /Rate limit excedido na Phyllo API \(429\)\. Tente novamente em 10 segundos\./,
        'Deveria formatar erro de rate limit 429 com o tempo do Retry-After'
      );
      console.log('✓ Test 7: Tratamento de Rate Limit 429 e Retry-After verificado');
    } finally {
      global.fetch = originalFetch;
    }
  }

  console.log('🎉 Todos os testes de Hardening da integração Phyllo passaram com sucesso!');
}

// Executa testes se chamado diretamente via node/tsx
if (require.main === module) {
  runPhylloTests().catch((err) => {
    console.error('❌ Falha na execução dos testes:', err);
    process.exit(1);
  });
}
