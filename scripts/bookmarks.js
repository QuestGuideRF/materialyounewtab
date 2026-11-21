const bookmarkButton = document.getElementById("bookmarkButton");
const bookmarkSidebar = document.getElementById("bookmarkSidebar");
const bookmarkList = document.getElementById("bookmarkList");
const bookmarkSearch = document.getElementById("bookmarkSearch");
const bookmarkSearchClearButton = document.getElementById("clearSearchButton");
const bookmarkViewGrid = document.getElementById("bookmarkViewGrid");
const bookmarkViewList = document.getElementById("bookmarkViewList");
const bookmarksCheckbox = document.getElementById("bookmarksCheckbox");

const editBookmarkModal = document.getElementById("editBookmarkModal");
const editBookmarkName = document.getElementById("editBookmarkName");
const editBookmarkURL = document.getElementById("editBookmarkURL");
const editBookmarkFavicon = document.getElementById("editBookmarkFavicon");
const saveBookmarkChanges = document.getElementById("saveBookmarkChanges");
const cancelBookmarkEdit = document.getElementById("cancelBookmarkEdit");
let currentBookmarkId = null;

const sortAlphabetical = document.getElementById("sortAlphabetical");
const sortTimeAdded = document.getElementById("sortTimeAdded");
let currentSortMethod = localStorage.getItem("bookmarkSortMethod") || 'title';

var bookmarksAPI;
if (isFirefox) {
    bookmarksAPI = browser.bookmarks;
} else if (isChromiumBased) {
    bookmarksAPI = chrome.bookmarks;
}

updateSortButtons();

bookmarkButton.addEventListener("click", function () {
    toggleBookmarkSidebar();
    bookmarkSearchClearButton.click();
});

bookmarkViewGrid.addEventListener("click", function () {
    if (!bookmarkGridCheckbox.checked) bookmarkGridCheckbox.click();
});

bookmarkViewList.addEventListener("click", function () {
    if (bookmarkGridCheckbox.checked) bookmarkGridCheckbox.click();
});

document.addEventListener("click", function (event) {
    const modalContainer = document.getElementById("prompt-modal-container");

    if (modalContainer && modalContainer.style.display === "flex") {
        return;
    }

    if (
        !bookmarkSidebar.contains(event.target) &&
        !bookmarkButton.contains(event.target) &&
        !editBookmarkModal.contains(event.target) &&
        bookmarkSidebar.classList.contains("open")
    ) {
        toggleBookmarkSidebar();

        if (editBookmarkModal.style.display !== "none") {
            editBookmarkModal.style.display = "none";
        }
    }
});

bookmarkSearch.addEventListener("input", function () {
    const searchTerm = bookmarkSearch.value.toLowerCase();
    const bookmarks = bookmarkList.querySelectorAll("li[data-url], li.folder");

    Array.from(bookmarks).forEach(function (bookmark) {
        const text = bookmark.textContent.toLowerCase();
        const url = bookmark.dataset.url ? bookmark.dataset.url.toLowerCase() : "";
        const isFolder = bookmark.classList.contains("folder");

        if (!isFolder && (text.includes(searchTerm) || url.includes(searchTerm))) {
            bookmark.style.display = "";
        } else if (isFolder) {

            const childBookmarks = bookmark.querySelectorAll("li[data-url]");
            let hasVisibleChild = false;
            Array.from(childBookmarks).forEach(function (childBookmark) {
                const childText = childBookmark.textContent.toLowerCase();
                const childUrl = childBookmark.dataset.url ? childBookmark.dataset.url.toLowerCase() : "";
                if (childText.includes(searchTerm) || childUrl.includes(searchTerm)) {
                    hasVisibleChild = true;
                    childBookmark.style.display = "";
                } else {
                    childBookmark.style.display = "none";
                }
            });

            if (hasVisibleChild) {
                bookmark.style.display = "";
                bookmark.classList.add("open");
            } else {
                bookmark.style.display = "none";
                bookmark.classList.remove("open");
            }
        } else {
            bookmark.style.display = "none";
        }
    });

    if (searchTerm === "") {

        Array.from(bookmarks).forEach(function (bookmark) {
            bookmark.style.display = "";
            if (bookmark.classList.contains("folder")) {
                bookmark.classList.remove("open");
                const childList = bookmark.querySelector("ul");
                if (childList) {
                    childList.classList.add("hidden");
                }
            }
        });
    }

    bookmarkSearchClearButton.style.display = searchTerm ? "inline" : "none";
});

