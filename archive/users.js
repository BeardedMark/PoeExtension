
function addRatingButtons() {
    const rating = 5;

    // Находим все элементы с классом "profile-link"
    const profileLinks = document.querySelectorAll(".profile-link");

    profileLinks.forEach(profileLink => {
        // Извлекаем имя пользователя
        const userName = profileLink.textContent.trim();
        profileLink.classList.add("user-container");

        // Создаем кнопку "+"
        const plusButton = document.createElement("button");
        plusButton.textContent = "+";
        plusButton.classList.add("cp-icon-opacity");

        // Создаем кнопку "-"
        const minusButton = document.createElement("button");
        minusButton.textContent = "−";
        minusButton.classList.add("cp-icon-opacity");

        // Создаем элемент для отображения текущего рейтинга
        const ratingDisplay = document.createElement("span");
        ratingDisplay.textContent = "0"; // По умолчанию рейтинг равен 0
        ratingDisplay.style.fontWeight = "bold";

        // Функция для обновления отображаемого рейтинга
        function updateRatingDisplay() {
            chrome.storage.local.get("userRatings", (data) => {
                const ratings = data.userRatings || {};
                const currentRating = ratings[userName] || 0;
                ratingDisplay.textContent = currentRating;
            });
        }

        // Обработчик для кнопки "+"
        plusButton.addEventListener("click", () => {
            chrome.storage.local.get("userRatings", (data) => {
                const ratings = data.userRatings || {};
                const currentRating = ratings[userName] || 0;

                if (currentRating < rating) { // Проверяем, не превышает ли текущий рейтинг максимум
                    ratings[userName] = currentRating + 1;
                    chrome.storage.local.set({ userRatings: ratings }, () => {
                        console.log(`Рейтинг пользователя ${userName} увеличен: ${ratings[userName]}`);
                        updateRatingDisplay();
                    });
                } else {
                    console.log(`Рейтинг пользователя ${userName} уже достиг максимума (${MAX_RATING}).`);
                }
            });
        });

        // Обработчик для кнопки "-"
        minusButton.addEventListener("click", () => {
            chrome.storage.local.get("userRatings", (data) => {
                const ratings = data.userRatings || {};
                const currentRating = ratings[userName] || 0;

                if (currentRating > (rating * -1)) { // Проверяем, не меньше ли текущий рейтинг минимума
                    ratings[userName] = currentRating - 1;
                    chrome.storage.local.set({ userRatings: ratings }, () => {
                        console.log(`Рейтинг пользователя ${userName} уменьшен: ${ratings[userName]}`);
                        updateRatingDisplay();
                    });
                } else {
                    console.log(`Рейтинг пользователя ${userName} уже достиг минимума (${MIN_RATING}).`);
                }
            });
        });

        // Проверяем и обновляем рейтинг при загрузке
        updateRatingDisplay();

        // Добавляем кнопки и рейтинг после элемента <span>
        profileLink.appendChild(minusButton);
        profileLink.appendChild(ratingDisplay);
        profileLink.appendChild(plusButton);
    });
}


window.addEventListener("load", () => {
    // Вызываем функцию для добавления кнопок
    addRatingButtons();

    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            observer.disconnect();
            addRatingButtons();
            observer.observe(document.body, { childList: true, subtree: true });
        }
    });

    // Наблюдаем за изменениями в `body`:
    observer.observe(document.body, { childList: true, subtree: true });

});
