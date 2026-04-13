import { useState } from 'react';
import './App.css';
import { ServiceBusService } from './generated';
import type { ServiceBusMessage } from './generated/models/ServiceBusModel';

const QUEUE_NAME = 'petestest';

function App() {
  const [messages, setMessages] = useState<ServiceBusMessage[]>([]);
  const [sendText, setSendText] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [decodeInput, setDecodeInput] = useState('');
  const [activeQueueType, setActiveQueueType] = useState<'Main' | 'DeadLetter'>('Main');

  const peekMessages = async (queueType: 'Main' | 'DeadLetter') => {
    setLoading(true);
    setActiveQueueType(queueType);
    setStatus(`Peeking ${queueType} queue...`);
    try {
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
      setStatus(`Got ${msgs.length} message(s) from ${queueType} queue — locks held, use actions below`);
    } catch (err) {
      console.error(err);
      setStatus(`Error: ${err}`);
    }
    setLoading(false);
  };

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

  const sendMessage = async () => {
    if (!sendText.trim()) return;
    setLoading(true);
    setStatus('Sending...');
    try {
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

  return (
    <div className="app">
      <header className="app-header">
        <div className="icon">🚌</div>
        <h1>Service Bus Explorer</h1>
        <span className="queue-badge">{QUEUE_NAME}</span>
      </header>

      {/* Send */}
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

      {/* Peek */}
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

      {/* Status */}
      {status && (
        <p className={`status ${statusType(status)}`}>{status}</p>
      )}

      {/* Messages */}
      {messages.length > 0 ? (
        <section className="panel">
          <h2>Messages ({messages.length})</h2>
          <div className="messages">
            {messages.map((msg, i) => (
              <div key={msg.MessageId ?? i} className="message-card">
                <div className="message-header">
                  <span className="msg-id">ID: {msg.MessageId ?? '—'}</span>
                  {msg.SequenceNumber != null && (
                    <span className="msg-seq">Seq: {msg.SequenceNumber}</span>
                  )}
                </div>
                <div className="message-body">
                  {safeBase64Decode(msg.ContentData ?? '') || msg.ContentData || '(empty)'}
                </div>
                {msg.Label && (
                  <div className="message-label">Label: {msg.Label}</div>
                )}
                {msg.SessionId && (
                  <div className="message-label">Session: {msg.SessionId}</div>
                )}
                <div className="message-actions">
                  <button onClick={() => completeMessage(msg)} className="btn-complete">
                    ✓ Complete
                  </button>
                  {activeQueueType === 'Main' && (
                    <button onClick={() => deadLetterMessage(msg)} className="btn-deadletter">
                      ☠️ Dead Letter
                    </button>
                  )}
                  <button onClick={() => abandonMessage(msg)} className="btn-abandon">
                    ↩ Abandon
                  </button>
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
        !loading && messages.length === 0 && status.includes('Got') && (
          <div className="empty-state">No messages in queue</div>
        )
      )}

      {/* Base64 Decoder */}
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

const statusType = (s: string): 'error' | 'success' | 'info' => {
  if (/error|failed/i.test(s)) return 'error';
  if (/Got|sent|Completed|Dead-lettered|Abandoned/i.test(s)) return 'success';
  return 'info';
};

const safeBase64Decode = (encoded: string): string => {
  try {
    if (!encoded || typeof encoded !== 'string') return '';
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }
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
