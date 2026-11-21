const dbName = "ImageDB";
const storeName = "backgroundImages";
const timestampKey = "lastUpdateTime";
const imageTypeKey = "imageType";
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);
        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            db.createObjectStore(storeName);
        };
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject("Ошибка базы данных: " + event.target.errorCode);
    });
}
async function saveImageToIndexedDB(imageBlob, isRandom) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        store.put(imageBlob, "backgroundImage");
        store.put(new Date().toISOString(), timestampKey);
        store.put(isRandom ? "random" : "upload", imageTypeKey);
        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => reject("Ошибка транзакции: " + event.target.errorCode);
    });
}
async function loadImageAndDetails() {
    const db = await openDatabase();
    return Promise.all([
        getFromStore(db, "backgroundImage"),
        getFromStore(db, timestampKey),
        getFromStore(db, imageTypeKey)
    ]);
}
function getFromStore(db, key) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject("Ошибка запроса: " + event.target.errorCode);
    });
}
async function clearImageFromIndexedDB() {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        store.delete("backgroundImage");
        store.delete(timestampKey);
        store.delete(imageTypeKey);
        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => reject("Удалить ошибку: " + event.target.errorCode);
    });
}
document.getElementById("imageUpload").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        const imageUrl = URL.createObjectURL(file);
        const image = new Image();
        image.onload = function () {
            document.body.style.setProperty("--bg-image", `url(${imageUrl})`);
            saveImageToIndexedDB(file, false)
                .then(() => {
                    toggleBackgroundType(true);
                    URL.revokeObjectURL(imageUrl);
                })
                .catch(error => console.error(error));
        };
        image.src = imageUrl;
    }
});
const RANDOM_IMAGE_URL = "https://picsum.photos/1920/1080";
async function applyRandomImage(showConfirmation = true) {
    if (showConfirmation && !(await confirmPrompt(
        translations[currentLanguage]?.confirmWallpaper || translations["en"].confirmWallpaper
    ))) {
        return;
    }
    try {
        const response = await fetch(RANDOM_IMAGE_URL);
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        document.body.style.setProperty("--bg-image", `url(${imageUrl})`);
        await saveImageToIndexedDB(blob, true);
        toggleBackgroundType(true);
        setTimeout(() => URL.revokeObjectURL(imageUrl), 2000);
    } catch (error) {
        console.error("Ошибка при получении случайного изображения:", error);
    }
}
function toggleBackgroundType(hasWallpaper) {
    document.body.setAttribute("data-bg", hasWallpaper ? "wallpaper" : "color");
}
function checkAndUpdateImage() {
    loadImageAndDetails()
        .then(([blob, savedTimestamp, imageType]) => {
            const now = new Date();
            const lastUpdate = new Date(savedTimestamp);
            if (!blob || !savedTimestamp || isNaN(lastUpdate)) {
                toggleBackgroundType(false);
                return;
            }
            const imageUrl = URL.createObjectURL(blob);
            if (imageType === "upload") {
                document.body.style.setProperty("--bg-image", `url(${imageUrl})`);
                toggleBackgroundType(true);
                return;
            }
            if (lastUpdate.toDateString() !== now.toDateString()) {
                applyRandomImage(false);
            } else {
                document.body.style.setProperty("--bg-image", `url(${imageUrl})`);
                toggleBackgroundType(true);
            }
            setTimeout(() => URL.revokeObjectURL(imageUrl), 1500);
        })
        .catch((error) => {
            console.error("Ошибка при загрузке сведений об изображении:", error);
            toggleBackgroundType(false);
        });
}
document.getElementById("uploadTrigger").addEventListener("click", () =>
    document.getElementById("imageUpload").click()
);
document.getElementById("clearImage").addEventListener("click", async function () {
    try {
        const [blob] = await loadImageAndDetails();
        if (!blob) {
            await alertPrompt(translations[currentLanguage]?.Nobackgroundset || translations["en"].Nobackgroundset);
            return;
        }
        const confirmationMessage = translations[currentLanguage]?.clearbackgroundimage || translations["en"].clearbackgroundimage;
        if (await confirmPrompt(confirmationMessage)) {
            try {
                await clearImageFromIndexedDB();
                document.body.style.removeProperty("--bg-image");
                toggleBackgroundType(false);
            } catch (error) {
                console.error(error);
            }
        }
    } catch (error) {
        console.error(error);
    }
});
document.getElementById("randomImageTrigger").addEventListener("click", applyRandomImage);
checkAndUpdateImage();
