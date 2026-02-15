import { afterEach, describe, expect, it, vi } from 'vitest';

import { POST } from './route';

describe('POST /api/chat', () => {
  const originalApiKey = process.env.COHERE_API_KEY;

  afterEach(() => {
    process.env.COHERE_API_KEY = originalApiKey;
    vi.restoreAllMocks();
  });

  it('returns 400 when message is missing', async () => {
    process.env.COHERE_API_KEY = 'test-key';
    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [] }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Message is required.');
  });

  it('returns model text from Cohere response', async () => {
    process.env.COHERE_API_KEY = 'test-key';
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        message: {
          content: [{ text: 'Trading plan response' }],
        },
      }),
    });

    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'How should I size this trade?',
        messages: [],
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.text).toBe('Trading plan response');
    expect(fetch).toHaveBeenCalledTimes(1);
    const [, options] = fetch.mock.calls[0];
    const payload = JSON.parse(options.body);
    expect(payload.messages.at(-1)).toMatchObject({
      role: 'user',
      content: 'How should I size this trade?',
    });
  });
});
