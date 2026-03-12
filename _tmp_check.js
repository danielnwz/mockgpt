
  function show(id, btn) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    document.getElementById('panel-' + id).classList.add('active');
    btn.classList.add('active');
  }

  function autoGrow(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, parseInt(el.style.maxHeight || 300)) + 'px';
  }

  function toolIcon(id, size, color) {
    const stroke = color || 'currentColor';
    const s = size || 14;
    if (id === 'web') return `<svg width="${s}" height="${s}" viewBox="0 0 16 16" fill="none" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 2a9 9 0 0 0 0 12M8 2a9 9 0 0 1 0 12M2 8h12"/></svg>`;
    if (id === 'code') return `<svg width="${s}" height="${s}" viewBox="0 0 16 16" fill="none" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="5 4 1 8 5 12"/><polyline points="11 4 15 8 11 12"/></svg>`;
    if (id === 'db') return `<svg width="${s}" height="${s}" viewBox="0 0 16 16" fill="none" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round"><ellipse cx="8" cy="5" rx="5" ry="2.5"/><path d="M3 5v6c0 1.38 2.24 2.5 5 2.5s5-1.12 5-2.5V5"/><path d="M3 8c0 1.38 2.24 2.5 5 2.5s5-1.12 5-2.5"/></svg>`;
    if (id === 'email') return `<svg width="${s}" height="${s}" viewBox="0 0 16 16" fill="none" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round"><rect x="2" y="3" width="12" height="10" rx="2"/><polyline points="2 6 8 9.5 14 6"/></svg>`;
    if (id === 'jira') return `<svg width="${s}" height="${s}" viewBox="0 0 16 16" fill="none" stroke="${stroke}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h4v4H3z"/><path d="M9 9h4v4H9z"/><path d="M7 5h2v2H7z"/><path d="M8 7v2"/><path d="M7 8h2"/></svg>`;
    if (id === 'github') return `<svg width="${s}" height="${s}" viewBox="0 0 16 16" fill="none" stroke="${stroke}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2a5.5 5.5 0 0 0-1.7 10.7V11.2c-2 .5-2.4-1-2.4-1-.3-.8-.8-1- .8-1 .7 0 1.1.7 1.1.7.6 1.1 1.6.8 2 .6.1-.4.3-.8.5-1-1.6-.2-3.3-.8-3.3-3.5 0-.8.3-1.4.7-1.9-.1-.2-.3-.9.1-1.8 0 0 .6-.2 1.9.7a6.4 6.4 0 0 1 3.5 0c1.3-.9 1.9-.7 1.9-.7.4.9.2 1.6.1 1.8.5.5.7 1.1.7 1.9 0 2.7-1.7 3.3-3.3 3.5.3.2.5.7.5 1.4v2.1A5.5 5.5 0 0 0 8 2z"/></svg>`;
    if (id === 'calendar') return `<svg width="${s}" height="${s}" viewBox="0 0 16 16" fill="none" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round"><rect x="2" y="3" width="12" height="11" rx="2"/><line x1="2" y1="6" x2="14" y2="6"/><line x1="5" y1="1.8" x2="5" y2="4.2"/><line x1="11" y1="1.8" x2="11" y2="4.2"/></svg>`;
    return `<svg width="${s}" height="${s}" viewBox="0 0 16 16" fill="none" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round"><path d="M3 3h10v10H3z"/><path d="M5 6h6M5 9h4"/></svg>`;
  }

  const TOOL_DEFS = [
    { id: 'web', label: 'Web-Suche', desc: 'Aktuelle Informationen', iconBg: '#1e2d45', iconColor: '#60a5fa' },
    { id: 'code', label: 'Code-Runner', desc: 'Python & JS ausf�hren', iconBg: '#1e351e', iconColor: '#4ade80' },
    { id: 'db', label: 'Datenbank', desc: 'SQL-Abfragen', iconBg: '#35201e', iconColor: '#fb923c' },
    { id: 'email', label: 'E-Mail', desc: 'Nachrichten senden', iconBg: '#2d1e35', iconColor: '#c084fc' },
    { id: 'jira', label: 'Jira MCP', desc: 'Tickets lesen & aktualisieren', iconBg: '#1e2d45', iconColor: '#93c5fd' },
    { id: 'github', label: 'GitHub', desc: 'Repos & Issues', iconBg: '#1f2937', iconColor: '#e2e8f0' },
    { id: 'calendar', label: 'Kalender', desc: 'Termine planen', iconBg: '#2d1e35', iconColor: '#f9a8d4' },
    { id: 'docs', label: 'Docs', desc: 'Interne Wissensbasis', iconBg: '#1e351e', iconColor: '#86efac' }
  ];

  const TOOL_STATE = {
    a: new Set(['web', 'code']),
    b: new Set(['web']),
    c: new Set(['web', 'code'])
  };

  function togglePopover(id, trigger) {
    const p = document.getElementById(id);
    if (!p) return;
    const wrap = trigger ? trigger.closest('.popover-wrap') : p.parentElement;
    const isOpen = p.style.display === 'block' || p.classList.contains('open');
    const stickyOpen = !!(trigger && trigger.dataset && trigger.dataset.stickyOpen === '1');
    if (isOpen && stickyOpen) return;
    const shouldOpen = !isOpen;
    document.querySelectorAll('.tool-popover').forEach(pop => {
      pop.classList.remove('open');
      pop.style.display = 'none';
      if (pop.parentElement) pop.parentElement.classList.remove('open');
    });
    if (!shouldOpen) return;
    p.classList.add('open');
    p.style.display = 'block';
    if (wrap) wrap.classList.add('open');
    setTimeout(() => {
      document.addEventListener('click', function closer(e) {
        if (wrap && wrap.contains(e.target)) return;
        if (!p.contains(e.target)) {
          p.classList.remove('open');
          p.style.display = 'none';
          if (wrap) wrap.classList.remove('open');
          document.removeEventListener('click', closer);
        }
      });
    }, 10);
  }

  function toggleTool(concept, toolId) {
    const set = TOOL_STATE[concept];
    if (!set) return;
    if (set.has(toolId)) set.delete(toolId);
    else set.add(toolId);
    renderTools(concept);
  }

  function renderToolPopoverList(targetId, concept) {
    const target = document.getElementById(targetId);
    if (!target) return;
    target.innerHTML = '';
    TOOL_DEFS.forEach(tool => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'tool-item';
      if (TOOL_STATE[concept].has(tool.id)) item.classList.add('selected');
      item.onclick = function () { toggleTool(concept, tool.id); };
      item.innerHTML = `
        <div class="tool-icon" style="background:${tool.iconBg};">
          ${toolIcon(tool.id, 16, tool.iconColor)}
        </div>
        <div class="tool-info">
          <div class="tool-name">${tool.label}</div>
          <div class="tool-desc">${tool.desc}</div>
        </div>
        <svg class="tool-check" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round"><polyline points="3 8 6.5 11.5 13 4"/></svg>
      `;
      target.appendChild(item);
    });
  }

  function renderToolsA() {
    const wrap = document.getElementById('active-tools-a');
    if (!wrap) return;
    wrap.innerHTML = '';
    TOOL_DEFS.forEach(tool => {
      if (!TOOL_STATE.a.has(tool.id)) return;
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip tool';
      chip.onclick = function () { toggleTool('a', tool.id); };
      chip.innerHTML = `
        ${toolIcon(tool.id, 11, 'currentColor')}
        ${tool.label}
        <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="2" y1="2" x2="10" y2="10"/><line x1="10" y1="2" x2="2" y2="10"/></svg>
      `;
      wrap.appendChild(chip);
    });
    renderToolPopoverList('tool-list-a', 'a');
  }

  function renderToolsB() {
    const row = document.getElementById('tool-row-b');
    if (!row) return;
    row.innerHTML = '';
    TOOL_DEFS.forEach(tool => {
      const btn = document.createElement('button');
      btn.type = 'button';
      const active = TOOL_STATE.b.has(tool.id);
      btn.className = 'chip tool' + (active ? '' : ' inactive');
      btn.onclick = function () { toggleTool('b', tool.id); };
      btn.innerHTML = `${toolIcon(tool.id, 11, 'currentColor')}${tool.label}`;
      row.appendChild(btn);
    });
  }

  function renderToolsC() {
    const count = document.getElementById('tool-count-c');
    const btn = document.getElementById('tools-c-btn');
    if (count && btn) {
      const activeCount = TOOL_STATE.c.size;
      count.textContent = String(activeCount);
      count.style.background = activeCount > 0 ? '#4f46e5' : '#2d3748';
      btn.classList.toggle('active', activeCount > 0);
    }
    renderToolPopoverList('tool-list-c', 'c');
  }

  function renderTools(concept) {
    if (concept === 'a') renderToolsA();
    if (concept === 'b') renderToolsB();
    if (concept === 'c') renderToolsC();
  }

  function initTools() {
    renderToolsA();
    renderToolsB();
    renderToolsC();
  }

  function toggleReasonDrop(dropId) {
    const drop = document.getElementById(dropId);
    const menu = drop.querySelector('.reason-menu');
    const trigger = drop.querySelector('.reason-trigger');
    const isOpen = menu.classList.contains('open');
    document.querySelectorAll('.reason-menu').forEach(m => m.classList.remove('open'));
    document.querySelectorAll('.reason-trigger').forEach(t => t.classList.remove('open'));
    if (!isOpen) {
      menu.classList.add('open');
      trigger.classList.add('open');
      setTimeout(() => {
        document.addEventListener('click', function closer(e) {
          if (!drop.contains(e.target)) {
            menu.classList.remove('open');
            trigger.classList.remove('open');
            document.removeEventListener('click', closer);
          }
        });
      }, 10);
    }
  }

  function pickReason(dropId, menuId, value, opt) {
    const drop = document.getElementById(dropId);
    const menu = document.getElementById(menuId);
    const trigger = drop.querySelector('.reason-trigger');
    const val = drop.querySelector('.reason-val');
    menu.querySelectorAll('.reason-option').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    const prefix = dropId === 'rdrop-c' ? '' : 'Denktiefe: ';
    val.textContent = prefix + value;
    if (value !== 'Aus') trigger.classList.add('has-value');
    else trigger.classList.remove('has-value');
    menu.classList.remove('open');
    trigger.classList.remove('open');
  }

  function setReasonPresetB(value, btn) {
    const wrap = document.getElementById('rpills-b');
    if (!wrap) return;
    wrap.querySelectorAll('.reason-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  function setReasonModeC(value, btn) {
    const wrap = document.getElementById('rswitch-c');
    if (!wrap) return;
    wrap.querySelectorAll('.reason-mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const current = document.getElementById('reason-c-current');
    if (current) current.textContent = 'Aktiv: ' + value;
  }

  function expandTa(taId, btn) {
    const ta = document.getElementById(taId);
    const expanded = btn.classList.contains('expanded');
    if (expanded) {
      ta.style.maxHeight = taId === 'ta-c' ? '260px' : '200px';
      ta.style.height = 'auto';
      btn.classList.remove('expanded');
      btn.title = 'Vergrößern';
      btn.innerHTML = `<svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 11l4-4M8 1l3 3-4 4M9 1h2v2"/></svg>`;
    } else {
      ta.style.maxHeight = '480px';
      ta.style.height = '320px';
      btn.classList.add('expanded');
      btn.title = 'Verkleinern';
      btn.innerHTML = `<svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 1l-4 4M2 9l2 2 4-4M1 10h2V8"/></svg>`;
    }
  }

  function updateSendA() {
    const t = document.getElementById('ta-a').value.trim();
    const btn = document.getElementById('send-a');
    const lbl = document.getElementById('send-a-label');
    if (t) {
      btn.classList.remove('voice-mode');
      btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="8" x2="13" y2="8"/><polyline points="9 4 13 8 9 12"/></svg><span id="send-a-label">Senden</span>`;
    } else {
      btn.classList.add('voice-mode');
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 1a3 3 0 0 1 3 3v4a3 3 0 0 1-6 0V4a3 3 0 0 1 3-3z"/><path d="M3 9a5 5 0 0 0 10 0"/><line x1="8" y1="14" x2="8" y2="16"/></svg><span id="send-a-label">Sprechen</span>`;
    }
  }

  function updateSendB() {
    const t = document.getElementById('ta-b').value.trim();
    const btn = document.getElementById('send-b');
    const lbl = document.getElementById('send-b-label');
    if (t) {
      btn.classList.remove('voice-mode');
      lbl.textContent = 'Senden';
      btn.querySelector('svg').innerHTML = `<line x1="3" y1="8" x2="13" y2="8"/><polyline points="9 4 13 8 9 12"/>`;
      btn.querySelector('svg').setAttribute('stroke-width','2.2');
    } else {
      btn.classList.add('voice-mode');
      lbl.textContent = 'Sprechen';
      btn.querySelector('svg').innerHTML = `<path d="M8 1a3 3 0 0 1 3 3v4a3 3 0 0 1-6 0V4a3 3 0 0 1 3-3z"/><path d="M3 9a5 5 0 0 0 10 0"/><line x1="8" y1="14" x2="8" y2="16"/>`;
    }
  }

  function handleSendA() {
    const t = document.getElementById('ta-a').value.trim();
    if (!t) handleVoice();
  }

  function handleSendB() {
    const t = document.getElementById('ta-b').value.trim();
    if (!t) handleVoice();
  }

  function handleVoice() {
    alert('Spracherkennung würde hier gestartet…');
  }

  function toggleExpand(concept) {
    const btn = document.getElementById('expand-btn-' + concept);
    const isExpanded = btn.dataset.expanded === '1';
    if (isExpanded) {
      btn.dataset.expanded = '0';
      btn.querySelector('svg').innerHTML = '<path d="M3 8h10M8 3v10"/>';
      btn.childNodes[btn.childNodes.length - 1].textContent = 'Vollbild';
    } else {
      btn.dataset.expanded = '1';
      btn.querySelector('svg').innerHTML = '<polyline points="4 3 3 3 3 13 13 13 13 12"/><line x1="10" y1="6" x2="14" y2="2"/><polyline points="9 2 14 2 14 7"/>';
      btn.childNodes[btn.childNodes.length - 1].textContent = ' Verkleinern';
    }
  }

  function triggerFile() {
    alert('Datei-Upload-Dialog würde hier geöffnet…');
  }

  initTools();

