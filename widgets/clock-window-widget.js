(function() {
    // Remove previous instance if exists
    const old = document.getElementById('clock-window-widget');
    if (old) old.remove();

    // Create widget DOM
    const widgetDiv = document.createElement('div');
    widgetDiv.id = 'clock-window-widget';
    widgetDiv.className = 'widget clock-window-widget';
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

    // HTML
    widgetDiv.innerHTML = `
      <div class="clock-window-header" style="
        display:flex;align-items:center;justify-content:space-between;
        padding:6px 11px 6px 11px;
        background:var(--btn-bg,#1c2331);
        border-top-left-radius:8px;
        border-top-right-radius:8px;
        cursor:move;font-size:1em;font-weight:500;
      ">
        <span style="font-size:1em;">Clock</span>
        <span style="display:flex;gap:6px;">
          <button id="clock-window-minimise" style="
            background:none;border:none;color:var(--text,#eee);font-size:1.1em;cursor:pointer;padding:0;" title="Minimize">
            <span id="clock-window-minimise-icon" style="display:inline-block;">&#8212;</span>
          </button>
          <button id="clock-window-close" style="
            background:none;border:none;color:var(--text,#eee);font-size:1.1em;cursor:pointer;margin-left:5px;padding:0;" title="Close">&times;</button>
        </span>
      </div>
      <div id="clock-window-body" style="
        padding:14px 12px;text-align:center;font-size:1.4em;letter-spacing:0.5px;
      ">
        <span id="clock-window-time"></span>
      </div>
    `;

    // Attach to widgets container if present
    const container = document.getElementById('widgets-container');
    if (container) {
        container.appendChild(widgetDiv);
    } else {
        document.body.appendChild(widgetDiv);
    }

    // Live clock logic
    function updateClock() {
        const now = new Date();
        widgetDiv.querySelector('#clock-window-time').textContent =
            now.toLocaleTimeString();
    }
    updateClock();
    let timer = setInterval(updateClock, 1000);

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
            const idx = enabled.indexOf("clock-window-widget.js");
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
    const header = widgetDiv.querySelector('.clock-window-header');

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
        localStorage.setItem('clock-window-pos', JSON.stringify({
            left: widgetDiv.style.left,
            top: widgetDiv.style.top
        }));
    }
    function loadPos() {
        try {
            const pos = JSON.parse(localStorage.getItem('clock-window-pos') || '{}');
            if (pos.left) widgetDiv.style.left = pos.left;
            if (pos.top) widgetDiv.style.top = pos.top;
        } catch {}
    }
    loadPos();
})();
