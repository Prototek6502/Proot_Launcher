(async function() {
    let container = document.getElementById('widgets-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'widgets-container';
        document.body.appendChild(container);
    }
    const enabled = ["clock-window-widget.js"];
    for (const widgetFile of enabled) {
        const script = document.createElement('script');
        script.src = `widgets/${widgetFile}`;
        script.type = "text/javascript";
        document.body.appendChild(script);
    }
})();