sortAlphabetical.addEventListener("click", function () {
    if (!this.classList.contains("active")) {
        currentSortMethod = 'title';
        localStorage.setItem("bookmarkSortMethod", "title");
        updateSortButtons();
        loadBookmarks();
    }
});

sortTimeAdded.addEventListener("click", function () {
    if (!this.classList.contains("active")) {
        currentSortMethod = 'date';
        localStorage.setItem("bookmarkSortMethod", "date");
        updateSortButtons();
        loadBookmarks();
    }
});

function updateSortButtons() {
    sortAlphabetical.classList.toggle("active", currentSortMethod === 'title');
    sortTimeAdded.classList.toggle("active", currentSortMethod === 'date');
}

bookmarkSearchClearButton.addEventListener("click", function () {
    bookmarkSearch.value = "";
    bookmarkSearch.dispatchEvent(new Event("input"));
});

function updateBookmarkUI(enabled) {
    bookmarksCheckbox.checked = enabled;
    bookmarkButton.style.display = enabled ? "flex" : "none";
    saveDisplayStatus("bookmarksDisplayStatus", enabled ? "flex" : "none");
    saveCheckboxState("bookmarksCheckboxState", bookmarksCheckbox);
}

async function verifyBookmarkPermission() {

    let bookmarksPermission;
    if (isFirefox) bookmarksPermission = browser.permissions;
    else if (isChromiumBased) bookmarksPermission = chrome.permissions;

    if (!bookmarksPermission) {
        await alertPrompt(translations[currentLanguage]?.UnsupportedBrowser ||
            translations['en'].UnsupportedBrowser);
        updateBookmarkUI(false);
        return false;
    }

    if (isFirefox) {
        updateBookmarkUI(true);
        return true;
    }

    const requiredPermissions = isOpera ? ["bookmarks"] : ["bookmarks", "favicon"];

    const hasPermission = await new Promise(resolve =>
        chrome.permissions.contains({ permissions: requiredPermissions }, resolve));

    if (!hasPermission) {
        const granted = await new Promise(resolve =>
            chrome.permissions.request({ permissions: requiredPermissions }, resolve));

        if (!granted) {
            updateBookmarkUI(false);
            return false;
        }
        bookmarksAPI = chrome.bookmarks;
    }

    updateBookmarkUI(true);
    return true;
}

async function toggleBookmarkSidebar() {
    const hasPermission = await verifyBookmarkPermission();
    if (hasPermission) {
        bookmarkSidebar.classList.toggle("open");
        bookmarkButton.classList.toggle("rotate");

        if (bookmarkSidebar.classList.contains("open")) {
            loadBookmarks();
        }
    }
}

function loadBookmarks() {
    if (!bookmarksAPI?.getTree) {
        console.error("Bookmarks API is unavailable. Please check permissions or context.");
        return;
    }

    bookmarksAPI.getTree().then(bookmarkTreeNodes => {

        bookmarkList.innerHTML = "";

        if (bookmarksAPI.getRecent) {
            bookmarksAPI.getRecent(8).then(recentBookmarks => {
                if (recentBookmarks.length > 0) {
                    const recentAddedFolder = {
                        title: "Recently Added",
                        children: recentBookmarks
                    };
                    bookmarkList.appendChild(displayBookmarks([recentAddedFolder]));
                }
            });
        }

        if (isFirefox) {
            const toolbarNode = bookmarkTreeNodes[0]?.children?.find(node => node.title === "Bookmarks Toolbar");
            const menuNode = bookmarkTreeNodes[0]?.children?.find(node => node.title === "Bookmarks Menu");
            const otherNode = bookmarkTreeNodes[0]?.children?.find(node => node.title === "Other Bookmarks");

            if (toolbarNode?.children) bookmarkList.appendChild(displayBookmarks(toolbarNode.children));
            if (menuNode?.children) bookmarkList.appendChild(displayBookmarks(menuNode.children));
            if (otherNode?.children) bookmarkList.appendChild(displayBookmarks(otherNode.children));
        }
        else {
            let default_folder = "Bookmarks bar";
            if (isEdge) default_folder = "Favorites bar";
            if (isBrave) default_folder = "Bookmarks";

            const rootChildren = bookmarkTreeNodes[0]?.children || [];

            const mainBookmarks = rootChildren.find(node =>
                node.title === default_folder ||
                node.folderType === "bookmarks-bar"
            );

            if (mainBookmarks?.children) {
                bookmarkList.appendChild(displayBookmarks(mainBookmarks.children));
            }

            rootChildren.forEach(node => {
                if (node !== mainBookmarks && node.id !== "1" && node.children) {
                    bookmarkList.appendChild(displayBookmarks([node]));
                }
            });
        }
    }).catch(err => {
        console.error("Error loading bookmarks:", err);
    });
}

