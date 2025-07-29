// widgets-loader.js
// Dynamically loads widgets listed in widgets/widgets-index.txt into #widgets-container

(async function() {
    // Path to widgets index
    const indexPath = 'widgets/widgets-index.txt';

    // Fetch the list of widgets
    let widgetList = [];
    try {
        const res = await fetch(indexPath);
        if (res.ok) {
            widgetList = (await res.text())
                .split('\n')
                .map(line => line.trim())
                .filter(line => line && !line.startsWith('#'));
        } else {
            console.error(`Failed to fetch ${indexPath}: ${res.statusText}`);
        }
    } catch (error) {
        console.error(`Error fetching widgets index:`, error);
    }

    // Find or create the widgets container
    let container = document.getElementById('widgets-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'widgets-container';
        document.body.appendChild(container);
    }

    // Dynamically load each widget JS file
    for (const widgetFile of widgetList) {
        // Only load .js files for security/convention
        if (!widgetFile.endsWith('.js')) continue;

        const script = document.createElement('script');
        script.src = `widgets/${widgetFile}`;
        script.type = "text/javascript";
        script.defer = true;

        // Attach the script to the document head for execution;
        // Widgets themselves should append their content to #widgets-container
        document.head.appendChild(script);
    }
})();