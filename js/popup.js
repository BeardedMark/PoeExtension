chrome.storage.sync.get(null, items => {
    console.log("Все данные в settings:", items);
    Object.entries(items).forEach(([key, value]) => console.log(`Ключ: ${key}, Значение:`, value));
});

document.addEventListener("DOMContentLoaded", () => {
    const clearStorageButton = document.getElementById("clearStorage");
    const exportStorageButton = document.getElementById("exportStorage");
    const importStorageButton = document.getElementById("importStorage");
    const importFileInput = document.getElementById("importFile");

    const saveCheckboxState = checkbox => {
        const key = checkbox.id || checkbox.name;
        const value = checkbox.checked;
        chrome.storage.sync.set({ [key]: value }, () => console.log(`Сохранено: ${key} = ${value}`));
    };

    const restoreCheckboxStates = () => {
        chrome.storage.sync.get(null, items => {
            document.querySelectorAll(".checkbox-options").forEach(checkbox => {
                const key = checkbox.id || checkbox.name;
                if (items[key] !== undefined) checkbox.checked = items[key];
            });
        });
    };

    document.querySelectorAll(".checkbox-options").forEach(checkbox => {
        checkbox.addEventListener("change", () => saveCheckboxState(checkbox));
    });

    restoreCheckboxStates();

    clearStorageButton.addEventListener("click", () => {
        if (confirm("Вы уверены, что хотите очистить localStorage?")) {
            chrome.storage.local.clear(() => alert("LocalStorage очищен."));
        }
    });

    exportStorageButton.addEventListener("click", () => {
        chrome.storage.local.get(null, items => {
            const jsonData = JSON.stringify(items, null, 2);
            const blob = new Blob([jsonData], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const downloadLink = document.createElement("a");
            downloadLink.href = url;
            downloadLink.download = "localStorage_backup.json";
            downloadLink.click();
            URL.revokeObjectURL(url);
        });
    });

    importStorageButton.addEventListener("click", () => importFileInput.click());

    importFileInput.addEventListener("change", event => {
        const file = event.target.files[0];
        if (file && file.type === "application/json") {
            const reader = new FileReader();
            reader.onload = e => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    chrome.storage.local.set(importedData, () => {
                        alert("Данные импортированы.");
                    });
                } catch {
                    alert("Ошибка при импорте файла. Проверьте формат JSON.");
                }
            };
            reader.readAsText(file);
        } else {
            alert("Пожалуйста, выберите файл формата JSON.");
        }
    });
});
