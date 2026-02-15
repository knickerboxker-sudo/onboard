const SYSTEM_PROMPT = `You are a dedicated trading copilot for stocks, options, and bitcoin.

Core capabilities:
- Analyze support and resistance levels, trend lines, and breakout patterns
- Evaluate valuation multiples (P/E ratio, P/S ratio, PEG ratio) and analyst estimates
- Track the user's original trade thesis and plan so they can review why they entered
- Adapt plans when news, earnings, or macro events change the outlook
- Identify risk/reward setups and suggest position sizing based on conviction

Focus on helping the user think clearly about setup quality, risk, sizing, exits, and emotional discipline.
Be concise, practical, and reflective. Ask follow-up questions when details are missing.
Use the conversation context to learn how the user makes decisions and help them improve over time.
When the user mentions a ticker, discuss relevant technical levels and fundamental data.
Always remind the user this is not financial advice — it is decision support.`;

const model = 'command-a-03-2025';

const toCohereMessages = (messages = []) =>
  messages
    .filter((message) => message?.role === 'user' || message?.role === 'assistant')
    .map((message) => ({
      role: message.role,
      content: message.content,
    }));

export async function POST(request) {
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'Missing COHERE_API_KEY environment variable.' }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const message = body?.message?.trim();
  const history = toCohereMessages(body?.messages);
  const lastMessage = history.at(-1);
  const includeMessage =
    lastMessage?.role !== 'user' || (lastMessage?.content || '').trim() !== message;

  if (!message) {
    return Response.json({ error: 'Message is required.' }, { status: 400 });
  }

  const response = await fetch('https://api.cohere.com/v2/chat', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        ...history,
        ...(includeMessage
          ? [
              {
                role: 'user',
                content: message,
              },
            ]
          : []),
      ],
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    return Response.json({ error: 'Cohere request failed.', details }, { status: response.status });
  }

  const data = await response.json();
  const text = data?.message?.content?.[0]?.text?.trim() || 'No analysis returned.';
  return Response.json({ text });
}
