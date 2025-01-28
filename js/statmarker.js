// Обновление ссылок выбора языка
function fixedSearchBar() {
    document.querySelector(".top")?.classList.add("top-container");
}

// Обновление ссылок выбора языка
function updateLanguageSelectLinks() {
    const currentUrl = window.location.href;
    const urlEnding = currentUrl.split("pathofexile.com")[1];

    const languageSelectContainer = document.querySelector(".language-select");

    if (languageSelectContainer) {
        const links = languageSelectContainer.querySelectorAll("a");

        links.forEach(link => {
            const baseUrl = link.href.split("pathofexile.com")[0];
            const newUrl = `${baseUrl}pathofexile.com${urlEnding}`;
            link.href = newUrl;
        });
    }
}

// Применить компактную шапку сайта
function applyCompactHeader() {
    document.querySelectorAll("#statusBar, .logo").forEach(element => {
        element.style.display = "none";
    });

    const headContainer = document.createElement("div");
    headContainer.classList.add("head-container");

    document.querySelector(".language-select")?.classList.add("lang-container");
    document.querySelector(".linkBack")?.classList.add("back-container");

    headContainer.append(
        document.querySelector(".linkBack"),
        document.querySelector(".language-select")
    );

    const parent = document.querySelector(".wrapper");
    parent?.prepend(headContainer);
}

// Скрытие элементов с классом .verifiedStatus
function hideVerifiedStatus() {
    document.querySelectorAll(".verifiedStatus").forEach((element) => {
        element.style.display = "none";
    });
}

// Обновление цвета ссылок профилей в зависимости от статуса
function updateDetailsStatusColors() {
    document.querySelectorAll(".details").forEach((element) => {
        const profileLink = element.querySelector(".profile-link a");

        if (element.querySelector(".status-online")) {
            profileLink.style.color = "#43a567";
        } else if (element.querySelector(".status-away")) {
            profileLink.style.color = "#c45f00";
        } else if (element.querySelector(".status-offline")) {
            profileLink.style.color = "#d9534f";
        }

        element.querySelector(".status")?.remove();
    });
}

// Перемещение профиля выше кнопок
function rearrangeDetailsElements() {
    document.querySelectorAll(".details").forEach((element) => {
        const profile = element.querySelector(".profile-link");
        const btns = element.querySelector(".info");

        if (profile && btns && profile.nextElementSibling !== btns) {
            profile.style.padding = "5px 0";
            element.insertBefore(profile, btns);
        }
    });
}

// Стилизация и перемещение имени персонажа
function styleCharacterNames() {
    document.querySelectorAll(".details").forEach((element) => {
        if(element.querySelector(".status-offline")) return;
        const characterNameElement = element.querySelector(".character-name");
        const btns = element.querySelector(".info");
        const isUpdate = characterNameElement.getAttribute("data-is-update");

        if (characterNameElement && btns && !isUpdate) {
            characterNameElement.style.display = "block";
            characterNameElement.style.padding = "5px 0";

            characterNameElement.setAttribute("data-is-update", "true");
            element.insertBefore(characterNameElement, btns);
        }
    });
}

// Стилизация блока информации
function styleInfoElements() {
    document.querySelectorAll(".details").forEach((element) => {
        const info = element.querySelector(".info");

        if (info) {
            info.style.padding = "5px 0";
            info.style.margin = "0";
            info.style.color = "#a38d6d";
        }
    });
}


// Удаление Описания предметов
function removeItemNotes() {
    document.querySelectorAll(".textCurrency.itemNote").forEach((itemNote) => {
        const previousElement = itemNote.previousElementSibling;

        if (previousElement && previousElement.classList.contains("separator")) {
            previousElement.remove();
        }

        itemNote.remove();
    });
}

