(function() {
    // Remove previous instance if exists
    const old = document.getElementById('js-usage-graph-widget');
    if (old) old.remove();

    // Create widget DOM
    const widgetDiv = document.createElement('div');
    widgetDiv.id = 'js-usage-graph-widget';
    widgetDiv.className = 'widget js-usage-graph-widget';
    widgetDiv.style.position = 'absolute';
    widgetDiv.style.top = '180px';
    widgetDiv.style.left = '80px';
    widgetDiv.style.width = '340px';
    widgetDiv.style.minHeight = '300px';
    widgetDiv.style.background = 'var(--card-bg,#242c3c)';
    widgetDiv.style.color = 'var(--text,#eee)';
    widgetDiv.style.border = '2px solid var(--border,#3a4a6b)';
    widgetDiv.style.borderRadius = '10px';
    widgetDiv.style.boxShadow = '0 2px 12px rgba(0,0,0,0.18)';
    widgetDiv.style.zIndex = 1001;
    widgetDiv.style.userSelect = 'none';

    // Unique widget instance ID for graph
    const instanceId = 'js-usage-graph-' + Math.random().toString(36).slice(2);

    widgetDiv.innerHTML = `
      <div class="js-usage-graph-header" style="
        display:flex;
        align-items:center;
        justify-content:space-between;
        padding:6px 11px;
        background: var(--btn-bg,#1c2331);
        border-top-left-radius:8px;
        border-top-right-radius:8px;
        cursor:move;
        font-size:1em;
        font-weight:500;
      ">
        <span style="font-size:1em;">CPU Usage Graph</span>
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
        <canvas id="${instanceId}-chart" width="320" height="200" style="width:100%; height:200px;"></canvas>
      </div>
    `;

    // Attach to widgets container if present
    const container = document.getElementById('widgets-container');
    if (container) {
        container.appendChild(widgetDiv);
    } else {
        document.body.appendChild(widgetDiv);
    }

    // Chart.js setup
    const ctx = widgetDiv.querySelector(`#${instanceId}-chart`).getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], // X-axis labels
            datasets: [{
                label: 'CPU Usage (%)',
                data: [], // Y-axis data
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 1,
                fill: true,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Usage'
                    },
                    min: 0,
                    max: 100
                }
            }
        }
    });

    // Function to update the graph with new data
    function updateGraph(label, value) {
        chart.data.labels.push(label);
        chart.data.datasets[0].data.push(value);
        chart.update();
    }

    // Function to simulate CPU usage retrieval
    // Function to simulate CPU usage retrieval
    function getCpuUsage() {
    // Get the number of logical processors
    const logicalProcessors = navigator.hardwareConcurrency || 1; // Default to 1 if not available
}

    // Update the graph every second with simulated CPU usage data
    setInterval(() => {
        const now = new Date().toLocaleTimeString();
        const cpuUsage = getCpuUsage(); // Get simulated CPU usage
        updateGraph(now, cpuUsage);
    }, 1000);

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
        widgetDiv.remove();
        window.location.reload();
    };

    // Drag logic
    let isDragging = false, dragOffsetX = 0, dragOffsetY = 0;
    const header = widgetDiv.querySelector('.js-usage-graph-header');

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
        localStorage.setItem('js-usage-graph-window-pos', JSON.stringify({
            left: widgetDiv.style.left,
            top: widgetDiv.style.top
        }));
    }
    function loadPos() {
        try {
            const pos = JSON.parse(localStorage.getItem('js-usage-graph-window-pos') || '{}');
            if (pos.left) widgetDiv.style.left = pos.left;
            if (pos.top) widgetDiv.style.top = pos.top;
        } catch {}
    }
    loadPos();
})();