function setBookmarkFavicon(faviconElement, pageUrl) {

    const offlineFallback = () => faviconElement.src = "./svgs/offline.svg";

    const googleFallback = () => {
        faviconElement.src = `https://www.google.com/s2/favicons?domain=${new URL(pageUrl).hostname}&sz=32`;
        faviconElement.onerror = offlineFallback;
    };

    if (!isFirefox || !isOpera) {
        faviconElement.src = `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(pageUrl)}&size=32`;
        faviconElement.onerror = googleFallback;
    } else {
        googleFallback();
    }
}

function displayBookmarks(bookmarkNodes) {
    let list = document.createElement("ul");

    const folders = bookmarkNodes.filter(node => node.children && node.children.length > 0);
    const bookmarks = bookmarkNodes.filter(node => node.url);

    if (currentSortMethod === 'title') {
        folders.sort((a, b) => a.title.localeCompare(b.title));
        bookmarks.sort((a, b) => a.title.localeCompare(b.title));
    } else {
        folders.sort((a, b) => (a.dateAdded || 0) - (b.dateAdded || 0));
        bookmarks.sort((a, b) => (a.dateAdded || 0) - (b.dateAdded || 0));
    }

    const sortedNodes = [...bookmarks, ...folders];

    for (let node of sortedNodes) {
        if (node.id === "1") continue;

        if (node.children && node.children.length > 0) {
            let folderItem = document.createElement("li");

            folderItem.dataset.id = node.id;

            const folderIcon = document.getElementById("folderIconTemplate").cloneNode(true);
            folderIcon.removeAttribute("id");
            folderItem.appendChild(folderIcon);

            folderItem.appendChild(document.createTextNode(node.title));
            folderItem.classList.add("folder", "open");

            folderItem.addEventListener("click", function (event) {
                event.stopPropagation();
                folderItem.classList.toggle("open");
                const subList = folderItem.querySelector("ul");
                if (subList) {
                    subList.classList.toggle("hidden");
                }
            });

            let subList = displayBookmarks(node.children);
            folderItem.appendChild(subList);

            list.appendChild(folderItem);
        } else if (node.url) {
            let item = document.createElement("li");
            item.dataset.id = node.id;
            item.dataset.url = node.url;
            let link = document.createElement("a");
            link.href = node.url;
            let span = document.createElement("span");
            span.textContent = node.title;

            const favicon = document.createElement("img");
            setBookmarkFavicon(favicon, node.url);
            favicon.classList.add("favicon");

            let deleteButton = document.createElement("button");
            deleteButton.textContent = "✖";
            deleteButton.classList.add("bookmark-delete-button");

            deleteButton.addEventListener("click", async function (event) {
                event.preventDefault();
                event.stopPropagation();

                const confirmMessage = (translations[currentLanguage]?.deleteBookmark || translations["en"].deleteBookmark)
                    .replace("{title}", node.title || node.url);

                if (await confirmPrompt(confirmMessage)) {
                    if (isFirefox) {

                        bookmarksAPI.remove(node.id).then(() => {
                            item.remove();
                        }).catch(err => {
                            console.error("Error removing bookmark:", err);
                        });
                    } else {

                        bookmarksAPI.remove(node.id, function () {
                            item.remove();
                        });
                    }
                }
            });

            link.appendChild(favicon);
            link.appendChild(span);
            item.appendChild(link);
            item.appendChild(deleteButton);

            link.addEventListener("click", function (event) {
                if (event.ctrlKey || event.metaKey) {

                    event.preventDefault();
                    if (isFirefox) {
                        browser.tabs.create({ url: node.url, active: false });
                    } else if (isChromiumBased) {
                        chrome.tabs.create({ url: node.url, active: false });
                    } else {
                        window.open(node.url, "_blank");
                    }
                } else {

                    event.preventDefault();
                    if (isFirefox) {
                        browser.tabs.update({ url: node.url });
                    } else if (isChromiumBased) {
                        chrome.tabs.update({ url: node.url }, function () {
                        });
                    } else {
                        window.location.href = node.url;
                    }
                }
            });
            list.appendChild(item);
        }
    }

    list.addEventListener("click", function (event) {
        event.stopPropagation();
    });

    return list;
}

