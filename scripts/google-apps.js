const iconContainer = document.getElementById("iconContainer");
const googleAppsCont = document.getElementById("googleAppsCont");
googleAppsCont.addEventListener("click", function (event) {
    const isMenuVisible = iconContainer.style.display === "grid";
    iconContainer.style.display = isMenuVisible ? "none" : "grid";
    if (!isMenuVisible) {
        googleAppsCont.classList.add("menu-open");
    } else {
        googleAppsCont.classList.remove("menu-open");
    }
    event.stopPropagation();
});
document.addEventListener("click", function (event) {
    const isClickInside =
        iconContainer.contains(event.target) || googleAppsCont.contains(event.target);
    if (!isClickInside && iconContainer.style.display === "grid") {
        iconContainer.style.display = "none";
        googleAppsCont.classList.remove("menu-open");
    }
});
document.addEventListener("DOMContentLoaded", function () {
    const googleAppsCont = document.getElementById("googleAppsCont");
    const googleAppsCheckbox = document.getElementById("googleAppsCheckbox");
    googleAppsCheckbox.addEventListener("change", function () {
        saveCheckboxState("googleAppsCheckboxState", googleAppsCheckbox);
        if (googleAppsCheckbox.checked) {
            googleAppsCont.style.display = "flex";
            saveDisplayStatus("googleAppsDisplayStatus", "flex");
        } else {
            googleAppsCont.style.display = "none";
            saveDisplayStatus("googleAppsDisplayStatus", "none");
        }
    });
    loadCheckboxState("googleAppsCheckboxState", googleAppsCheckbox);
    loadDisplayStatus("googleAppsDisplayStatus", googleAppsCont);
});