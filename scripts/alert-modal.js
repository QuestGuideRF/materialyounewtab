(function setupCustomModal() {
    if (document.getElementById("prompt-modal-container")) return;
    const blurOverlay = document.createElement("div");
    blurOverlay.id = "prompt-modal-blur";
    const modalContainer = document.createElement("div");
    modalContainer.id = "prompt-modal-container";
    const modalBox = document.createElement("div");
    modalBox.id = "prompt-modal-box";
    const messageElement = document.createElement("p");
    messageElement.id = "prompt-modal-message";
    const buttonContainer = document.createElement("div");
    buttonContainer.id = "prompt-modal-buttons";
    modalBox.appendChild(messageElement);
    modalBox.appendChild(buttonContainer);
    modalContainer.appendChild(modalBox);
    document.body.appendChild(blurOverlay);
    document.body.appendChild(modalContainer);
})();
function alertPrompt(message, isAlert = true, okText, cancelText) {
    return new Promise((resolve) => {
        const modalContainer = document.getElementById("prompt-modal-container");
        const blurOverlay = document.getElementById("prompt-modal-blur");
        const messageElement = document.getElementById("prompt-modal-message");
        const buttonContainer = document.getElementById("prompt-modal-buttons");
        const bookmarkContainer = document.getElementById("bookmarkSidebar");
        messageElement.innerHTML = "";
        message.split("\n").forEach((line, index) => {
            if (index > 0) messageElement.appendChild(document.createElement("br"));
            messageElement.appendChild(document.createTextNode(line));
        });
        buttonContainer.innerHTML = "";
        if (isAlert) {
            okText = okText || translations[currentLanguage]?.okText || translations["en"].okText;
        } else {
            okText = okText || translations[currentLanguage]?.yesText || translations["en"].yesText;
            cancelText = cancelText || translations[currentLanguage]?.noText || translations["en"].noText;
        }
        const okButton = document.createElement("button");
        okButton.textContent = okText;
        okButton.classList.add("prompt-modal-button", "prompt-modal-ok");
        okButton.onclick = closeModal.bind(null, true);
        buttonContainer.appendChild(okButton);
        let cancelButton = null;
        if (!isAlert) {
            cancelButton = document.createElement("button");
            cancelButton.textContent = cancelText;
            cancelButton.classList.add("prompt-modal-button", "prompt-modal-cancel");
            cancelButton.onclick = closeModal.bind(null, false);
            buttonContainer.appendChild(cancelButton);
        }
        modalContainer.style.display = "flex";
        blurOverlay.style.display = "block";
        document.body.style.pointerEvents = "none";
        if (bookmarkContainer) bookmarkContainer.style.pointerEvents = "none";
        modalContainer.style.pointerEvents = "auto";
        let lastFocusedButton = okButton;
        okButton.focus();
        function preventFocusLoss(event) {
            const isInsideModal = modalContainer.contains(event.target);
            const isButton = event.target.classList.contains("prompt-modal-button");
            if (!isInsideModal || !isButton) {
                event.preventDefault();
                lastFocusedButton.focus();
            }
        }
        document.addEventListener("mousedown", preventFocusLoss);
        function handleKeydown(event) {
            if (event.key === "Enter") {
                if (document.activeElement === okButton) {
                    closeModal(true);
                } else if (document.activeElement === cancelButton) {
                    closeModal(false);
                }
            } else if (event.key === "Escape") {
                closeModal(isAlert ? undefined : false);
            } else if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                event.preventDefault();
                const buttons = buttonContainer.querySelectorAll("button");
                let index = [...buttons].indexOf(document.activeElement);
                if (event.key === "ArrowRight") {
                    index = (index + 1) % buttons.length;
                } else if (event.key === "ArrowLeft") {
                    index = (index - 1 + buttons.length) % buttons.length;
                }
                buttons[index].focus();
                lastFocusedButton = buttons[index];
            }
        }
        document.addEventListener("keydown", handleKeydown);
        function closeModal(result) {
            modalContainer.style.display = "none";
            blurOverlay.style.display = "none";
            document.removeEventListener("keydown", handleKeydown);
            document.removeEventListener("mousedown", preventFocusLoss);
            document.body.style.pointerEvents = "auto";
            if (bookmarkContainer) bookmarkContainer.style.pointerEvents = "auto";
            resolve(result);
        }
    });
}
function confirmPrompt(message, okText, cancelText) {
    return alertPrompt(message, false, okText, cancelText);
}
const agreeText = translations[currentLanguage]?.agreeText || translations["en"].agreeText;
const cancelText = translations[currentLanguage]?.cancelText || translations["en"].cancelText;