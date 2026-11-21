function saveCheckboxState(key, checkbox) {
    localStorage.setItem(key, checkbox.checked ? "checked" : "unchecked");
}
const bookmarkGridCheckbox = document.getElementById("bookmarkGridCheckbox");
function loadCheckboxState(key, checkbox) {
    const savedState = localStorage.getItem(key);
    checkbox.checked = savedState === "checked";
    if (key === "bookmarkGridCheckboxState") {
        if (!savedState) {
            bookmarkGridCheckbox.click();
        } else {
            bookmarkGridCheckbox.click();
            bookmarkGridCheckbox.click();
        }
    }
}
function saveDisplayStatus(key, displayStatus) {
    localStorage.setItem(key, displayStatus);
}
function loadDisplayStatus(key, element) {
    const savedStatus = localStorage.getItem(key);
    if (savedStatus === "flex") {
        element.style.display = "flex";
    } else {
        element.style.display = "none";
    }
}
function saveActiveStatus(key, activeStatus) {
    localStorage.setItem(key, activeStatus);
}
function loadActiveStatus(key, element) {
    const savedStatus = localStorage.getItem(key);
    if (savedStatus === "active") {
        element.classList.remove("inactive");
    } else {
        element.classList.add("inactive");
    }
}