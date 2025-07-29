(async function() {
    // Ensure a single container exists for widgets
    let container = document.getElementById('widgets-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'widgets-container';
        document.body.appendChild(container);
    } else {
        container.innerHTML = '';
    }

    // Load widgets list from index file
    let allWidgets = [];
    try {
        const allRes = await fetch('widgets/widgets-index.txt');
        if (!allRes.ok) throw new Error("Index file not found");
        allWidgets = (await allRes.text())
            .split('\n')
            .map(l => l.trim())
            .filter(l => l && !l.startsWith('#') && l.endsWith('.js'));
    } catch (err) {
        console.error("Cannot load widgets-index.txt:", err);
        return;
    }

    // Get enabled widgets
    let enabled = [];
    try {
        enabled = JSON.parse(localStorage.getItem("launcher_widgets_enabled") || "[]");
    } catch {}
    if (!Array.isArray(enabled) || enabled.length === 0) enabled = allWidgets;

    // Only load widgets that are both enabled and present in index
    for (const widgetFile of enabled) {
        if (!allWidgets.includes(widgetFile)) continue;
        const script = document.createElement('script');
        script.src = `widgets/${widgetFile}`;
        script.type = "text/javascript";
        script.async = true;
        script.onerror = () => {
            console.error(`Widget ${widgetFile} failed to load.`);
        };
        document.body.appendChild(script);
    }
})();