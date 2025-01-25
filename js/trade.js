window.addEventListener("load", () => {

    // Рендер трейд-контейнера
    chrome.storage.sync.get("bookmarks", (settings) => {
        if (settings.bookmarks) {
            renderTradeContainer();
        }
    });


    // Компактная шапка
    chrome.storage.sync.get("minHeader", (settings) => {
        if (settings.minHeader) {
            document.querySelectorAll("#statusBar, .logo").forEach(element => {
                element.style.display = "none";
            });


            const headContainer = document.createElement("div");
            headContainer.classList.add("head-container");

            document.querySelector(".language-select")?.classList.add("lang-container");
            document.querySelector(".linkBack")?.classList.add("back-container");

            // Получаем окончание текущей ссылки
            const currentUrl = window.location.href;
            const urlEnding = currentUrl.split("pathofexile.com")[1]; // Берем часть URL после 'pathofexile.com'

            // Ищем элементы с классом language-select
            const languageSelectContainer = document.querySelector(".language-select");

            if (languageSelectContainer) {
                // Находим все ссылки внутри этого контейнера
                const links = languageSelectContainer.querySelectorAll("a");

                links.forEach(link => {
                    // Извлекаем текущую часть до 'pathofexile.com'
                    const baseUrl = link.href.split("pathofexile.com")[0];
                    // Формируем новую ссылку
                    const newUrl = `${baseUrl}pathofexile.com${urlEnding}`;
                    // Заменяем href элемента
                    link.href = newUrl;
                });
            }


            headContainer.append(
                document.querySelector(".linkBack"),
                document.querySelector(".language-select")
            );

            const parent = document.querySelector(".wrapper");
            parent?.prepend(headContainer);
        }
    });

    // Липкий поиск
    chrome.storage.sync.get("fixedHeader", (settings) => {
        if (settings.fixedHeader) {
            document.querySelector(".top")?.classList.add("top-container");
        }
    });
});

function renderTradeContainer() {
    fetch(chrome.runtime.getURL("view/trade-container.html"))
        .then(response => response.text())
        .then(html => {
            const body = document.body;
            if (!body) return;

            body.classList.add('trade-body');

            body.insertAdjacentHTML("afterbegin", html);
        })
        .catch(error => console.error("Ошибка при загрузке шаблона:", error));
}

