const LINKS_KEY = "launcher_links";
const CSS_KEY = "launcher_external_css";
const THEME_KEY = "launcher_theme";

// --- Theme logic ---
function getTheme() {
    return localStorage.getItem(THEME_KEY) || "dark";
}
function setTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
    applyTheme();
}
function applyTheme() {
    const theme = getTheme();
    document.body.classList.remove("theme-dark", "theme-blue", "theme-forest");
    document.body.classList.add("theme-" + theme);
    document.getElementById("theme-select").value = theme;
}

// --- Data access ---
function getLinks() {
    return JSON.parse(localStorage.getItem(LINKS_KEY) || "[]");
}
function setLinks(links) {
    localStorage.setItem(LINKS_KEY, JSON.stringify(links));
}
function getExternalCSS() {
    return localStorage.getItem(CSS_KEY) || "";
}
function setExternalCSS(url) {
    if (url) {
        localStorage.setItem(CSS_KEY, url);
    } else {
        localStorage.removeItem(CSS_KEY);
    }
}

// --- Favicon helper ---
function getFaviconUrl(url) {
    try {
        const u = new URL(url);
        return u.origin + '/favicon.ico';
    } catch {
        return '';
    }
}

// --- Rendering ---
function renderLinks() {
    const list = document.getElementById('links-list');
    list.innerHTML = '';
    const links = getLinks();
    links.forEach((item, idx) => {
        const li = document.createElement('li');
        li.className = "link-item";
        li.draggable = true;
        li.dataset.index = idx;

        // Drag events
        li.addEventListener('dragstart', onDragStart);
        li.addEventListener('dragover', onDragOver);
        li.addEventListener('dragenter', onDragEnter);
        li.addEventListener('dragleave', onDragLeave);
        li.addEventListener('drop', onDrop);
        li.addEventListener('dragend', onDragEnd);

        // Image or favicon
        if (item.image) {
            const image = document.createElement('img');
            image.className = "link-image";
            image.src = item.image;
            image.alt = '';
            image.onerror = function() {
                this.style.display = "none";
            };
            li.appendChild(image);
        } else {
            const favicon = document.createElement('img');
            favicon.className = "link-favicon";
            favicon.src = getFaviconUrl(item.url);
            favicon.alt = '';
            favicon.onerror = function() {
                this.style.display = "none";
            };
            li.appendChild(favicon);
        }

        const a = document.createElement('a');
        a.className = "link-name";
        a.href = item.url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = item.name;
        li.appendChild(a);

        const btn = document.createElement('button');
        btn.className = "remove-btn";
        btn.textContent = "✕";
        btn.title = "Remove";
        btn.onclick = () => {
            removeLink(idx);
        };
        li.appendChild(btn);

        list.appendChild(li);
    });
}

// --- Add/remove ---
function addLink(name, url, image) {
    const links = getLinks();
    links.push({ name, url, image });
    setLinks(links);
    renderLinks();
}
function removeLink(idx) {
    const links = getLinks();
    links.splice(idx, 1);
    setLinks(links);
    renderLinks();
}

// --- Export/Import ---
function exportLinks() {
    const links = getLinks();
    const content = JSON.stringify(links, null, 2);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = "launcher_links.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}
function importLinksFromFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const links = JSON.parse(e.target.result);
            if (Array.isArray(links) && links.every(l => l.name && l.url)) {
                setLinks(links);
                renderLinks();
            } else {
                alert("Invalid file format.");
            }
        } catch (err) {
            alert("Failed to import. Make sure it's a valid launcher_links.txt file.");
        }
    };
    reader.readAsText(file);
}

