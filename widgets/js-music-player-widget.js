(function() {
    // Remove previous instance if exists
    const old = document.getElementById('js-music-player-widget');
    if (old) old.remove();

    // Create widget DOM
    const widgetDiv = document.createElement('div');
    widgetDiv.id = 'js-music-player-widget';
    widgetDiv.className = 'widget js-music-player-widget';
    widgetDiv.style.position = 'absolute';
    widgetDiv.style.top = '180px';
    widgetDiv.style.left = '80px';
    widgetDiv.style.width = '340px';
    widgetDiv.style.minHeight = '200px';
    widgetDiv.style.background = 'var(--card-bg,#242c3c)';
    widgetDiv.style.color = 'var(--text,#eee)';
    widgetDiv.style.border = '2px solid var(--border,#3a4a6b)';
    widgetDiv.style.borderRadius = '10px';
    widgetDiv.style.boxShadow = '0 2px 12px rgba(0,0,0,0.18)';
    widgetDiv.style.zIndex = 1001;
    widgetDiv.style.userSelect = 'none';
    widgetDiv.style.padding = '10px';

    widgetDiv.innerHTML = `
      <div class="js-music-player-header" style="
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
        <span style="font-size:1em;">Music Player</span>
        <button id="js-music-player-close" style="
            background:none;border:none;color:var(--text,#eee);font-size:1.1em;cursor:pointer;padding:0;" title="Close">&times;</button>
      </div>
      <input type="file" id="js-music-file-input" accept="audio/*" style="margin: 10px 0;"/>
      <audio id="js-music-audio" controls style="width: 100%;"></audio>
    `;

    // Attach to widgets container if present
    const container = document.getElementById('widgets-container');
    if (container) {
        container.appendChild(widgetDiv);
    } else {
        document.body.appendChild(widgetDiv);
    }

    // Get references to the audio element and file input
    const audioElement = document.getElementById('js-music-audio');
    const fileInput = document.getElementById('js-music-file-input');

    // Handle file selection
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const fileURL = URL.createObjectURL(file);
            audioElement.src = fileURL;
            audioElement.play(); // Automatically play the selected audio
        }
    });

    // Close logic
    document.getElementById('js-music-player-close').onclick = function(e) {
        e.stopPropagation();
        widgetDiv.remove();
    };

    // Drag logic
    let isDragging = false, dragOffsetX = 0, dragOffsetY = 0;
    const header = widgetDiv.querySelector('.js-music-player-header');

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
})();