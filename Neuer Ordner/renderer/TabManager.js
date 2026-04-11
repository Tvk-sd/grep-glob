class TabManager {
  constructor({ dotsEl, terminalsHost, bugCanvas }) {
    this.dotsEl        = dotsEl;
    this.terminalsHost = terminalsHost;
    this.bugAnim       = new BugAnimation(bugCanvas);
    this.tabs          = new Map(); // tabId → record
    this.activeId      = null;
  }

  async newTab() {
    const tabId = await window.electronAPI.createTab();

    // Terminal container
    const container = document.createElement('div');
    container.className = 'terminal-container';
    container.dataset.tabId = tabId;
    this.terminalsHost.appendChild(container);

    // xterm instance
    const term = new Terminal({
      fontFamily: 'Menlo, "SF Mono", monospace',
      fontSize: 13,
      lineHeight: 1.4,
      cursorBlink: true,
      allowTransparency: true,
      theme: {
        background: 'transparent',
        foreground: '#e8e8e8',
        cursor: '#ffffff',
        selectionBackground: 'rgba(255,255,255,0.2)',
      },
    });

    const fitAddon = new FitAddon.FitAddon();
    term.loadAddon(fitAddon);

    // Dot in header
    const dot = document.createElement('span');
    dot.className = 'tab-dot';
    dot.dataset.tabId = tabId;
    dot.title = `Session ${this.tabs.size + 1}`;
    dot.addEventListener('click', () => this.activate(tabId));

    const closeBtn = document.createElement('span');
    closeBtn.className = 'close-btn';
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeTab(tabId);
    });
    dot.appendChild(closeBtn);
    this.dotsEl.appendChild(dot);

    // Wire PTY ↔ xterm
    const cleanup = window.electronAPI.onPtyData(tabId, data => term.write(data));
    term.onData(data => window.electronAPI.writeToTab(tabId, data));

    // Keep PTY dimensions in sync with container
    const ro = new ResizeObserver(() => {
      if (!container.classList.contains('active')) return;
      fitAddon.fit();
      window.electronAPI.resizePty(tabId, term.cols, term.rows);
    });
    ro.observe(container);

    this.tabs.set(tabId, { term, fitAddon, container, dot, cleanup, ro });
    this.activate(tabId);

    return tabId;
  }

  activate(tabId) {
    if (!this.tabs.has(tabId)) return;

    // Deactivate all
    this.tabs.forEach((rec, id) => {
      rec.container.classList.remove('active');
      rec.dot.classList.remove('active');
    });

    const rec = this.tabs.get(tabId);
    rec.container.classList.add('active');
    rec.dot.classList.add('active');
    this.activeId = tabId;

    // Mount xterm lazily (must be visible first)
    if (!rec.term.element) {
      rec.term.open(rec.container);
    }
    rec.fitAddon.fit();
    rec.term.focus();
  }

  closeTab(tabId) {
    const rec = this.tabs.get(tabId);
    if (!rec) return;

    rec.cleanup();
    rec.ro.disconnect();
    rec.term.dispose();
    rec.container.remove();
    rec.dot.remove();
    window.electronAPI.closeTab(tabId);
    this.tabs.delete(tabId);

    // Activate the last remaining tab, if any
    const remaining = [...this.tabs.keys()];
    if (remaining.length > 0) {
      this.activate(remaining[remaining.length - 1]);
    } else {
      this.activeId = null;
    }
  }

  handleStateChange({ tabId, state }) {
    const rec = this.tabs.get(tabId);
    if (!rec) return;

    // Update dot colour
    rec.dot.classList.remove('thinking', 'responding', 'error');
    if (state !== 'idle') rec.dot.classList.add(state);

    // Only update bug animation for the active tab
    if (tabId === this.activeId) {
      this.bugAnim.setState(state);
    }
  }
}