// Замена текста на иконки у кнопок действий
function replaceButtonIcons() {
    document.querySelectorAll(".direct-btn").forEach(element => {
        if (!element.querySelector("img")) {
            const img = document.createElement("img");
            img.src = "https://img.icons8.com/material/18/e9cf9f/sms--v1.png";
            img.width = 18;
            img.height = 18;

            element.innerHTML = "";
            element.appendChild(img);
        }
    });

    document.querySelectorAll(".ignore-btn").forEach(element => {
        if (!element.querySelector("img")) {
            const img = document.createElement("img");
            img.src = "https://img.icons8.com/material/18/ec7676/cancel-2.png";
            img.width = 18;
            img.height = 18;

            element.innerHTML = "";
            element.appendChild(img);
        }
    });
}


// Удаление обводки кнопок при фокусе
function setStyleButtons() {
    document.querySelectorAll("button").forEach(element => {
        element.style.outline = "none";
        element.classList.add("button-focus");
    });
}


function styleMatchingElements() {
    const searchContainer = document.querySelector(".search-advanced-pane.brown");
    const contentContainer = document.querySelector(".content");

    if (!searchContainer || !contentContainer) {
        return;
    }

    // Выбираем только элементы без класса "disabled"
    const searchStrings = Array.from(
        searchContainer.querySelectorAll(".filter:not(.disabled) .filter-title.filter-title-clickable")
    )
        .map(element => {
            const span = element.querySelector("span");
            return span ? span.textContent.trim() : null;
        })
        .filter(text => text !== null);

    const searchRegexes = searchStrings.map(string =>
        new RegExp(string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/#/g, "[-+]?\\d+"), "i")
    );

    contentContainer.querySelectorAll("span").forEach(span => {
        if (searchRegexes.some(regex => regex.test(span.textContent))) {
            span.style.color = "rgb(67, 165, 103)";
        }
    });
}



function setUiIcons() {
    const icons = {
        base_defence_percentile: chrome.runtime.getURL("img/poe/base_defence_percentile.png"),
        ar: chrome.runtime.getURL("img/poe/ar.png"),
        ev: chrome.runtime.getURL("img/poe/ev.png"),
        es: chrome.runtime.getURL("img/poe/es.png"),
        ward: chrome.runtime.getURL("img/poe/ward.png"),
        edps: chrome.runtime.getURL("img/poe/edps.png"),
        pdps: chrome.runtime.getURL("img/poe/pdps.png"),
        dps: chrome.runtime.getURL("img/poe/dps.png"),
    };

    // Функция для добавления иконки к элементу
    function addIconToElement(element, icon) {
        if (!icon || element.hasAttribute("data-icon-applied")) return; // Проверка на уже обработанный элемент

        const img = document.createElement("img");
        img.src = icon;
        img.alt = element.getAttribute("data-field");
        img.width = 28;
        img.height = 28;

        const innerSpan = element.querySelector("span");
        element.textContent = ""; // Очищаем содержимое
        element.style.padding = "5px";
        element.style.width = "auto";
        element.appendChild(img);

        if (innerSpan) {
            element.appendChild(innerSpan);
        }

        element.setAttribute("data-icon-applied", "true"); // Помечаем элемент как обработанный
    }

    // Обработка контейнеров
    document.querySelectorAll(".itemPopupAdditional").forEach((container) => {
        container.style.display = "flow";
        container.querySelectorAll("[data-field]").forEach((element) => {
            const field = element.getAttribute("data-field");
            addIconToElement(element, icons[field]); // Используем вспомогательную функцию
        });
    });

    // Скрываем элементы с классом 'invisible' (единожды)
    document.querySelectorAll(".invisible").forEach((element) => {
        if (!element.hasAttribute("data-hidden")) {
            element.style.display = "none";
            element.setAttribute("data-hidden", "true"); // Помечаем элемент как обработанный
        }
    });
}


function addCustomButtons() {
    addCustomButton("success-btn", "https://img.icons8.com/material/18/7f7f7f/ok--v1.png", (profileName) => {
        console.log(`Дизлайк: ${profileName}`);
    });
    addCustomButton("warning-btn", "https://img.icons8.com/material/18/7f7f7f/box-important--v1.png", (profileName) => {
        console.log(`Дизлайк: ${profileName}`);
    });
    addCustomButton("danger-btn", "https://img.icons8.com/material/18/7f7f7f/error--v1.png", (profileName) => {
        console.log(`Лайк: ${profileName}`);
    });
}

function addCustomButton(name, iconUrl, callbackFunction) {
    const buttonContainers = document.querySelectorAll(".btns");

    buttonContainers.forEach((container) => {
        if (container.querySelector("." + name)) return;

        const profileNameElement = container.closest(".details").querySelector(".profile-link");
        if (!profileNameElement) return;

        const profileName = profileNameElement.textContent.trim();

        const newButtonSpan = document.createElement("span");
        const newButton = document.createElement("button");
        newButton.className = `btn btn-xs btn-default ${name} button-focus`;
        newButton.style.outline = "none";

        const img = document.createElement("img");
        img.src = iconUrl;
        img.alt = name;
        img.width = 18;
        img.height = 18;
        img.style.verticalAlign = "middle";

        newButton.appendChild(img);
        newButton.addEventListener("click", () => {
            callbackFunction(profileName);
        });

        newButtonSpan.appendChild(newButton);

        const lastChild = container.lastElementChild;
        if (lastChild) {
            container.insertBefore(newButtonSpan, lastChild);
        } else {
            container.appendChild(newButtonSpan);
        }
    });
}

function transformPriceElement() {
    document.querySelectorAll(".price").forEach((element) => {
        const priceLabel = element.querySelector('.price-label');
        if (priceLabel) priceLabel.remove();

        const brElement = element.querySelector('br');
        if (brElement) brElement.remove();

        const currencyImage = element.querySelector('.currency-text img');
        currencyImage.style.height = "42px";
    });
}

// Удаление Описания предметов
function createClaenStatButton() {
    document.querySelectorAll(".filter.full-span").forEach((filterElement) => {
        // Проверяем, была ли кнопка уже добавлена
        if (!filterElement.querySelector(".clear-btn")) {
            // Найти последний <span>
            const lastSpan = filterElement.querySelector(".input-group-btn:last-child");

            if (lastSpan) {
                const clearSpan = document.createElement("span");
                clearSpan.className = "input-group-btn";

                const clearButton = document.createElement("button");
                clearButton.className = "btn clear-btn button-focus";
                clearButton.style.border = "none";
                clearButton.style.outline = "none";
                clearButton.style.marginRight = "4px";

                const img = document.createElement("img");
                img.src = "https://img.icons8.com/material/18/ffffff/broom.png";
                img.width = 18;
                img.height = 18;
                clearButton.appendChild(img);

                // Добавить обработчик событий на кнопку
                clearButton.addEventListener("click", () => {
                    const minInput = filterElement.querySelector('input[placeholder="мин"]');
                    const maxInput = filterElement.querySelector('input[placeholder="макс"]');

                    // Функция для эмуляции ввода символов
                    const emulateTyping = (inputElement) => {
                        if (!inputElement) return;

                        // Установить фокус на поле
                        inputElement.focus();

                        // Очистить значение символ за символом
                        inputElement.value = ""; // Полностью очищаем поле

                        // Эмитировать события ввода
                        const eventOptions = { bubbles: true, cancelable: true, key: "Backspace", code: "Backspace" };
                        inputElement.dispatchEvent(new KeyboardEvent("keydown", eventOptions));
                        inputElement.dispatchEvent(new KeyboardEvent("keypress", eventOptions));
                        inputElement.dispatchEvent(new KeyboardEvent("keyup", eventOptions));

                        // Уведомляем о завершении изменений
                        inputElement.dispatchEvent(new Event("input", { bubbles: true }));
                        inputElement.dispatchEvent(new Event("change", { bubbles: true }));
                    };

                    // Применяем очистку для полей
                    emulateTyping(minInput);
                    emulateTyping(maxInput);
                    clearButton.focus();
                });

                clearSpan.appendChild(clearButton);

                // Вставить новый <span> перед последним
                lastSpan.insertBefore(clearButton, lastSpan.querySelector(".remove-btn"));
            }
        }
    });


}