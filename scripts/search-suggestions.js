let proxyurl;
document.addEventListener("DOMContentLoaded", () => {
    const userProxyInput = document.getElementById("userproxy");
    const saveProxyButton = document.getElementById("saveproxy");
    const savedProxy = localStorage.getItem("proxy");

    const defaultProxyURL = "https://mynt-proxy.rhythmcorehq.com/proxy?url=";

    if (savedProxy && savedProxy !== defaultProxyURL) {
        userProxyInput.value = savedProxy;
    }

    userProxyInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            saveProxyButton.click();
        }
    });

    saveProxyButton.addEventListener("click", () => {
        proxyurl = userProxyInput.value.trim();

        if (proxyurl === "") {
            proxyurl = defaultProxyURL;
        } else {

            if (!(proxyurl.startsWith("http://") || proxyurl.startsWith("https://"))) {
                proxyurl = "https://" + proxyurl;
            }
        }

        localStorage.setItem("proxy", proxyurl);
        userProxyInput.value = "";
        location.reload();
    });

    proxyurl = savedProxy || defaultProxyURL;
});

let lastInteractionBy = null;
let originalSearchText = "";
const resultBox = document.getElementById("resultBox");

function showResultBox() {
    resultBox.classList.add("show");
    resultBox.style.display = "block";
}

function hideResultBox() {
    resultBox.classList.remove("show");

}

showResultBox();
hideResultBox();

searchInput.addEventListener("input", async function () {
    const searchsuggestionscheckbox = document.getElementById("searchsuggestionscheckbox");
    if (searchsuggestionscheckbox.checked) {
        const query = this.value;

        originalSearchText = query;

        if (query.length > 0) {
            try {

                const suggestions = await getAutocompleteSuggestions(query);

                if (!suggestions?.length) {
                    hideResultBox();
                } else {

                    resultBox.innerHTML = "";

                    suggestions.forEach((suggestion, index) => {
                        const resultItem = document.createElement("div");
                        resultItem.classList.add("resultItem");
                        resultItem.textContent = suggestion;
                        resultItem.setAttribute("data-index", index);

                        resultItem.onclick = () => {
                            performSearch(suggestion);
                        };

                        resultItem.addEventListener("mouseenter", () => {

                            const currentlyActive = resultBox.querySelector(".active");
                            if (currentlyActive) currentlyActive.classList.remove("active");

                            resultItem.classList.add("active");
                            lastInteractionBy = "mouse";
                        });

                        resultBox.appendChild(resultItem);
                    });

                    const dropdown = document.querySelector(".dropdown-content");

                    if (dropdown.style.display === "block") {
                        dropdown.style.display = "none";
                    }
                    showResultBox();
                }
            } catch (error) {

            }
        } else {
            hideResultBox();
        }
    }
});

searchInput.addEventListener("keydown", function (e) {
    const activeItem = resultBox.querySelector(".active");
    let currentIndex = activeItem ? parseInt(activeItem.getAttribute("data-index")) : -1;

    if (resultBox.children.length > 0 && resultBox.classList.contains("show")) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            lastInteractionBy = "keyboard";

            if (activeItem) {
                activeItem.classList.remove("active");
            }

            if (e.key === "ArrowDown") {
                currentIndex = (currentIndex + 1) % resultBox.children.length;
            } else {
                currentIndex = (currentIndex - 1 + resultBox.children.length) % resultBox.children.length;
            }

            resultBox.children[currentIndex].classList.add("active");

            const activeElement = resultBox.children[currentIndex];
            activeElement.scrollIntoView({ behavior: "smooth", block: "nearest" });

            const suggestionText = activeElement.textContent;
            this.value = suggestionText;

        } else if ((e.key === "ArrowRight" || e.key === "Tab") && activeItem && lastInteractionBy === "mouse") {

            const cursorAtEnd = this.selectionStart === this.value.length;

            if (cursorAtEnd) {
                e.preventDefault();
                const suggestionText = activeItem.textContent;
                this.value = suggestionText;
            }

        } else if (e.key === "Enter") {
            e.preventDefault();
            if (activeItem) {

                activeItem.click();

            } else {

                performSearch(this.value);
            }

        } else if (e.key === "Escape") {
            e.preventDefault();

            this.value = originalSearchText;

            if (activeItem) {
                activeItem.classList.remove("active");
            }
        }
    } else if (e.key === "Enter") {

        e.preventDefault();
        performSearch(this.value);
    }
});

function getClientParam() {
    if (isFirefox) return "firefox";
    if (isOpera) return "opera";
    if (isChromiumBased) return "chrome";
    if (isSafari) return "safari";
    return "firefox";
}

let lastRedditRequestTime = 0;

