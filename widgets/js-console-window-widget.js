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
    widgetDiv.style.minHeight = '120px';
    widgetDiv.style.background = 'var(--card-bg,#242c3c)';
    widgetDiv.style.color = 'var(--text,#eee)';
    widgetDiv.style.border = '2px solid var(--border,#3a4a6b)';
    widgetDiv.style.borderRadius = '10px';
    widgetDiv.style.boxShadow = '0 2px 12px rgba(0,0,0,0.18)';
    widgetDiv.style.zIndex = 1001;
    widgetDiv.style.userSelect = 'none';

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
        <button id="js-console-window-close" style="
          background:none;
          border:none;
          color:var(--text,#eee);
          font-size:1.1em;
          cursor:pointer;
          margin-left:5px;
          padding:0;
        " title="Close">&times;</button>
      </div>
      <div id="js-console-window-body" style="
        padding:10px 9px;
      ">
        <div id="js-console-output" style="background:#222;color:#eee;height:70px;overflow-y:auto;padding:6px;border-radius:6px;font-size:0.95em;margin-bottom:0.6em;"></div>
        <form id="js-console-form" style="display:flex;gap:0.5em;">
            <input id="js-console-input" type="text" placeholder="Type JS..." autocomplete="off" style="flex:1;padding:5px;border-radius:4px;border:1px solid #555;background:#333;color:#fff;">
            <button type="submit" style="padding:5px 10px;border-radius:4px;border:none;background:#555;color:#fff;">Run</button>
        </form>
      </div>
    `;

    document.body.appendChild(widgetDiv);

    // JS Console logic
    const outputDiv = widgetDiv.querySelector('#js-console-output');
    const form = widgetDiv.querySelector('#js-console-form');
    const input = widgetDiv.querySelector('#js-console-input');

    function printToConsole(type, msg) {
        const entry = document.createElement('div');
        entry.textContent = `[${type}] ${msg}`;
        entry.style.wordBreak = 'break-all';
        outputDiv.appendChild(entry);
        outputDiv.scrollTop = outputDiv.scrollHeight;
    }

    // Hook console.* (once per session)
    if (!window._jsConsoleWidgetHooked) {
        window._jsConsoleWidgetHooked = true;
        ['log', 'error', 'warn'].forEach(method => {
            const orig = console[method];
            console[method] = function(...args) {
                printToConsole(method, args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
                orig.apply(console, args);
            };
        });
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const code = input.value;
        if (!code.trim()) return;
        printToConsole('input', code);
        try {
            let result = Function('"use strict";return (' + code + ')')();
            printToConsole('result', typeof result === 'object' ? JSON.stringify(result) : String(result));
        } catch (err) {
            printToConsole('error', err.message);
        }
        input.value = '';
    });

    // Close button
    widgetDiv.querySelector('#js-console-window-close').onclick = function() {
        widgetDiv.remove();
    };

    // Drag logic
    let isDragging = false, dragOffsetX = 0, dragOffsetY = 0;
    const header = widgetDiv.querySelector('.js-console-window-header');

    header.addEventListener('mousedown', function(e) {
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
        }
    });

    // Optional: touch support for mobile
    header.addEventListener('touchstart', function(e) {
        if (!e.touches[0]) return;
        isDragging = true;
        dragOffsetX = e.touches[0].clientX - widgetDiv.offsetLeft;
        dragOffsetY = e.touches[0].clientY - widgetDiv.offsetTop;
        widgetDiv.style.transition = 'none';
        e.preventDefault();
    }, {passive:false});
    document.addEventListener('touchmove', function(e) {
        if (!isDragging || !e.touches[0]) return;
        let x = e.touches[0].clientX - dragOffsetX;
        let y = e.touches[0].clientY - dragOffsetY;
        x = Math.max(0, Math.min(window.innerWidth - widgetDiv.offsetWidth, x));
        y = Math.max(0, Math.min(window.innerHeight - widgetDiv.offsetHeight, y));
        widgetDiv.style.left = x + 'px';
        widgetDiv.style.top = y + 'px';
    }, {passive:false});
    document.addEventListener('touchend', function(e) {
        if (isDragging) {
            isDragging = false;
            widgetDiv.style.transition = '';
        }
    });

    // Optional: Save position in localStorage
    let savePos = function() {
        localStorage.setItem('js-console-window-pos', JSON.stringify({
            left: widgetDiv.style.left,
            top: widgetDiv.style.top
        }));
    };
    let loadPos = function() {
        try {
            const pos = JSON.parse(localStorage.getItem('js-console-window-pos') || '{}');
            if (pos.left) widgetDiv.style.left = pos.left;
            if (pos.top) widgetDiv.style.top = pos.top;
        } catch {}
    };
    document.addEventListener('mouseup', savePos);
    document.addEventListener('touchend', savePos);
    loadPos();

})();