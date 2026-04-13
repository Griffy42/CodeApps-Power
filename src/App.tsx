import { useState } from 'react';
import './App.css';
import { ServiceBusService } from './generated';
import type { ServiceBusMessage } from './generated/models/ServiceBusModel';

// The Service Bus queue name to interact with.
// Change this to target a different queue.
const QUEUE_NAME = 'petestest';

/**
 * Service Bus Explorer — main app component.
 *
 * Provides a UI to send, peek, complete, dead-letter, and abandon
 * messages on an Azure Service Bus queue via the Power Apps connector.
 */
function App() {
  // Currently displayed messages (from the last peek operation)
  const [messages, setMessages] = useState<ServiceBusMessage[]>([]);
  // Text input for composing a new message to send
  const [sendText, setSendText] = useState('');
  // Status bar text shown below the action panels
  const [status, setStatus] = useState('');
  // True while any async operation is in progress (disables buttons)
  const [loading, setLoading] = useState(false);
  // Input value for the Base64 decoder utility
  const [decodeInput, setDecodeInput] = useState('');
  // Tracks which queue type (Main or DeadLetter) was last peeked,
  // so that complete/abandon/dead-letter target the correct sub-queue
  const [activeQueueType, setActiveQueueType] = useState<'Main' | 'DeadLetter'>('Main');

  /**
   * Peek messages from the specified queue using peek-lock.
   * Peek-lock reads messages without removing them, but holds a lock.
   * Before peeking, any previously held locks are abandoned so those
   * messages become visible again (avoids "0 messages" on re-peek).
   */
  const peekMessages = async (queueType: 'Main' | 'DeadLetter') => {
    setLoading(true);
    setActiveQueueType(queueType);
    setStatus(`Peeking ${queueType} queue...`);
    try {
      // Abandon any existing locks first so messages become visible again.
      // If a lock has already expired, the abandon call will fail silently.
      for (const msg of messages) {
        if (msg.LockToken) {
          try {
            await ServiceBusService.AbandonMessageInQueue(
              QUEUE_NAME, msg.LockToken, activeQueueType
            );
          } catch { /* lock may have already expired */ }
        }
      }
      setMessages([]);

      // Fetch up to 10 messages with peek-lock.
      // Messages remain on the queue until explicitly completed or dead-lettered.
      const result = await ServiceBusService.GetMessagesFromQueueWithPeekLock(
        QUEUE_NAME, 10, queueType
      );
      if (result.error) {
        setStatus(`Peek error: ${JSON.stringify(result.error)}`);
        setLoading(false);
        return;
      }
      const msgs = result.data ?? [];
      setMessages(msgs);
      setStatus(
        msgs.length > 0
          ? `Got ${msgs.length} message(s) from ${queueType} queue — locks held, use actions below`
          : `No messages in ${queueType} queue`
      );
    } catch (err) {
      console.error(err);
      setStatus(`Error: ${err}`);
    }
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
    try {
      await ServiceBusService.CompleteMessageInQueue(
        QUEUE_NAME, msg.LockToken, activeQueueType
      );
      setMessages((prev) => prev.filter((m) => m.MessageId !== msg.MessageId));
      setStatus(`Completed message ${msg.MessageId}`);
    } catch (err) {
      console.error(err);
      setStatus(`Complete failed (lock may have expired) — re-peek and try again`);
    }
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
    try {
      await ServiceBusService.DeadLetterMessageInQueue(
        QUEUE_NAME, msg.LockToken, undefined, 'Manual dead-letter', 'Dead-lettered via Service Bus Explorer'
      );
      setMessages((prev) => prev.filter((m) => m.MessageId !== msg.MessageId));
      setStatus(`Dead-lettered message ${msg.MessageId}`);
    } catch (err) {
      console.error(err);
      setStatus(`Dead-letter failed (lock may have expired) — re-peek and try again`);
    }
  };

  /**
   * Abandon a message — releases the lock and returns the message
   * to the queue so it can be read again by any consumer.
   */
  const abandonMessage = async (msg: ServiceBusMessage) => {
    if (!msg.LockToken) return;
    try {
      await ServiceBusService.AbandonMessageInQueue(
        QUEUE_NAME, msg.LockToken, activeQueueType
      );
      setMessages((prev) => prev.filter((m) => m.MessageId !== msg.MessageId));
      setStatus(`Abandoned message ${msg.MessageId} — returned to queue`);
    } catch (err) {
      console.error(err);
      setStatus(`Abandon failed — lock may have expired`);
    }
  };

  /**
   * Send a new message to the queue.
   * The message body is base64-encoded (required by the Service Bus connector).
   */
  const sendMessage = async () => {
    if (!sendText.trim()) return;
    setLoading(true);
    setStatus('Sending...');
    try {
      // The connector expects ContentData as a base64 string.
      // encodeURIComponent handles multi-byte chars, unescape converts to binary, btoa encodes.
      const encoded = btoa(unescape(encodeURIComponent(sendText)));
      const message = { ContentData: encoded, ContentType: 'text/plain' };
      const result = await ServiceBusService.SendMessage(QUEUE_NAME, message);
      setSendText('');
      setStatus(result.error ? `Send error: ${JSON.stringify(result.error)}` : 'Message sent!');
    } catch (err: unknown) {
      console.error(err);
      setStatus(`Send error: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
    }
    setLoading(false);
  };

  // ── Render ──

  return (
    <div className="app">
      {/* Header with app icon, title, and active queue badge */}
      <header className="app-header">
        <div className="icon">🚌</div>
        <h1>Service Bus Explorer</h1>
        <span className="queue-badge">{QUEUE_NAME}</span>
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
          <button onClick={sendMessage} disabled={loading || !sendText.trim()}>
            {loading ? <span className="spinner" /> : '↑'} Send
          </button>
        </div>
      </section>

      {/* Peek panel — read messages from Main or Dead Letter queue */}
      <section className="panel">
        <h2>Read Messages</h2>
        <div className="button-row">
          <button onClick={() => peekMessages('Main')} disabled={loading}>
            {loading ? <span className="spinner" /> : '📥'} Peek Main Queue
          </button>
          <button className="secondary" onClick={() => peekMessages('DeadLetter')} disabled={loading}>
            ☠️ Peek Dead Letter
          </button>
        </div>
      </section>

      {/* Status bar — shows result of the last operation (color-coded) */}
      {status && (
        <p className={`status ${statusType(status)}`}>{status}</p>
      )}

      {/* Message list — each card shows content and action buttons */}
      {messages.length > 0 ? (
        <section className="panel">
          <h2>Messages ({messages.length})</h2>
          <div className="messages">
            {messages.map((msg, i) => (
              <div key={msg.MessageId ?? i} className="message-card">
                {/* Message metadata */}
                <div className="message-header">
                  <span className="msg-id">ID: {msg.MessageId ?? '—'}</span>
                  {msg.SequenceNumber != null && (
                    <span className="msg-seq">Seq: {msg.SequenceNumber}</span>
                  )}
                </div>

                {/* Message body — auto-decoded from base64 */}
                <div className="message-body">
                  {safeBase64Decode(msg.ContentData ?? '') || msg.ContentData || '(empty)'}
                </div>

                {/* Optional metadata fields */}
                {msg.Label && (
                  <div className="message-label">Label: {msg.Label}</div>
                )}
                {msg.SessionId && (
                  <div className="message-label">Session: {msg.SessionId}</div>
                )}

                {/* Action buttons for this message */}
                <div className="message-actions">
                  {/* Complete: permanently remove from queue */}
                  <button onClick={() => completeMessage(msg)} className="btn-complete">
                    ✓ Complete
                  </button>
                  {/* Dead Letter: move to dead-letter sub-queue (main queue only) */}
                  {activeQueueType === 'Main' && (
                    <button onClick={() => deadLetterMessage(msg)} className="btn-deadletter">
                      ☠️ Dead Letter
                    </button>
                  )}
                  {/* Abandon: release lock, return message to queue */}
                  <button onClick={() => abandonMessage(msg)} className="btn-abandon">
                    ↩ Abandon
                  </button>
                  {/* Decode: copy ContentData to the Base64 decoder panel */}
                  <button
                    onClick={() => setDecodeInput(msg.ContentData ?? '')}
                    className="btn-decode"
                  >
                    🔓 Decode
                  </button>
                </div>
              </div>
            ))}
          </div>
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
    return decodeURIComponent(
      decoded
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
  } catch {
    return encoded; // Return raw if not valid base64
  }
};

export default App;
