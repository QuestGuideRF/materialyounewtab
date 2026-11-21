document.addEventListener("DOMContentLoaded", function () {
    if (!isDesktop) {
        document.querySelectorAll('.hideOnMobile').forEach(el => el.style.display = 'none');
    }
    const adjustZoomInfo = document.getElementById("adjustZoomInfo");
    let adjustZoomInfoText = translations[currentLanguage]?.adjustZoomInfo || translations["en"].adjustZoomInfo;
    if (isMac) {
        adjustZoomInfoText = adjustZoomInfoText.replace(/Ctrl/g, "⌘");
    }
    adjustZoomInfo.textContent = adjustZoomInfoText;
    const changeBrowserThemeInfo = document.getElementById("changeBrowserThemeInfo");
    if (isFirefoxAll) {
        changeBrowserThemeInfo.innerHTML = translations[currentLanguage]?.firefoxThemeInfo || translations["en"].firefoxThemeInfo;
    } else if (isEdge) {
        changeBrowserThemeInfo.innerHTML = translations[currentLanguage]?.edgeThemeInfo || translations["en"].edgeThemeInfo;
    } else if (isBrave) {
        changeBrowserThemeInfo.innerHTML = translations[currentLanguage]?.braveThemeInfo || translations["en"].braveThemeInfo;
    } else {
        changeBrowserThemeInfo.innerHTML = translations[currentLanguage]?.chromeThemeInfo || translations["en"].chromeThemeInfo;
    }
    const firefoxHomepage = document.getElementById("firefoxHomepage");
    const updateFirefoxHomepageInfo = document.getElementById("updateFirefoxHomepageInfo");
    if (isFirefox) {
        firefoxHomepage.style.display = "block";
        updateFirefoxHomepageInfo.innerHTML = translations[currentLanguage]?.updateFirefoxHomepageInfo || translations["en"].updateFirefoxHomepageInfo;
    }
    const tips = document.getElementById("tips");
    const dontShowButton = document.getElementById("dontShowTips");
    if (localStorage.getItem("hideTips") === "true") {
        tips.style.display = "none";
    }
    dontShowButton.addEventListener("click", function () {
        tips.style.display = "none";
        localStorage.setItem("hideTips", "true");
    });
});
(function () {
    if (isFirefoxAll || !isDesktop) return;
    const TOAST_DURATION = 30 * 1000;
    const STORAGE_KEY = 'chrome-footer-toast-shown';
    const toast = document.getElementById('chromeFooterToast');
    const progressBar = document.getElementById('toastProgressBar');
    const closeBtn = document.getElementById('toastClose');
    let progressInterval;
    let elapsedTime = 0;
    let lastTick = 0;
    let isPaused = false;
    function showToast() {
        const hasShown = localStorage.getItem(STORAGE_KEY);
        if (hasShown) return;
        localStorage.setItem(STORAGE_KEY, 'true');
        setTimeout(() => {
            toast.classList.add('show');
            startProgress();
        }, 1500);
    }
    function hideToast() {
        toast.classList.remove('show');
        clearInterval(progressInterval);
    }
    function startProgress() {
        lastTick = Date.now();
        progressInterval = setInterval(() => {
            if (isPaused) return;
            const now = Date.now();
            elapsedTime += now - lastTick;
            lastTick = now;
            const remaining = Math.max(0, 100 - (elapsedTime / TOAST_DURATION) * 100);
            progressBar.style.width = remaining + '%';
            if (elapsedTime >= TOAST_DURATION) {
                hideToast();
            }
        }, 50);
    }
    toast.addEventListener('mouseenter', () => {
        isPaused = true;
    });
    toast.addEventListener('mouseleave', () => {
        isPaused = false;
        lastTick = Date.now();
    });
    closeBtn.addEventListener('click', hideToast);
    showToast();
})();