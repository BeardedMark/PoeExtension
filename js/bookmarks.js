window.addEventListener("load", () => {
    chrome.storage.sync.get("bookmarks", (settings) => {
        if (settings.bookmarks) {
            setupInterface();
        }
    });
});

function setupInterface() {
    fetch(chrome.runtime.getURL("view/bookmarks.html"))
        .then(response => response.text())
        .then(html => {
            const tradeBody = document.querySelector("#trade-body");

            if (tradeBody) {
                tradeBody.insertAdjacentHTML("afterbegin", html);

                updateButtons();
                updateFolders();
            }
        })
        .catch(error => console.error("Ошибка:", error));
}

function updateButtons() {
    const addFolder = document.querySelector("#folder-add")
    if (addFolder) addFolder.addEventListener("click", handleCreateFolder);

    const clearFolder = document.querySelector("#folder-clear");
    if (clearFolder) clearFolder.addEventListener("click", handleClearBookmarks);

    const importFolder = document.querySelector("#folder-input");
    if (importFolder) importFolder.addEventListener("click", handleImportBookmarks);

    const restoreFolder = document.querySelector("#folder-restore");
    if (restoreFolder) restoreFolder.addEventListener("click", handleRestoreBookmarks);

    const exportFolder = document.querySelector("#folder-export");
    if (exportFolder) exportFolder.addEventListener("click", handleExportBookmarks);

    const collapseFolders = document.querySelector("#folder-collapse");
    if (collapseFolders) collapseFolders.addEventListener("click", handleCollapseFolders);

    const expandFolders = document.querySelector("#folder-expand");
    if (expandFolders) expandFolders.addEventListener("click", handleExpandFolders);
}

function updateFolders() {
    chrome.storage.local.get("folders", ({ folders = [] }) => {
        const container = document.querySelector("#folders-container");
        container.innerHTML = "";

        folders.forEach((folder, folderIndex) => {
            const folderElement = createFolderWrapper(folder, folderIndex, folders);
            container.appendChild(folderElement);
        });
    });
}

// Interface

