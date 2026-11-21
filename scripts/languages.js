const translations = {
    en: en,
    pt: pt,
    zh: zh,
    zh_TW: zh_TW,
    hi: hi,
    hu: hu,
    cs: cs,
    it: it,
    tr: tr,
    bn: bn,
    vi: vi,
    ru: ru,
    uz: uz,
    es: es,
    ja: ja,
    ko: ko,
    idn: idn,
    mr: mr,
    fr: fr,
    az: az,
    sl: sl,
    np: np,
    ur: ur,
    de: de,
    fa: fa,
    ar_SA: ar_SA,
    el: el,
    ta: ta,
    th: th,
    pl: pl,
    uk: uk,
};
const menuWidths = {
    en: "400px",
    ta: "480px",
    pt: "470px",
    bn: "416px",
    uz: "455px",
    vi: "445px",
    cs: "452px",
    es: "446px",
    hi: "408px",
    hu: "445px",
    ja: "444px",
    ru: "400px",
    it: "437px",
    idn: "435px",
    tr: "430px",
    fr: "475px",
    az: "418px",
    sl: "470px",
    np: "430px",
    de: "460px",
    fa: "460px",
    ar_SA: "440px",
    el: "455px",
    th: "455px",
    pl: "455px",
    uk: "455px",
};
const numberMappings = {
    "bn": { "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪", "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯" },
    "ta": { "0": "௦", "1": "௧", "2": "௨", "3": "௩", "4": "௪", "5": "௫", "6": "௬", "7": "௭", "8": "௮", "9": "௯" },
    "mr": { "0": "०", "1": "१", "2": "२", "3": "३", "4": "४", "5": "५", "6": "६", "7": "७", "8": "८", "9": "९" },
    "np": { "0": "०", "1": "१", "2": "२", "3": "३", "4": "४", "5": "५", "6": "६", "7": "७", "8": "८", "9": "९" },
    "fa": { 0: "۰", 1: "۱", 2: "۲", 3: "۳", 4: "۴", 5: "۵", 6: "۶", 7: "۷", 8: "۸", 9: "۹" },
    "ar_SA": { 0: "۰", 1: "۱", 2: "۲", 3: "۳", 4: "٤", 5: "٥", 6: "٦", 7: "۷", 8: "۸", 9: "۹" }
};
const LRM = "\u200E";
function localizeNumbers(text, language) {
    const map = numberMappings[language];
    const specialDecimalLanguages = ["cs", "it", "pt", "ru", "tr", "vi", "uz", "es", "ko", "idn", "fr", "az", "sl", "hu", "de", "fa", "el", "uk"];
    if (specialDecimalLanguages.includes(language)) {
        text = text.replace(".", ",");
    }
    if (map) {
        text = text.replace(/\d/g, (digit) => map[digit] || digit);
    }
    const rtlFlipLanguages = ["ar_SA"];
    if (rtlFlipLanguages.includes(language)) {
        text = `${LRM}${text}${LRM}`;
    }
    return text;
}
const rtlLanguages = ["ur", "fa", "ar_SA"];
function applyLanguage(lang) {
    const translationMap = [
        "feedback",
        "resetsettings",
        "shortcutsText",
        "enableShortcutsText",
        "editShortcutsText",
        "shortcutsInfoText",
        "editShortcutsList",
        "editShortcutsListInfo",
        "adaptiveIconText",
        "adaptiveIconInfoText",
        "googleAppsMenuText",
        "googleAppsMenuInfo",
        "fahrenheitCelsiusCheckbox",
        "fahrenheitCelsiusText",
        "minMaxTempText",
        "minMaxTempSubText",
        "hideWeatherTitle",
        "hideWeatherInfo",
        "hideWeatherBox",
        "hideWeatherBoxInfo",
        "micIconTitle",
        "micIconInfo",
        "hideSearchWith",
        "hideSearchWithInfo",
        "search_suggestions_button",
        "search_suggestions_text",
        "hideClockBox",
        "hideClockBoxInfo",
        "digitalclocktitle",
        "digitalclockinfo",
        "timeformattitle",
        "timeformatinfo",
        "useproxytitletext",
        "useproxyText",
        "ProxyText",
        "ProxySubtext",
        "HostproxyButton",
        "UserLocText",
        "UserLocSubtext",
        "useGPS",
        "useGPSInfo",
        "PrivacyPolicy",
        "WeatherApiText",
        "WeatherApiSubtext",
        "LearnMoreButton",
        "saveAPI",
        "enterBtn",
        "defaultEngine",
        "googleEngine",
        "duckEngine",
        "bingEngine",
        "braveEngine",
        "youtubeEngine",
        "gImagesEngine",
        "redditEngine",
        "wikipediaEngine",
        "quoraEngine",
        "github",
        "googleAppsHover",
        "uploadWallpaperText",
        "backupText",
        "restoreText",
        "rangColor",
        "bookmarksText",
        "bookmarksInfo",
        "bookmarksHeading",
        "bookmarkSortBy",
        "sortAlphabetical",
        "sortTimeAdded",
        "bookmarkViewAs",
        "bookmarkViewGrid",
        "bookmarkViewList",
        "editBookmarkHeading",
        "lightThemed",
        "darkThemed",
        "systemThemed",
        "switchSearchModes",
        "switchSearchModesInfo",
        "adjustZoom",
        "changeBrowserTheme",
        "updateFirefoxHomepage",
        "dontShowTips",
        "opacityTitle",
        "adjustOpacityDesc",
        "footerToastTitle",
        "footerToastMessage"
    ];
    const placeholderMap = [
        { id: "userLoc", key: "userLoc" },
        { id: "userAPI", key: "userAPI" },
        { id: "searchQ", key: "searchPlaceholder" },
        { id: "bookmarkSearch", key: "bookmarkSearch" },
        { id: "editBookmarkName", key: "editBookmarkName" },
        { id: "editBookmarkURL", key: "editBookmarkURL" }
    ];
    const elementsMap = [
        { id: "defaultEngineDD", key: "defaultEngine" },
        { id: "googleEngineDD", key: "googleEngine" },
        { id: "duckEngineDD", key: "duckEngine" },
        { id: "bingEngineDD", key: "bingEngine" },
        { id: "braveEngineDD", key: "braveEngine" },
        { id: "youtubeEngineDD", key: "youtubeEngine" },
        { id: "gImagesEngineDD", key: "gImagesEngine" },
        { id: "redditEngineDD", key: "redditEngine" },
        { id: "wikipediaEngineDD", key: "wikipediaEngine" },
        { id: "quoraEngineDD", key: "quoraEngine" },
        { id: "bookmarksHover", key: "bookmarksHeading" },
        { id: "saveproxy", key: "saveAPI" },
        { id: "saveLoc", key: "saveAPI" },
        { id: "saveBookmarkChanges", key: "saveAPI" },
        { id: "cancelBookmarkEdit", key: "cancelText" },
        { id: "editBookmarkNameLabel", key: "editBookmarkName" },
        { id: "editBookmarkURLLabel", key: "editBookmarkURL" }
    ];
    function applyTranslations(items, isPlaceholder) {
        items.forEach(item => {
            const element = document.getElementById(item.id || item);
            if (element) {
                const key = item.key || item;
                const translation = translations[lang]?.[key] || translations["en"]?.[key];
                if (isPlaceholder) {
                    element.placeholder = translation;
                } else {
                    element.innerText = translation;
                }
            }
        });
    }
    applyTranslations(placeholderMap, true);
    applyTranslations(elementsMap, false);
    applyTranslations(translationMap, false);
    const menuCloseButton = document.getElementById("menuCloseButton");
    if (menuCloseButton) {
        const hoverText = translations[lang]?.menuCloseText || translations["en"].menuCloseText;
        menuCloseButton.setAttribute("data-lang", hoverText);
    }
    const menuCont = document.querySelector(".menuBar .menuCont");
    if (menuCont) {
        menuCont.style.width = menuWidths[lang] || menuWidths["en"];
        let widthh = window.innerWidth / parseInt(menuWidths[lang] || menuWidths["en"]);
        if (window.innerWidth < 476) {
            let menuStyle = document.getElementById("menuStyle") || document.createElement("style");
            menuStyle.id = "menuStyle";
            menuStyle.innerHTML = `
                .menuCont {
                    scale: ${widthh} !important;
                    height: ${(100 / widthh).toString()}dvh !important;
                    transform-origin: top right !important;
                }
            `;
            document.head.append(menuStyle);
        }
    }
    function loadFont(fontUrl) {
        if (!document.querySelector(`link[href="${fontUrl}"]`)) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = fontUrl;
            document.head.appendChild(link);
        }
    }
    const root = document.documentElement;
    const commonFontStack = "'poppins', 'Poppins', sans-serif";
    if (lang === "vi") {
        loadFont("https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro&display=swap");
        root.style.setProperty("--main-font-family", `"Be Vietnam Pro", ${commonFontStack}`);
    } else if (lang === "ur") {
        loadFont("https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic&display=swap");
        root.style.setProperty("--main-font-family", `"Noto Sans Arabic", ${commonFontStack}`);
    } else if (lang === "fa") {
        loadFont("https://fonts.googleapis.com/css2?family=Vazirmatn&display=swap");
        root.style.setProperty("--main-font-family", `"Vazirmatn", ${commonFontStack}`);
    } else {
        root.style.setProperty("--main-font-family", commonFontStack);
    }
    const isRTL = rtlLanguages.includes(lang);
    const rtlSelectors = [".topDiv", ".searchbar", ".searchWithCont", ".resultBox",
        ".leftDiv", ".shortcutsContainer", ".aiQuickMenu", ".page", "#prompt-modal-box",
        ".bookmark-search-container", ".bookmark-controls-container", "#editBookmarkModal", ".liquidGlass-toast"];
    rtlSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            el.setAttribute("dir", isRTL ? "rtl" : "ltr");
        });
    });
    const feelsLikeElement = document.getElementById("feelsLike");
    feelsLikeElement.style.left = isRTL ? "12px" : "";
    feelsLikeElement.style.paddingRight = isRTL ? "43px" : "";
    feelsLikeElement.style.width = isRTL ? "calc(100% - 12px)" : "";
    feelsLikeElement.style.textAlign = isRTL ? "right" : "left";
    document.documentElement.lang = currentLanguage;
    saveLanguageStatus("selectedLanguage", lang);
}
document.getElementById("languageSelector").addEventListener("change", (event) => {
    applyLanguage(event.target.value);
    location.reload();
});
window.onload = function () {
    const savedLanguage = getLanguageStatus("selectedLanguage") || "ru";
    document.getElementById("languageSelector").value = savedLanguage;
    applyLanguage(savedLanguage);
};
function saveLanguageStatus(key, languageStatus) {
    localStorage.setItem(key, languageStatus);
}
function getLanguageStatus(key) {
    return localStorage.getItem(key);
}
