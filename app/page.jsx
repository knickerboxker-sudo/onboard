'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const NAV_ITEMS = [{ id: 'chat', label: 'Chat' }];

const STRATEGY_TYPES = ['momentum', 'breakout', 'swing', 'scalp', 'options', 'other'];

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
  async remove(key) {
    if (typeof window === 'undefined' || !window.storage?.delete) {
      return false;
    }
    try {
      await window.storage.delete(key, { shared: false });
      return true;
    } catch (error) {
      console.error('Storage remove failed:', error);
      return false;
    }
  },
};

const toCurrency = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(
    Number.isFinite(n) ? n : 0,
  );

const toPercent = (n) => `${(Number.isFinite(n) ? n : 0).toFixed(2)}%`;

const dayDiff = (isoDate) => Math.max(1, Math.ceil((Date.now() - new Date(isoDate).getTime()) / 86400000));

export default function TradingCopilotApp() {
  const [messages, setMessages] = useState([]);
  const [trades, setTrades] = useState([]);
  const [patterns, setPatterns] = useState({});
  const [watchlist, setWatchlist] = useState([]);
  const [currentView, setCurrentView] = useState('chat');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchingWeb, setSearchingWeb] = useState(false);
  const [error, setError] = useState('');
  const [journalFilter, setJournalFilter] = useState({ ticker: '', strategy: 'all', outcome: 'all' });
  const [expandedTradeId, setExpandedTradeId] = useState(null);

  const messageEndRef = useRef(null);

  const activePositions = useMemo(
    () =>
      trades
        .filter((trade) => !trade.exitDate)
        .map((trade) => {
          const currentPrice = trade.currentPrice ?? trade.entryPrice;
          const shares = Number(trade.positionSize) || 0;
          const unrealizedPL = (currentPrice - trade.entryPrice) * shares;
          return { ...trade, currentPrice, unrealizedPL, daysHeld: dayDiff(trade.entryDate) };
        }),
    [trades],
  );

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
    Promise.all(
      trades
        .filter((trade) => !trade.exitDate)
        .map((trade) => baseStorage.set(`positions:${trade.ticker.toUpperCase()}`, JSON.stringify(trade))),
    );
  }, [trades, persistCollection]);

  useEffect(() => {
    persistPatterns(patterns);
  }, [patterns, persistPatterns]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const computePatterns = useCallback((nextTrades) => {
    if (!nextTrades.length) return;
    const closed = nextTrades.filter((t) => t.exitDate && Number.isFinite(t.profitLossPercent));
    if (!closed.length) return;
    const wins = closed.filter((t) => (t.profitLossPercent ?? 0) > 0).length;
    const avgHold = closed.reduce((acc, t) => acc + dayDiff(t.entryDate), 0) / closed.length;
    const avgReturn = closed.reduce((acc, t) => acc + (t.profitLossPercent ?? 0), 0) / closed.length;
    const next = {
      performance: {
        winRate: Number(((wins / closed.length) * 100).toFixed(1)),
        avgHoldDays: Number(avgHold.toFixed(1)),
        avgReturn: Number(avgReturn.toFixed(2)),
      },
      watchlist,
    };
    setPatterns(next);
  }, [watchlist]);

  const updateTrade = useCallback(
    (id, updates) => {
      setTrades((prev) => {
        const next = prev.map((trade) => (trade.id === id ? { ...trade, ...updates } : trade));
        computePatterns(next);
        return next;
      });
    },
    [computePatterns],
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
          thesis: 'Pending thesis details',
          conviction: 'medium',
          strategyType: 'other',
          stopLoss: 0,
          targets: [],
          conversationIds: [messageId],
          notes: '',
          profitLoss: null,
          profitLossPercent: null,
          currentPrice: entryPrice,
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

  const callCopilot = useCallback(
    async (userText, allMessages) => {
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
    },
    [],
  );

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
        content: aiText || 'No analysis returned. Try asking with a ticker and setup details.',
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
        content:
          'Network or API issue detected. I can still help you log the trade manually in Positions or Journal while we retry.',
        timestamp: Date.now(),
        metadata: { error: true },
      };
      setMessages((prev) => [...prev, fallback]);
    } finally {
      setLoading(false);
      setSearchingWeb(false);
    }
  }, [callCopilot, input, loading, maybeAutoLogTrade, messages, searchingWeb]);

  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      const tickerOk = !journalFilter.ticker || trade.ticker.toLowerCase().includes(journalFilter.ticker.toLowerCase());
      const strategyOk = journalFilter.strategy === 'all' || trade.strategyType === journalFilter.strategy;
      const outcomeOk =
        journalFilter.outcome === 'all' ||
        (journalFilter.outcome === 'win' && (trade.profitLoss ?? 0) > 0) ||
        (journalFilter.outcome === 'loss' && (trade.profitLoss ?? 0) <= 0);
      return tickerOk && strategyOk && outcomeOk;
    });
  }, [journalFilter, trades]);

  return (
    <div className="min-h-screen bg-trade-bg text-trade-text">
      <div className="mx-auto flex w-full max-w-4xl gap-6 px-4 py-6">
        <aside className="hidden h-screen w-60 shrink-0 rounded-lg border border-trade-border bg-trade-surface p-3">
          <h1 className="mb-4 text-lg font-semibold">Trading Copilot</h1>
          <nav className="space-y-1" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrentView(item.id)}
                className={`w-full rounded-md border-l-2 px-3 py-2 text-left text-sm transition ${
                  currentView === item.id
                    ? 'border-trade-accent bg-black/20 text-trade-text'
                    : 'border-transparent text-trade-muted hover:bg-black/20 hover:text-trade-text'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-6 space-y-2">
            <button
              type="button"
              onClick={() => {
                setCurrentView('chat');
                setInput('Log new trade: ');
              }}
              className="w-full rounded-md bg-trade-accent px-3 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Log new trade
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentView('chat');
                setInput('Update position: ');
              }}
              className="w-full rounded-md border border-trade-border px-3 py-2 text-sm hover:bg-black/20"
            >
              Update position
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentView('chat');
                setInput(`Check watchlist: ${watchlist.join(', ')}`);
              }}
              className="w-full rounded-md border border-trade-border px-3 py-2 text-sm hover:bg-black/20"
            >
              Check watchlist
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 rounded-lg border border-trade-border bg-trade-surface p-4">
          {error ? (
            <div className="mb-3 rounded-md border border-trade-danger/40 bg-trade-danger/10 px-3 py-2 text-sm text-trade-danger">
              {error}
            </div>
          ) : null}

          {currentView === 'chat' && (
            <section className="flex h-full flex-col">
              <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <article
                      className={`max-w-3xl rounded-lg border px-3 py-2 text-sm leading-6 ${
                        message.role === 'user'
                          ? 'border-trade-border bg-black/30 text-trade-text'
                          : 'border-trade-border bg-black/10 text-trade-text'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p className="mt-1 text-xs text-trade-muted">{new Date(message.timestamp).toLocaleString()}</p>
                    </article>
                  </div>
                ))}
                {loading ? (
                  <div className="rounded-md border border-trade-border bg-black/10 px-3 py-2 text-sm text-trade-muted">
                    Analyzing...
                  </div>
                ) : null}
                {searchingWeb ? (
                  <div className="text-xs text-trade-muted">Searching web and news sources for current market context.</div>
                ) : null}
                <div ref={messageEndRef} />
              </div>

              <div className="mt-3 flex items-center gap-2 border-t border-trade-border pt-3">
                <label htmlFor="message-input" className="sr-only">
                  Ask trading copilot
                </label>
                <input
                  id="message-input"
                  aria-label="Ask trading copilot"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  className="flex-1 rounded-md border border-trade-border bg-black/20 px-3 py-2 text-sm outline-none ring-trade-accent focus:ring-2"
                  placeholder="Ask about setups, updates, exits, or chart analysis..."
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  className="rounded-md bg-trade-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                >
                  Send
                </button>
              </div>
            </section>
          )}

          {currentView === 'positions' && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Active Positions</h2>
              <div className="overflow-hidden rounded-lg border border-trade-border">
                <table className="min-w-full text-sm">
                  <thead className="bg-black/20 text-left text-trade-muted">
                    <tr>
                      <th className="px-3 py-2">Ticker</th>
                      <th className="px-3 py-2">Entry</th>
                      <th className="px-3 py-2">Current</th>
                      <th className="px-3 py-2">Unrealized P/L</th>
                      <th className="px-3 py-2">Entry Date</th>
                      <th className="px-3 py-2">Conviction</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activePositions.map((position, idx) => (
                      <tr key={position.id} className={idx % 2 ? 'bg-black/10' : 'bg-transparent'}>
                        <td className="px-3 py-2 font-medium">{position.ticker}</td>
                        <td className="px-3 py-2">{toCurrency(position.entryPrice)}</td>
                        <td className="px-3 py-2">{toCurrency(position.currentPrice)}</td>
                        <td
                          className={`px-3 py-2 font-medium ${
                            position.unrealizedPL >= 0 ? 'text-trade-success' : 'text-trade-danger'
                          }`}
                        >
                          {toCurrency(position.unrealizedPL)}
                        </td>
                        <td className="px-3 py-2">{new Date(position.entryDate).toLocaleDateString()}</td>
                        <td className="px-3 py-2 uppercase">{position.conviction}</td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => updateTrade(position.id, { exitDate: new Date().toISOString(), exitPrice: position.currentPrice })}
                            className="rounded-md border border-trade-border px-2 py-1 text-xs hover:bg-black/20"
                          >
                            Mark closed
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!activePositions.length ? <p className="p-4 text-sm text-trade-muted">No open positions yet.</p> : null}
              </div>
            </section>
          )}

          {currentView === 'journal' && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Trade Journal</h2>
              <div className="mb-3 grid gap-2 md:grid-cols-3">
                <input
                  value={journalFilter.ticker}
                  onChange={(e) => setJournalFilter((prev) => ({ ...prev, ticker: e.target.value }))}
                  placeholder="Filter by ticker"
                  className="rounded-md border border-trade-border bg-black/20 px-3 py-2 text-sm"
                />
                <select
                  value={journalFilter.strategy}
                  onChange={(e) => setJournalFilter((prev) => ({ ...prev, strategy: e.target.value }))}
                  className="rounded-md border border-trade-border bg-black/20 px-3 py-2 text-sm"
                >
                  <option value="all">All strategies</option>
                  {STRATEGY_TYPES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <select
                  value={journalFilter.outcome}
                  onChange={(e) => setJournalFilter((prev) => ({ ...prev, outcome: e.target.value }))}
                  className="rounded-md border border-trade-border bg-black/20 px-3 py-2 text-sm"
                >
                  <option value="all">All outcomes</option>
                  <option value="win">Wins</option>
                  <option value="loss">Losses</option>
                </select>
              </div>

              <div className="space-y-2">
                {filteredTrades.map((trade) => (
                  <article key={trade.id} className="rounded-lg border border-trade-border bg-black/10 p-3">
                    <button
                      type="button"
                      onClick={() => setExpandedTradeId((prev) => (prev === trade.id ? null : trade.id))}
                      className="flex w-full items-center justify-between text-left"
                    >
                      <div>
                        <p className="font-medium">{trade.ticker}</p>
                        <p className="text-xs text-trade-muted">
                          {new Date(trade.entryDate).toLocaleString()} • {trade.strategyType}
                        </p>
                      </div>
                      <p className={`text-sm font-medium ${(trade.profitLoss ?? 0) >= 0 ? 'text-trade-success' : 'text-trade-danger'}`}>
                        {trade.exitDate ? toPercent(trade.profitLossPercent ?? 0) : 'Open'}
                      </p>
                    </button>

                    {expandedTradeId === trade.id ? (
                      <div className="mt-3 space-y-2 border-t border-trade-border pt-3 text-sm">
                        <p>Thesis: {trade.thesis || 'No thesis captured yet.'}</p>
                        <p>
                          Entry/Exit: {toCurrency(trade.entryPrice)} /{' '}
                          {trade.exitDate ? toCurrency(trade.exitPrice ?? 0) : 'Open'}
                        </p>
                        <textarea
                          aria-label={`Notes for ${trade.ticker}`}
                          value={trade.notes || ''}
                          onChange={(e) => updateTrade(trade.id, { notes: e.target.value })}
                          className="w-full rounded-md border border-trade-border bg-black/20 px-3 py-2 text-sm"
                          placeholder="Lessons learned, execution notes, emotional context..."
                        />
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          )}

          {currentView === 'patterns' && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Learning and Patterns</h2>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-lg border border-trade-border bg-black/10 p-3">
                  <p className="text-xs text-trade-muted">Win rate</p>
                  <p className="text-xl font-semibold">{patterns.performance?.winRate ?? 0}%</p>
                </div>
                <div className="rounded-lg border border-trade-border bg-black/10 p-3">
                  <p className="text-xs text-trade-muted">Average hold time</p>
                  <p className="text-xl font-semibold">{patterns.performance?.avgHoldDays ?? 0} days</p>
                </div>
                <div className="rounded-lg border border-trade-border bg-black/10 p-3">
                  <p className="text-xs text-trade-muted">Average return</p>
                  <p className="text-xl font-semibold">{patterns.performance?.avgReturn ?? 0}%</p>
                </div>
              </div>

              <div className="rounded-lg border border-trade-border bg-black/10 p-3 text-sm">
                <p className="font-medium">Behavioral insights</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-trade-muted">
                  <li>
                    {patterns.performance?.avgReturn < 0
                      ? 'Recent average return is negative. Tighten entry criteria and pre-define invalidation levels.'
                      : 'Positive expectancy detected. Continue documenting what confirms your entries.'}
                  </li>
                  <li>
                    {patterns.performance?.avgHoldDays < 2
                      ? 'You often exit quickly. Validate if momentum exits are process-driven or emotion-driven.'
                      : 'Hold time is consistent with swing-style management.'}
                  </li>
                </ul>
              </div>
            </section>
          )}
        </main>

        <aside className="hidden w-80 shrink-0 rounded-lg border border-trade-border bg-trade-surface p-4">
          <h2 className="mb-3 text-sm font-semibold text-trade-muted">Session context</h2>
          <div className="space-y-2 text-sm">
            <p>Open positions: {activePositions.length}</p>
            <p>Total trades logged: {trades.length}</p>
            <p>Watchlist: {watchlist.join(', ') || 'None yet'}</p>
          </div>
          <div className="mt-4 rounded-md border border-trade-border bg-black/10 p-3 text-xs text-trade-muted">
            Ask for chart analysis directly: &quot;Show me NVDA chart and key levels&quot;.
          </div>
        </aside>
      </div>
    </div>
  );
}