async function getAutocompleteSuggestions(query) {
    const clientParam = getClientParam();
    var selectedOption = document.querySelector('input[name="search-engine"]:checked').value;

    const now = Date.now();
    if (selectedOption === "engine7") {
        if (now - lastRedditRequestTime < 1000) {
            return [];
        }
        lastRedditRequestTime = now;
    }

    const searchSuggestionsAPI = {
        engine0: `https://duckduckgo.com/ac/?q=${encodeURIComponent(query)}&type=list`,
        engine1: `https://www.google.com/complete/search?client=${clientParam}&q=${encodeURIComponent(query)}`,
        engine2: `https://duckduckgo.com/ac/?q=${encodeURIComponent(query)}&type=list`,
        engine4: `https://search.brave.com/api/suggest?q=${encodeURIComponent(query)}&rich=true&source=web`,
        engine5: `https://www.google.com/complete/search?client=${clientParam}&ds=yt&q=${encodeURIComponent(query)}`,
        engine7: `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=relevance&limit=15`,
        engine8: `https://${languageCode}.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&format=json`
    };

    const useproxyCheckbox = document.getElementById("useproxyCheckbox");
    let apiUrl = searchSuggestionsAPI[selectedOption] || searchSuggestionsAPI["engine1"];
    if (useproxyCheckbox.checked && selectedOption !== "engine7") {
        apiUrl = proxyurl + encodeURIComponent(apiUrl);
    }

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (selectedOption === "engine4") {
            const suggestions = data[1].map(item => {
                if (item.is_entity) {
                    return `${item.q} - ${item.name} (${item.category ? item.category : "No category"})`;
                } else {
                    return item.q;
                }
            });
            return suggestions;

        } else if (selectedOption === "engine7") {
            const suggestions = [];
            if (data && data.data && data.data.children) {
                data.data.children.forEach(post => {
                    if (post.data && post.data.title) {
                        const subreddit = post.data.subreddit_name_prefixed;
                        suggestions.push(`${post.data.title} (${subreddit})`);
                    }
                });
            }
            return suggestions;

        } else {
            return data[1];
        }
    } catch (error) {
        console.error("Error fetching autocomplete suggestions:", error);
        return [];
    }
}

document.addEventListener("click", function (event) {
    if (!searchbar.contains(event.target)) {
        hideResultBox();
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const searchsuggestionscheckbox = document.getElementById("searchsuggestionscheckbox");
    const proxybypassField = document.getElementById("proxybypassField");
    const proxyinputField = document.getElementById("proxyField");
    const useproxyCheckbox = document.getElementById("useproxyCheckbox");
    const searchSuggestionsHeader = document.getElementById("searchSuggestionsHeader");
    const proxyOptions = document.querySelector(".proxyOptions");

    async function showProxyDisclaimer() {
        const message = translations[currentLanguage]?.ProxyDisclaimer || translations["en"].ProxyDisclaimer;
        return await confirmPrompt(message, agreeText, cancelText);
    }

    async function requestHostPermissions() {
        if (!globalThis.chrome?.permissions?.request)
            return false;

        return new Promise((resolve) => {
            globalThis.chrome.permissions.request({
                origins: [
                    "https://www.google.com/complete/search?client=*",
                    "https://duckduckgo.com/ac/?q=*",
                    "https://search.brave.com/api/suggest?q=*",
                    "https://*.wikipedia.org/w/api.php?action=opensearch&search=*"
                ]
            }, (granted) => {
                resolve(granted);
            });
        });
    }

    function applySearchSuggestionsState(enabled) {
        proxyOptions.classList.toggle("not-applicable", !enabled);
        proxybypassField.classList.toggle("inactive", !enabled);

        if (!enabled) {
            useproxyCheckbox.checked = false;
            saveCheckboxState("useproxyCheckboxState", useproxyCheckbox);
            proxyinputField.classList.add("inactive");
            saveActiveStatus("proxyinputField", "inactive");
            setTimeout(() => searchSuggestionsHeader.style.borderBottom = "none", 80);
        } else
            searchSuggestionsHeader.style.borderBottom = "";
    }

    searchsuggestionscheckbox.addEventListener("change", async function () {
        saveCheckboxState("searchsuggestionscheckboxState", searchsuggestionscheckbox);

        const enabled = searchsuggestionscheckbox.checked;
        applySearchSuggestionsState(enabled);

        if (enabled && !isFirefoxAll) {
            await requestHostPermissions();
        }
    });

    useproxyCheckbox.addEventListener("change", async function () {
        if (useproxyCheckbox.checked) {

            const userConfirmed = await showProxyDisclaimer();
            if (userConfirmed) {

                saveCheckboxState("useproxyCheckboxState", useproxyCheckbox);
                proxyinputField.classList.remove("inactive");
                saveActiveStatus("proxyinputField", "active");
            } else {

                useproxyCheckbox.checked = false;
            }
        } else {

            saveCheckboxState("useproxyCheckboxState", useproxyCheckbox);
            proxyinputField.classList.add("inactive");
            saveActiveStatus("proxyinputField", "inactive");
        }
    });

    loadCheckboxState("searchsuggestionscheckboxState", searchsuggestionscheckbox);
    loadCheckboxState("useproxyCheckboxState", useproxyCheckbox);
    loadActiveStatus("proxyinputField", proxyinputField);
    loadActiveStatus("proxybypassField", proxybypassField);
    applySearchSuggestionsState(searchsuggestionscheckbox.checked);
});