// --- Modal logic (Add Link & Import CSS) ---
function openAddLinkModal() {
    document.getElementById('add-link-modal').style.display = "block";
    setTimeout(() => {
        document.getElementById('link-name').focus();
    }, 150);
}
function closeAddLinkModal() {
    document.getElementById('add-link-modal').style.display = "none";
    document.getElementById('add-link-form').reset();
    document.getElementById('link-image-file').value = '';
    document.getElementById('link-image-url').value = '';
}
function openImportCSSModal() {
    document.getElementById('import-css-modal').style.display = "block";
    document.getElementById('external-css-url').value = getExternalCSS();
}
function closeImportCSSModal() {
    document.getElementById('import-css-modal').style.display = "none";
    document.getElementById('import-css-form').reset();
}

document.getElementById('add-link-open-btn').addEventListener('click', openAddLinkModal);
document.getElementById('add-link-close-btn').addEventListener('click', closeAddLinkModal);
document.getElementById('import-css-open-btn').addEventListener('click', openImportCSSModal);
document.getElementById('import-css-close-btn').addEventListener('click', closeImportCSSModal);
window.onclick = function(event) {
    const modal1 = document.getElementById('add-link-modal');
    const modal2 = document.getElementById('import-css-modal');
    if (event.target === modal1) closeAddLinkModal();
    if (event.target === modal2) closeImportCSSModal();
};
window.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
        closeAddLinkModal();
        closeImportCSSModal();
        // Also close widgets modal
        document.getElementById('widgets-modal').style.display = "none";
    }
});

// --- Widget Modal Logic ---
const WIDGETS_KEY = "launcher_widgets_enabled";

// Utility: fetch all available widgets from index.txt
async function getAllWidgets() {
    // Prevent caching by adding a timestamp
    const res = await fetch('widgets/widgets-index.txt?' + Date.now());
    return (await res.text())
        .split('\n')
        .map(l => l.trim())
        .filter(l => l && !l.startsWith('#'));
}

// Utility: get enabled widget list from localStorage
function getEnabledWidgets() {
    let arr = [];
    try {
        arr = JSON.parse(localStorage.getItem(WIDGETS_KEY) || "[]");
    } catch {}
    return arr;
}

// Utility: save enabled widget list to localStorage
function setEnabledWidgets(arr) {
    localStorage.setItem(WIDGETS_KEY, JSON.stringify(arr));
}

// UI Logic for widgets button and modal
document.getElementById('widgets-navbar-btn').addEventListener('click', async function() {
    document.getElementById('widgets-modal').style.display = "block";

    const allWidgets = await getAllWidgets(); // always fresh
    const enabledWidgets = getEnabledWidgets();

    const ul = document.getElementById('widgets-list');
    ul.innerHTML = '';
    allWidgets.forEach(widget => {
        const li = document.createElement('li');
        li.style.marginBottom = '0.5em';

        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = widget;
        cb.checked = enabledWidgets.includes(widget);

        const label = document.createElement('label');
        label.textContent = widget;
        label.style.marginLeft = '0.5em';

        li.appendChild(cb);
        li.appendChild(label);
        ul.appendChild(li);
    });
});

document.getElementById('widgets-modal-close').addEventListener('click', function() {
    document.getElementById('widgets-modal').style.display = "none";
});

document.getElementById('widgets-save-btn').addEventListener('click', function() {
    const checks = Array.from(document.querySelectorAll('#widgets-list input[type="checkbox"]'));
    const enabled = checks.filter(cb => cb.checked).map(cb => cb.value);
    localStorage.setItem("launcher_widgets_enabled", JSON.stringify(enabled));
    window.location.reload();
});

document.getElementById('widgets-center-btn').addEventListener('click', function() {
    // List widget IDs you want to center
    const widgetIds = [
        'clock-window-widget',
        'js-console-window-widget',
        // Add more widget IDs here if needed
    ];

    widgetIds.forEach(function(id) {
        const widget = document.getElementById(id);
        if (widget) {
            // Calculate center position
            const width = widget.offsetWidth;
            const height = widget.offsetHeight;
            const left = Math.max(0, (window.innerWidth - width) / 2);
            const top = Math.max(0, (window.innerHeight - height) / 2);
            widget.style.left = left + 'px';
            widget.style.top = top + 'px';

            // Optionally, update position in localStorage so it persists
            const posKey = id === 'clock-window-widget'
                ? 'clock-window-pos'
                : id === 'js-console-window-widget'
                    ? 'js-console-window-pos'
                    : id + '-pos';
            localStorage.setItem(posKey, JSON.stringify({
                left: widget.style.left,
                top: widget.style.top
            }));
        }
    });
});


