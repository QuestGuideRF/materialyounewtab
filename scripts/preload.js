document.documentElement.style.setProperty('--Loading-Screen-Color', localStorage.getItem('LoadingScreenColor') || "#bbd6fd");

const retiredStorageKeys = [
    "aiToolsCheckboxState",
    "aiToolsDisplayStatus",
    "aiToolsSettings",
    "greetingEnabled",
    "greetingField",
    "motivationalQuotesVisible",
    "todoLastUpdateDate",
    "todoList",
    "todoListCheckboxState",
    "todoListDisplayStatus",
    "userText",
    "userTextVisible"
];

retiredStorageKeys.forEach(key => localStorage.removeItem(key));
Object.keys(localStorage)
    .filter(key => key.startsWith("quotes_"))
    .forEach(key => localStorage.removeItem(key));
