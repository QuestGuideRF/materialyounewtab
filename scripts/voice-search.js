function isSupportedBrowser() {
    return (isChrome || isEdge) && isDesktop && !isBrave;
}
const micIcon = document.getElementById("micIcon");
const micIconCheckbox = document.getElementById("micIconCheckbox");
const savedState = localStorage.getItem("micIconVisible");
let isMicIconVisible;
if (savedState !== null) {
    isMicIconVisible = savedState === "true";
} else {
    isMicIconVisible = isSupportedBrowser();
    localStorage.setItem("micIconVisible", isMicIconVisible);
}
micIconCheckbox.checked = !isMicIconVisible;
if (isMicIconVisible) {
    micIcon.style.display = "block";
} else {
    micIcon.style.display = "none";
}
function toggleMicIconVisibility(isVisible) {
    micIcon.style.display = isVisible ? "block" : "none";
    localStorage.setItem("micIconVisible", isVisible);
}
micIconCheckbox.addEventListener("change", () => {
    const isChecked = micIconCheckbox.checked;
    toggleMicIconVisibility(!isChecked);
    if (!isChecked) {
        initializeSpeechRecognition();
    }
});
function initializeSpeechRecognition() {
    const searchInput = document.getElementById("searchQ");
    const resultBox = document.getElementById("resultBox");
    const currentLanguage = getLanguageStatus("selectedLanguage") || "ru";
    const isSpeechRecognitionAvailable = "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
    if (isSpeechRecognitionAvailable) {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = currentLanguage;
        let isRecognizing = false;
        recognition.onstart = () => {
            isRecognizing = true;
            const selectedRadio = document.querySelector(".colorPlate:checked");
            if (selectedRadio.value !== "dark") {
                micIcon.style.color = "var(--darkerColor-blue)";
            }
            searchInput.placeholder = `${translations[currentLanguage]?.listenPlaceholder || translations["en"].listenPlaceholder}`;
            micIcon.classList.add("micActive");
        };
        recognition.onresult = (event) => {
            let transcript = "";
            for (let i = 0; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            searchInput.value = transcript;
            searchInput.dispatchEvent(new Event("input"));
            if (event.results[event.results.length - 1].isFinal) {
                resultBox.style.display = "none";
            }
        };
        recognition.onerror = (event) => {
            console.error("Ошибка распознавания речи: ", event.error);
            isRecognizing = false;
        };
        recognition.onend = () => {
            isRecognizing = false;
            micIcon.style.color = "var(--darkColor-blue)";
            micIcon.classList.remove("micActive");
            searchInput.placeholder = `${translations[currentLanguage]?.searchPlaceholder || translations["en"].searchPlaceholder}`;
        };
        micIcon.addEventListener("click", () => {
            if (isRecognizing) {
                recognition.stop();
            } else {
                recognition.start();
            }
        });
    } else {
        console.info("API распознавания речи не поддерживается в этом браузере.");
    }
}
if (!micIconCheckbox.checked) {
    initializeSpeechRecognition();
}