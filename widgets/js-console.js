// JS Console Widget
(function() {
    // Create widget container
    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'widget js-console-widget';
    widgetDiv.style.maxWidth = '400px';
    widgetDiv.style.padding = '1em';

    // HTML for widget
    widgetDiv.innerHTML = `
        <strong>JS Console</strong>
        <div id="js-console-output" style="background:#222;color:#eee;height:120px;overflow-y:auto;padding:6px;border-radius:6px;font-size:0.9em;margin-bottom:0.5em;"></div>
        <form id="js-console-form" style="display:flex;gap:0.5em;">
            <input id="js-console-input" type="text" placeholder="Type JS..." autocomplete="off" style="flex:1;padding:5px;border-radius:4px;border:1px solid #555;background:#333;color:#fff;">
            <button type="submit" style="padding:5px 10px;border-radius:4px;border:none;background:#555;color:#fff;">Run</button>
        </form>
    `;

    // Add to widgets container
    document.getElementById('widgets-container').appendChild(widgetDiv);

    // Elements
    const outputDiv = widgetDiv.querySelector('#js-console-output');
    const form = widgetDiv.querySelector('#js-console-form');
    const input = widgetDiv.querySelector('#js-console-input');

    // Helper to print output
    function printToConsole(type, msg) {
        const entry = document.createElement('div');
        entry.textContent = `[${type}] ${msg}`;
        entry.style.wordBreak = 'break-all';
        outputDiv.appendChild(entry);
        outputDiv.scrollTop = outputDiv.scrollHeight;
    }

    // Intercept console.log/error/warn
    if (!window._jsConsoleWidgetHooked) {
        window._jsConsoleWidgetHooked = true;
        ['log', 'error', 'warn'].forEach(method => {
            const orig = console[method];
            console[method] = function(...args) {
                printToConsole(method, args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
                orig.apply(console, args);
            };
        });
    }

    // Evaluate JS on submit
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const code = input.value;
        if (!code.trim()) return;
        printToConsole('input', code);
        try {
            // Use Function constructor for better scoping
            let result = Function('"use strict";return (' + code + ')')();
            printToConsole('result', typeof result === 'object' ? JSON.stringify(result) : String(result));
        } catch (err) {
            printToConsole('error', err.message);
        }
        input.value = '';
    });
})();