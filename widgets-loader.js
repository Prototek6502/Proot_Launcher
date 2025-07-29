(async function() {
    // Create or clear the widgets container
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
        return; // Abort if index file missing
    }

    // Get enabled widgets from localStorage, fallback to allWidgets if none enabled
    let enabled = [];
    try {
        enabled = JSON.parse(localStorage.getItem("launcher_widgets_enabled") || "[]");
    } catch {}
    if (!Array.isArray(enabled) || enabled.length === 0) enabled = allWidgets;

    // Load each enabled widget as a script
    for (const widgetFile of enabled) {
        if (!widgetFile.endsWith('.js')) continue; // Only JS files
        if (!allWidgets.includes(widgetFile)) continue; // Only allow valid widgets
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