function createFolderWrapper(folder, folderIndex, folders) {
    const folderElement = document.createElement("div");
    folderElement.classList.add("tree-folder");

    const folderHeader = document.createElement("div");
    folderHeader.classList.add("tree-item");
    folderHeader.setAttribute("draggable", "true");

    folderHeader.addEventListener("dragstart", (event) => {
        event.dataTransfer.setData("folderIndex", folderIndex);
        event.dataTransfer.setData("type", "folder");
        folderElement.classList.add("dragstart");
    });

    folderHeader.addEventListener("dragover", (event) => {
        event.preventDefault();
        if (event.dataTransfer.getData("type") === "folder") {
            folderElement.classList.add("dragover");
        }
    });

    folderHeader.addEventListener("dragleave", (event) => {
        event.preventDefault();
        folderElement.classList.remove("dragover");
    });

    folderHeader.addEventListener("dragend", (event) => {
        event.preventDefault();
        folderElement.classList.remove("dragover");
        folderElement.classList.remove("dragstart");
    });

    folderHeader.addEventListener("drop", (event) => {
        event.preventDefault();
        const draggedFolderIndex = event.dataTransfer.getData("folderIndex");
        const draggedType = event.dataTransfer.getData("type");
    
        if (draggedType === "folder" && draggedFolderIndex !== folderIndex.toString()) {
            const draggedFolder = folders.splice(draggedFolderIndex, 1)[0];
            folders.splice(folderIndex, 0, draggedFolder);
    
            chrome.storage.local.get("folders", ({ folders: storedFolders }) => {
                const folderStates = {};
    
                if (storedFolders) {
                    storedFolders.forEach((folder) => {
                        folderStates[folder.id] = folder.isOpen;
                    });
                }
    
                folders.forEach((folder) => {
                    if (folderStates[folder.id] !== undefined) {
                        folder.isOpen = folderStates[folder.id];
                    }
                });
    
                chrome.storage.local.set({ folders }, updateFolders);
            });
        }
    });
    

    const folderIcon = document.createElement("img");
    folderIcon.classList.add("tree-item-icon");
    folderIcon.src = folder.isOpen
        ? "https://img.icons8.com/material/18/FFFFFF/opened-folder.png"
        : "https://img.icons8.com/material/18/FFFFFF/folder-invoices.png";
    folderIcon.alt = "folder-icon";
    folderIcon.width = 18;
    folderIcon.height = 18;

    const folderTitle = document.createElement("p");
    folderTitle.classList.add("tree-item-title", "cp-link");
    folderTitle.textContent = folder.name;

    const toolsContainer = document.createElement("div");
    toolsContainer.classList.add("tree-item-tools");

    toolsContainer.appendChild(createButton(
        "https://img.icons8.com/material/18/FFFFFF/export.png",
        "export",
        () => handleExportFolder(folderIndex)
    ));
    toolsContainer.appendChild(createButton(
        "https://img.icons8.com/material/18/FFFFFF/import.png",
        "import",
        () => handleImportFolder(folderIndex)
    ));
    toolsContainer.appendChild(createButton(
        "https://img.icons8.com/material/18/FFFFFF/restore-page.png",
        "restore-page",
        () => handleRestoreFolder(folderIndex)
    ));
    toolsContainer.appendChild(createButton(
        "https://img.icons8.com/material/18/FFFFFF/rename.png",
        "rename",
        () => handleRenameFolder(folderIndex)
    ));
    toolsContainer.appendChild(createButton(
        "https://img.icons8.com/material/18/FFFFFF/broom.png",
        "broom",
        () => handleClearFolder(folderIndex)
    ));
    toolsContainer.appendChild(createButton(
        "https://img.icons8.com/material/18/FFFFFF/delete-forever.png",
        "delete",
        () => handleDeleteFolder(folderIndex)
    ));
    toolsContainer.appendChild(createButton(
        "https://img.icons8.com/material/18/FFFFFF/plus-math--v1.png",
        "add-link",
        () => handleCreateLink(folderIndex)
    ));

    const linksContainer = document.createElement("div");
    linksContainer.classList.add("tree-list");
    linksContainer.style.display = folder.isOpen ? "flex" : "none";

    folder.links.forEach((link, linkIndex) => {
        const linkWrapper = createLinkWrapper(link.name, link.url, folderIndex, linkIndex);
        linksContainer.appendChild(linkWrapper);
    });

    folderHeader.addEventListener("click", () => {
        const isHidden = linksContainer.style.display === "none";
        linksContainer.style.display = isHidden ? "flex" : "none";
        folderIcon.src = isHidden
            ? "https://img.icons8.com/material/18/FFFFFF/opened-folder.png"
            : "https://img.icons8.com/material/18/FFFFFF/folder-invoices.png";

        chrome.storage.local.get("folders", ({ folders }) => {
            if (folders[folderIndex]) {
                folders[folderIndex].isOpen = isHidden;
                chrome.storage.local.set({ folders });
            }
        });
    });

    folderHeader.append(folderIcon, folderTitle, toolsContainer);
    folderElement.append(folderHeader, linksContainer);

    return folderElement;
}

