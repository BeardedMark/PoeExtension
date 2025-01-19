let linksContainer;

window.addEventListener("load", () => {
    // Скрываем лишнее
    document.querySelectorAll("#statusBar, .logo").forEach(element => {
        element.style.display = "none";
    });

    // Липкий поиск
    const top = document.querySelector(".top");
    top.classList.add("top-container");
});

window.addEventListener("load", () => {
    // Создаём контейнер для ссылок
    linksContainer = document.createElement("div");
    linksContainer.classList.add("row-container");

    // Создаём кнопки и контейнеры
    const buttonsContainer = createButtonsContainer();

    const tradeContainer = document.createElement("div");
    tradeContainer.classList.add("trade-container");

    tradeContainer.appendChild(buttonsContainer);
    tradeContainer.appendChild(linksContainer);

    const headContainer = document.createElement("div");
    headContainer.classList.add("head-container");

    const langContainer = document.querySelector(".language-select");
    langContainer.classList.add("lang-container");

    const backContainer = document.querySelector(".linkBack");
    backContainer.classList.add("back-container");

    headContainer.append(backContainer);
    headContainer.append(langContainer);

    const parent = document.querySelector(".wrapper");
    
    parent.prepend(tradeContainer);
    parent.prepend(headContainer);

    // Обновляем список ссылок
    updateLinks();
});
