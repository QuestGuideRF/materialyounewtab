const searchbar = document.getElementById("searchbar");
const searchInput = document.getElementById("searchQ");
const languageCode = (localStorage.getItem("selectedLanguage") || "ru").slice(0, 2);
const searchQueryURLs = {
    engine1: "https://www.google.com/search?q=",
    engine2: "https://duckduckgo.com/?q=",
    engine3: "https://bing.com/?q=",
    engine4: "https://search.brave.com/search?q=",
    engine5: "https://www.youtube.com/results?search_query=",
    engine6: "https://www.google.com/search?tbm=isch&q=",
    engine7: "https://www.reddit.com/search/?q=",
    engine8: "https://en.wikipedia.org/wiki/Special:Search?search=",
    engine9: "https://www.quora.com/search?q="
};
searchbar.addEventListener("click", function (event) {
    event.stopPropagation();
    searchbar.classList.add("active");
    if (!event.target.closest(".dropdown-btn")) {
        searchInput.focus();
    }
});
document.addEventListener("click", function (event) {
    if (!searchbar.contains(event.target)) {
        searchbar.classList.remove("active");
    }
});
const searchWith = document.getElementById("searchWithHint");
const searchEngines = document.querySelectorAll(".searchEnginesContainer .search-engine");
const searchEnginesContainer = document.querySelector(".searchEnginesContainer");
let activeSearchMode = localStorage.getItem("activeSearchMode") || "search-with";
searchWith.addEventListener("click", function (event) {
    activeSearchMode = (activeSearchMode === "search-with") ? "search-on" : "search-with";
    searchEnginesContainer.classList.toggle("show");
    toggleSearchEngines(activeSearchMode);
    event.stopPropagation();
    searchInput.focus();
    searchbar.classList.add("active");
    setTimeout(() => {
        searchEnginesContainer.classList.remove("show");
    }, 300);
});
function toggleSearchEngines(category) {
    const defaultItems = {
        "search-with": "engine0",
        "search-on": "engine5",
    };
    const checkeditem = localStorage.getItem(`selectedSearchEngine-${category}`) || defaultItems[category];
    const searchModeName = category === "search-with" ? "searchWithHint" : "searchOnHint";
    searchWith.innerText = translations[currentLanguage][searchModeName] || translations["en"][searchModeName];
    searchEngines.forEach(engine => {
        if (engine.getAttribute("data-category") === category) {
            engine.style.display = "flex";
        } else {
            engine.style.display = "none";
        }
        if (engine.lastElementChild.value === checkeditem) {
            const radioBtn = engine.querySelector('input[type="radio"]');
            radioBtn.checked = true;
            radioBtn.dispatchEvent(new Event("change"));
        }
    });
}
const dropdown = document.querySelector(".dropdown-content");
dropdown.addEventListener("click", (event) => {
    if (dropdown.classList.contains("show")) {
        event.stopPropagation();
        dropdown.classList.remove("show");
        searchInput.focus();
    }
});
document.addEventListener("click", (event) => {
    if (dropdown.classList.contains("show")) {
        event.stopPropagation();
        dropdown.classList.remove("show");
    }
});
document.querySelector(".dropdown-btn").addEventListener("click", function () {
    const resultBox = document.getElementById("resultBox");
    if (resultBox.classList.toString().includes("show")) return;
    dropdownItems.forEach(item => item.classList.remove("selected"));
    selectedIndex = -1;
    dropdown.classList.toggle("show");
});
const enterBTN = document.getElementById("enterBtn");
const searchEngineRadio = document.getElementsByName("search-engine");
const searchDropdowns = document.querySelectorAll('[id$="-dropdown"]:not(*[data-default])');
const defaultEngine = document.querySelector('#default-dropdown-item div[id$="-dropdown"]');
const sortDropdown = () => {
    const elements = Array.from(searchDropdowns);
    const sortedDropdowns = elements.sort((a, b) => {
        const engineA = parseInt(a.getAttribute("data-engine"), 10);
        const engineB = parseInt(b.getAttribute("data-engine"), 10);
        return engineA - engineB;
    })
    const parent = sortedDropdowns[0]?.parentNode;
    if (parent) {
        sortedDropdowns.forEach(item => parent.appendChild(item));
    }
}
searchDropdowns.forEach(element => {
    element.addEventListener("click", () => {
        const engine = element.getAttribute("data-engine");
        const radioButton = document.querySelector(`input[type="radio"][value="engine${engine}"]`);
        const selector = `*[data-engine-name=${element.getAttribute("data-engine-name")}]`;
        radioButton.checked = true;
        swapDropdown(selector);
        sortDropdown()
        localStorage.setItem(`selectedSearchEngine-${radioButton.parentElement.dataset.category}`, radioButton.value);
        localStorage.setItem(`activeSearchMode`, radioButton.parentElement.dataset.category);
    });
});
document.querySelectorAll(".search-engine").forEach((engineDiv) => {
    engineDiv.addEventListener("click", (event) => {
        event.stopPropagation();
        const radioButton = engineDiv.querySelector('input[type="radio"]');
        radioButton.checked = true;
        const radioButtonValue = radioButton.value.charAt(radioButton.value.length - 1);
        const selector = `[data-engine="${radioButtonValue}"]`;
        swapDropdown(selector);
        sortDropdown();
        localStorage.setItem(`selectedSearchEngine-${radioButton.parentElement.dataset.category}`, radioButton.value);
        localStorage.setItem(`activeSearchMode`, radioButton.parentElement.dataset.category);
        searchInput.focus();
        searchbar.classList.add("active");
    });
});
function swapDropdown(selectedElement) {
    const element = document.querySelector(selectedElement);
    const tempHTML = defaultEngine.innerHTML;
    defaultEngine.innerHTML = element.innerHTML;
    element.innerHTML = tempHTML;
    ["data-engine", "data-engine-name", "id"].forEach(attr => {
        const tempAttr = defaultEngine.getAttribute(attr);
        defaultEngine.setAttribute(attr, element.getAttribute(attr));
        element.setAttribute(attr, tempAttr);
    });
}
function performSearch(query) {
    const selectedOption = document.querySelector('input[name="search-engine"]:checked').value;
    const searchTerm = query || searchInput.value;
    if (searchTerm !== "") {
        if (selectedOption === "engine0") {
            try {
                if (isFirefox) {
                    browser.search.query({ text: searchTerm });
                } else {
                    chrome.search.query({ text: searchTerm });
                }
            } catch (error) {
                var fallbackUrl = searchQueryURLs.engine1 + encodeURIComponent(searchTerm);
                window.location.href = fallbackUrl;
            }
        } else {
            var searchUrl = searchQueryURLs[selectedOption] + encodeURIComponent(searchTerm);
            window.location.href = searchUrl;
        }
    }
}
enterBTN.addEventListener("click", () => performSearch());
const storedSearchEngine = localStorage.getItem(`selectedSearchEngine-${activeSearchMode}`);
toggleSearchEngines(activeSearchMode);
if (storedSearchEngine) {
    const storedSearchEngineSN = storedSearchEngine.charAt(storedSearchEngine.length - 1);
    const defaultDropdownSN = document.querySelector("*[data-default]").getAttribute("data-engine");
    if (storedSearchEngineSN !== defaultDropdownSN) {
        const selector = `*[data-engine="${storedSearchEngineSN}"]`;
        swapDropdown(selector);
        sortDropdown();
    }
    const selectedRadioButton = document.querySelector(`input[name="search-engine"][value="${storedSearchEngine}"]`);
    if (selectedRadioButton) {
        selectedRadioButton.checked = true;
    }
}
const dropdownItems = document.querySelectorAll(".dropdown-item:not(*[data-default])");
let selectedIndex = -1;
function updateSelection() {
    dropdownItems.forEach((item, index) => {
        item.addEventListener("mouseenter", () => {
            item.classList.add("selected");
        })
        item.addEventListener("mouseleave", () => {
            item.classList.remove("selected");
        })
        if (index === selectedIndex) {
            item.focus()
            item.classList.add("selected");
        } else {
            item.focus()
            item.classList.remove("selected");
        }
    });
}
document.querySelector(".dropdown").addEventListener("keydown", function (event) {
    if (dropdown.classList.contains("show")) {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            selectedIndex = (selectedIndex + 1) % dropdownItems.length;
            const activeElement = dropdownItems[selectedIndex];
            activeElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            selectedIndex = (selectedIndex - 1 + dropdownItems.length) % dropdownItems.length;
            const activeElement = dropdownItems[selectedIndex];
            activeElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
        } else if (event.key === "Enter") {
            const selectedItem = document.querySelector(".dropdown-content .selected");
            if (!selectedItem) return;
            const engine = selectedItem.getAttribute("data-engine");
            const radioButton = document.querySelector(`input[type="radio"][value="engine${engine}"]`);
            radioButton.checked = true;
            swapDropdown(`*[data-engine="${engine}"]`);
            sortDropdown();
            localStorage.setItem("selectedSearchEngine", radioButton.value);
            dropdown.classList.remove("show");
            searchInput.focus();
        }
        updateSelection();
    }
});
updateSelection();
searchEngineRadio.forEach((radio) => {
    radio.addEventListener("change", () => {
        const selectedOption = document.querySelector('input[name="search-engine"]:checked');
        localStorage.setItem(`selectedSearchEngine-${selectedOption.parentElement.dataset.category}`, selectedOption.value);
        localStorage.setItem(`activeSearchMode`, selectedOption.parentElement.dataset.category);
    });
});
const searchIconContainer = document.querySelectorAll(".searchIcon");
const showEngineContainer = () => {
    searchIconContainer[1].style.display = "none";
    searchIconContainer[0].style.display = "block";
    document.getElementById("search-with-container").style.visibility = "visible";
}
const hideEngineContainer = () => {
    searchIconContainer[0].style.display = "none";
    searchIconContainer[1].style.display = "block";
    document.getElementById("search-with-container").style.visibility = "hidden";
}
const initShortCutSwitch = (element) => {
    if (element.checked) {
        hideEngineContainer();
        localStorage.setItem("showShortcutSwitch", true)
    } else {
        showEngineContainer();
        localStorage.setItem("showShortcutSwitch", false)
    }
}
const hideSearchWith = document.getElementById("shortcut_switchcheckbox");
hideSearchWith.addEventListener("change", (e) => {
    initShortCutSwitch(e.target);
    let activeSearchMode = localStorage.getItem("activeSearchMode") || "search-with";
    toggleSearchEngines(activeSearchMode);
    const storedSearchEngine = localStorage.getItem(`selectedSearchEngine-${activeSearchMode}`);
    const selectedRadioButton = document.querySelector(`input[name="search-engine"][value="${storedSearchEngine}"]`);
    selectedRadioButton.checked = true;
    const storedSearchEngineSN = storedSearchEngine.charAt(storedSearchEngine.length - 1);
    const selector = `*[data-engine="${storedSearchEngineSN}"]`;
    swapDropdown(selector);
    sortDropdown();
});
if (localStorage.getItem("showShortcutSwitch")) {
    const isShortCutSwitchEnabled = localStorage.getItem("showShortcutSwitch").toString() === "true";
    document.getElementById("shortcut_switchcheckbox").checked = isShortCutSwitchEnabled;
    if (isShortCutSwitchEnabled) {
        hideEngineContainer();
    } else if (!isShortCutSwitchEnabled) {
        showEngineContainer()
    }
} else {
    localStorage.setItem("showShortcutSwitch", false);
}
initShortCutSwitch(hideSearchWith);
document.addEventListener("keydown", function (event) {
    const modalContainer = document.getElementById("prompt-modal-container");
    if (
        modalContainer?.style.display === "flex" ||
        menuBar.style.display !== "none" ||
        bookmarkSidebar.classList.contains("open")
    ) {
        return;
    }
    if (event.key === "/" && event.target.tagName !== "INPUT" && event.target.tagName !== "TEXTAREA" && event.target.isContentEditable !== true) {
        event.preventDefault();
        searchInput.focus();
        searchbar.classList.add("active");
    }
});
