import assert from 'node:assert/strict';
import test from 'node:test';

process.env.VITE_SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.RESEND_API_KEY = 're_test';
process.env.FROM_EMAIL = 'noreply@example.com';
process.env.PROPERTY_INQUIRY_EMAIL = 'geral.trata@gmail.com';

const { default: handler } = await import('../api/submit-inquiry.js');

test('stores a property inquiry and emails the configured agency address', async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];

  globalThis.fetch = async (url, options) => {
    calls.push({ url: String(url), options });

    if (String(url).includes('/rest/v1/inquiries')) {
      return new Response(null, { status: 201 });
    }

    if (String(url) === 'https://api.resend.com/emails') {
      return Response.json({ id: 'email-test-id' });
    }

    throw new Error(`Unexpected fetch: ${url}`);
  };

  try {
    const request = new Request('https://www.trataimobiliaria.pt/api/submit-inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Cliente Teste',
        email: 'cliente@example.com',
        phone: '+351 912 345 678',
        message: 'Gostaria de visitar este imóvel.',
        propertyId: '11111111-1111-1111-1111-111111111111',
        propertyTitle: 'Apartamento T2 em Braga',
        inquiryType: 'visit',
        preferredContact: 'email'
      })
    });

    const response = await handler(request);
    const result = await response.json();

    assert.equal(response.status, 200);
    assert.equal(result.success, true);
    assert.equal(calls.length, 2);

    const emailPayload = JSON.parse(calls[1].options.body);
    assert.deepEqual(emailPayload.to, ['geral.trata@gmail.com']);
    assert.equal(emailPayload.reply_to, 'cliente@example.com');
    assert.match(emailPayload.subject, /Apartamento T2 em Braga/);
    assert.match(emailPayload.html, /Gostaria de visitar este imóvel\./);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
