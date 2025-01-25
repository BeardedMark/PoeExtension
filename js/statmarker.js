function getStats() {
    const container = document.querySelector(".search-advanced-pane.brown");
    if (!container) {
        return [];
    }

    const elements = container.querySelectorAll(".filter-title.filter-title-clickable");

    const stats = Array.from(elements)
        .map(element => {
            const span = element.querySelector("span");
            return span ? span.textContent.trim() : null;
        })
        .filter(text => text !== null);
    ;
    return stats;
}

window.addEventListener("load", () => {
    chrome.storage.sync.get("statmarker", (settings) => {
        if (settings.statmarker) {
            const observer = new MutationObserver(() => {
                observer.disconnect();

                styleMatchingElements();

                // Удаление обводки
                document.querySelectorAll("button").forEach(element => {
                    element.style.outline = "none";
                    element.classList.add("button-focus");
                });

                // Замена кнопок
                document.querySelectorAll(".direct-btn").forEach(element => {
                    const img = document.createElement("img");
                    img.src = "https://img.icons8.com/material/18/e9cf9f/sms--v1.png";
                    img.width = 18;
                    img.height = 18;
                    
                    element.innerHTML = "";
                    element.appendChild(img);
                });

                document.querySelectorAll(".ignore-btn").forEach(element => {
                    const img = document.createElement("img");
                    img.src = "https://img.icons8.com/material/18/ec7676/cancel-2.png";
                    img.width = 18;
                    img.height = 18;
                    
                    element.innerHTML = "";
                    element.appendChild(img);
                });

                observer.observe(document.body, { childList: true, subtree: true });
            });

            observer.observe(document.body, { childList: true, subtree: true });

            styleMatchingElements();
        }
    });
});

function styleMatchingElements() {
    const searchStrings = getStats();

    const container = document.querySelector(".content");
    if (!container) {
        return;
    }

    const spans = container.querySelectorAll("span");

    const searchRegexes = searchStrings.map(string => {
        const escapedString = string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/#/g, "[-+]?\\d+");
        return new RegExp(escapedString, "i");
    });

    spans.forEach(span => {
        const spanText = span.textContent;

        const hasMatch = searchRegexes.some(regex => regex.test(spanText));

        if (hasMatch) {
            span.style.color = "rgb(67, 165, 103)";
        }
    });
}

