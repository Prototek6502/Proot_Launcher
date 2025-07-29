(function() {
    // Remove previous instance if exists
    const old = document.getElementById('clock-widget-container');
    if (old) old.remove();

    const widgetDiv = document.createElement('div');
    widgetDiv.id = 'clock-widget-container';
    widgetDiv.className = 'widget clock-widget';
    widgetDiv.innerHTML = `<strong>Time:</strong> <span id="widget-clock"></span>`;
    document.getElementById('widgets-container').appendChild(widgetDiv);

    function updateClock() {
        widgetDiv.querySelector('#widget-clock').textContent =
            new Date().toLocaleTimeString();
    }
    updateClock();
    setInterval(updateClock, 1000);
})();