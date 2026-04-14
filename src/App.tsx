import { useState, useEffect } from 'react';
import './App.css';
import { ServiceBusService } from './generated';
import type { ServiceBusMessage } from './generated/models/ServiceBusModel';

// The Service Bus queue name to interact with.
const QUEUE_NAME = 'petestest';

// Number of messages to display per page in the message list
const PAGE_SIZE = 10;

// Available theme options
const THEMES = [
  { id: 'dark', label: 'Dark', icon: '🌑' },
  { id: 'light', label: 'Light', icon: '☀️' },
  { id: 'midnight', label: 'Midnight', icon: '🔮' },
  { id: 'nord', label: 'Nord', icon: '❄️' },
] as const;

type ThemeId = (typeof THEMES)[number]['id'];

/**
 * Service Bus Explorer — main app component.
 *
 * Provides a UI to send, peek, complete, dead-letter, and abandon
 * messages on an Azure Service Bus queue via the Power Apps connector.
 */
function App() {
  // ── Theme ──
  const [theme, setTheme] = useState<ThemeId>(() => {
    return (localStorage.getItem('sb-theme') as ThemeId) || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sb-theme', theme);
  }, [theme]);

  // Currently displayed messages (from the last peek operation)
  const [messages, setMessages] = useState<ServiceBusMessage[]>([]);
  // Text input for composing a new message to send
  const [sendText, setSendText] = useState('');
  // Status bar text shown below the action panels
  const [status, setStatus] = useState('');
  // True while any async operation is in progress (disables buttons)
  const [loading, setLoading] = useState(false);
  // Descriptive text shown in the loading banner during long operations
  const [loadingText, setLoadingText] = useState('');
  // Input value for the Base64 decoder utility
  const [decodeInput, setDecodeInput] = useState('');
  // Tracks which queue type (Main or DeadLetter) was last peeked,
  // so that complete/abandon/dead-letter target the correct sub-queue
  const [activeQueueType, setActiveQueueType] = useState<'Main' | 'DeadLetter'>('Main');
  // MessageId currently being acted on (shows spinner on that card)
  const [busyMsgId, setBusyMsgId] = useState<string | null>(null);
  // Current page index for client-side message pagination (0-based)
  const [page, setPage] = useState(0);

  /** Remove a message from the list and clamp the page index if it would overflow. */
  const removeMessage = (msgId: string | undefined) => {
    setMessages((prev) => {
      const next = prev.filter((m) => m.MessageId !== msgId);
      // If the current page now has no items, step back one page
      setPage((p) => Math.min(p, Math.max(0, Math.ceil(next.length / PAGE_SIZE) - 1)));
      return next;
    });
  };

  /**
   * Peek messages from the specified queue using peek-lock.
   * Peek-lock reads messages without removing them, but holds a lock.
   * Before peeking, any previously held locks are abandoned so those
   * messages become visible again (avoids "0 messages" on re-peek).
   */
  const unlockMessages = async (queueType: 'Main' | 'DeadLetter') => {
    const lockedMsgs = messages.filter((m) => m.LockToken);
    if (lockedMsgs.length === 0) {
      setMessages([]);
      setPage(0);
      setStatus('No locked messages to release');
      return;
    }
    setLoading(true);
    setLoadingText(`Releasing ${lockedMsgs.length} lock(s)…`);
    try {
      await Promise.allSettled(
        lockedMsgs.map((msg) =>
          ServiceBusService.AbandonMessageInQueue(
            QUEUE_NAME, msg.LockToken!, queueType
          )
        )
      );
      setStatus(`Released ${lockedMsgs.length} lock(s) on ${queueType} queue`);
    } catch {
      setStatus('Some locks could not be released (may have expired)');
    }
    setMessages([]);
    setPage(0);
    setLoadingText('');
    setLoading(false);
  };

  const peekMessages = async (queueType: 'Main' | 'DeadLetter') => {
    setLoading(true);
    setActiveQueueType(queueType);
    setPage(0);
    setLoadingText(`Connecting to ${queueType} queue…`);
    setStatus('');
    try {
      // Abandon any existing locks in parallel so messages become visible again.
      // Promise.allSettled ensures we don't stop on expired-lock errors.
      const lockedMsgs = messages.filter((m) => m.LockToken);
      if (lockedMsgs.length > 0) {
        setLoadingText(`Releasing ${lockedMsgs.length} lock(s)…`);
        await Promise.allSettled(
          lockedMsgs.map((msg) =>
            ServiceBusService.AbandonMessageInQueue(
              QUEUE_NAME, msg.LockToken!, activeQueueType
            )
          )
        );
      }
      setMessages([]);

      // Fetch all messages by looping in batches of BATCH_SIZE.
      // The connector caps how many it returns per call; when a batch
      // returns fewer than requested, we know the queue is drained.
      const BATCH_SIZE = 100;
      const allMsgs: ServiceBusMessage[] = [];
      let done = false;
      while (!done) {
        setLoadingText(
          allMsgs.length === 0
            ? `Fetching messages from ${queueType} queue…`
            : `Fetched ${allMsgs.length} message(s) so far — checking for more…`
        );
        const result = await ServiceBusService.GetMessagesFromQueueWithPeekLock(
          QUEUE_NAME, BATCH_SIZE, queueType
        );
        if (result.error) {
          setStatus(`Peek error: ${JSON.stringify(result.error)}`);
          setLoading(false);
          setLoadingText('');
          // Keep any messages already fetched
          if (allMsgs.length > 0) setMessages(allMsgs);
          return;
        }
        const batch = result.data ?? [];
        allMsgs.push(...batch);
        // If we got fewer than requested, the queue is empty
        if (batch.length < BATCH_SIZE) done = true;
      }
      setMessages(allMsgs);
      const msgs = allMsgs;
      setStatus(
        msgs.length > 0
          ? `Got ${msgs.length} message(s) from ${queueType} queue — locks held, use actions below`
          : `No messages in ${queueType} queue`
      );
    } catch (err) {
      setStatus(`Error: ${err}`);
    }
    setLoadingText('');
    setLoading(false);
  };

  /**
   * Complete a message — permanently removes it from the queue.
   * Requires a valid lock token from a prior peek-lock operation.
   */
  const completeMessage = async (msg: ServiceBusMessage) => {
    if (!msg.LockToken) {
      setStatus('No lock token — re-peek first');
      return;
    }
    if (!confirm('Complete this message? It will be permanently removed from the queue.')) return;
    setBusyMsgId(msg.MessageId ?? null);
    try {
      await ServiceBusService.CompleteMessageInQueue(
        QUEUE_NAME, msg.LockToken, activeQueueType
      );
      removeMessage(msg.MessageId);
      setStatus(`Completed message ${msg.MessageId}`);
    } catch {
      setStatus(`Complete failed (lock may have expired) — re-peek and try again`);
    }
    setBusyMsgId(null);
  };

  /**
   * Dead-letter a message — moves it from the main queue to the
   * dead-letter sub-queue. Useful for isolating poison messages.
   * Only available when viewing the Main queue.
   */
  const deadLetterMessage = async (msg: ServiceBusMessage) => {
    if (!msg.LockToken) {
      setStatus('No lock token — re-peek first');
      return;
    }
    if (!confirm('Dead-letter this message? It will be moved to the Dead Letter sub-queue.')) return;
    setBusyMsgId(msg.MessageId ?? null);
    try {
      await ServiceBusService.DeadLetterMessageInQueue(
        QUEUE_NAME, msg.LockToken, undefined, 'Manual dead-letter', 'Dead-lettered via Service Bus Explorer'
      );
      removeMessage(msg.MessageId);
      setStatus(`Dead-lettered message ${msg.MessageId}`);
    } catch {
      setStatus(`Dead-letter failed (lock may have expired) — re-peek and try again`);
    }
    setBusyMsgId(null);
  };

  /**
   * Abandon a message — releases the lock and returns the message
   * to the queue so it can be read again by any consumer.
   */
  const abandonMessage = async (msg: ServiceBusMessage) => {
    if (!msg.LockToken) return;
    setBusyMsgId(msg.MessageId ?? null);
    try {
      await ServiceBusService.AbandonMessageInQueue(
        QUEUE_NAME, msg.LockToken, activeQueueType
      );
      removeMessage(msg.MessageId);
      setStatus(`Abandoned message ${msg.MessageId} — returned to queue`);
    } catch {
      setStatus(`Abandon failed — lock may have expired`);
    }
    setBusyMsgId(null);
  };

  /** Seed 30 sample messages into the queue. */
  const seedMessages = async () => {
    const SEED_COUNT = 30;
    setLoading(true);
    setStatus('');
    try {
      for (let i = 1; i <= SEED_COUNT; i++) {
        setLoadingText(`Seeding message ${i} of ${SEED_COUNT}…`);
        const text = `Sample message #${i} — created ${new Date().toLocaleString()}`;
        const bytes = new TextEncoder().encode(text);
        const encoded = btoa(String.fromCharCode(...bytes));
        await ServiceBusService.SendMessage(QUEUE_NAME, { ContentData: encoded, ContentType: 'text/plain' });
      }
      setStatus(`Seeded ${SEED_COUNT} sample messages`);
      await peekMessages(activeQueueType);
      return;
    } catch (err: unknown) {
      setStatus(`Seed error: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
    }
    setLoadingText('');
    setLoading(false);
  };

  /**
   * Send a new message to the queue.
   * The message body is base64-encoded (required by the Service Bus connector).
   */
  const sendMessage = async () => {
    if (!sendText.trim()) return;
    setLoading(true);
    setLoadingText('Sending message…');
    setStatus('');
    try {
      // The connector expects ContentData as a base64 string.
      // TextEncoder + manual binary-to-base64 handles multi-byte chars correctly.
      const bytes = new TextEncoder().encode(sendText);
      const encoded = btoa(String.fromCharCode(...bytes));
      const message = { ContentData: encoded, ContentType: 'text/plain' };
      const result = await ServiceBusService.SendMessage(QUEUE_NAME, message);
      setSendText('');
      if (result.error) {
        setStatus(`Send error: ${JSON.stringify(result.error)}`);
      } else {
        setStatus('Message sent!');
        // Re-peek the active queue so the new message appears immediately
        await peekMessages(activeQueueType);
        return; // peekMessages already sets loading to false
      }
    } catch (err: unknown) {
      setStatus(`Send error: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
    }
    setLoadingText('');
    setLoading(false);
  };

  // ── Render ──

  return (
    <div className="app">
      {/* Header with app icon, title, and active queue badge */}
      <header className="app-header">
        <div className="icon">🚌</div>
        <h1>Service Bus Explorer</h1>
        <div className="theme-picker">
          {THEMES.map((t) => (
            <button
              key={t.id}
              className={`theme-btn ${theme === t.id ? 'active' : ''}`}
              onClick={() => setTheme(t.id)}
              title={t.label}
            >
              {t.label}
            </button>
          ))}
        </div>
        <span className="queue-badge" title="Active Service Bus queue">{QUEUE_NAME}</span>
        <button className="btn-seed" onClick={seedMessages} disabled={loading} title="Send 30 sample messages to the queue">
          🌱 Seed 30
        </button>
      </header>

      {/* Send panel — type a message and send to the queue */}
      <section className="panel">
        <h2>Send Message</h2>
        <div className="send-row">
          <input
            value={sendText}
            onChange={(e) => setSendText(e.target.value)}
            placeholder="Type a message to send..."
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage} disabled={loading || !sendText.trim()} title="Send message to queue (base64-encoded)">
            {loading ? <span className="spinner" /> : '↑'} Send
          </button>
        </div>
      </section>

      {/* Peek panel — toggle between Main and Dead Letter queue */}
      <section className="panel">
        <h2>Read Messages</h2>
        <div className="queue-toggle">
          <button
            className={`toggle-btn ${activeQueueType === 'Main' ? 'active' : ''}`}
            onClick={() => peekMessages('Main')}
            disabled={loading}
            title="Peek-lock all messages from the main queue"
          >
            📥 Main Queue
          </button>
          <button
            className="btn-unlock"
            onClick={() => unlockMessages('Main')}
            disabled={loading || messages.length === 0 || activeQueueType !== 'Main'}
            title="Release all locks on main queue and clear the table"
          >
            🔓 Unlock
          </button>
          <button
            className={`toggle-btn deadletter ${activeQueueType === 'DeadLetter' ? 'active' : ''}`}
            onClick={() => peekMessages('DeadLetter')}
            disabled={loading}
            title="Peek-lock messages from the dead-letter sub-queue"
          >
            ☠️ Dead Letter
          </button>
          <button
            className="btn-unlock"
            onClick={() => unlockMessages('DeadLetter')}
            disabled={loading || messages.length === 0 || activeQueueType !== 'DeadLetter'}
            title="Release all locks on dead-letter queue and clear the table"
          >
            🔓 Unlock
          </button>
        </div>
      </section>

      {/* Loading banner — shown during fetch/send with progress details */}
      {loading && loadingText && (
        <div className="loading-banner">
          <span className="spinner" />
          <span>{loadingText}</span>
        </div>
      )}

      {/* Status bar — shows result of the last operation (color-coded) */}
      {status && (
        <p className={`status ${statusType(status)}`}>{status}</p>
      )}

      {/* Message table — headers matching Azure Portal Service Bus Explorer */}
      {messages.length > 0 ? (
        <section className="panel">
          <div className="messages-header">
            <h2>
              {activeQueueType === 'DeadLetter' ? '☠️ Dead Letter' : '📥 Main'} — {messages.length} message{messages.length !== 1 ? 's' : ''}
            </h2>
            {messages.length > PAGE_SIZE && (
              <span className="showing-range">
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, messages.length)}
              </span>
            )}
          </div>
          <div className="msg-table-wrap">
            <table className="msg-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Sequence Number</th>
                  <th>Message ID</th>
                  <th>State</th>
                  <th>Body Size</th>
                  <th>Content Type</th>
                  <th>Label / Subject</th>
                  <th>Correlation ID</th>
                  {activeQueueType === 'DeadLetter' && <th>Dead Letter Reason</th>}
                  {activeQueueType === 'DeadLetter' && <th>DL Error</th>}
                  <th>Message Text</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((msg, i) => {
                  const isBusy = busyMsgId === msg.MessageId;
                  const rowNum = page * PAGE_SIZE + i + 1;
                  const decoded = safeBase64Decode(msg.ContentData ?? '') || msg.ContentData || '(empty)';
                  const bodySize = msg.ContentData
                    ? `${Math.ceil((msg.ContentData.length * 3) / 4)} B`
                    : '—';
                  const props = (msg.Properties ?? {}) as Record<string, unknown>;
                  const dlReason = (props['DeadLetterReason'] ?? props['deadLetterReason'] ?? '') as string;
                  const dlError = (props['DeadLetterErrorDescription'] ?? props['deadLetterErrorDescription'] ?? '') as string;
                  return (
                  <tr key={msg.MessageId ?? i} className={isBusy ? 'busy' : ''}>
                    <td className="cell-num">{rowNum}</td>
                    <td className="cell-seq">{msg.SequenceNumber ?? '—'}</td>
                    <td className="cell-id" title={msg.MessageId ?? ''}>{msg.MessageId ?? '—'}</td>
                    <td className="cell-state">
                      <span className={`state-badge ${activeQueueType === 'DeadLetter' ? 'dead' : 'active'}`}>
                        {activeQueueType === 'DeadLetter' ? 'Dead-lettered' : 'Active'}
                      </span>
                    </td>
                    <td className="cell-size">{bodySize}</td>
                    <td className="cell-ct">{msg.ContentType || '—'}</td>
                    <td className="cell-label">{msg.Label || '—'}</td>
                    <td className="cell-corr" title={msg.CorrelationId ?? ''}>{msg.CorrelationId || '—'}</td>
                    {activeQueueType === 'DeadLetter' && <td className="cell-dlr" title={dlReason}>{dlReason || '—'}</td>}
                    {activeQueueType === 'DeadLetter' && <td className="cell-dle" title={dlError}>{dlError || '—'}</td>}
                    <td className="cell-body" title={decoded}>{decoded}</td>
                    <td className="cell-actions">
                      <button onClick={() => completeMessage(msg)} className="btn-complete" disabled={isBusy} title="Permanently remove this message from the queue">
                        {isBusy ? <span className="spinner" /> : '✓'}
                      </button>
                      {activeQueueType === 'Main' && (
                        <button onClick={() => deadLetterMessage(msg)} className="btn-deadletter" disabled={isBusy} title="Move to dead-letter sub-queue">
                          {isBusy ? <span className="spinner" /> : '☠️'}
                        </button>
                      )}
                      <button onClick={() => abandonMessage(msg)} className="btn-abandon" disabled={isBusy} title="Release lock and return to queue">
                        ↩
                      </button>
                      <button onClick={() => setDecodeInput(msg.ContentData ?? '')} className="btn-decode" title="Copy to decoder">
                        🔓
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination controls — shown when messages exceed one page */}
          {messages.length > PAGE_SIZE && (() => {
            const totalPages = Math.ceil(messages.length / PAGE_SIZE);
            // Build a compact set of page numbers: first, last, and neighbours of current
            const pageNums = Array.from(new Set(
              [0, page - 1, page, page + 1, totalPages - 1].filter((n) => n >= 0 && n < totalPages)
            )).sort((a, b) => a - b);
            // Insert -1 as a gap marker between non-consecutive numbers
            const withGaps: number[] = [];
            pageNums.forEach((n, idx) => {
              if (idx > 0 && n - pageNums[idx - 1] > 1) withGaps.push(-1);
              withGaps.push(n);
            });
            return (
            <div className="pagination">
              <button
                className="secondary"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                title="Previous page"
              >
                ←
              </button>
              {withGaps.map((n, idx) =>
                n === -1 ? (
                  <span key={`gap-${idx}`} className="page-ellipsis">…</span>
                ) : (
                  <button
                    key={n}
                    className={`page-btn ${n === page ? 'active' : ''}`}
                    onClick={() => setPage(n)}
                    title={`Page ${n + 1}`}
                  >
                    {n + 1}
                  </button>
                )
              )}
              <button
                className="secondary"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={(page + 1) * PAGE_SIZE >= messages.length}
                title="Next page"
              >
                →
              </button>
            </div>
            );
          })()}
        </section>
      ) : (
        // Empty state shown after a peek returns no messages
        !loading && messages.length === 0 && status.includes('Got') && (
          <div className="empty-state">No messages in queue</div>
        )
      )}

      {/* Base64 decoder utility — paste or auto-fill from a message */}
      <section className="panel">
        <h2>Base64 Decoder</h2>
        <input
          value={decodeInput}
          onChange={(e) => setDecodeInput(e.target.value)}
          placeholder="Paste base64 content..."
        />
        {decodeInput && (
          <div className="decoder-output">
            {safeBase64Decode(decodeInput) || '(invalid base64)'}
          </div>
        )}
      </section>
    </div>
  );
}

/**
 * Classify a status message for colour-coding.
 * Returns 'error' (red), 'success' (green), or 'info' (blue).
 */
const statusType = (s: string): 'error' | 'success' | 'info' => {
  if (/error|failed/i.test(s)) return 'error';
  if (/Got|sent|Completed|Dead-lettered|Abandoned/i.test(s)) return 'success';
  return 'info';
};

/**
 * Safely decode a base64 string to UTF-8 text.
 * Handles URL-safe base64 variants (- and _ characters)
 * and adds missing padding. Returns the raw input if decoding fails.
 */
const safeBase64Decode = (encoded: string): string => {
  try {
    if (!encoded || typeof encoded !== 'string') return '';
    // Convert URL-safe base64 chars back to standard
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    // Pad to multiple of 4 (base64 requirement)
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }
    // Decode base64 → binary string → URI-encoded → UTF-8 text
    const decoded = atob(base64);
    const text = decodeURIComponent(
      decoded
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    // Strip wrapping double-quotes added by JSON serialisation
    if (text.length >= 2 && text.startsWith('"') && text.endsWith('"')) {
      return text.slice(1, -1);
    }
    return text;
  } catch {
    return encoded; // Return raw if not valid base64
  }
};

export default App;
