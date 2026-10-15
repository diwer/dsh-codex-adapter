import { AdapterError, protocol } from './errors.mjs';

/** Parse SSE incrementally, including split UTF-8, CRLF, comments and multiline data. */
export async function* readSse(body, { signal, maxEventBytes = 8 * 1024 * 1024 } = {}) {
  if (!body?.getReader) throw protocol('The provider did not return a readable event stream.');
  const reader = body.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let pending = '', data = [], bytes = 0, eventName = '';
  const abort = () => { void reader.cancel().catch(() => {}); };
  signal?.addEventListener('abort', abort, { once: true });
  const check = () => {
    if (signal?.aborted) throw new AdapterError('The request was cancelled.', 'ABORTED');
  };
  const line = (value, width) => {
    if (value === '') {
      const payload = data.length ? { data: data.join('\n'), event: eventName } : undefined;
      data = []; bytes = 0; eventName = '';
      return payload;
    }
    // Bound all wire fields, not just data. Account before retaining event names
    // or discarding comments/unknown fields; blank dispatch lines reset the budget.
    bytes += Buffer.byteLength(value) + width;
    if (bytes > maxEventBytes) throw protocol('A provider event exceeded the configured size limit.');
    if (value.startsWith(':')) return;
    const separator = value.indexOf(':');
    const field = separator < 0 ? value : value.slice(0, separator);
    let content = separator < 0 ? '' : value.slice(separator + 1);
    if (content.startsWith(' ')) content = content.slice(1);
    if (field === 'data') data.push(content);
    if (field === 'event') eventName = content;
  };
  try {
    check();
    while (true) {
      const { value, done } = await reader.read();
      check();
      pending += done ? decoder.decode() : decoder.decode(value, { stream: true });
      let at;
      while ((at = pending.search(/[\r\n]/)) >= 0) {
        if (!done && pending[at] === '\r' && at === pending.length - 1) break;
        const width = pending[at] === '\r' && pending[at + 1] === '\n' ? 2 : 1;
        const payload = line(pending.slice(0, at), width);
        pending = pending.slice(at + width);
        if (payload) yield payload;
      }
      // A lone CR may be the first byte of the blank dispatch delimiter.
      const pendingBytes = pending === '\r' ? 0 : Buffer.byteLength(pending);
      if (pendingBytes + bytes > maxEventBytes) throw protocol('A provider event exceeded the configured size limit.');
      if (done) break;
    }
    // SSE dispatch requires a blank line. An unterminated final event is a truncation.
    if (pending.length || data.length) throw protocol('The event stream ended in an incomplete event.');
  } catch (error) {
    if (signal?.aborted) throw new AdapterError('The request was cancelled.', 'ABORTED');
    if (error instanceof AdapterError) throw error;
    throw protocol('The provider event stream could not be read.');
  } finally {
    signal?.removeEventListener('abort', abort);
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

/** Decode JSON wire events without returning malformed or reflected raw data. */
export function parseEvent(frame) {
  if (frame.data === '[DONE]') return { type: 'transport.done' };
  let event;
  try { event = JSON.parse(frame.data); } catch { throw protocol('The provider sent malformed event JSON.'); }
  if (!event || typeof event !== 'object' || typeof event.type !== 'string') throw protocol();
  if (frame.event && frame.event !== 'message' && frame.event !== event.type) throw protocol('The SSE event type and data disagreed.');
  return event;
}