function createLinkWrapper(title, url, folderIndex, index) {
    const linkWrapper = document.createElement("div");
    linkWrapper.classList.add("tree-item", "bookmarks-link");
    linkWrapper.setAttribute("draggable", "true");

    const linkElement = document.createElement("a");
    linkElement.href = url;
    linkElement.textContent = title;
    linkElement.classList.add("tree-item-title", "cp-link");

    const actionsWrapper = document.createElement("div");
    actionsWrapper.classList.add("tree-item-tools");

    actionsWrapper.appendChild(createButton("https://img.icons8.com/material/18/FFFFFF/share.png", "share", () => handleShareLink(url)));
    actionsWrapper.appendChild(createButton("https://img.icons8.com/material/18/FFFFFF/rename.png", "rename", () => handleRenameLink(folderIndex, index)));
    actionsWrapper.appendChild(createButton("https://img.icons8.com/material/18/FFFFFF/replace.png", "replace", () => handleReplaceLink(folderIndex, index)));
    actionsWrapper.appendChild(createButton("https://img.icons8.com/material/18/FFFFFF/delete-forever.png", "delete", () => handleDeleteLink(folderIndex, index)));
    actionsWrapper.appendChild(createButton("https://img.icons8.com/material/18/FFFFFF/external-link.png", "external-link", () => handleOpenExternalLink(url)));

    linkWrapper.addEventListener("dragstart", (event) => {
        event.dataTransfer.setData("draggedLinkIndex", index);
        event.dataTransfer.setData("type", "link");
        event.dataTransfer.setData("sourceFolderIndex", folderIndex);
        linkWrapper.classList.add("dragstart");
    });

    linkWrapper.addEventListener("dragover", (event) => {
        event.preventDefault();
        if (event.dataTransfer.getData("type") === "link") {
            linkWrapper.classList.add("dragover");
        }
        linkWrapper.classList.add("dragover");
    });

    linkWrapper.addEventListener("dragleave", (event) => {
        event.preventDefault();
        linkWrapper.classList.remove("dragover");
    });

    linkWrapper.addEventListener("dragend", (event) => {
        event.preventDefault();
        linkWrapper.classList.remove("dragover");
        linkWrapper.classList.remove("dragstart");
    });

    linkWrapper.addEventListener("drop", (event) => {
        event.preventDefault();
        linkWrapper.classList.remove("dragstart");
        const draggedLinkIndex = event.dataTransfer.getData("draggedLinkIndex");
        const sourceFolderIndex = event.dataTransfer.getData("sourceFolderIndex");
        const targetFolderIndex = folderIndex;

        if (sourceFolderIndex !== targetFolderIndex.toString() || draggedLinkIndex !== index.toString()) {
            chrome.storage.local.get("folders", ({ folders }) => {
                const sourceFolder = folders[sourceFolderIndex];
                const targetFolder = folders[targetFolderIndex];

                if (sourceFolder && targetFolder) {
                    const draggedLink = sourceFolder.links.splice(draggedLinkIndex, 1)[0];
                    targetFolder.links.splice(index, 0, draggedLink);
                    chrome.storage.local.set({ folders }, updateFolders);
                }
            });
        }
    });

    linkWrapper.append(linkElement, actionsWrapper);
    return linkWrapper;
}

function createButton(src, alt, handler) {
    const button = document.createElement("button");
    button.classList.add("cp-icon-opacity");

    const img = document.createElement("img");
    img.src = src;
    img.alt = alt;
    img.width = 18;
    img.height = 18;

    button.appendChild(img);
    button.addEventListener("click", (event) => {
        event.stopPropagation();
        handler();
    });

    return button;
}

// Actions

function handleClearBookmarks() {
    if (confirm("Удалить все/Delete all?")) {
        chrome.storage.local.set({ folders: [] }, updateFolders);
    }
}

function handleExportBookmarks() {
    chrome.storage.local.get("folders", ({ folders = [] }) => {
        const jsonData = JSON.stringify(folders, null, 2);
        const blob = new Blob([jsonData], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        // Формирование названия файла с текущей датой и временем
        const now = new Date();
        const dateString = now.toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
        const defaultFileName = `PoeTradeBookmarks_${dateString}`;

        // Запрашиваем имя файла у пользователя
        const userFileName = prompt("Введите имя файла для экспорта:", defaultFileName);

        // Если пользователь нажал "Отмена" или оставил поле пустым, использовать имя по умолчанию
        const fileName = userFileName ? userFileName.trim() : defaultFileName;

        // Создание и запуск скачивания
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    });
}

function handleImportBookmarks() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.addEventListener("change", handleFileSelect);
    input.click();

    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file || file.type !== "application/json") {
            alert("Пожалуйста, выберите файл в формате JSON.");
            return;
        }

        const reader = new FileReader();
        reader.onload = ({ target: { result } }) => {
            try {
                const importedLinks = JSON.parse(result);

                chrome.storage.local.get("folders", ({ folders = [] }) => {
                    const updatedLinks = [...folders, ...importedLinks];
                    chrome.storage.local.set({ folders: updatedLinks }, updateFolders);
                });
            } catch {
                alert("Ошибка при импорте файла. Убедитесь, что файл в правильном формате.");
            }
        };
        reader.readAsText(file);
    }
}

