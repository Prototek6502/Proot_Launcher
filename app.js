const LINKS_KEY = "launcher_links";

// --- Data access ---
function getLinks() {
    return JSON.parse(localStorage.getItem(LINKS_KEY) || "[]");
}
function setLinks(links) {
    localStorage.setItem(LINKS_KEY, JSON.stringify(links));
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

        // Favicon
        const favicon = document.createElement('img');
        favicon.className = "link-favicon";
        favicon.src = getFaviconUrl(item.url);
        favicon.alt = '';
        favicon.onerror = function() {
            this.style.display = "none";
        };
        li.appendChild(favicon);

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
function addLink(name, url) {
    const links = getLinks();
    links.push({ name, url });
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

// --- Modal logic (popup for Add Link) ---
function openAddLinkModal() {
    document.getElementById('add-link-modal').style.display = "block";
    setTimeout(() => {
        document.getElementById('link-name').focus();
    }, 150);
}
function closeAddLinkModal() {
    document.getElementById('add-link-modal').style.display = "none";
    document.getElementById('add-link-form').reset();
}
document.getElementById('add-link-open-btn').addEventListener('click', openAddLinkModal);
document.getElementById('add-link-close-btn').addEventListener('click', closeAddLinkModal);
window.onclick = function(event) {
    const modal = document.getElementById('add-link-modal');
    if (event.target === modal) {
        closeAddLinkModal();
    }
};
window.addEventListener('keydown', function(event) {
    if (event.key === "Escape") closeAddLinkModal();
});
document.getElementById('add-link-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('link-name').value.trim();
    const url = document.getElementById('link-url').value.trim();
    if (!name || !url) return;
    addLink(name, url);
    closeAddLinkModal();
});
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
    // Rearrange links
    const links = getLinks();
    const [moved] = links.splice(dragSrcIdx, 1);
    links.splice(targetIdx, 0, moved);
    setLinks(links);
    renderLinks();
    return false;
}
function onDragEnd(e) {
    // Remove all drag-over and dragging classes
    document.querySelectorAll('.link-item').forEach(item => {
        item.classList.remove('dragging','drag-over');
    });
    dragSrcIdx = null;
}

// --- Init ---
window.onload = renderLinks;