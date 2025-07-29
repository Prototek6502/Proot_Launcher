(async function() {
    // Ensure a single container exists for widgets
    let container = document.getElementById('widgets-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'widgets-container';
        document.body.appendChild(container);
    } else {
        container.innerHTML = ''; // clear all widgets before loading!
    }

    // Load widgets list
    const allRes = await fetch('widgets/widgets-index.txt');
    const allWidgets = (await allRes.text())
        .split('\n')
        .map(l => l.trim())
        .filter(l => l && !l.startsWith('#'));

    let enabled = [];
    try {
        enabled = JSON.parse(localStorage.getItem("launcher_widgets_enabled") || "[]");
    } catch {}
    // If nothing is enabled, enable everything by default
    if (!enabled.length) enabled = allWidgets;

    // This block is duplicated above, can be removed for clarity
    // let container = document.getElementById('widgets-container');
    // if (!container) {
    //     container = document.createElement('div');
    //     container.id = 'widgets-container';
    //     document.body.appendChild(container);
    // } else {
    //     container.innerHTML = ''; // clear all widgets before loading!
    // }

    // Load each widget as a script
    for (const widgetFile of enabled) {
        if (!widgetFile.endsWith('.js')) continue;
        const script = document.createElement('script');
        script.src = `widgets/${widgetFile}`;
        script.type = "text/javascript";
        // Use async instead of defer so execution order is not blocked
        script.async = true;
        document.body.appendChild(script);
    }
})();