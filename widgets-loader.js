// widgets-loader.js
(async function() {
    const allRes = await fetch('widgets/widgets-index.txt');
    const allWidgets = (await allRes.text())
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('#'));

    // Get enabled widgets from localStorage (fall back to all if not set)
    let enabled = [];
    try {
        enabled = JSON.parse(localStorage.getItem("launcher_widgets_enabled") || "[]");
    } catch {}
    if (!enabled.length) enabled = allWidgets; // default: all enabled

    // Find or create widgets container
    let container = document.getElementById('widgets-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'widgets-container';
        document.body.appendChild(container);
    }

    // Load only enabled widgets
    for (const widgetFile of enabled) {
        if (!widgetFile.endsWith('.js')) continue;
        const script = document.createElement('script');
        script.src = `widgets/${widgetFile}`;
        script.type = "text/javascript";
        script.defer = true;
        document.head.appendChild(script);
    }
})();