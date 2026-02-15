'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const baseStorage = {
  async get(key) {
    if (typeof window === 'undefined' || !window.storage?.get) {
      return null;
    }
    try {
      return await window.storage.get(key, { shared: false });
    } catch (error) {
      console.error('Storage read failed:', error);
      return null;
    }
  },
  async set(key, value) {
    if (typeof window === 'undefined' || !window.storage?.set) {
      return false;
    }
    try {
      await window.storage.set(key, value, { shared: false });
      return true;
    } catch (error) {
      console.error('Storage write failed:', error);
      return false;
    }
  },
};

export default function TradingCopilotApp() {
  const [messages, setMessages] = useState([]);
  const [trades, setTrades] = useState([]);
  const [patterns, setPatterns] = useState({});
  const [watchlist, setWatchlist] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchingWeb, setSearchingWeb] = useState(false);
  const [error, setError] = useState('');

  const messageEndRef = useRef(null);

  const persistCollection = useCallback(async (prefix, items) => {
    const indexKey = `${prefix}:index`;
    const ids = items.map((x) => x.id);
    await baseStorage.set(indexKey, JSON.stringify(ids));
    await Promise.all(items.map((item) => baseStorage.set(`${prefix}:${item.id}`, JSON.stringify(item))));
  }, []);

  const loadCollection = useCallback(async (prefix) => {
    const rawIndex = await baseStorage.get(`${prefix}:index`);
    if (!rawIndex) return [];
    try {
      const ids = JSON.parse(rawIndex);
      const records = await Promise.all(ids.map((id) => baseStorage.get(`${prefix}:${id}`)));
      return records.filter(Boolean).map((raw) => JSON.parse(raw));
    } catch (e) {
      console.error(`Failed to parse ${prefix}:`, e);
      setError('Some saved records could not be loaded.');
      return [];
    }
  }, []);

  const persistPatterns = useCallback(async (nextPatterns) => {
    const types = Object.keys(nextPatterns);
    await baseStorage.set('patterns:index', JSON.stringify(types));
    await Promise.all(types.map((type) => baseStorage.set(`patterns:${type}`, JSON.stringify(nextPatterns[type]))));
  }, []);

  const loadPatterns = useCallback(async () => {
    const raw = await baseStorage.get('patterns:index');
    if (!raw) return {};
    try {
      const types = JSON.parse(raw);
      const entries = await Promise.all(
        types.map(async (type) => {
          const value = await baseStorage.get(`patterns:${type}`);
          return [type, value ? JSON.parse(value) : null];
        }),
      );
      return Object.fromEntries(entries.filter(([, value]) => value));
    } catch (e) {
      console.error('Failed to load patterns:', e);
      return {};
    }
  }, []);

  useEffect(() => {
    (async () => {
      const [savedMessages, savedTrades, savedPatterns] = await Promise.all([
        loadCollection('messages'),
        loadCollection('trades'),
        loadPatterns(),
      ]);
      setMessages(savedMessages.sort((a, b) => a.timestamp - b.timestamp));
      setTrades(savedTrades.sort((a, b) => b.entryDate.localeCompare(a.entryDate)));
      setPatterns(savedPatterns);
      const interest = savedPatterns.watchlist || [];
      setWatchlist(Array.isArray(interest) ? interest : []);
    })();
  }, [loadCollection, loadPatterns]);

  useEffect(() => {
    persistCollection('messages', messages);
  }, [messages, persistCollection]);

  useEffect(() => {
    persistCollection('trades', trades);
  }, [trades, persistCollection]);

  useEffect(() => {
    persistPatterns(patterns);
  }, [patterns, persistPatterns]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const computePatterns = useCallback(
    (nextTrades) => {
      if (!nextTrades.length) return;
      const closed = nextTrades.filter((t) => t.exitDate && Number.isFinite(t.profitLossPercent));
      if (!closed.length) return;
      const wins = closed.filter((t) => (t.profitLossPercent ?? 0) > 0).length;
      const avgReturn = closed.reduce((acc, t) => acc + (t.profitLossPercent ?? 0), 0) / closed.length;
      setPatterns({
        performance: {
          winRate: Number(((wins / closed.length) * 100).toFixed(1)),
          avgReturn: Number(avgReturn.toFixed(2)),
        },
        watchlist,
      });
    },
    [watchlist],
  );

  const maybeAutoLogTrade = useCallback(
    (messageText, messageId) => {
      const buyMatch = messageText.match(/(?:entering|bought|long)\s+([A-Za-z]{1,5}).*?\$?(\d+(?:\.\d+)?)/i);
      if (buyMatch) {
        const ticker = buyMatch[1].toUpperCase();
        const entryPrice = Number(buyMatch[2]);
        const trade = {
          id: Date.now(),
          ticker,
          entryPrice,
          exitPrice: null,
          entryDate: new Date().toISOString(),
          exitDate: null,
          positionSize: 100,
          strategyType: 'other',
          conversationIds: [messageId],
          profitLoss: null,
          profitLossPercent: null,
        };
        setTrades((prev) => [trade, ...prev]);
        if (!watchlist.includes(ticker)) {
          const nextWatchlist = [...watchlist, ticker];
          setWatchlist(nextWatchlist);
          setPatterns((prev) => ({ ...prev, watchlist: nextWatchlist }));
        }
      }

      const sellMatch = messageText.match(/(?:sold|exit|closed)\s+([A-Za-z]{1,5}).*?\$?(\d+(?:\.\d+)?)/i);
      if (sellMatch) {
        const ticker = sellMatch[1].toUpperCase();
        const exitPrice = Number(sellMatch[2]);
        setTrades((prev) => {
          const openTrade = prev.find((trade) => trade.ticker === ticker && !trade.exitDate);
          if (!openTrade) return prev;
          const shares = Number(openTrade.positionSize) || 0;
          const profitLoss = (exitPrice - openTrade.entryPrice) * shares;
          const profitLossPercent = ((exitPrice - openTrade.entryPrice) / openTrade.entryPrice) * 100;
          const next = prev.map((trade) =>
            trade.id === openTrade.id
              ? { ...trade, exitPrice, exitDate: new Date().toISOString(), profitLoss, profitLossPercent }
              : trade,
          );
          computePatterns(next);
          return next;
        });
      }
    },
    [computePatterns, watchlist],
  );

  const callCopilot = useCallback(async (userText, allMessages) => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userText,
        messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!response.ok) {
      throw new Error(`AI request failed with status ${response.status}`);
    }

    const data = await response.json();
    setSearchingWeb(false);
    return data.text;
  }, []);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setError('');

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
      metadata: {},
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    maybeAutoLogTrade(trimmed, userMessage.id);

    setLoading(true);
    try {
      const nextMessages = [...messages, userMessage];
      const aiText = await callCopilot(trimmed, nextMessages);
      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: aiText || 'No analysis returned. Try asking with more context.',
        timestamp: Date.now(),
        metadata: { searchingWeb },
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (e) {
      console.error(e);
      setError('Could not reach the AI service right now. Please retry.');
      const fallback = {
        id: Date.now() + 2,
        role: 'assistant',
        content: 'Network or API issue detected. I can still help you think through your next trade and journal it once reconnected.',
        timestamp: Date.now(),
        metadata: { error: true },
      };
      setMessages((prev) => [...prev, fallback]);
    } finally {
      setLoading(false);
      setSearchingWeb(false);
    }
  }, [callCopilot, input, loading, maybeAutoLogTrade, messages, searchingWeb]);

  const stats = useMemo(() => {
    const openPositions = trades.filter((trade) => !trade.exitDate).length;
    return {
      messageCount: messages.length,
      openPositions,
      watchlistSize: watchlist.length,
    };
  }, [messages.length, trades, watchlist.length]);

  return (
    <div className="min-h-screen bg-trade-bg px-3 py-4 text-trade-text sm:px-4">
      <div className="mx-auto flex h-[calc(100vh-2rem)] w-full max-w-3xl flex-col rounded-2xl border border-trade-border bg-trade-surface/95 shadow-2xl">
        <header className="border-b border-trade-border px-4 py-4 sm:px-6">
          <h1 className="text-lg font-semibold tracking-tight">Trading Copilot</h1>
          <p className="mt-1 text-sm text-trade-muted">A single conversation that remembers your trades, ideas, and decision patterns.</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-trade-muted">
            <span className="rounded-full border border-trade-border px-2.5 py-1">{stats.messageCount} messages</span>
            <span className="rounded-full border border-trade-border px-2.5 py-1">{stats.openPositions} open positions</span>
            <span className="rounded-full border border-trade-border px-2.5 py-1">{stats.watchlistSize} watchlist symbols</span>
          </div>
        </header>

        {error ? (
          <div className="mx-4 mt-4 rounded-lg border border-trade-danger/40 bg-trade-danger/10 px-3 py-2 text-sm text-trade-danger sm:mx-6">
            {error}
          </div>
        ) : null}

        <section className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-4 sm:px-6">
          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {messages.length === 0 && !loading ? (
              <div className="rounded-xl border border-trade-border bg-black/10 p-4 sm:p-5">
                <h2 className="text-base font-medium">Start your reflection</h2>
                <p className="mt-2 text-sm leading-6 text-trade-muted">
                  Describe your current position, reasoning, risk tolerance, or what happened in today&apos;s session. I will keep context over time and help with structure, discipline, and review.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    'Review my last two losing trades',
                    'I went long TSLA at 250 because momentum looked strong',
                    'Help me define a better exit plan',
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => setInput(prompt)}
                      className="rounded-full border border-trade-border px-3 py-1.5 text-xs text-trade-muted transition hover:border-trade-accent hover:text-trade-text"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {messages.map((message) => (
              <article
                key={message.id}
                className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 sm:max-w-[82%] ${
                  message.role === 'user'
                    ? 'ml-auto border border-trade-accent/40 bg-trade-accent/10'
                    : 'border border-trade-border bg-black/20'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </article>
            ))}

            {loading ? (
              <div className="inline-flex rounded-2xl border border-trade-border bg-black/20 px-3.5 py-2.5 text-sm text-trade-muted">
                Thinking...
              </div>
            ) : null}
            <div ref={messageEndRef} />
          </div>

          <form
            className="mt-4 flex items-end gap-2 border-t border-trade-border pt-3"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              rows={1}
              placeholder="Describe a trade, decision, concern, or plan..."
              className="max-h-28 min-h-[44px] flex-1 resize-y rounded-xl border border-trade-border bg-black/20 px-3 py-2 text-sm text-trade-text outline-none transition focus:border-trade-accent"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-11 rounded-xl bg-trade-accent px-4 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Send
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
