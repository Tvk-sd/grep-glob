const timers = new Map();

function feed(tabId, data, win) {
  const emit = state => win.webContents.send('tab:state-change', { tabId, state });

  // Spinner / thinking: carriage return without newline
  if (/\r(?!\n)/.test(data)) {
    emit('thinking');
  } else {
    emit('responding');
  }

  // Error patterns
  if (/\b(error|failed|exception)\b/i.test(data)) {
    emit('error');
  }

  // Silence → idle
  clearTimeout(timers.get(tabId));
  timers.set(tabId, setTimeout(() => emit('idle'), 1500));
}

function clear(tabId) {
  clearTimeout(timers.get(tabId));
  timers.delete(tabId);
}

module.exports = { feed, clear };
