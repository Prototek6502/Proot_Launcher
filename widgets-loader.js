(async function() {
    // Fetch all widgets from index
    const allRes = await fetch('widgets/widgets-index.txt');
    const allWidgets = (await allRes.text())
        .split('\n')
        .map(l => l.trim())
        .filter(l => l && !l.startsWith('#'));

    // Get enabled widgets from localStorage (fallback to all if not set)
    let enabled = [];
    try {
        enabled = JSON.parse(localStorage.getItem("launcher_widgets_enabled") || "[]");
    } catch {}
    if (!enabled.length) enabled = allWidgets;

    // Find or create widgets container
    let container = document.getElementById('widgets-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'widgets-container';
        document.body.appendChild(container);
    }

    // Remove all child widget nodes before loading new widgets
    container.innerHTML = '';

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