window.addEventListener('click', function(event) {
    const widgetsModal = document.getElementById('widgets-modal');
    if (event.target === widgetsModal) widgetsModal.style.display = "none";
});

// Optional: click outside modal to close (for widgets modal)
window.addEventListener('click', function(event) {
    const widgetsModal = document.getElementById('widgets-modal');
    if (event.target === widgetsModal) widgetsModal.style.display = "none";
});

// --- Add Link Form Handler ---
document.getElementById('add-link-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('link-name').value.trim();
    const url = document.getElementById('link-url').value.trim();
    const fileInput = document.getElementById('link-image-file');
    const imageUrlInput = document.getElementById('link-image-url');
    let imageData = "";

    if (fileInput.files && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        imageData = await new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = e2 => resolve(e2.target.result);
            reader.readAsDataURL(file);
        });
    } else if (imageUrlInput.value.trim()) {
        imageData = imageUrlInput.value.trim();
    }

    if (!name || !url) return;
    addLink(name, url, imageData);
    closeAddLinkModal();
});

// --- Theme dropdown ---
document.getElementById('theme-select').addEventListener('change', function(e) {
    setTheme(e.target.value);
});

// --- Import CSS Form Handler ---
document.getElementById('import-css-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const url = document.getElementById('external-css-url').value.trim();
    setExternalCSS(url);
    applyExternalCSS();
    closeImportCSSModal();
});
document.getElementById('remove-css-btn').addEventListener('click', function() {
    setExternalCSS('');
    applyExternalCSS();
    closeImportCSSModal();
});

// --- External CSS Logic ---
function applyExternalCSS() {
    const url = getExternalCSS();
    const linkElem = document.getElementById('external-css');
    if (url) {
        linkElem.href = url;
        linkElem.disabled = false;
    } else {
        linkElem.href = '';
        linkElem.disabled = true;
    }
}

// --- Export/Import ---
document.getElementById('export-btn').addEventListener('click', exportLinks);
document.getElementById('import-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    importLinksFromFile(file);
    this.value = ""; // reset for next import
});

// --- Drag and drop logic ---
let dragSrcIdx = null;
function onDragStart(e) {
    dragSrcIdx = Number(this.dataset.index);
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData('text/plain', dragSrcIdx);
}
function onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    return false;
}
function onDragEnter(e) {
    if (Number(this.dataset.index) !== dragSrcIdx) {
        this.classList.add('drag-over');
    }
}
function onDragLeave(e) {
    this.classList.remove('drag-over');
}
function onDrop(e) {
    e.stopPropagation();
    this.classList.remove('drag-over');
    const targetIdx = Number(this.dataset.index);
    if (dragSrcIdx === null || dragSrcIdx === targetIdx) return false;
    const links = getLinks();
    const [moved] = links.splice(dragSrcIdx, 1);
    links.splice(targetIdx, 0, moved);
    setLinks(links);
    renderLinks();
    return false;
}
function onDragEnd(e) {
    document.querySelectorAll('.link-item').forEach(item => {
        item.classList.remove('dragging','drag-over');
    });
    dragSrcIdx = null;
}

// --- Init ---
window.onload = function() {
    applyTheme();
    renderLinks();
    applyExternalCSS();
};

// --- Searchbar clear after submit (safe for themes/modals) ---
document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', function() {
            setTimeout(() => {
                searchInput.value = '';
            }, 100); // Let form submit and open new tab, then clear the input
        });
    }
});