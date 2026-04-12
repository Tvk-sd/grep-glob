;(function () {
  let term = null
  let fitAddon = null
  let resizeObs = null
  let opening = false

  function fitAddonCtor() {
    const root = window.FitAddon
    if (!root) return null
    return root.FitAddon ? new root.FitAddon() : new root()
  }

  function disposeTerm() {
    if (resizeObs) {
      try {
        resizeObs.disconnect()
      } catch (_) {
        /* ignore */
      }
      resizeObs = null
    }
    if (term) {
      try {
        term.dispose()
      } catch (_) {
        /* ignore */
      }
      term = null
      fitAddon = null
    }
  }

  function collapseChrome() {
    document.body.classList.remove('expanded')
    document.body.classList.add('shrunk')
    window.electronAPI.shrineCollapsed()
  }

  async function bootTerminal() {
    const host = document.getElementById('terminal')
    if (!host || typeof window.Terminal === 'undefined') return
    disposeTerm()
    term = new window.Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: { background: '#1e1e1e' },
    })
    fitAddon = fitAddonCtor()
    if (fitAddon) term.loadAddon(fitAddon)
    term.open(host)
    if (fitAddon) fitAddon.fit()
    else term.resize(80, 24)

    term.onData((d) => {
      window.electronAPI.terminalWrite(d)
    })

    const cols = term.cols
    const rows = term.rows
    const r = await window.electronAPI.terminalStart({ cols, rows })
    if (!r || !r.ok) {
      const msg = (r && r.error) || 'unknown error'
      term.writeln(`\x1b[31mCould not start session: ${msg}\x1b[0m`)
      setTimeout(() => {
        disposeTerm()
        collapseChrome()
      }, 2500)
      return
    }

    const wrap = document.getElementById('terminalWrap')
    if (wrap && typeof ResizeObserver !== 'undefined') {
      resizeObs = new ResizeObserver(() => {
        if (!term || !fitAddon) return
        fitAddon.fit()
        window.electronAPI.terminalResize(term.cols, term.rows)
      })
      resizeObs.observe(wrap)
    }
  }

  async function onOpenShrineTerminal() {
    if (opening) return
    opening = true
    try {
      document.body.classList.remove('shrunk')
      document.body.classList.add('expanded')
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
      await bootTerminal()
    } finally {
      opening = false
    }
  }

  function onTerminalOutput(data) {
    if (term) term.write(typeof data === 'string' ? data : String(data))
  }

  function onTerminalClosed() {
    disposeTerm()
    document.body.classList.remove('expanded')
    document.body.classList.add('shrunk')
    window.electronAPI.shrineCollapsed()
  }

  function onWindowResize() {
    if (!term || !fitAddon) return
    fitAddon.fit()
    window.electronAPI.terminalResize(term.cols, term.rows)
  }

  window.initShrineTerminalBridge = function initShrineTerminalBridge() {
    window.electronAPI.onOpenShrineTerminal(onOpenShrineTerminal)
    window.electronAPI.onTerminalOutput(onTerminalOutput)
    window.electronAPI.onTerminalClosed(onTerminalClosed)
    const closeBtn = document.getElementById('closeTerm')
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        window.electronAPI.terminalKill()
      })
    }
    window.addEventListener('resize', onWindowResize)
  }
})()
