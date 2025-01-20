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

    console.log(stats);
    return stats;
}

window.addEventListener("load", () => {
    chrome.storage.sync.get("statmarker", (settings) => {
        if (settings.statmarker) {
            const observer = new MutationObserver(() => {
                observer.disconnect();

                styleMatchingElements();

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
        console.warn("Контейнер с классом '.content' не найден.");
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
            span.style.color = "#bdbdbd";
        }
    });
}