bookmarkList.addEventListener("contextmenu", function (event) {
    event.preventDefault();

    const bookmarkItem = event.target.closest("li[data-id]");
    if (!bookmarkItem) return;

    currentBookmarkId = bookmarkItem.dataset.id;
    const bookmarkTitle = bookmarkItem.querySelector("a").textContent.trim();
    const bookmarkURL = bookmarkItem.dataset.url;

    editBookmarkName.value = bookmarkTitle;
    editBookmarkURL.value = bookmarkURL;
    setBookmarkFavicon(editBookmarkFavicon, bookmarkURL);

    editBookmarkModal.style.display = "block";
    saveBookmarkChanges.disabled = false;
});

editBookmarkURL.addEventListener("input", () => {
    saveBookmarkChanges.disabled = editBookmarkURL.value.trim() === "";
});

saveBookmarkChanges.onclick = function () {
    if (!currentBookmarkId) return;

    const updatedTitle = editBookmarkName.value.trim();
    const updatedURL = encodeURI(editBookmarkURL.value.trim());

    const updatedData = { title: updatedTitle, url: updatedURL };

    if (isFirefox) {
        bookmarksAPI.update(currentBookmarkId, updatedData).then(() => {
            updateBookmark(currentBookmarkId, updatedTitle, updatedURL);
            editBookmarkModal.style.display = "none";
        }).catch(err => {
            console.error("Error updating bookmark:", err);
        });
    } else {
        bookmarksAPI.update(currentBookmarkId, updatedData, function () {
            if (chrome.runtime.lastError) {
                console.error("Error updating bookmark:", chrome.runtime.lastError);
                return;
            }
            updateBookmark(currentBookmarkId, updatedTitle, updatedURL);
            editBookmarkModal.style.display = "none";
        });
    }

    loadBookmarks();
};

cancelBookmarkEdit.onclick = function () {
    editBookmarkModal.style.display = "none";
};

function updateBookmark(bookmarkId, title, url) {
    const bookmarkItem = document.querySelector(`li[data-id="${bookmarkId}"]`);
    if (bookmarkItem) {
        const link = bookmarkItem.querySelector("a");
        link.textContent = title;
        link.href = url;
        bookmarkItem.dataset.url = url;
    }
}

editBookmarkName.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        editBookmarkURL.focus();
    }
});

editBookmarkURL.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        if (!saveBookmarkChanges.disabled) {
            saveBookmarkChanges.click();
        }
    }
});

document.addEventListener("DOMContentLoaded", function () {
    bookmarksCheckbox.addEventListener("change", async function () {
        if (!bookmarksCheckbox.checked) {
            updateBookmarkUI(false);
            return;
        }
        await verifyBookmarkPermission();
    });

    bookmarkGridCheckbox.addEventListener("change", function () {
        saveCheckboxState("bookmarkGridCheckboxState", bookmarkGridCheckbox);
        if (bookmarkGridCheckbox.checked) {
            bookmarkList.classList.add("grid-view");
        } else {
            bookmarkList.classList.remove("grid-view");
        }
    });

    loadCheckboxState("bookmarksCheckboxState", bookmarksCheckbox);
    loadDisplayStatus("bookmarksDisplayStatus", bookmarkButton);
    loadCheckboxState("bookmarkGridCheckboxState", bookmarkGridCheckbox);
});

document.addEventListener("keydown", function (event) {

    const modalContainer = document.getElementById("prompt-modal-container");
    if (modalContainer?.style.display === "flex" || menuBar.style.display !== "none") {
        return;
    }

    if (bookmarksCheckbox.checked &&
        event.key === "ArrowRight" &&
        !event.repeat &&
        event.target.tagName !== "INPUT" &&
        event.target.tagName !== "TEXTAREA" &&
        event.target.isContentEditable !== true
    ) {
        bookmarkButton.click();
    }
});