function handleRestoreBookmarks() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.addEventListener("change", handleFileSelect);
    input.click();

    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file || file.type !== "application/json") {
            alert("Пожалуйста, выберите файл в формате JSON.");
            return;
        }

        const reader = new FileReader();
        reader.onload = ({ target: { result } }) => {
            try {
                const importedLinks = JSON.parse(result);
                chrome.storage.local.set({ folders: importedLinks }, updateFolders);
            } catch {
                alert("Ошибка при импорте файла. Убедитесь, что файл в правильном формате.");
            }
        };
        reader.readAsText(file);
    }
}

function handleCreateFolder() {
    const name = prompt("Введите имя папки:");
    if (!name || name.trim() === "") return;

    chrome.storage.local.get("folders", ({ folders = [] }) => {
        folders.push({ name, links: [] });
        chrome.storage.local.set({ folders }, updateFolders);
    });
}

function handleCollapseFolders() {
    const folders = document.querySelectorAll('.tree-folder');
    folders.forEach((folder) => {
        const linksContainer = folder.querySelector('.tree-list');
        const folderIcon = folder.querySelector('.tree-item-icon');

        if (linksContainer && folderIcon) {
            linksContainer.style.display = 'none';
            folderIcon.src = 'https://img.icons8.com/material/18/FFFFFF/folder-invoices.png';
        }
    });

    chrome.storage.local.get('folders', ({ folders }) => {
        if (folders) {
            folders.forEach((folder) => {
                folder.isOpen = false;
            });
            chrome.storage.local.set({ folders });
        }
    });
}

function handleExpandFolders() {
    const folders = document.querySelectorAll('.tree-folder');
    folders.forEach((folder) => {
        const linksContainer = folder.querySelector('.tree-list');
        const folderIcon = folder.querySelector('.tree-item-icon');

        if (linksContainer && folderIcon) {
            linksContainer.style.display = 'flex';
            folderIcon.src = 'https://img.icons8.com/material/18/FFFFFF/opened-folder.png';
        }
    });

    chrome.storage.local.get('folders', ({ folders }) => {
        if (folders) {
            folders.forEach((folder) => {
                folder.isOpen = true;
            });
            chrome.storage.local.set({ folders });
        }
    });
}

