const aiQuickMenu = document.getElementById("aiQuickMenu");
const aiQuickToggle = document.getElementById("aiQuickToggle");
const aiQuickPanel = document.getElementById("aiQuickPanel");

function setAiQuickMenuOpen(isOpen) {
    aiQuickMenu.classList.toggle("is-open", isOpen);
    aiQuickToggle.setAttribute("aria-expanded", String(isOpen));
    aiQuickPanel.setAttribute("aria-hidden", String(!isOpen));
}

aiQuickToggle.addEventListener("click", () => {
    setAiQuickMenuOpen(!aiQuickMenu.classList.contains("is-open"));
});

document.addEventListener("click", (event) => {
    if (!aiQuickMenu.contains(event.target)) {
        setAiQuickMenuOpen(false);
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && aiQuickMenu.classList.contains("is-open")) {
        setAiQuickMenuOpen(false);
        aiQuickToggle.focus();
    }
});
