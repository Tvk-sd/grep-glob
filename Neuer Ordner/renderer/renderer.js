const tabManager = new TabManager({
  dotsEl:        document.getElementById('tab-dots'),
  terminalsHost: document.getElementById('terminals-host'),
  bugCanvas:     document.getElementById('bug-canvas'),
});

// ── Controls ─────────────────────────────────────────────────────────────────

document.getElementById('btn-new-tab').addEventListener('click', async () => {
  await tabManager.newTab();
});

document.getElementById('btn-toggle').addEventListener('click', async () => {
  const expanding = await window.electronAPI.toggleWindow();
  document.body.classList.toggle('expanded', expanding);

  if (expanding && tabManager.activeId) {
    // Give the window time to finish animating before fitting
    setTimeout(() => {
      const rec = tabManager.tabs.get(tabManager.activeId);
      if (rec) { rec.fitAddon.fit(); rec.term.focus(); }
    }, 220);
  }
});

// ── State changes from main ───────────────────────────────────────────────────

window.electronAPI.onStateChange(payload => {
  tabManager.handleStateChange(payload);
});

// ── Open first tab automatically ─────────────────────────────────────────────

tabManager.newTab();
