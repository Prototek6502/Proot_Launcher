(function() {
    // Remove previous instance if exists
    const old = document.getElementById('clock-window-widget');
    if (old) old.remove();

    // Create widget DOM
    const widgetDiv = document.createElement('div');
    widgetDiv.id = 'clock-window-widget';
    widgetDiv.className = 'widget clock-window-widget';
    widgetDiv.style.position = 'absolute';
    widgetDiv.style.top = '80px';
    widgetDiv.style.left = '80px';
    widgetDiv.style.width = '160px';
    widgetDiv.style.minHeight = '56px';
    widgetDiv.style.background = 'var(--card-bg,#242c3c)';
    widgetDiv.style.color = 'var(--text,#eee)';
    widgetDiv.style.border = '2px solid var(--border,#3a4a6b)';
    widgetDiv.style.borderRadius = '10px';
    widgetDiv.style.boxShadow = '0 2px 12px rgba(0,0,0,0.18)';
    widgetDiv.style.zIndex = 1000;
    widgetDiv.style.userSelect = 'none';

    // Header for dragging
    widgetDiv.innerHTML = `
      <div class="clock-window-header" style="
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
        <span style="font-size:1em;">🕒 Clock</span>
        <button id="clock-window-close" style="
          background:none;
          border:none;
          color:var(--text,#eee);
          font-size:1.1em;
          cursor:pointer;
          margin-left:5px;
          padding:0;
        " title="Close">&times;</button>
      </div>
      <div id="clock-window-body" style="
        padding:14px 12px;
        text-align:center;
        font-size:1.4em;
        letter-spacing:0.5px;
      ">
        <span id="clock-window-time"></span>
      </div>
    `;

    // Add to widgets container (absolute so append to body)
    document.body.appendChild(widgetDiv);

    // Update time every second
    function updateClock() {
        const now = new Date();
        widgetDiv.querySelector('#clock-window-time').textContent =
            now.toLocaleTimeString();
    }
    updateClock();
    setInterval(updateClock, 1000);

    // Close button
    widgetDiv.querySelector('#clock-window-close').onclick = function() {
        widgetDiv.remove();
    };

    // Drag logic
    let isDragging = false, dragOffsetX = 0, dragOffsetY = 0;
    const header = widgetDiv.querySelector('.clock-window-header');

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
        // Clamp within viewport
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

    // Optional: touch support for mobile devices
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
        localStorage.setItem('clock-window-pos', JSON.stringify({
            left: widgetDiv.style.left,
            top: widgetDiv.style.top
        }));
    };
    let loadPos = function() {
        try {
            const pos = JSON.parse(localStorage.getItem('clock-window-pos') || '{}');
            if (pos.left) widgetDiv.style.left = pos.left;
            if (pos.top) widgetDiv.style.top = pos.top;
        } catch {}
    };
    // Save position when drag ends
    document.addEventListener('mouseup', savePos);
    document.addEventListener('touchend', savePos);
    loadPos();

})();