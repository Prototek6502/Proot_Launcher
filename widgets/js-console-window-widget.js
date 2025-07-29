(function() {
    // Remove previous instance if exists
    const old = document.getElementById('js-console-window-widget');
    if (old) old.remove();

    // Create widget DOM
    const widgetDiv = document.createElement('div');
    widgetDiv.id = 'js-console-window-widget';
    widgetDiv.className = 'widget js-console-window-widget';
    widgetDiv.style.position = 'absolute';
    widgetDiv.style.top = '180px';
    widgetDiv.style.left = '80px';
    widgetDiv.style.width = '340px';
    widgetDiv.style.minHeight = '48px';
    widgetDiv.style.background = 'var(--card-bg,#242c3c)';
    widgetDiv.style.color = 'var(--text,#eee)';
    widgetDiv.style.border = '2px solid var(--border,#3a4a6b)';
    widgetDiv.style.borderRadius = '10px';
    widgetDiv.style.boxShadow = '0 2px 12px rgba(0,0,0,0.18)';
    widgetDiv.style.zIndex = 1001;
    widgetDiv.style.userSelect = 'none';

    // Unique widget instance ID for console hook
    const instanceId = 'js-console-' + Math.random().toString(36).slice(2);

    widgetDiv.innerHTML = `
      <div class="js-console-window-header" style="
        display:flex;
        align-items:center;
        justify-content:space-between;
        padding:6px 11px 6px 11px;
        background: var(--btn-bg,#1c2331);
        border-top-left-radius:8px;
        border-top-right-radius:8px;
        cursor:move;
        font-size:1em;
        font-weight:500;
      ">
        <span style="font-size:1em;">🖥️ JS Console</span>
        <span style="display:flex;gap:6px;">
          <button id="${instanceId}-minimise" style="
            background:none;border:none;color:var(--text,#eee);font-size:1.1em;cursor:pointer;padding:0;" title="Minimize">
            <span id="${instanceId}-minimise-icon" style="display:inline-block;">&#8212;</span>
          </button>
          <button id="${instanceId}-close" style="
            background:none;border:none;color:var(--text,#eee);font-size:1.1em;cursor:pointer;margin-left:5px;padding:0;" title="Close">&times;</button>
        </span>
      </div>
      <div id="${instanceId}-body" style="padding:10px 9px;">
        <div id="${instanceId}-output" style="background:#222;color:#eee;height:70px;overflow-y:auto;padding:6px;border-radius:6px;font-size:0.95em;margin-bottom:0.6em;"></div>
        <form id="${instanceId}-form" style="display:flex;gap:0.5em;">
            <input id="${instanceId}-input" type="text" placeholder="Type JS..." autocomplete="off" style="flex:1;padding:5px;border-radius:4px;border:1px solid #555;background:#333;color:#fff;">
            <button type="submit" style="padding:5px 10px;border-radius:4px;border:none;background:#555;color:#fff;">Run</button>
        </form>
      </div>
    `;

    // Attach to widgets container if present
    const container = document.getElementById('widgets-container');
    if (container) {
        container.appendChild(widgetDiv);
    } else {
        document.body.appendChild(widgetDiv);
    }

    // JS Console logic
    const outputDiv = widgetDiv.querySelector(`#${instanceId}-output`);
    const form = widgetDiv.querySelector(`#${instanceId}-form`);
    const input = widgetDiv.querySelector(`#${instanceId}-input`);

    function printToConsole(type, msg) {
        const entry = document.createElement('div');
        entry.textContent = `[${type}] ${msg}`;
        entry.style.wordBreak = 'break-all';
        outputDiv.appendChild(entry);
        outputDiv.scrollTop = outputDiv.scrollHeight;
    }

    // Only hook once per session, but also tag output for this widget only
    if (!window._jsConsoleWidgetHooked) {
        window._jsConsoleWidgetHooked = [];
    }
    if (!window._jsConsoleWidgetHooked.includes(instanceId)) {
        window._jsConsoleWidgetHooked.push(instanceId);
        ['log', 'error', 'warn'].forEach(method => {
            const orig = console[method];
            console[method] = function(...args) {
                // Print to all open widgets
                document.querySelectorAll('.js-console-window-widget').forEach(wdiv => {
                    const od = wdiv.querySelector('div[id$="-output"]');
                    if (od) {
                        const entry = document.createElement('div');
                        entry.textContent = `[${method}] ${args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')}`;
                        entry.style.wordBreak = 'break-all';
                        od.appendChild(entry);
                        od.scrollTop = od.scrollHeight;
                    }
                });
                orig.apply(console, args);
            };
        });
    }

    // Run JS on submit
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const code = input.value;
        if (!code.trim()) return;
        printToConsole('input', code);
        try {
            let result;
            // Try as an expression first, fallback to statement
            try {
                result = Function('"use strict";return (' + code + ')')();
            } catch {
                result = Function('"use strict";' + code)();
            }
            printToConsole('result', typeof result === 'object' ? JSON.stringify(result) : String(result));
        } catch (err) {
            printToConsole('error', err.message);
        }
        input.value = '';
    });

    // Minimize logic
    let isMinimized = false;
    const bodyDiv = widgetDiv.querySelector(`#${instanceId}-body`);
    const minimiseBtn = widgetDiv.querySelector(`#${instanceId}-minimise`);
    const minimiseIcon = widgetDiv.querySelector(`#${instanceId}-minimise-icon`);
    minimiseBtn.onclick = function(e) {
        e.stopPropagation();
        isMinimized = !isMinimized;
        bodyDiv.style.display = isMinimized ? "none" : "";
        minimiseIcon.innerHTML = isMinimized ? "&#x25A1;" : "&#8212;";
    };

    // Close logic: disables the widget and reloads (removes from enabled list)
    widgetDiv.querySelector(`#${instanceId}-close`).onclick = function(e) {
        e.stopPropagation();
        // Remove this widget from enabled list and reload
        try {
            const WIDGETS_KEY = "launcher_widgets_enabled";
            let enabled = [];
            try {
                enabled = JSON.parse(localStorage.getItem(WIDGETS_KEY) || "[]");
            } catch {}
            const idx = enabled.indexOf("js-console-window-widget.js");
            if (idx > -1) {
                enabled.splice(idx, 1);
                localStorage.setItem(WIDGETS_KEY, JSON.stringify(enabled));
            }
        } catch {}
        widgetDiv.remove();
        window.location.reload();
    };

    // Drag logic
    let isDragging = false, dragOffsetX = 0, dragOffsetY = 0;
    const header = widgetDiv.querySelector('.js-console-window-header');

    header.addEventListener('mousedown', function(e) {
        if (e.target === minimiseBtn || e.target === widgetDiv.querySelector(`#${instanceId}-close`)) return;
        isDragging = true;
        dragOffsetX = e.clientX - widgetDiv.offsetLeft;
        dragOffsetY = e.clientY - widgetDiv.offsetTop;
        widgetDiv.style.transition = 'none';
        document.body.style.cursor = 'move';
        e.preventDefault();
    });

    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        let x = e.clientX - dragOffsetX;
        let y = e.clientY - dragOffsetY;
        x = Math.max(0, Math.min(window.innerWidth - widgetDiv.offsetWidth, x));
        y = Math.max(0, Math.min(window.innerHeight - widgetDiv.offsetHeight, y));
        widgetDiv.style.left = x + 'px';
        widgetDiv.style.top = y + 'px';
    });

    document.addEventListener('mouseup', function(e) {
        if (isDragging) {
            isDragging = false;
            widgetDiv.style.transition = '';
            document.body.style.cursor = '';
            savePos();
        }
    });

    // Touch support
    header.addEventListener('touchstart', function(e) {
        if (!e.touches[0] || e.target === minimiseBtn || e.target === widgetDiv.querySelector(`#${instanceId}-close`)) return;
        isDragging = true;
        dragOffsetX = e.touches[0].clientX - widgetDiv.offsetLeft;
        dragOffsetY = e.touches[0].clientY - widgetDiv.offsetTop;
        widgetDiv.style.transition = 'none';
        e.preventDefault();
    }, {passive: false});

    document.addEventListener('touchmove', function(e) {
        if (!isDragging || !e.touches[0]) return;
        let x = e.touches[0].clientX - dragOffsetX;
        let y = e.touches[0].clientY - dragOffsetY;
        x = Math.max(0, Math.min(window.innerWidth - widgetDiv.offsetWidth, x));
        y = Math.max(0, Math.min(window.innerHeight - widgetDiv.offsetHeight, y));
        widgetDiv.style.left = x + 'px';
        widgetDiv.style.top = y + 'px';
    }, {passive: false});

    document.addEventListener('touchend', function(e) {
        if (isDragging) {
            isDragging = false;
            widgetDiv.style.transition = '';
            savePos();
        }
    });

    // Save position in localStorage
    function savePos() {
        localStorage.setItem('js-console-window-pos', JSON.stringify({
            left: widgetDiv.style.left,
            top: widgetDiv.style.top
        }));
    }
    function loadPos() {
        try {
            const pos = JSON.parse(localStorage.getItem('js-console-window-pos') || '{}');
            if (pos.left) widgetDiv.style.left = pos.left;
            if (pos.top) widgetDiv.style.top = pos.top;
        } catch {}
    }
    loadPos();
})();