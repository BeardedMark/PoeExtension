function checkAndRun(settingKey, callback) {
    chrome.storage.sync.get(settingKey, (settings) => {
        if (settings[settingKey]) {
            callback();
        }
    });
}

window.addEventListener("load", () => {
    checkAndRun("bookmarks", renderTradeContainer);
    checkAndRun("minHeader", applyCompactHeader);
    checkAndRun("fixedHeader", fixedSearchBar);

    updateLanguageSelectLinks();

    const observerTarget = document.body;

    if (observerTarget) {
        const observer = new MutationObserver(() => {
            observer.disconnect();
            checkAndRun("statmarker", styleMatchingElements);
            checkAndRun("cleanStat", createClaenStatButton);
            checkAndRun("charName", styleCharacterNames);
            checkAndRun("profileName", rearrangeDetailsElements);
            checkAndRun("propIcons", setUiIcons);
            checkAndRun("iconButton", replaceButtonIcons);
            checkAndRun("statRarity", () => {
                setStatRarity();
                applyShadowToImage();
            });
            checkAndRun("updateUi", () => {
                hideVerifiedStatus();
                removeItemNotes();
                transformPriceElement();
                styleInfoElements();
                setStyleButtons();
            });

            // updateDetailsStatusColors();
            observer.observe(observerTarget, { childList: true, subtree: true });
        });
        observer.observe(observerTarget, { childList: true, subtree: true });
    }
});

// Создание контейнера на сайте
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