function handleExportFolder(folderIndex) {
    chrome.storage.local.get("folders", ({ folders = [] }) => {
        if (!folders[folderIndex]) {
            alert("Папка не найдена.");
            return;
        }

        const folder = folders[folderIndex];
        const jsonData = JSON.stringify(folder.links, null, 2);
        const blob = new Blob([jsonData], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `${folder.name}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });
}

function handleImportFolder(folderIndex) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.addEventListener("change", handleFileSelect);
    input.click();

    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file || file.type !== "application/json") {
            alert("Пожалуйста, выберите файл в формате JSON.");
            return;
        }

        const reader = new FileReader();
        reader.onload = ({ target: { result } }) => {
            try {
                const importedLinks = JSON.parse(result);

                chrome.storage.local.get("folders", ({ folders = [] }) => {
                    if (!folders[folderIndex]) {
                        alert("Папка не найдена.");
                        return;
                    }

                    folders[folderIndex].links = [...folders[folderIndex].links, ...importedLinks];
                    chrome.storage.local.set({ folders }, updateFolders);
                });
            } catch {
                alert("Ошибка при импорте файла. Убедитесь, что файл в правильном формате.");
            }
        };
        reader.readAsText(file);
    }
}

function handleRestoreFolder(folderIndex) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.addEventListener("change", handleFileSelect);
    input.click();

    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file || file.type !== "application/json") {
            alert("Пожалуйста, выберите файл в формате JSON.");
            return;
        }

        const reader = new FileReader();
        reader.onload = ({ target: { result } }) => {
            try {
                const importedLinks = JSON.parse(result);

                chrome.storage.local.get("folders", ({ folders = [] }) => {
                    if (!folders[folderIndex]) {
                        alert("Папка не найдена.");
                        return;
                    }

                    folders[folderIndex].links = importedLinks;
                    chrome.storage.local.set({ folders }, updateFolders);
                });
            } catch {
                alert("Ошибка при импорте файла. Убедитесь, что файл в правильном формате.");
            }
        };
        reader.readAsText(file);
    }
}

function handleRenameFolder(folderIndex) {
    chrome.storage.local.get("folders", ({ folders = [] }) => {
        if (!folders[folderIndex]) {
            alert("Папка не найдена.");
            return;
        }

        const newFolderName = prompt("Введите новое имя папки:", folders[folderIndex].name);
        if (newFolderName && newFolderName.trim() !== "") {
            folders[folderIndex].name = newFolderName.trim();
            chrome.storage.local.set({ folders }, updateFolders);
        }
    });
}

function handleClearFolder(folderIndex) {
    chrome.storage.local.get("folders", ({ folders = [] }) => {
        if (!folders[folderIndex]) {
            alert("Папка не найдена.");
            return;
        }

        if (confirm(`Очистить папку "${folders[folderIndex].name}"?`)) {
            folders[folderIndex].links = [];
            chrome.storage.local.set({ folders }, updateFolders);
        }
    });
}

function handleDeleteFolder(folderIndex) {
    chrome.storage.local.get("folders", ({ folders = [] }) => {
        if (!folders[folderIndex]) {
            alert("Папка не найдена.");
            return;
        }

        if (confirm(`Удалить папку "${folders[folderIndex].name}"?`)) {
            folders.splice(folderIndex, 1);
            chrome.storage.local.set({ folders }, updateFolders);
        }
    });
}

function handleCreateLink(index) {
    const name = prompt("Введите имя ссылки:", document.title);
    if (!name) return;

    const url = window.location.href;
    chrome.storage.local.get("folders", ({ folders = [] }) => {
        if (!folders[index]) {
            alert("Папка не найдена.");
            return;
        }

        folders[index].links.push({ name, url });
        chrome.storage.local.set({ folders }, updateFolders);
    });
}

function handleShareLink(url) {
    navigator.clipboard.writeText(url)
        // .then(() => alert(`Ссылка на результат поиска скопирована`))
        .catch(() => alert("Не удалось скопировать ссылку."));
}

function handleRenameLink(folderIndex, linkIndex) {
    chrome.storage.local.get("folders", ({ folders = [] }) => {
        const currentName = folders[folderIndex]?.links[linkIndex]?.name || "";
        const newName = prompt("Введите новое имя ссылки:", currentName);

        if (!newName || newName.trim() === "") return;

        folders[folderIndex].links[linkIndex].name = newName.trim();
        chrome.storage.local.set({ folders }, updateFolders);
    });
}

function handleReplaceLink(folderIndex, linkIndex) {
    chrome.storage.local.get("folders", ({ folders = [] }) => {
        const currentUrl = window.location.href;
        const newUrl = prompt(`Введите новую ссылку/Enter new link:`, currentUrl);

        if (newUrl && newUrl.trim() !== "") {
            folders[folderIndex].links[linkIndex].url = newUrl.trim();
            chrome.storage.local.set({ folders }, updateFolders);
        }
    });
}

function handleDeleteLink(folderIndex, linkIndex) {
    chrome.storage.local.get("folders", ({ folders = [] }) => {
        const linkName = folders[folderIndex]?.links[linkIndex]?.name || "эту ссылку"; // Имя ссылки или дефолтный текст
        if (confirm(`Удалить ссылку "${linkName}"?`)) {
            folders[folderIndex].links.splice(linkIndex, 1);
            chrome.storage.local.set({ folders }, updateFolders);
        }
    });
}

function handleOpenExternalLink(url) {
    window.open(url, "_blank");
}