let linksContainer;

window.addEventListener("load", () => {

    chrome.storage.sync.get("fixedHeader", (settings) => {
        if (settings.fixedHeader) {
            document.querySelector(".top")?.classList.add("top-container");
        }
    });

    chrome.storage.sync.get("bookmarks", (settings) => {
        if (settings.bookmarks) {
            document.querySelectorAll("#statusBar, .logo").forEach(element => {
                element.style.display = "none";
            });
            setupInterface();
            updateLinks();
        }
    });
});

function setupInterface() {
    linksContainer = document.createElement("div");
    linksContainer.classList.add("row-container");

    const buttonsContainer = createButtonsContainer();
    const tradeContainer = document.createElement("div");
    tradeContainer.classList.add("trade-container");
    tradeContainer.append(buttonsContainer, linksContainer);

    const headContainer = document.createElement("div");
    headContainer.classList.add("head-container");

    document.querySelector(".language-select")?.classList.add("lang-container");
    document.querySelector(".linkBack")?.classList.add("back-container");

    headContainer.append(
        document.querySelector(".linkBack"),
        document.querySelector(".language-select")
    );

    const parent = document.querySelector(".wrapper");
    parent?.prepend(headContainer, tradeContainer);
}

function createButtonsContainer() {
    const buttonsContainer = document.createElement("div");
    buttonsContainer.classList.add("row-container");

    const buttons = [
        { icon: "save.png", handler: handleSaveButtonClick, class: "cp-btn-accent" },
        { icon: "clean.png", handler: handleClearButtonClick, class: "cp-btn-prime" },
        { icon: "export.png", handler: handleExportButtonClick, class: "cp-btn" },
        { icon: "import.png", handler: handleImportButtonClick, class: "cp-btn" }
    ];

    buttons.forEach(({ icon, handler, class: className }) => {
        const button = createButton(icon, handler, className);
        buttonsContainer.appendChild(button);
    });

    return buttonsContainer;
}

function createButton(iconName, onClick, className) {
    const button = document.createElement("button");
    button.classList.add(className);
    button.addEventListener("click", onClick);

    const icon = document.createElement("img");
    icon.src = chrome.runtime.getURL(`img/icons/${iconName}`);
    icon.classList.add("cp-icon");

    button.appendChild(icon);
    return button;
}

function updateLinks() {
    chrome.storage.local.get("savedLinks", ({ savedLinks = [] }) => {
        linksContainer.innerHTML = "";
        linksContainer.style.display = "flex";

        if (savedLinks.length === 0) {
            linksContainer.style.display = "none";
            return;
        }

        savedLinks.forEach(({ title, url }, index) => {
            const linkWrapper = createLinkWrapper(title, url, index);
            linksContainer.appendChild(linkWrapper);
        });
    });
}

function createLinkWrapper(title, url, index) {
    const linkWrapper = document.createElement("div");
    linkWrapper.classList.add("link-wrapper");

    const linkElement = document.createElement("a");
    linkElement.href = url;
    linkElement.textContent = title;
    linkElement.classList.add("cp-link");

    const deleteButton = document.createElement("img");
    deleteButton.src = chrome.runtime.getURL("img/icons/delete.png");
    deleteButton.classList.add("cp-icon-opacity");
    deleteButton.addEventListener("click", () => handleDeleteLink(title, index));

    linkWrapper.append(linkElement, deleteButton);
    return linkWrapper;
}

function handleDeleteLink(title, index) {
    if (!confirm(`Вы уверены, что хотите удалить ссылку: ${title}?`)) return;

    chrome.storage.local.get("savedLinks", ({ savedLinks = [] }) => {
        savedLinks.splice(index, 1);
        chrome.storage.local.set({ savedLinks }, updateLinks);
    });
}

function handleSaveButtonClick() {
    const title = prompt("Введите имя для сохранённой ссылки:", document.title);
    if (!title) return;

    const url = window.location.href;
    chrome.storage.local.get("savedLinks", ({ savedLinks = [] }) => {
        savedLinks.push({ title, url });
        chrome.storage.local.set({ savedLinks }, updateLinks);
    });
}

function handleClearButtonClick() {
    if (!confirm("Вы уверены, что хотите очистить весь список?")) return;

    chrome.storage.local.set({ savedLinks: [] }, updateLinks);
}

function handleExportButtonClick() {
    chrome.storage.local.get("savedLinks", ({ savedLinks = [] }) => {
        const jsonData = JSON.stringify(savedLinks, null, 2);
        const blob = new Blob([jsonData], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "saved_links.json";
        a.click();
        URL.revokeObjectURL(url);
    });
}

function handleImportButtonClick() {
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
                chrome.storage.local.set({ savedLinks: importedLinks }, updateLinks);
            } catch {
                alert("Ошибка при импорте файла. Убедитесь, что файл в правильном формате.");
            }
        };
        reader.readAsText(file);
    }
}
