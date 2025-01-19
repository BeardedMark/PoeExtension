// Создаём контейнер с кнопками
function createButtonsContainer() {
    const buttonsContainer = document.createElement("div");
    buttonsContainer.classList.add("row-container");

    const saveButton = createButton("save.png", handleSaveButtonClick, "cp-btn-accent");
    const clearButton = createButton("clean.png", handleClearButtonClick, "cp-btn-prime");
    const exportButton = createButton("export.png", handleExportButtonClick, "cp-btn");
    const importButton = createButton("import.png", handleImportButtonClick, "cp-btn");

    buttonsContainer.appendChild(saveButton);
    buttonsContainer.appendChild(clearButton);
    buttonsContainer.appendChild(exportButton);
    buttonsContainer.appendChild(importButton);

    return buttonsContainer;
}

// Универсальная функция для создания кнопки
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

// Функция для обновления списка сохранённых ссылок
function updateLinks() {
    chrome.storage.local.get("savedLinks", (data) => {
        const links = data.savedLinks || [];
        linksContainer.innerHTML = ""; // Очищаем контейнер

        if (links.length === 0) {
            return;
        }

        // Если ссылки есть, создаём элементы
        links.forEach(({ title, url }, index) => {
            const linkWrapper = createLinkWrapper(title, url, index);
            if (linkWrapper) linksContainer.appendChild(linkWrapper);
        });
    });
}

// Функция для создания элемента ссылки
function createLinkWrapper(title, url, index) {
    const linkWrapper = document.createElement("div");
    linkWrapper.classList.add("link-wrapper");

    // Создаём ссылку
    const linkElement = document.createElement("a");
    linkElement.href = url;
    linkElement.textContent = title;
    linkElement.classList.add("cp-link");

    // Создаём кнопку для удаления
    const deleteButton = document.createElement("img");
    deleteButton.src = chrome.runtime.getURL("img/icons/delete.png");
    deleteButton.classList.add("cp-icon-opacity");

    // Обработчик для удаления ссылки
    deleteButton.addEventListener("click", () => {
        const confirmDelete = confirm(`Вы уверены, что хотите удалить ссылку: ${title}?`);
        if (confirmDelete) {
            chrome.storage.local.get("savedLinks", (data) => {
                const links = data.savedLinks || [];
                links.splice(index, 1);
                chrome.storage.local.set({ savedLinks: links }, () => {
                    updateLinks();
                });
            });
        }
    });

    linkWrapper.appendChild(linkElement);
    linkWrapper.appendChild(deleteButton);

    return linkWrapper;
}

// Обработчик клика на кнопку "Сохранить"
function handleSaveButtonClick() {
    const title = prompt("Введите имя для сохранённой ссылки:", document.title);
    if (title) {
        const url = window.location.href;

        chrome.storage.local.get("savedLinks", (data) => {
            const links = data.savedLinks || [];
            links.push({ title, url });
            chrome.storage.local.set({ savedLinks: links }, () => {
                updateLinks();
            });
        });
    }
}

// Обработчик клика на кнопку "Очистить"
function handleClearButtonClick() {
    const confirmClear = confirm("Вы уверены, что хотите очистить весь список?");
    if (confirmClear) {
        chrome.storage.local.set({ savedLinks: [] }, () => {
            updateLinks();
        });
    }
}

// Обработчик клика на кнопку "Экспорт"
function handleExportButtonClick() {
    chrome.storage.local.get("savedLinks", (data) => {
        const links = data.savedLinks || [];
        const jsonData = JSON.stringify(links, null, 2);

        const blob = new Blob([jsonData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "saved_links.json";
        a.click();
        URL.revokeObjectURL(url);
    });
}

// Обработчик клика на кнопку "Импорт"
function handleImportButtonClick() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.addEventListener("change", handleFileSelect);
    input.click();

    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (file && file.type === "application/json") {
            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const importedLinks = JSON.parse(e.target.result);
                    chrome.storage.local.set({ savedLinks: importedLinks }, () => {
                        updateLinks();
                    });
                } catch (err) {
                    alert("Ошибка при импорте файла. Убедитесь, что файл в правильном формате.");
                }
            };
            reader.readAsText(file);
        } else {
            alert("Пожалуйста, выберите файл в формате JSON.");
        }
    }
}